/**
 * Pattern Aggregator
 * Combines all pattern modules
 */

import type { PatternRule } from "../pii.type.js";
import { EMAIL_PATTERNS } from "./email.js";
import { PHONE_PATTERNS } from "./phone.js";
import { FINANCIAL_PATTERNS } from "./financial.js";
import { ID_PATTERNS } from "./ids.js";
import { OBFUSCATED_PATTERNS } from "./obfuscated.js";

export const ALL_PATTERNS: PatternRule[] = [
  ...EMAIL_PATTERNS,
  ...PHONE_PATTERNS,
  ...FINANCIAL_PATTERNS,
  ...ID_PATTERNS,
  ...OBFUSCATED_PATTERNS,
];

export {
  EMAIL_PATTERNS,
  PHONE_PATTERNS,
  FINANCIAL_PATTERNS,
  ID_PATTERNS,
  OBFUSCATED_PATTERNS,
};
