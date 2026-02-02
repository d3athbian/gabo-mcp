/**
 * Base type definitions - Source of truth for common types
 * All other *.type.ts files should extend from these base types
 */

// ============================================================================
// ENVIRONMENT & CONFIGURATION TYPES
// ============================================================================

export type NodeEnvironment = "development" | "production" | "test";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type Nullable<T> = T | null | undefined;

// ============================================================================
// COMMON ENTITY PROPERTIES
// ============================================================================

export type EntityId = string;

export type EntityType = string;

export type EntityTimestamp = string; // ISO 8601

export type BaseEntity = {
  id: EntityId;
  created_at: EntityTimestamp;
  updated_at?: EntityTimestamp;
};

// ============================================================================
// KNOWLEDGE DOMAIN TYPES
// ============================================================================

export type KnowledgeAttributes = {
  id: EntityId;
  type: EntityType;
  title: string;
  content: string;
  tags: string[];
  source?: string;
  created_at: EntityTimestamp;
};

export type KnowledgeWithMeta = KnowledgeAttributes & {
  user_id: EntityId;
  visibility?: "private" | "archived";
  embedding?: number[];
  updated_at?: EntityTimestamp;
};

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export type FilterParams = {
  query?: string;
  type?: EntityType;
};

// ============================================================================
// GENERIC RESPONSE PATTERNS
// ============================================================================

export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type ErrorResponse = {
  success: false;
  error: string;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type ListResponse<T> = {
  success: boolean;
  data: T[];
  count: number;
  limit?: number;
  offset?: number;
};

// ============================================================================
// CONTENT TYPES
// ============================================================================

export type ContentBlock = {
  type: "text";
  text: string;
};

export type ResponseContent = ContentBlock[];

// ============================================================================
// LOGGING
// ============================================================================

export type LogFn = (msg: string) => void;

export type LogErrorFn = (msg: string, error?: unknown) => void;

export type LoggerInterface = {
  info: LogFn;
  warn: LogFn;
  error: LogErrorFn;
  debug: LogFn;
};

// ============================================================================
// CALLBACK TYPES
// ============================================================================

export type ErrorCallback = (error?: Error | null) => void;

export type WriteCallback = ErrorCallback;

// ============================================================================
// EMBEDDING TYPES
// ============================================================================

export type Embedding = number[];

export type EmbeddingBatch = Embedding[];

// ============================================================================
// DATABASE GENERIC TYPES
// ============================================================================

export type DatabaseRow = {
  id: EntityId;
  created_at: EntityTimestamp;
};

export type QueryError = {
  message: string;
  code?: string;
};
