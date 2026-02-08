/**
 * Tool Types
 * Type definitions for MCP tools following base.type.ts patterns
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodTypeAny } from "zod";
import type { ToolResponse } from "../utils/tool-handler.js";

/**
 * Tool handler function type
 */
export type ToolHandler<T> = (args: T) => Promise<ToolResponse>;

/**
 * Tool definition for registration
 */
export type ToolDefinition<T> = {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodTypeAny;
  handler: ToolHandler<T>;
};

/**
 * Tool registrar function type
 */
export type ToolRegistrar = (server: McpServer) => void;
