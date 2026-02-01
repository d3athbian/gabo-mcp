/**
 * MongoDB Atlas Vector Search Utilities
 * Uses Atlas Vector Search with $vectorSearch aggregation pipeline
 * Requires Atlas Vector Search index to be configured in MongoDB Atlas UI
 */

import { getKnowledgeEntriesCollection } from "./client.js";
import type { SearchResult } from "../types.ts";

/**
 * Search knowledge entries using vector similarity
 * Requires Atlas Vector Search index configured with:
 * - path: "embedding"
 * - numDimensions: 768
 * - similarity: "cosine"
 */
export async function searchKnowledgeVector(
  userId: string,
  queryVector: number[],
  limit = 10,
  type?: string,
): Promise<SearchResult[]> {
  const collection = getKnowledgeEntriesCollection();

  // Build Atlas Vector Search pipeline
  const pipeline: any[] = [
    {
      $vectorSearch: {
        index: "vector_index", // Name of the index in Atlas
        path: "embedding",
        queryVector: queryVector,
        numCandidates: 100,
        limit: limit * 2, // Get more candidates for filtering
      },
    },
    {
      $match: {
        user_id: userId, // Security: filter by user
        ...(type && { type }), // Optional type filter
      },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        type: 1,
        created_at: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ];

  try {
    const results = await collection.aggregate(pipeline).toArray();

    return results.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content,
      type: doc.type,
      created_at: doc.created_at,
      embedding_score: doc.score,
    }));
  } catch (error) {
    console.error("Vector search error:", error);
    throw new Error(
      `Vector search failed. Ensure Atlas Vector Search index is configured. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Hybrid search: combines vector similarity with text search
 * Falls back to text search if vector search fails
 */
export async function searchKnowledgeHybrid(
  userId: string,
  queryText: string,
  queryVector: number[],
  limit = 10,
  type?: string,
  vectorWeight = 0.7, // Weight for vector vs text results (0-1)
): Promise<SearchResult[]> {
  // Run both searches in parallel
  const [vectorResults, textResults] = await Promise.all([
    searchKnowledgeVector(userId, queryVector, limit * 2, type).catch(() => []),
    searchKnowledgeText(userId, queryText, limit * 2, type),
  ]);

  // Combine and deduplicate results
  const seen = new Set<string>();
  const combined: Array<SearchResult & { score: number }> = [];

  // Add vector results with score weighting
  vectorResults.forEach((result, index) => {
    if (!seen.has(result.id)) {
      seen.add(result.id);
      combined.push({
        ...result,
        score: (1 - index / vectorResults.length) * vectorWeight,
      });
    }
  });

  // Add text results with score weighting
  textResults.forEach((result, index) => {
    if (!seen.has(result.id)) {
      seen.add(result.id);
      combined.push({
        ...result,
        score: (1 - index / textResults.length) * (1 - vectorWeight),
      });
    } else {
      // Boost existing result
      const existing = combined.find((r) => r.id === result.id);
      if (existing) {
        existing.score += (1 - index / textResults.length) * (1 - vectorWeight);
      }
    }
  });

  // Sort by combined score and return top results
  return combined
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...result }) => ({
      ...result,
      relevance_score: score,
    }));
}

/**
 * Text-based search using MongoDB text index
 * Fallback when vector search is not available
 */
async function searchKnowledgeText(
  userId: string,
  query: string,
  limit = 10,
  type?: string,
): Promise<SearchResult[]> {
  const collection = getKnowledgeEntriesCollection();

  const filter: any = {
    user_id: userId,
    $text: { $search: query },
  };

  if (type) {
    filter.type = type;
  }

  const results = await collection
    .find(filter)
    .project({ score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .toArray();

  return results.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    content: doc.content,
    type: doc.type,
    created_at: doc.created_at,
    relevance_score: doc.score,
  }));
}

/**
 * Check if Atlas Vector Search is available
 * Tests by running a simple vector search
 */
export async function isVectorSearchAvailable(): Promise<boolean> {
  try {
    const collection = getKnowledgeEntriesCollection();
    await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: new Array(768).fill(0),
            numCandidates: 1,
            limit: 1,
          },
        },
        { $limit: 1 },
      ])
      .toArray();
    return true;
  } catch {
    return false;
  }
}
