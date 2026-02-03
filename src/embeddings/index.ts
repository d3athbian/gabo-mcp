/**
 * Placeholder for embedding module
 * To be fully implemented in Phase 4 with vector search
 */

import { config } from "../config/config.js";
import { logger } from "../utils/logger.js";
import type { EmbeddingResponse } from "../types.js";

/**
 * Generate embedding for a text using Ollama (or OpenAI in future)
 * Phase 4 implementation: full vector pipeline
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!config.features.enableEmbeddings) {
    // Return empty array if embeddings disabled
    return [];
  }

  try {
    if (config.embeddings.provider === "ollama") {
      return await generateOllamaEmbedding(text);
    } else if (config.embeddings.provider === "openai") {
      // TODO: Implement OpenAI embeddings in Phase 4+
      throw new Error("OpenAI embeddings not yet implemented");
    }
  } catch (error) {
    logger.error("Failed to generate embedding", error);
    // Graceful degradation: return empty array
    return [];
  }

  return [];
}

/**
 * Generate embedding using Ollama (Phase 4)
 */
async function generateOllamaEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `${config.embeddings.ollamaUrl}/api/embeddings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.embeddings.model,
        prompt: text,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = (await response.json()) as EmbeddingResponse;
  return data.embedding;
}

/**
 * Batch generate embeddings for multiple texts (Phase 4)
 */
export async function batchEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    results.push(embedding);
  }

  return results;
}

/**
 * Placeholder for vector search (Phase 4)
 * To be implemented with pgvector similarity
 */
export async function semanticSearch(
  _embedding: number[],
  _limit = 10,
): Promise<string[]> {
  // TODO: Implement semantic search with pgvector in Phase 4
  logger.info("Semantic search not yet implemented (Phase 4)");
  return [];
}
