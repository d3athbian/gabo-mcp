/**
 * API Key Database Queries
 * Operations for managing API keys in MongoDB.
 * Keys are stored as bcrypt hashes — the plain-text key NEVER lives in the DB.
 */

import { getApiKeysCollection } from "./client.js";
import { verifyApiKey } from "../utils/api-key/index.js";
import type { ApiKey } from "../schemas/index.schema.js";

export async function hasAnyApiKeys(): Promise<boolean> {
  const collection = getApiKeysCollection();
  const count = await collection.countDocuments();
  return count > 0;
}

/**
 * Creates a new API key record.
 * @param keyHash - bcrypt hash of (key + pepper). Never the plain-text key.
 */
export async function createApiKey(keyHash: string): Promise<ApiKey> {
  const collection = getApiKeysCollection();

  const now = new Date().toISOString();
  const doc = {
    key_hash: keyHash,
    created_at: now,
    last_used: undefined,
    is_active: true,
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    key_hash: doc.key_hash,
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
  };
}

/**
 * Finds an API key record by comparing the provided plain-text key
 * against all stored bcrypt hashes (using pepper).
 *
 * NOTE: We iterate over active keys and bcrypt.compare each.
 * In a personal MCP there will be very few keys (typically 1),
 * so this is perfectly efficient.
 */
export async function findApiKeyByKey(key: string): Promise<ApiKey | null> {
  const collection = getApiKeysCollection();

  // Only check active keys to short-circuit early
  const activeDocs = await collection
    .find({ is_active: true })
    .toArray();

  for (const doc of activeDocs) {
    const hash = doc.key_hash as string;
    if (!hash) continue;

    const matches = await verifyApiKey(key, hash);
    if (matches) {
      return {
        id: doc._id.toString(),
        key_hash: doc.key_hash,
        created_at: doc.created_at,
        last_used: doc.last_used,
        is_active: doc.is_active,
      };
    }
  }

  return null;
}

/**
 * Deletes ALL API key records from the database.
 * Used by the key-rotation script — after this, a new bootstrap is required.
 * Returns the number of documents deleted.
 */
export async function revokeAllApiKeys(): Promise<number> {
  const collection = getApiKeysCollection();
  const result = await collection.deleteMany({});
  return result.deletedCount;
}

export async function listApiKeys(): Promise<Omit<ApiKey, "key_hash">[]> {
  const collection = getApiKeysCollection();
  const docs = await collection.find({}).sort({ created_at: -1 }).toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
  }));
}
