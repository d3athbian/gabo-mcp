import { z } from "zod";
import {
  EntityIdSchema,
  EntityTimestampSchema,
  EntityTypeSchema,
  TimestampsSchema,
  PaginationSchema,
  ContentBlockSchema,
  ResponseContentSchema,
  ErrorResponseSchema,
  LogLevelSchema
} from "./schemas/base.schema.js";

// ============================================================================
// ENVIRONMENT & CONFIGURATION TYPES
// ============================================================================

export type NodeEnvironment = "development" | "production" | "test";

export type LogLevel = z.infer<typeof LogLevelSchema>;

export type Nullable<T> = T | null | undefined;

// ============================================================================
// COMMON ENTITY PROPERTIES
// ============================================================================

export type EntityId = z.infer<typeof EntityIdSchema>;

export type EntityType = z.infer<typeof EntityTypeSchema>;

export type EntityTimestamp = z.infer<typeof EntityTimestampSchema>;

export type BaseEntity = z.infer<typeof TimestampsSchema> & {
  id: EntityId;
};

// ============================================================================
// KNOWLEDGE DOMAIN TYPES
// ============================================================================

// NOTE: Specific knowledge types are now in index.schema.ts

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

export type PaginationParams = z.infer<typeof PaginationSchema>;

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

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

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

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

export type ResponseContent = z.infer<typeof ResponseContentSchema>;

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
// DATABASE GENERIC TYPES
// ============================================================================

export type DatabaseRow = z.infer<typeof TimestampsSchema> & {
  id: EntityId;
};

export type QueryError = {
  message: string;
  code?: string;
};
