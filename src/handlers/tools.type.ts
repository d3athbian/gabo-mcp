/**
 * Type definitions for tools handlers module
 * Extends base.type.ts for common patterns
 */

import type { ApiResponse, KnowledgeAttributes, PaginationParams } from '../base.type.ts';

export type StoreKnowledgeInput = {
  type: string;
  title: string;
  content: string;
  tags?: string[];
  source?: string;
};

export type SearchKnowledgeInput = {
  query: string;
  type?: string;
};

export type ListKnowledgeInput = PaginationParams;

export type GetKnowledgeInput = {
  id: string;
};

export type KnowledgeEntryResponse = Pick<KnowledgeAttributes, 'id' | 'type' | 'title' | 'created_at' | 'tags'>;

export type SearchResultResponse = {
  query: string;
  results: KnowledgeAttributes[];
  count: number;
};

export type ListResultResponse = {
  entries: KnowledgeAttributes[];
  total: number;
  limit?: number;
  offset?: number;
};

export type ToolResultData = Partial<KnowledgeAttributes> & {
  query?: string;
  results?: unknown[];
  count?: number;
  entries?: unknown[];
  total?: number;
  limit?: number;
  offset?: number;
};

export type ToolResult = ApiResponse<ToolResultData>;
