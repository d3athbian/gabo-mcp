/**
 * API Key Utilities
 * Functions for generating, hashing, and verifying API keys
 * Uses bcrypt for secure hashing
 */

import * as bcrypt from "bcrypt";
import { randomBytes, createHash } from "crypto";

const SALT_ROUNDS = 10;
const KEY_PREFIX = "gabo_";
const KEY_LENGTH = 16;

/**
 * Generate a simple device ID from timestamp
 * Format: gabo_<timestamp_hash>
 */
export function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString("hex").slice(0, 8);
  return `${KEY_PREFIX}${timestamp}_${randomPart}`;
}

/**
 * Generate a new API key based on installation timestamp
 * Format: gabo_<timestamp>_<random>
 * Returns both the full key (to show once) and the hash (to store)
 */
export function generateApiKey(): {
  key: string;
  hash: string;
  preview: string;
  deviceId: string;
} {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(KEY_LENGTH)
    .toString("hex")
    .slice(0, KEY_LENGTH);
  const deviceId = `${KEY_PREFIX}${timestamp}`;

  const key = `${deviceId}_${randomPart}`;
  const hash = bcrypt.hashSync(key, SALT_ROUNDS);
  const preview = `...${key.slice(-6)}`;

  return { key, hash, preview, deviceId };
}

/**
 * Generate a global key from a seed (for recovery/cross-device)
 * Uses timestamp-based seed for consistency
 */
export function generateGlobalKeyFromSeed(seed: string): {
  key: string;
  hash: string;
  preview: string;
} {
  const hash = createHash("sha256").update(seed).digest("hex").slice(0, 24);
  const key = `${KEY_PREFIX}${hash}`;
  const fullHash = bcrypt.hashSync(key, SALT_ROUNDS);
  const preview = `...${key.slice(-6)}`;

  return { key, hash: fullHash, preview };
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
 * Checks prefix and structure
 */
export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  if (!key.startsWith(KEY_PREFIX)) return false;
  const parts = key.split("_");
  if (parts.length < 3) return false;
  return true;
}

/**
 * Extract preview from full key
 * Returns last 6 characters with prefix
 */
export function getKeyPreview(key: string): string {
  if (!key || key.length < 6) return "...???";
  return `...${key.slice(-6)}`;
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

/**
 * Check if a key matches a device ID
 */
export function getDeviceIdFromKey(key: string): string | null {
  if (!isValidApiKeyFormat(key)) return null;
  const parts = key.split("_");
  if (parts.length < 2) return null;
  return `${parts[0]}_${parts[1]}`;
}
