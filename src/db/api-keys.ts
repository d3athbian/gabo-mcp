/**
 * API Key Database Queries
 * Operations for managing API keys in MongoDB
 */

import { getApiKeysCollection } from "./client.js";
import { ObjectId } from "mongodb";
import type { ApiKey } from "../schemas/index.schema.js";

/**
 * Check if any API keys exist in the database
 * Used for bootstrap detection
 */
export async function hasAnyApiKeys(): Promise<boolean> {
  const collection = getApiKeysCollection();
  const count = await collection.countDocuments();
  return count > 0;
}

/**
 * Get the global API key (first/only key)
 * Used for cross-device recovery
 */
export async function getGlobalApiKey(): Promise<Omit<
  ApiKey,
  "key_hash"
> | null> {
  const collection = getApiKeysCollection();
  const doc = await collection.findOne({ is_active: true });

  if (!doc) return null;

  return {
    id: doc._id.toString(),
    key_preview: doc.key_preview,
    name: doc.name,
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
    created_by: doc.created_by,
  };
}

/**
 * Get the raw API key document including hash
 * For internal authentication use only
 */
export async function getApiKeyDocumentByHash(
  keyHash: string,
): Promise<ApiKey | null> {
  const collection = getApiKeysCollection();
  const doc = await collection.findOne({ key_hash: keyHash });

  if (!doc) return null;

  return {
    id: doc._id.toString(),
    key_hash: doc.key_hash,
    key_preview: doc.key_preview,
    name: doc.name,
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
    created_by: doc.created_by,
  };
}

/**
 * Create a new API key
 */
export async function createApiKey(
  keyHash: string,
  keyPreview: string,
  name: string,
  createdBy: string,
): Promise<ApiKey> {
  const collection = getApiKeysCollection();

  const now = new Date().toISOString();
  const doc = {
    key_hash: keyHash,
    key_preview: keyPreview,
    name,
    created_at: now,
    last_used: undefined,
    is_active: true,
    created_by: createdBy,
    is_global: createdBy.startsWith("gabo_"),
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    ...doc,
  };
}

/**
 * Find API key by its hash
 */
export async function findApiKeyByHash(
  keyHash: string,
): Promise<ApiKey | null> {
  const collection = getApiKeysCollection();
  const doc = await collection.findOne({ key_hash: keyHash });

  if (!doc) return null;

  return {
    id: doc._id.toString(),
    key_hash: doc.key_hash,
    key_preview: doc.key_preview,
    name: doc.name,
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
    created_by: doc.created_by,
  };
}

/**
 * Update last_used timestamp for an API key
 */
export async function updateApiKeyLastUsed(keyHash: string): Promise<void> {
  const collection = getApiKeysCollection();
  await collection.updateOne(
    { key_hash: keyHash },
    { $set: { last_used: new Date().toISOString() } },
  );
}

/**
 * List all API keys (without sensitive hash data)
 */
export async function listApiKeys(): Promise<Omit<ApiKey, "key_hash">[]> {
  const collection = getApiKeysCollection();
  const docs = await collection.find({}).sort({ created_at: -1 }).toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    key_preview: doc.key_preview,
    name: doc.name,
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
    created_by: doc.created_by,
  }));
}

/**
 * Revoke (deactivate) an API key by ID
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  const collection = getApiKeysCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(keyId) },
    { $set: { is_active: false } },
  );

  return result.modifiedCount > 0;
}

/**
 * Revoke (deactivate) an API key by name
 */
export async function revokeApiKeyByName(name: string): Promise<boolean> {
  const collection = getApiKeysCollection();
  const result = await collection.updateOne(
    { name },
    { $set: { is_active: false } },
  );

  return result.modifiedCount > 0;
}

/**
 * Find API key by ID
 */
export async function findApiKeyById(keyId: string): Promise<ApiKey | null> {
  const collection = getApiKeysCollection();
  const doc = await collection.findOne({ _id: new ObjectId(keyId) });

  if (!doc) return null;

  return {
    id: doc._id.toString(),
    key_hash: doc.key_hash,
    key_preview: doc.key_preview,
    name: doc.name,
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
    created_by: doc.created_by,
  };
}
