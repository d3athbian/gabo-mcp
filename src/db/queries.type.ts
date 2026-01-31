/**
 * Type definitions for database queries module
 * Extends base.type.ts for common patterns
 */

import type { EntityId, EntityTimestamp, EntityType, DatabaseRow, QueryError, Embedding } from '../base.type.ts';

export type QueryResult<T> = {
  data: T | null;
  error: QueryError | null;
};

export type ListQueryResult<T> = {
  data: T[];
  count: number | null;
};

export type KnowledgeEntryRow = DatabaseRow & {
  user_id: EntityId;
  type: EntityType;
  title: string;
  content: string;
  tags: string[];
  source?: string;
  visibility: string;
  updated_at?: EntityTimestamp;
  embedding?: Embedding;
};

export type SearchResultRow = DatabaseRow & {
  title: string;
  content: string;
  type: EntityType;
  relevance_score?: number;
  embedding_score?: number;
};
