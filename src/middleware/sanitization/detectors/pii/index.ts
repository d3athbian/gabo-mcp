/**
 * PII Detector - Main Entry Point
 * Modularized implementation following TypeScript best practices
 */

import type { DetectionResult } from "../../sanitization.type.js";
import "./pii.type.js";
import { ALL_PATTERNS } from "./patterns/index.js";
import { KEYWORD_PATTERNS } from "./keywords/index.js";
import {
  redactValue,
  passesLuhnCheck,
  isValidSSN,
  isLikelyFalsePositive,
} from "./utils/index.js";

export function detectPII(content: string, title: string): DetectionResult {
  const matches: string[] = [];
  const combinedText = `${title} ${content}`;

  for (const { pattern, redaction } of ALL_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(combinedText)) !== null) {
      const matchedValue = match[0];

      if (isLikelyFalsePositive(matchedValue, combinedText)) {
        continue;
      }

      matches.push(redactValue(matchedValue, redaction));
    }
  }

  for (const { pattern } of KEYWORD_PATTERNS) {
    const found = combinedText.match(pattern);
    if (found) {
      matches.push(...found.map(() => "***PII_DETECTED***"));
    }
  }

  const ssnLikePatterns = combinedText.match(/\b\d{3}-\d{2}-\d{4}\b/g) || [];
  for (const ssn of ssnLikePatterns) {
    if (!isValidSSN(ssn)) {
      const index = matches.indexOf(redactValue(ssn, "partial"));
      if (index > -1) matches.splice(index, 1);
    }
  }

  const cardMatches = combinedText.match(/\b\d{13,19}\b/g) || [];
  for (const card of cardMatches) {
    if (!passesLuhnCheck(card)) {
      const index = matches.indexOf(redactValue(card, "partial"));
      if (index > -1) matches.splice(index, 1);
    }
  }

  const uniqueMatches = [...new Set(matches)];

  return {
    detected: uniqueMatches.length > 0,
    category: "pii",
    matches: uniqueMatches,
    message:
      uniqueMatches.length > 0
        ? `Detected ${uniqueMatches.length} PII item(s): emails, phone numbers, financial data, or sensitive identifiers`
        : undefined,
  };
}

export type {
  PIIType,
  RedactionStrategy,
  PatternRule,
  KeywordRule,
} from "./pii.type.js";
