/**
 * Zod Schemas for Knowledge MCP Server
 * This file is the SOURCE OF TRUTH for all type definitions
 * Types are generated using z.infer<typeof Schema>
 */

import { z } from "zod";
import {
  TimestampsSchema,
  PaginationSchema,
} from "./base.schema.js";

// ============================================================================
// ENUMS
// ============================================================================

export const KnowledgeTypeSchema = z.enum([
  "UI_UX",
  "ARCH_DECISION",
  "PROMPT",
  "ERROR_CORRECTION",
  "CODE_SNIPPET",
  "DESIGN_DECISION",
  "TECHNICAL_INSIGHT",
  "PATTERN",
  "PITFALL",
  "INFRASTRUCTURE",
  "TESTING",
]);

export type KnowledgeType = z.infer<typeof KnowledgeTypeSchema>;

export const VisibilityTypeSchema = z.enum(["private", "archived"]);

export type VisibilityType = z.infer<typeof VisibilityTypeSchema>;

// ============================================================================
// DOMAIN-SPECIFIC BASES
// ============================================================================

export const BaseKnowledgeSchema = z.object({
  type: KnowledgeTypeSchema,
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  source: z.string().optional().describe("Context or pattern this knowledge applies to (e.g. 'auth_flow_optimization', 'db_migration_pattern'). Avoid specific local file paths unless critical."),
  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export const KnowledgeEntrySchema = BaseKnowledgeSchema.extend({
  id: z.string(),
  visibility: VisibilityTypeSchema.optional(),
  embedding: z.array(z.number()).optional(),
}).merge(TimestampsSchema);

export type KnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>;

// StoredEntry is a subset of KnowledgeEntry for external responses
export const StoredEntrySchema = KnowledgeEntrySchema.pick({
  id: true,
  type: true,
  title: true,
  content: true,
  tags: true,
  source: true,
  created_at: true,
});

export type StoredEntry = z.infer<typeof StoredEntrySchema>;

// ============================================================================
// INPUT TYPES
// ============================================================================

export const CreateKnowledgeInputSchema = BaseKnowledgeSchema.partial({
  tags: true,
});

export type CreateKnowledgeInput = z.infer<typeof CreateKnowledgeInputSchema>;

export const SearchKnowledgeInputSchema = z.object({
  query: z.string(),
  type: KnowledgeTypeSchema.optional(),
  similarityThreshold: z.number().optional(),
}).merge(PaginationSchema);

export type SearchKnowledgeInput = z.infer<typeof SearchKnowledgeInputSchema>;

export const SearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: KnowledgeTypeSchema,
  created_at: z.string(),
  relevance_score: z.number().optional(),
  embedding_score: z.number().optional(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// ============================================================================
// TOOL INFRASTRUCTURE
// ============================================================================

export const AuthenticatedToolSchema = z.object({
  api_key: z.string().min(1, "API key is required"),
});

export type AuthenticatedToolArgs = z.infer<typeof AuthenticatedToolSchema>;

export const MCPToolResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type MCPToolResult = z.infer<typeof MCPToolResultSchema>;

// ============================================================================
// TOOL ARGUMENT SCHEMAS
// ============================================================================

export const StoreKnowledgeSchema = BaseKnowledgeSchema.extend({
  embedding: z.array(z.number()).optional(),
}).merge(AuthenticatedToolSchema);

export type StoreKnowledgeArgs = z.infer<typeof StoreKnowledgeSchema>;

export const SearchKnowledgeSchema = z.object({
  query: z.string().min(1, "Query is required"),
  type: KnowledgeTypeSchema.optional(),
}).merge(AuthenticatedToolSchema);

export type SearchKnowledgeArgs = z.infer<typeof SearchKnowledgeSchema>;

export const ListKnowledgeSchema = z.object({
  limit: z.number().positive().int().default(10),
}).merge(AuthenticatedToolSchema);

export type ListKnowledgeArgs = z.infer<typeof ListKnowledgeSchema>;

export const GetKnowledgeSchema = z.object({
  id: z.string().min(1, "ID is required"),
}).merge(AuthenticatedToolSchema);

export type GetKnowledgeArgs = z.infer<typeof GetKnowledgeSchema>;

export const SemanticSearchSchema = z.object({
  query_vector: z.array(z.number()).min(1, "Vector is required"),
  type: KnowledgeTypeSchema.optional(),
  limit: z.number().positive().int().default(10),
}).merge(AuthenticatedToolSchema);

export type SemanticSearchArgs = z.infer<typeof SemanticSearchSchema>;

export const SuggestPatternsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  context: z.string().optional(),
}).merge(AuthenticatedToolSchema);

export type SuggestPatternsArgs = z.infer<typeof SuggestPatternsSchema>;

export const GetPitfallsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  context: z.string().optional(),
}).merge(AuthenticatedToolSchema);

export type GetPitfallsArgs = z.infer<typeof GetPitfallsSchema>;

// ============================================================================
// MCP RESPONSE SCHEMAS
// ============================================================================

export const MCPToolResponseSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
    }),
  ),
  isError: z.boolean().optional(),
});

export type MCPToolResponse = z.infer<typeof MCPToolResponseSchema>;

export const ToolResponseDataSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  message: z.string().optional(),
  entry: StoredEntrySchema.optional(),
  query: z.string().optional(),
  results: z.array(StoredEntrySchema).optional(),
  count: z.number().optional(),
  entries: z.array(StoredEntrySchema).optional(),
  total: z.number().optional(),
  error: z.string().optional(),
});

export type ToolResponseData = z.infer<typeof ToolResponseDataSchema>;

// ============================================================================
// API KEY SCHEMAS
// ============================================================================

export const ApiKeySchema = z.object({
  id: z.string(),
  key: z.string(),
  last_used: z.string().optional(),
  is_active: z.boolean(),
}).merge(TimestampsSchema.pick({ created_at: true }));

export type ApiKey = z.infer<typeof ApiKeySchema>;
