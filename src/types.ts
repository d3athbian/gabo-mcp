/**
 * Core types for Knowledge MCP Server
 * Extends base.type.ts for common patterns
 */

import type { EntityId, EntityTimestamp, Embedding, KnowledgeWithMeta, PaginationParams } from './base.type.ts';

export type KnowledgeType = 
  | 'UI_REASONING'
  | 'ARCH_DECISION'
  | 'PROMPT'
  | 'ERROR_CORRECTION'
  | 'CODE_SNIPPET'
  | 'DESIGN_DECISION'
  | 'TECHNICAL_INSIGHT'
  | 'REACT_PATTERN';

export type VisibilityType = 'private' | 'archived';

export type KnowledgeEntry = KnowledgeWithMeta & {
  type: KnowledgeType;
  visibility: VisibilityType;
};

export type CreateKnowledgeInput = {
  type: KnowledgeType;
  title: string;
  content: string;
  tags?: string[];
  source?: string;
};

export type SearchKnowledgeInput = PaginationParams & {
  query: string;
  type?: KnowledgeType;
  similarityThreshold?: number;
};

export type SearchResult = {
  id: EntityId;
  title: string;
  content: string;
  type: KnowledgeType;
  created_at: EntityTimestamp;
  relevance_score?: number;
  embedding_score?: number;
};

export type EmbeddingResponse = {
  embedding: Embedding;
  model: string;
  usage?: {
    prompt_tokens?: number;
  };
};

export type MCPToolResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};
