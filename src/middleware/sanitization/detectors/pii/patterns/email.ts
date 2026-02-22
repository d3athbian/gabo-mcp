/**
 * Email Patterns
 */

import type { PatternRule } from '../pii.type.js';

export const EMAIL_PATTERNS: PatternRule[] = [
  {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    type: 'email',
    redaction: 'email',
  },
  // Unicode obfuscation
  {
    pattern: /[a-zA-Z0-9._%+-]+[@\u0040\u2E2F\uFE6B][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    type: 'obfuscated_email',
    redaction: 'email',
  },
];

export const EMAIL_KEYWORDS = [
  /@gmail\.com/gi,
  /@yahoo\.com/gi,
  /@hotmail\.com/gi,
  /@outlook\.com/gi,
  /@icloud\.com/gi,
  /@protonmail\.com/gi,
  /@pm\.me/gi,
];
