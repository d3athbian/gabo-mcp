/**
 * MongoDB Atlas Vector Search Utilities
 * Uses Atlas Vector Search with $vectorSearch aggregation pipeline
 * Requires Atlas Vector Search index to be configured in MongoDB Atlas UI
 * Falls back to text search automatically when vector search is unavailable
 *
 * Note: No caching of availability. Each request attempts vector search first,
 * falling back to text search only if vector search genuinely fails.
 * This handles Atlas serverless "cold start" correctly.
 */

import type { SearchResult } from '../types.ts';
import { logger } from '../utils/logger/index.js';
import { getKnowledgeEntriesCollection } from './client.js';

/**
 * Search knowledge entries using vector similarity
 * Requires Atlas Vector Search index configured with:
 * - path: "embedding"
 * - numDimensions: 768
 * - similarity: "cosine"
 */
export async function searchKnowledgeVector(
  queryVector: number[],
  limit = 10,
  type?: string
): Promise<SearchResult[]> {
  const collection = getKnowledgeEntriesCollection();

  // Build Atlas Vector Search pipeline
  const pipeline: any[] = [
    {
      $vectorSearch: {
        index: 'vector_index', // Name of the index in Atlas
        path: 'embedding',
        queryVector: queryVector,
        numCandidates: 100,
        limit: limit * 2, // Get more candidates for filtering
      },
    },
    {
      $match: {
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
        score: { $meta: 'vectorSearchScore' },
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
    const err = error as any;
    if (err.codeName === 'AtlasSearchDisabled' || err.message?.includes('atlas')) {
      logger.debug('Vector search not available on this Atlas tier');
    } else {
      logger.debug(`Vector search error: ${err.message}`);
    }
    throw error;
  }
}

/**
 * Hybrid search: combines vector similarity with text search
 * Falls back to text search if vector search fails
 */
export async function searchKnowledgeHybrid(
  queryText: string,
  queryVector: number[],
  limit = 10,
  type?: string,
  vectorWeight = 0.7 // Weight for vector vs text results (0-1)
): Promise<SearchResult[]> {
  // Run both searches in parallel
  const [vectorResults, textResults] = await Promise.all([
    searchKnowledgeVector(queryVector, limit * 2, type).catch(() => []),
    searchKnowledgeText(queryText, limit * 2, type),
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
  query: string,
  limit = 10,
  type?: string
): Promise<SearchResult[]> {
  const collection = getKnowledgeEntriesCollection();

  const filter: any = {
    $text: { $search: query },
  };

  if (type) {
    filter.type = type;
  }

  const results = await collection
    .find(filter)
    .project({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
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
 * Performs real-time check (no caching) to handle Atlas cold start
 */
export async function isVectorSearchAvailable(): Promise<boolean> {
  try {
    const collection = getKnowledgeEntriesCollection();
    const count = await collection.countDocuments({
      embedding: { $exists: true, $ne: [] },
    });
    return count > 0;
  } catch {
    return false;
  }
}
