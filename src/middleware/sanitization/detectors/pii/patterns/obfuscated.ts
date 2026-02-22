/**
 * Obfuscation Detection Patterns - Anti-evasion techniques
 */

import type { PatternRule } from "../pii.type.js";

export const OBFUSCATED_PATTERNS: PatternRule[] = [
  {
    pattern: /[a-zA-Z0-9._%+-]\s*\[\s*at\s*\]/gi,
    type: "obfuscated_email",
    redaction: "email",
  },
  {
    pattern: /[a-zA-Z0-9._%+-]\s*\(\s*at\s*\)/gi,
    type: "obfuscated_email",
    redaction: "email",
  },
  {
    pattern: /[a-zA-Z0-9._%+-]\s*\[dot\]/gi,
    type: "obfuscated_email",
    redaction: "email",
  },
  {
    pattern: /[a-zA-Z0-9._%+-]\s*\(\s*dot\s*\)/gi,
    type: "obfuscated_email",
    redaction: "email",
  },
  {
    pattern: /[a-zA-Z0-9._%+-]\s*@\s*[a-zA-Z0-9.-]+\s*\./gi,
    type: "obfuscated_email",
    redaction: "email",
  },
  {
    pattern: /[a-zA-Z0-9._%+-]+\s*@+\s*[a-zA-Z0-9.-]+/gi,
    type: "obfuscated_email",
    redaction: "email",
  },
  {
    pattern:
      /[a-zA-Z0-9._%+-]+[\s\.@]+(?:gmail|hotmail|yahoo|outlook|icloud)[\s\.@]+(?:com|org|net)/gi,
    type: "obfuscated_email",
    redaction: "email",
  },
  // IP addresses
  {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    type: "ip",
    redaction: "generic",
  },
  {
    pattern: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    type: "ip",
    redaction: "generic",
  },
  {
    pattern:
      /\b(?:[0-9a-fA-F]{1,4}:){1,7}:(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}\b/g,
    type: "ip",
    redaction: "generic",
  },
  // API Keys
  {
    pattern: /\b(?:sk-|pk_live_|pk_test_)[a-zA-Z0-9]{20,}\b/g,
    type: "api_key",
    redaction: "generic",
  },
  {
    pattern: /\bghp_[a-zA-Z0-9]{36}\b/g,
    type: "api_key",
    redaction: "generic",
  },
  {
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    type: "api_key",
    redaction: "generic",
  },
  {
    pattern: /['"]?[a-zA-Z0-9_-]*:['"]?[A-Za-z0-9_-]{20,}['"]?\b/g,
    type: "api_key",
    redaction: "generic",
  },
  {
    pattern: /\b(?:ya29|ya31)\.[a-zA-Z0-9_-]{50,}\b/g,
    type: "api_key",
    redaction: "generic",
  },
  // Address patterns
  {
    pattern:
      /\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)\b/gi,
    type: "address",
    redaction: "generic",
  },
  {
    pattern: /\b(?:Apt|Suite|Unit|Floor)\s*\d+\b/gi,
    type: "address",
    redaction: "generic",
  },
  {
    pattern: /\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g,
    type: "address",
    redaction: "generic",
  },
];
