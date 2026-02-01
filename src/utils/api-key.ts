/**
 * API Key Utilities
 * Simple key generation based on installation timestamp
 */

import { randomBytes } from "crypto";

const KEY_PREFIX = "gabo_";

export function generateApiKey(): {
  key: string;
  hash: string;
  preview: string;
} {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString("hex").slice(0, 8);
  const key = `${KEY_PREFIX}${timestamp}_${randomPart}`;
  const preview = `...${key.slice(-8)}`;

  return { key, hash: key, preview };
}

export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  return key.startsWith(KEY_PREFIX) && key.includes("_");
}
