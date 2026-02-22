/**
 * Tool Handler Utility
 * Reusable error handling and response formatting for MCP tools
 */

import type { ContentBlock, ErrorResponse } from '../../base.type.js';
import { recordAuditLog } from '../../db/audit-log.js';
import type { AuditAction } from '../../db/audit-log.type.js';
import { logger } from '../logger/index.js';
import type { HandleToolErrorOptions, ToolResponse } from './tool-handler.type.js';

/**
 * Handles errors in tool catch blocks
 * Logs the error and returns a standardized MCP error response
 */
export function handleToolError(
  error: unknown,
  operationName: string,
  options?: HandleToolErrorOptions
): ToolResponse {
  const errorMessage =
    options?.customMessage ?? (error instanceof Error ? error.message : String(error));

  // Log based on level
  if (options?.logLevel === 'warn') {
    logger.warn(`${operationName} failed: ${errorMessage}`);
  } else {
    logger.error(`${operationName} failed`, error);
  }

  // Create error response following ErrorResponse pattern
  const errorData: ErrorResponse = {
    success: false,
    error: errorMessage,
  };

  const contentBlock: ContentBlock = {
    type: 'text',
    text: JSON.stringify(errorData, null, 2),
  };

  return {
    content: [contentBlock],
    isError: true,
  };
}

/**
 * Creates a standardized success response
 */
export function successResponse<T extends Record<string, unknown>>(data: T): ToolResponse {
  const successData = {
    success: true,
    ...data,
  };

  const contentBlock: ContentBlock = {
    type: 'text',
    text: JSON.stringify(successData, null, 2),
  };

  return {
    content: [contentBlock],
  };
}

/**
 * Middleware: Global Error Handling
 * Wraps a handler with try/catch and standardized logging
 */
export function withErrorHandler(
  operationName: string,
  handler: (args: any) => Promise<ToolResponse>
) {
  return async (args: any): Promise<ToolResponse> => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, operationName);
    }
  };
}

/**
 * Middleware: Audit Logging
 * Records tool execution in the audit log collection
 */
export function withAudit(
  operationName: string,
  action: AuditAction,
  handler: (args: any) => Promise<ToolResponse>
) {
  return async (args: any): Promise<ToolResponse> => {
    const response = await handler(args);

    await recordAuditLog({
      action,
      success: !response.isError,
      metadata: {
        tool: operationName,
      },
    });

    return response;
  };
}

export function errorResponse(message: string, code?: string): ToolResponse {
  const errorData = {
    success: false,
    error: message,
    code: code || 'ERROR',
  };

  const contentBlock: ContentBlock = {
    type: 'text',
    text: JSON.stringify(errorData, null, 2),
  };

  return {
    content: [contentBlock],
    isError: true,
  };
}
