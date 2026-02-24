/**
 * Tool Factory
 * Creates MCP tool definitions with less boilerplate
 */

import type { ZodTypeAny } from 'zod';
import type { ToolDefinition } from '../tools/index.type.js';
import type { AuditAction } from '../types.js';
import { withAudit } from './tool-handler/index.js';
import type { ToolResponse } from './tool-handler/tool-handler.type.js';

export interface ToolConfig {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodTypeAny;
  auditAction?: AuditAction;
  skipAuth?: boolean;
}

/**
 * Factory for creating MCP tools with standardized configuration
 * Applies error handling and audit logging automatically
 */
export function createTool<T extends Record<string, unknown>>(
  config: ToolConfig,
  handler: (args: T) => Promise<ToolResponse>
): ToolDefinition<T> {
  const wrappedHandler = async (args: unknown): Promise<ToolResponse> => {
    return handler(args as T);
  };

  const finalHandler = config.auditAction
    ? withAudit(config.name, config.auditAction, wrappedHandler)
    : wrappedHandler;

  return {
    name: config.name,
    title: config.title,
    description: config.description,
    inputSchema: config.inputSchema,
    auditAction: config.auditAction,
    skipAuth: config.skipAuth,
    handler: finalHandler,
  };
}
