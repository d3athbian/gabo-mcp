/**
 * MongoDB Queries for Knowledge Management
 * All queries implement application-level security by filtering by user_id
 * This replaces Supabase RLS in MongoDB Atlas M0
 */

import { ObjectId } from "mongodb";
import { getKnowledgeEntriesCollection } from "./client.js";
import type {
  KnowledgeEntry,
  CreateKnowledgeInput,
  SearchKnowledgeInput,
  SearchResult,
} from "../types.ts";

/**
 * Convert string ID to ObjectId safely
 */
function toObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
}

/**
 * Store a new knowledge entry
 * Security: Always includes user_id
 */
export async function storeKnowledge(
  userId: string,
  input: CreateKnowledgeInput & { embedding?: number[] },
): Promise<KnowledgeEntry> {
  const { type, title, content, tags = [], source, embedding } = input;

  // Validate input
  if (!title || title.trim().length === 0) {
    throw new Error("Title is required and cannot be empty");
  }
  if (!content || content.trim().length === 0) {
    throw new Error("Content is required and cannot be empty");
  }

  const collection = getKnowledgeEntriesCollection();

  const now = new Date().toISOString();
  const doc = {
    user_id: userId,
    type,
    title: title.trim(),
    content: content.trim(),
    tags,
    source,
    visibility: "private" as const,
    embedding: embedding || [],
    created_at: now,
    updated_at: now,
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    user_id: userId,
    type,
    title: title.trim(),
    content: content.trim(),
    tags,
    source,
    visibility: "private",
    embedding: embedding || [],
    created_at: now,
    updated_at: now,
  };
}

/**
 * Search knowledge entries by keyword
 * Phase 3: Full-text search without embeddings
 * Security: Filters by user_id
 */
export async function searchKnowledge(
  userId: string,
  input: SearchKnowledgeInput,
): Promise<SearchResult[]> {
  const { query, type, limit = 10 } = input;

  if (!query || query.trim().length === 0) {
    throw new Error("Search query is required");
  }

  const collection = getKnowledgeEntriesCollection();

  // Build query with security filter
  const filter: any = {
    user_id: userId,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ],
  };

  if (type) {
    filter.type = type;
  }

  const results = await collection
    .find(filter)
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();

  return results.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    content: doc.content,
    type: doc.type,
    created_at: doc.created_at,
    relevance_score: undefined,
    embedding_score: undefined,
  }));
}

/**
 * Get a single knowledge entry by ID
 * Security: Verifies user_id matches
 */
export async function getKnowledge(
  userId: string,
  entryId: string,
): Promise<KnowledgeEntry> {
  const collection = getKnowledgeEntriesCollection();

  const doc = await collection.findOne({
    _id: toObjectId(entryId),
    user_id: userId,
  });

  if (!doc) {
    throw new Error("Knowledge entry not found");
  }

  return {
    id: doc._id.toString(),
    user_id: doc.user_id,
    type: doc.type,
    title: doc.title,
    content: doc.content,
    tags: doc.tags,
    source: doc.source,
    visibility: doc.visibility,
    embedding: doc.embedding,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

/**
 * List knowledge entries with optional filtering
 * Security: Filters by user_id
 */
export async function listKnowledge(
  userId: string,
  type?: string,
  limit = 10,
  offset = 0,
): Promise<{ data: KnowledgeEntry[]; count: number }> {
  const collection = getKnowledgeEntriesCollection();

  const filter: any = { user_id: userId };
  if (type) {
    filter.type = type;
  }

  const [results, count] = await Promise.all([
    collection
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    data: results.map((doc) => ({
      id: doc._id.toString(),
      user_id: doc.user_id,
      type: doc.type,
      title: doc.title,
      content: doc.content,
      tags: doc.tags,
      source: doc.source,
      visibility: doc.visibility,
      embedding: doc.embedding,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    })),
    count,
  };
}

/**
 * Update a knowledge entry
 * Security: Verifies user_id matches
 */
export async function updateKnowledge(
  userId: string,
  entryId: string,
  updates: Partial<CreateKnowledgeInput>,
): Promise<KnowledgeEntry> {
  const collection = getKnowledgeEntriesCollection();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) {
    updateData.title = updates.title.trim();
  }
  if (updates.content !== undefined) {
    updateData.content = updates.content.trim();
  }
  if (updates.tags !== undefined) {
    updateData.tags = updates.tags;
  }
  if (updates.source !== undefined) {
    updateData.source = updates.source;
  }
  if (updates.type !== undefined) {
    updateData.type = updates.type;
  }

  const result = await collection.findOneAndUpdate(
    { _id: toObjectId(entryId), user_id: userId },
    { $set: updateData },
    { returnDocument: "after" },
  );

  if (!result) {
    throw new Error("Knowledge entry not found or access denied");
  }

  return {
    id: result._id.toString(),
    user_id: result.user_id,
    type: result.type,
    title: result.title,
    content: result.content,
    tags: result.tags,
    source: result.source,
    visibility: result.visibility,
    embedding: result.embedding,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
}

/**
 * Delete a knowledge entry
 * Security: Verifies user_id matches
 */
export async function deleteKnowledge(
  userId: string,
  entryId: string,
): Promise<void> {
  const collection = getKnowledgeEntriesCollection();

  const result = await collection.deleteOne({
    _id: toObjectId(entryId),
    user_id: userId,
  });

  if (result.deletedCount === 0) {
    throw new Error("Knowledge entry not found or access denied");
  }
}

/**
 * Get all unique tags for a user
 * Security: Filters by user_id
 */
export async function getUserTags(userId: string): Promise<string[]> {
  const collection = getKnowledgeEntriesCollection();

  const results = await collection
    .distinct("tags", { user_id: userId })
    .then((tags) => tags.flat().filter((tag, i, arr) => arr.indexOf(tag) === i))
    .then((tags) => tags.sort());

  return results;
}

/**
 * Update embedding for an entry (used after generating with Ollama)
 * Security: Verifies user_id matches
 */
export async function updateEmbedding(
  userId: string,
  entryId: string,
  embedding: number[],
): Promise<void> {
  const collection = getKnowledgeEntriesCollection();

  const result = await collection.updateOne(
    { _id: toObjectId(entryId), user_id: userId },
    { $set: { embedding, updated_at: new Date().toISOString() } },
  );

  if (result.matchedCount === 0) {
    throw new Error("Knowledge entry not found or access denied");
  }
}
