/**
 * API Key Utilities
 * Functions for generating, hashing, and verifying API keys
 * Uses bcrypt for secure hashing
 */

import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 10;
const KEY_PREFIX = "gmcp_live_";
const KEY_LENGTH = 32; // caracteres aleatorios después del prefix

/**
 * Generate a new API key
 * Format: gmcp_live_<32_random_chars>
 * Returns both the full key (to show once) and the hash (to store)
 */
export function generateApiKey(): {
  key: string;
  hash: string;
  preview: string;
} {
  const randomPart = randomBytes(KEY_LENGTH)
    .toString("hex")
    .slice(0, KEY_LENGTH);
  const key = `${KEY_PREFIX}${randomPart}`;
  const hash = bcrypt.hashSync(key, SALT_ROUNDS);
  const preview = `...${key.slice(-5)}`;

  return { key, hash, preview };
}

/**
 * Hash an existing API key
 * Use this when storing a key for the first time
 */
export function hashApiKey(key: string): string {
  return bcrypt.hashSync(key, SALT_ROUNDS);
}

/**
 * Verify an API key against its hash
 * Returns true if valid, false otherwise
 */
export function verifyApiKey(key: string, hash: string): boolean {
  return bcrypt.compareSync(key, hash);
}

/**
 * Validate API key format
 * Checks prefix and length
 */
export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  if (!key.startsWith(KEY_PREFIX)) return false;
  if (key.length !== KEY_PREFIX.length + KEY_LENGTH) return false;
  return true;
}

/**
 * Extract preview from full key
 * Returns last 5 characters with prefix
 */
export function getKeyPreview(key: string): string {
  if (!key || key.length < 5) return "...???";
  return `...${key.slice(-5)}`;
}

/**
 * Sanitize key for logging
 * Never log full keys, only previews
 */
export function sanitizeKeyForLogging(key: string): string {
  if (!key) return "[empty]";
  if (key.length <= 8) return "***";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
