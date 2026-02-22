/**
 * PII Detection Types
 * Externalized from implementation following TypeScript standards
 */

export type PIIType =
  | "email"
  | "phone"
  | "credit_card"
  | "ssn"
  | "ip"
  | "iban"
  | "dni"
  | "passport"
  | "license"
  | "crypto"
  | "api_key"
  | "address"
  | "obfuscated_email";

export type RedactionStrategy = "email" | "partial" | "full" | "generic";

export type PatternRule = {
  pattern: RegExp;
  type: PIIType;
  redaction: RedactionStrategy;
};

export type KeywordRule = {
  pattern: RegExp;
  type: PIIType;
};

export type ValidationResult = {
  isValid: boolean;
  reason?: string;
};
