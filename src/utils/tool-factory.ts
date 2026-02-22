/**
 * Tool Factory
 * Creates MCP tool definitions with less boilerplate
 */

import type { ZodTypeAny } from 'zod';
import type { AuditAction } from '../db/audit-log.type.js';
import type { ToolDefinition } from '../tools/index.type.js';
import { type successResponse, withAudit, withErrorHandler } from './tool-handler/index.js';

export interface ToolConfig {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodTypeAny;
  auditAction?: AuditAction;
  skipAuth?: boolean;
}

type SimpleHandler = (args: any) => Promise<ReturnType<typeof successResponse>>;

/**
 * Factory for creating MCP tools with standardized configuration
 * Applies error handling and audit logging automatically
 */
export function createTool(config: ToolConfig, handler: SimpleHandler): ToolDefinition<any> {
  const wrappedHandler = withErrorHandler(config.name, handler);

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
