/**
 * Core types for Knowledge MCP Server
 */

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

export interface KnowledgeEntry {
  id: string;
  user_id: string;
  type: KnowledgeType;
  title: string;
  content: string;
  embedding?: number[];
  tags: string[];
  source?: string;
  visibility: VisibilityType;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeInput {
  type: KnowledgeType;
  title: string;
  content: string;
  tags?: string[];
  source?: string;
}

export interface SearchKnowledgeInput {
  query: string;
  type?: KnowledgeType;
  limit?: number;
  offset?: number;
  similarityThreshold?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  created_at: string;
  relevance_score?: number;
  embedding_score?: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage?: {
    prompt_tokens?: number;
  };
}

export interface MCPToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
