/**
 * Tool Types
 * Type definitions for MCP tools following base.type.ts patterns
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodTypeAny } from 'zod';
import type { ToolResponse } from '../utils/tool-handler/tool-handler.type.js';

/**
 * Tool handler function type
 * Receives arguments WITHOUT api_key (extracted by middleware)
 */
export type BaseToolHandler<T> = (args: T, auth: { keyId: string }) => Promise<ToolResponse>;

/**
 * Metadata for tool definition
 */
export type ToolDefinition<T> = {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodTypeAny;
  handler: BaseToolHandler<Omit<T, 'api_key'>>;
  skipAuth?: boolean; // Optional flag to bypass authentication
  auditAction?: import('../db/audit-log.type.js').AuditAction;
};

/**
 * Tool registrar function type
 */
export type ToolRegistrar = (server: McpServer) => void;
