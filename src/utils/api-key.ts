/**
 * API Key Utilities
 * Simple key generation based on installation timestamp
 */

import { randomBytes } from "crypto";

const KEY_PREFIX = "gabo_";

export function generateApiKey(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString("hex").slice(0, 8);
  return `${KEY_PREFIX}${timestamp}_${randomPart}`;
}

export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  return key.startsWith(KEY_PREFIX) && key.includes("_");
}
