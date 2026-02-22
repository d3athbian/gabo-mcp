/**
 * Keyword Patterns - Multilingual personal identifiers
 */

import type { KeywordRule } from '../pii.type.js';

export const KEYWORD_PATTERNS: KeywordRule[] = [
  // Spanish
  {
    pattern: /mi\s+(?:email|correo|tel[eé]fono|n[uú]mero|ip|direcci[ó]n|cuenta|dni)\s+es/gi,
    type: 'email',
  },
  { pattern: /(?:email|correo|contacto)[:\s]/gi, type: 'email' },
  { pattern: /tel[eé]fono[:\s]/gi, type: 'phone' },
  { pattern: /cuenta\s+bancaria/gi, type: 'iban' },
  { pattern: /n[uú]mero\s+de\s+cuenta/gi, type: 'iban' },
  { pattern: /n[uú]mero\s+de\s+seguro/gi, type: 'ssn' },
  { pattern: /seguro\s+social/gi, type: 'ssn' },
  { pattern: /domicilio[:\s]/gi, type: 'address' },
  { pattern: /direcci[ó]n[:\s]/gi, type: 'address' },
  // English
  { pattern: /phone[:\s]/gi, type: 'phone' },
  {
    pattern: /(?:me\s+llamo|my\s+name\s+is|je\s+m'?appelle)\s+[A-Z][a-z]+/gi,
    type: 'email',
  },
  { pattern: /(?:soy|soy\s+)[A-Z][a-z]+/gi, type: 'email' },
];
