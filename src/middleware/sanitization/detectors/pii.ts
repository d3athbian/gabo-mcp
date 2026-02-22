/**
 * PII (Personally Identifiable Information) Detector
 * Detects emails, phone numbers, credit cards, SSN, IPs, and obfuscated patterns
 */

import type { DetectionResult } from "../sanitization.type.js";

const PII_PATTERNS = [
  // Email addresses (standard)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // Phone numbers (various formats)
  /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,

  // Credit card numbers
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,

  // SSN
  /\b\d{3}-\d{2}-\d{4}\b/g,

  // IP addresses
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  // OBFUSCATED EMAILS (evasion attempts)
  // Patterns like: user [at] domain.com, user[at]domain.com, u.s.e.r @ domain
  /[a-zA-Z0-9._%+-]\s*\[\s*at\s*\]/gi,
  /[a-zA-Z0-9._%+-]\s*\(\s*at\s*\)/gi,
  /[a-zA-Z0-9._%+-]\s*\[dot\]/gi,
  /[a-zA-Z0-9._%+-]\s*\(\s*dot\s*\)/gi,
  /[a-zA-Z0-9._%+-]\s*@\s*[a-zA-Z0-9.-]+\s*\./gi,

  // Generic email-like patterns that look like obfuscation
  /[a-zA-Z0-9._%+-]+\s*@+\s*[a-zA-Z0-9.-]+/gi,
];

const PII_PATTERNS_EXTRA = [
  // Bank account numbers (various countries)
  /\b\d{10,20}\b/g, // Generic 10-20 digit bank account numbers
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // 16-digit accounts
  /IBAN[:\s]?[A-Z]{2}\d{2}[A-Z0-9]{11,30}/gi,

  // DNI / National ID (Spain, Argentina, Latin America)
  /\b\d{7,9}\b/g, // Generic 7-9 digit IDs
  /DNI[:\s]?\d{7,9}/gi,
  /CUIL[:\s]?\d{11}/gi,
  /CUIT[:\s]?\d{11}/gi,
  /RUT[:\s]?\d{1,9}[\s-]?\d/gim,

  // Passport numbers
  /pasaporte[:\s]?[A-Z0-9]{6,9}/gi,

  // Driver's license
  /licencia[:\s]?[A-Z0-9]{5,20}/gi,

  // Medical / Health
  /seguro\s+social/gi,
  /numero\s+de\s+seguro/gi,

  // Crypto wallets
  /\b(0x[a-fA-F0-9]{40}|bc1[a-z0-9]{25,90})\b/gi,

  // API Keys / Tokens patterns
  /sk-[a-zA-Z0-9]{20,}/gi,
  /ghp_[a-zA-Z0-9]{36}/gi,
  /AKIA[0-9A-Z]{16}/gi,
];

const PII_KEYWORDS = [
  // Personal identifiers in content
  /mi\s+email\s+es/gi,
  /mi\s+correo\s+es/gi,
  /mi\s+telefono\s+es/gi,
  /mi\s+numero\s+es/gi,
  /mi\s+ip\s+es/gi,
  /mi\s+direccion\s+es/gi,
  /mi\s+cuenta\s+es/gi,
  /mi\s+dni\s+es/gi,
  /mi\s+pasaporte\s+es/gi,
  /contacto[:\s]/gi,
  /email[:\s]/gi,
  /telefono[:\s]/gi,
  /phone[:\s]/gi,
  /cuenta\s+bancaria/gi,
  /numero\s+de\s+cuenta/gi,
  /@gmail\.com/gi,
  /@yahoo\.com/gi,
  /@hotmail\.com/gi,
  /@outlook\.com/gi,
  /@icloud\.com/gi,
];

export function detectPII(content: string, title: string): DetectionResult {
  const matches: string[] = [];
  const combinedText = `${title} ${content}`;

  // Check standard patterns
  for (const pattern of PII_PATTERNS) {
    const found = combinedText.match(pattern);
    if (found) {
      matches.push(
        ...found.map((m) => {
          if (m.includes("@")) return `***@***`;
          if (m.length > 10) return `${m.substring(0, 4)}***`;
          return "***";
        }),
      );
    }
  }

  // Check keywords
  for (const pattern of PII_KEYWORDS) {
    const found = combinedText.match(pattern);
    if (found) {
      matches.push(...found.map(() => "***PII_DETECTED***"));
    }
  }

  // Check extra PII patterns (bank accounts, IDs, crypto, etc.)
  for (const pattern of PII_PATTERNS_EXTRA) {
    const found = combinedText.match(pattern);
    if (found) {
      matches.push(...found.map(() => "***PII_DETECTED***"));
    }
  }

  return {
    detected: matches.length > 0,
    category: "pii",
    matches: [...new Set(matches)],
    message:
      matches.length > 0
        ? `Detected ${matches.length} PII item(s): emails, phone numbers, or sensitive identifiers`
        : undefined,
  };
}
