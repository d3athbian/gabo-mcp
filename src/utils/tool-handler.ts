/**
 * Tool Handler Utility
 * Reusable error handling and response formatting for MCP tools
 * Follows base.type.ts architecture patterns
 */

import { logger } from "./logger.js";
import type {
  ContentBlock,
  ResponseContent,
  ErrorResponse,
  LogLevel,
} from "../base.type.js";

/**
 * MCP Tool response structure
 * Uses base.type.ts ContentBlock pattern
 */
export type ToolResponse = {
  content: ResponseContent;
  isError?: boolean;
};

/**
 * Options for error handling
 */
export type HandleToolErrorOptions = {
  customMessage?: string;
  logLevel?: LogLevel;
};

/**
 * Handles errors in tool catch blocks
 * Logs the error and returns a standardized MCP error response
 *
 * Usage:
 *   } catch (error) {
 *     return handleToolError(error, "Store knowledge");
 *   }
 */
export function handleToolError(
  error: unknown,
  operationName: string,
  options?: HandleToolErrorOptions,
): ToolResponse {
  const errorMessage =
    options?.customMessage ??
    (error instanceof Error ? error.message : String(error));

  // Log based on level
  if (options?.logLevel === "warn") {
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
    type: "text",
    text: JSON.stringify(errorData, null, 2),
  };

  return {
    content: [contentBlock],
    isError: true,
  };
}

/**
 * Creates a standardized success response
 * Follows SuccessResponse<T> pattern from base.type.ts
 *
 * Usage:
 *   return successResponse({ id: entry.id, message: "Created" });
 */
export function successResponse<T extends Record<string, unknown>>(
  data: T,
): ToolResponse {
  const successData = {
    success: true,
    ...data,
  };

  const contentBlock: ContentBlock = {
    type: "text",
    text: JSON.stringify(successData, null, 2),
  };

  return {
    content: [contentBlock],
  };
}

/**
 * Creates a standardized validation error response
 *
 * Usage:
 *   if (!title) return validationError("title is required");
 */
export function validationError(message: string): ToolResponse {
  const errorData: ErrorResponse = {
    success: false,
    error: `Error: ${message}`,
  };

  const contentBlock: ContentBlock = {
    type: "text",
    text: JSON.stringify(errorData, null, 2),
  };

  return {
    content: [contentBlock],
    isError: true,
  };
}
