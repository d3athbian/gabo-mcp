/**
 * Environment Variables Detector
 * Detects environment variable access patterns in code
 */

import type { DetectionResult } from '../sanitization.type.js';

const ENV_VAR_PATTERNS = [
  // JavaScript/TypeScript
  /process\.env\.\w+/g,
  /process\.env\[['"]?\w+['"]?\]/g,

  // Python
  /os\.environ\[['"]?\w+['"]?\]/g,
  /os\.getenv\(['"]?\w+['"]?\)/g,

  // Shell/Bash
  /\$\{?\w+\}?/g,
  /export\s+\w+=/g,

  // Docker/Compose
  /ENV\s+\w+=/g,

  // General patterns
  /\.env\.\w+/g,
];

export function detectEnvVars(content: string, title: string): DetectionResult {
  const matches: string[] = [];
  const combinedText = `${title} ${content}`;

  for (const pattern of ENV_VAR_PATTERNS) {
    const found = combinedText.match(pattern);
    if (found) {
      matches.push(...found);
    }
  }

  // Filter out common false positives
  const filtered = matches.filter((m) => {
    const lower = m.toLowerCase();
    // Allow common development variables
    return !lower.includes('node_env') && !lower.includes('path') && !lower.includes('home');
  });

  return {
    detected: filtered.length > 0,
    category: 'env_vars',
    matches: [...new Set(filtered)],
    message:
      filtered.length > 0
        ? `Detected ${filtered.length} environment variable reference(s)`
        : undefined,
  };
}
