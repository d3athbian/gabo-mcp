/**
 * MongoDB Queries for Knowledge Management
 * All queries are global for the instance (Autenticación via Secret Key)
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
 */
export async function storeKnowledge(
  input: CreateKnowledgeInput & { embedding?: number[] },
): Promise<KnowledgeEntry> {
  const {
    type,
    title,
    content,
    tags = [],
    source,
    embedding,
    metadata,
  } = input;

  const collection = getKnowledgeEntriesCollection();

  const now = new Date().toISOString();
  const doc = {
    type,
    title: title.trim(),
    content: content.trim(),
    tags,
    source,
    metadata,
    visibility: "private" as const,
    embedding: embedding || [],
    created_at: now,
    updated_at: now,
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    type,
    title: title.trim(),
    content: content.trim(),
    tags,
    source,
    metadata,
    visibility: "private",
    embedding: embedding || [],
    created_at: now,
    updated_at: now,
  };
}

/**
 * Search knowledge entries by keyword (Text search)
 */
export async function searchKnowledge(
  input: SearchKnowledgeInput,
): Promise<SearchResult[]> {
  const { query, type, limit = 10 } = input;

  const collection = getKnowledgeEntriesCollection();

  const filter: any = {
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
 */
export async function getKnowledge(
  entryId: string,
): Promise<KnowledgeEntry> {
  const collection = getKnowledgeEntriesCollection();

  const doc = await collection.findOne({
    _id: toObjectId(entryId),
  });

  if (!doc) {
    throw new Error("Knowledge entry not found");
  }

  return {
    id: doc._id.toString(),
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
 */
export async function listKnowledge(
  type?: string,
  limit = 10,
  offset = 0,
): Promise<{ data: KnowledgeEntry[]; count: number }> {
  const collection = getKnowledgeEntriesCollection();

  const filter: any = {};
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
 */
export async function updateKnowledge(
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
    { _id: toObjectId(entryId) },
    { $set: updateData },
    { returnDocument: "after" },
  );

  if (!result) {
    throw new Error("Knowledge entry not found");
  }

  return {
    id: result._id.toString(),
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
 */
export async function deleteKnowledge(
  entryId: string,
): Promise<void> {
  const collection = getKnowledgeEntriesCollection();

  const result = await collection.deleteOne({
    _id: toObjectId(entryId),
  });

  if (result.deletedCount === 0) {
    throw new Error("Knowledge entry not found");
  }
}

/**
 * Get all unique tags
 */
export async function getUserTags(): Promise<string[]> {
  const collection = getKnowledgeEntriesCollection();

  const results = await collection
    .distinct("tags", {})
    .then((tags) => tags.flat().filter((tag, i, arr) => arr.indexOf(tag) === i))
    .then((tags) => tags.sort());

  return results;
}
