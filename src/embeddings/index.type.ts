/**
 * Type definitions for embeddings module
 * Extends base.type.ts for common patterns
 */

import type { Embedding, EmbeddingBatch } from '../base.type.ts';

export type EmbeddingResult = Embedding;

export type BatchEmbeddingsResult = EmbeddingBatch;

export type EmbeddingResponse = {
  embedding: Embedding;
  model: string;
  usage?: {
    prompt_tokens?: number;
  };
};

export type OllamaEmbeddingRequest = {
  model: string;
  prompt: string;
};

export type OllamaEmbeddingResponse = {
  embedding: Embedding;
};

export type SemanticSearchResult = string[];
