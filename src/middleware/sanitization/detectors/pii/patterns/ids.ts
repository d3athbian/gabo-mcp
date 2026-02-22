/**
 * ID Patterns - DNI, Passports, Driver's Licenses
 */

import type { PatternRule } from "../pii.type.js";

export const ID_PATTERNS: PatternRule[] = [
  // Generic numeric IDs (7-9 digits)
  {
    pattern: /\b\d{7,9}\b/g,
    type: "dni",
    redaction: "generic",
  },
  // DNI variants
  {
    pattern: /DNI[:\s]?\d{7,9}/gi,
    type: "dni",
    redaction: "generic",
  },
  {
    pattern: /CUIL[:\s]?\d{11}/gi,
    type: "dni",
    redaction: "generic",
  },
  {
    pattern: /CUIT[:\s]?\d{11}/gi,
    type: "dni",
    redaction: "generic",
  },
  {
    pattern: /RUT[:\s]?\d{1,9}[\s-]?\d/gim,
    type: "dni",
    redaction: "generic",
  },
  {
    pattern: /NIE[:\s]?[A-Z]\d{7}[A-Z]/gi,
    type: "dni",
    redaction: "generic",
  },
  // Passports
  {
    pattern: /pasaporte[:\s]?[A-Z0-9]{6,9}/gi,
    type: "passport",
    redaction: "generic",
  },
  {
    pattern: /\b[A-Z]{1,2}\d{6,9}\b/g,
    type: "passport",
    redaction: "generic",
  },
  // Driver's licenses
  {
    pattern: /licencia[:\s]?[A-Z0-9]{5,20}/gi,
    type: "license",
    redaction: "generic",
  },
  {
    pattern: /driver'?s?\s+licen[cs]e[:\s]?[A-Z0-9]{5,20}/gi,
    type: "license",
    redaction: "generic",
  },
];
