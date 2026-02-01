/**
 * Zod Schemas for Knowledge MCP Server
 * This file is the SOURCE OF TRUTH for all type definitions
 * Types are generated using z.infer<typeof Schema>
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const KnowledgeTypeSchema = z.enum([
  "UI_REASONING",
  "ARCH_DECISION",
  "PROMPT",
  "ERROR_CORRECTION",
  "CODE_SNIPPET",
  "DESIGN_DECISION",
  "TECHNICAL_INSIGHT",
  "REACT_PATTERN",
]);

export type KnowledgeType = z.infer<typeof KnowledgeTypeSchema>;

export const VisibilityTypeSchema = z.enum(["private", "archived"]);

export type VisibilityType = z.infer<typeof VisibilityTypeSchema>;

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export const KnowledgeEntrySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: KnowledgeTypeSchema,
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  source: z.string().optional(),
  visibility: VisibilityTypeSchema.optional(),
  embedding: z.array(z.number()).optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export type KnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>;

// ============================================================================
// INPUT TYPES
// ============================================================================

export const CreateKnowledgeInputSchema = z.object({
  type: KnowledgeTypeSchema,
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

export type CreateKnowledgeInput = z.infer<typeof CreateKnowledgeInputSchema>;

export const SearchKnowledgeInputSchema = z.object({
  query: z.string(),
  type: KnowledgeTypeSchema.optional(),
  similarityThreshold: z.number().optional(),
  limit: z.number().positive().int().default(10),
  offset: z.number().nonnegative().int().default(0),
});

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
// TOOL RESPONSE TYPES
// ============================================================================

export const MCPToolResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type MCPToolResult = z.infer<typeof MCPToolResultSchema>;

export const EmbeddingResponseSchema = z.object({
  embedding: z.array(z.number()),
  model: z.string(),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
    })
    .optional(),
});

export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>;

// ============================================================================
// SERVER-SPECIFIC TYPES
// ============================================================================

export const StoredEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  source: z.string().optional(),
  created_at: z.string(),
});

export type StoredEntry = z.infer<typeof StoredEntrySchema>;

export const StoreKnowledgeSchema = z.object({
  type: KnowledgeTypeSchema,
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

export type StoreKnowledgeArgs = z.infer<typeof StoreKnowledgeSchema>;

export const SearchKnowledgeSchema = z.object({
  query: z.string().min(1, "Query is required"),
  type: KnowledgeTypeSchema.optional(),
});

export type SearchKnowledgeArgs = z.infer<typeof SearchKnowledgeSchema>;

export const ListKnowledgeSchema = z.object({
  limit: z.number().positive().int().default(10),
});

export type ListKnowledgeArgs = z.infer<typeof ListKnowledgeSchema>;

export const GetKnowledgeSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export type GetKnowledgeArgs = z.infer<typeof GetKnowledgeSchema>;

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
