/**
 * Financial Patterns - Credit Cards, IBAN, Crypto Wallets
 */

import type { PatternRule } from '../pii.type.js';

export const FINANCIAL_PATTERNS: PatternRule[] = [
  // Credit cards
  {
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    type: 'credit_card',
    redaction: 'partial',
  },
  {
    pattern: /\b\d{13,19}\b/g,
    type: 'credit_card',
    redaction: 'partial',
  },
  // IBAN
  {
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    type: 'iban',
    redaction: 'generic',
  },
  // Crypto wallets
  {
    pattern: /\b0x[a-fA-F0-9]{40}\b/g,
    type: 'crypto',
    redaction: 'partial',
  },
  {
    pattern: /\bbc1[a-z0-9]{25,90}\b/gi,
    type: 'crypto',
    redaction: 'partial',
  },
  // SSN
  {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    type: 'ssn',
    redaction: 'partial',
  },
  {
    pattern: /\b\d{9}\b/g,
    type: 'ssn',
    redaction: 'partial',
  },
];
