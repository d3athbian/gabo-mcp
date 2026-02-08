/**
 * API Key Database Queries
 * Operations for managing API keys in MongoDB
 */

import { getApiKeysCollection } from "./client.js";
import type { ApiKey } from "../schemas/index.schema.js";

export async function hasAnyApiKeys(): Promise<boolean> {
  const collection = getApiKeysCollection();
  const count = await collection.countDocuments();
  return count > 0;
}

export async function createApiKey(
  key: string,
): Promise<ApiKey> {
  const collection = getApiKeysCollection();

  const now = new Date().toISOString();
  const doc = {
    key,
    created_at: now,
    last_used: undefined,
    is_active: true,
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    ...doc,
  };
}

export async function findApiKeyByKey(key: string): Promise<ApiKey | null> {
  const collection = getApiKeysCollection();
  const doc = await collection.findOne({ key });

  if (!doc) return null;

  return {
    id: doc._id.toString(),
    key: doc.key,
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
  };
}

export async function listApiKeys(): Promise<Omit<ApiKey, "key">[]> {
  const collection = getApiKeysCollection();
  const docs = await collection.find({}).sort({ created_at: -1 }).toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    created_at: doc.created_at,
    last_used: doc.last_used,
    is_active: doc.is_active,
  }));
}
