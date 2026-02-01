/**
 * Type definitions for embeddings module
 * EmbeddingResponse is now in schemas/index.schema.ts
 * Other types remain as they are low-level patterns
 */

export type EmbeddingResult = number[];

export type BatchEmbeddingsResult = number[][];

export type OllamaEmbeddingRequest = {
  model: string;
  prompt: string;
};

export type OllamaEmbeddingResponse = {
  embedding: number[];
};

export type SemanticSearchResult = string[];
