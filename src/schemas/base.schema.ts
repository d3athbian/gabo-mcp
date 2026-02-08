/**
 * Base Zod Schemas
 * Reusable schema fragments for the entire application
 */

import { z } from "zod";

// ============================================================================
// PRIMITIVES
// ============================================================================

export const EntityIdSchema = z.string();
export const EntityTimestampSchema = z.string(); // ISO 8601
export const EntityTypeSchema = z.string();

// ============================================================================
// HELPERS
// ============================================================================

export const TimestampsSchema = z.object({
    created_at: EntityTimestampSchema,
    updated_at: EntityTimestampSchema.optional(),
});

export const PaginationSchema = z.object({
    limit: z.number().positive().int().default(10),
    offset: z.number().nonnegative().int().default(0),
});

// ============================================================================
// MCP SPECIFIC
// ============================================================================

export const ContentBlockSchema = z.object({
    type: z.literal("text"),
    text: z.string(),
});

export const ResponseContentSchema = z.array(ContentBlockSchema);

export const ErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.string(),
});

export const SuccessResponseSchema = z.object({
    success: z.literal(true),
    data: z.unknown(),
});

export const ToolResponseSchema = z.object({
    content: ResponseContentSchema,
    isError: z.boolean().optional(),
});

export const LogLevelSchema = z.enum(["debug", "info", "warn", "error"]);
