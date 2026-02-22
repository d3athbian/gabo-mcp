/**
 * Content Sanitization Middleware
 * Blocks writing if sensitive data (PII, credentials) is detected
 */

import { logger } from '../../utils/logger/index.js';
import { detectCredentials } from './detectors/credentials.js';
import { detectPII } from './detectors/pii/index.js';
import type { SanitizationResult } from './sanitization.type.js';

export function sanitizeContent(title: string, content: string): SanitizationResult {
  const detectors = [
    { name: 'credentials', fn: detectCredentials },
    { name: 'pii', fn: detectPII },
  ];

  const violations = detectors
    .map((detector) => detector.fn(content, title))
    .filter((result) => result.detected);

  if (violations.length > 0) {
    logger.warn(`Sanitization BLOCKED: ${violations.length} issue(s) detected`);
    return {
      allowed: false,
      violations,
      errorMessage: buildErrorMessage(violations),
    };
  }

  return {
    allowed: true,
    violations: [],
  };
}

export function sanitizeAllFields(params: {
  title?: string;
  content?: string;
  tags?: string[];
  source?: string;
  metadata?: Record<string, any>;
}): SanitizationResult {
  const fieldsToCheck: Array<{ name: string; value: string }> = [];

  if (params.title) fieldsToCheck.push({ name: 'title', value: params.title });
  if (params.content) fieldsToCheck.push({ name: 'content', value: params.content });
  if (params.source) fieldsToCheck.push({ name: 'source', value: params.source });
  if (params.tags?.length) {
    fieldsToCheck.push({ name: 'tags', value: params.tags.join(' ') });
  }
  if (params.metadata) {
    const metadataString = JSON.stringify(params.metadata);
    fieldsToCheck.push({ name: 'metadata', value: metadataString });
  }

  const allViolations: Array<{
    category: string;
    message: string;
    field: string;
  }> = [];

  for (const field of fieldsToCheck) {
    const piiResult = detectPII(field.value, field.name);
    if (piiResult.detected) {
      allViolations.push({
        category: piiResult.category,
        message: piiResult.message || 'PII detected',
        field: field.name,
      });
    }

    const credResult = detectCredentials(field.value, field.name);
    if (credResult.detected) {
      allViolations.push({
        category: credResult.category,
        message: credResult.message || 'Credentials detected',
        field: field.name,
      });
    }
  }

  if (allViolations.length > 0) {
    logger.warn(`Sanitization BLOCKED: ${allViolations.length} issue(s) detected across fields`);
    return {
      allowed: false,
      violations: allViolations.map((v) => ({
        detected: true,
        category: v.category as any,
        matches: [],
        message: `[${v.field}] ${v.message}`,
      })),
      errorMessage: buildBlockMessage(allViolations),
    };
  }

  return {
    allowed: true,
    violations: [],
  };
}

function buildErrorMessage(violations: any[]): string {
  const lines = ['Blocked: Sensitive data detected. Cannot save.'];
  for (const violation of violations) {
    lines.push(`- ${violation.category.toUpperCase()}: ${violation.message}`);
  }
  lines.push('');
  lines.push('Remove sensitive data and try again.');
  return lines.join('\n');
}

function buildBlockMessage(
  violations: Array<{ category: string; message: string; field: string }>
): string {
  const lines = ['Blocked: Sensitive data detected in the following fields:'];
  for (const violation of violations) {
    lines.push(`- ${violation.field}: ${violation.category.toUpperCase()} (${violation.message})`);
  }
  lines.push('');
  lines.push('Remove sensitive data and try again.');
  return lines.join('\n');
}
