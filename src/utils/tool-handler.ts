/**
 * Tool Error Handler Utility
 * Reusable error handling for MCP tool catch blocks
 * Keeps the try-catch structure visible while standardizing error responses
 */

import { logger } from "./logger.js";

export interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/**
 * Handles errors in tool catch blocks
 * Logs the error and returns a standardized error response
 *
 * Usage:
 *   } catch (error) {
 *     return handleToolError(error, "Store knowledge");
 *   }
 */
export function handleToolError(
  error: unknown,
  operationName: string,
  options?: {
    customMessage?: string;
    logLevel?: "error" | "warn";
  },
): ToolResponse {
  const errorMessage =
    options?.customMessage ||
    (error instanceof Error ? error.message : String(error));

  if (options?.logLevel === "warn") {
    logger.warn(`${operationName} failed: ${errorMessage}`);
  } else {
    logger.error(`${operationName} failed`, error);
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: false,
            error: errorMessage,
          },
          null,
          2,
        ),
      },
    ],
    isError: true,
  };
}

/**
 * Creates a standardized success response
 *
 * Usage:
 *   return successResponse({ id: entry.id, message: "Created" });
 */
export function successResponse(data: Record<string, unknown>): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: true,
            ...data,
          },
          null,
          2,
        ),
      },
    ],
  };
}

/**
 * Creates a standardized validation error response
 *
 * Usage:
 *   if (!title) return validationError("title is required");
 */
export function validationError(message: string): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: false,
            error: `Error: ${message}`,
          },
          null,
          2,
        ),
      },
    ],
    isError: true,
  };
}
