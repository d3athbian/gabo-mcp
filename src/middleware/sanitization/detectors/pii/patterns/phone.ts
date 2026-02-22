/**
 * Phone Number Patterns
 */

import type { PatternRule } from '../pii.type.js';

export const PHONE_PATTERNS: PatternRule[] = [
  {
    pattern: /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    type: 'phone',
    redaction: 'partial',
  },
  {
    pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    type: 'phone',
    redaction: 'partial',
  },
  {
    pattern: /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    type: 'phone',
    redaction: 'partial',
  },
];
