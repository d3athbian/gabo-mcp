/**
 * Content Sanitization Middleware
 * Detects sensitive data and returns warnings (does not block)
 */

import type { SanitizationResult } from "./sanitization.type.js";
import { detectCredentials } from "./detectors/credentials.js";
import { detectPII } from "./detectors/pii.js";
import { logger } from "../../utils/logger/index.js";

export function sanitizeContent(
  title: string,
  content: string,
): SanitizationResult {
  const detectors = [
    { name: "credentials", fn: detectCredentials },
    { name: "pii", fn: detectPII },
  ];

  const violations = detectors
    .map((detector) => detector.fn(content, title))
    .filter((result) => result.detected);

  if (violations.length > 0) {
    logger.warn(
      `Sanitization warnings: ${violations.length} issue(s) detected`,
    );
    return {
      allowed: true,
      violations,
      warningMessage: buildWarningMessage(violations),
    };
  }

  return {
    allowed: true,
    violations: [],
  };
}

function buildWarningMessage(violations: any[]): string {
  const lines = ["Warnings detected:"];

  for (const violation of violations) {
    lines.push(`- ${violation.category.toUpperCase()}: ${violation.message}`);
  }

  return lines.join("\n");
}
