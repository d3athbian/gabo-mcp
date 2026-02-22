/**
 * Credentials Detector
 * Detects passwords, API keys, tokens, and other authentication credentials
 */

import type { DetectionResult } from '../sanitization.type.js';

const CREDENTIAL_PATTERNS = [
  // Generic patterns
  /password\s*[=:]\s*["']?[\w@#$%^&*()]+["']?/gi,
  /api[_-]?key\s*[=:]\s*["']?[\w-]+["']?/gi,
  /secret\s*[=:]\s*["']?[\w-]+["']?/gi,
  /token\s*[=:]\s*["']?[\w.-]+["']?/gi,
  /auth\s*[=:]\s*["']?[\w.-]+["']?/gi,

  // Specific service patterns
  /Bearer\s+[\w.-]+/gi,
  /ghp_[a-zA-Z0-9]{36}/g, // GitHub Personal Access Token
  /gho_[a-zA-Z0-9]{36}/g, // GitHub OAuth Token
  /sk-[a-zA-Z0-9]{48}/g, // OpenAI API Key
  /xox[baprs]-[a-zA-Z0-9-]+/g, // Slack tokens
  /AKIA[0-9A-Z]{16}/g, // AWS Access Key
  /AIza[0-9A-Za-z\\-_]{35}/g, // Google API Key

  // JWT tokens
  /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,

  // Connection strings
  /mongodb(\+srv)?:\/\/[^\s]+/gi,
  /postgres:\/\/[^\s]+/gi,
  /mysql:\/\/[^\s]+/gi,
];

export function detectCredentials(content: string, title: string): DetectionResult {
  const matches: string[] = [];
  const combinedText = `${title} ${content}`;

  for (const pattern of CREDENTIAL_PATTERNS) {
    const found = combinedText.match(pattern);
    if (found) {
      matches.push(...found.map((m) => m.substring(0, 50))); // Truncate for safety
    }
  }

  return {
    detected: matches.length > 0,
    category: 'credentials',
    matches: [...new Set(matches)], // Remove duplicates
    message:
      matches.length > 0
        ? `Detected ${matches.length} potential credential(s): passwords, API keys, or tokens`
        : undefined,
  };
}
