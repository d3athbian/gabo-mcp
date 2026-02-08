import { z } from "zod";
import { ToolResponseSchema, LogLevelSchema } from "../../schemas/base.schema.js";

/**
 * MCP Tool response structure
 */
export type ToolResponse = z.infer<typeof ToolResponseSchema>;

/**
 * Options for error handling
 */
export type HandleToolErrorOptions = {
    customMessage?: string;
    logLevel?: z.infer<typeof LogLevelSchema>;
};
