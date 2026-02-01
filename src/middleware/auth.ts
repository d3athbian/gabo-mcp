/**
 * Authentication Middleware
 * Validates API keys for all protected operations
 */

import {
  findApiKeyByHash,
  updateApiKeyLastUsed,
  hasAnyApiKeys,
} from "../db/api-keys.js";
import { hashApiKey, isValidApiKeyFormat } from "../utils/api-key.js";
import { logger } from "../utils/logger.js";
import type { ToolResponse } from "../utils/tool-handler.js";

/**
 * Result of API key validation
 */
export type AuthResult =
  | { success: true; keyId: string; name: string }
  | { success: false; error: string };

/**
 * Validate an API key
 * Checks format, existence, and active status
 */
export async function validateApiKey(apiKey: string): Promise<AuthResult> {
  // Check format
  if (!apiKey || typeof apiKey !== "string") {
    return { success: false, error: "API key is required" };
  }

  if (!isValidApiKeyFormat(apiKey)) {
    logger.warn(`Invalid API key format attempted`);
    return { success: false, error: "Invalid API key format" };
  }

  // Hash the provided key to look it up
  const keyHash = hashApiKey(apiKey);

  // Find key in database
  const keyDoc = await findApiKeyByHash(keyHash);

  if (!keyDoc) {
    logger.warn(`API key not found in database`);
    return { success: false, error: "Invalid API key" };
  }

  if (!keyDoc.is_active) {
    logger.warn(`Revoked API key attempted: ${keyDoc.key_preview}`);
    return { success: false, error: "API key has been revoked" };
  }

  // Update last_used timestamp (fire and forget)
  updateApiKeyLastUsed(keyHash).catch((err) => {
    logger.error("Failed to update last_used timestamp", err);
  });

  logger.info(`API key validated: ${keyDoc.name} (${keyDoc.key_preview})`);

  return {
    success: true,
    keyId: keyDoc.id,
    name: keyDoc.name,
  };
}

/**
 * Check if bootstrap mode is available
 * Returns true if no API keys exist yet
 */
export async function isBootstrapAvailable(): Promise<boolean> {
  const hasKeys = await hasAnyApiKeys();
  return !hasKeys;
}

/**
 * Create error response for authentication failures
 */
export function createAuthErrorResponse(error: string): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: false,
            error,
            code: "AUTH_ERROR",
            help: "If this is your first time, run 'create_first_api_key' to bootstrap.",
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
 * Higher-order function to wrap tool handlers with authentication
 *
 * Usage:
 *   const protectedHandler = withAuth(
 *     async (args, auth) => {
 *       // args has api_key removed
 *       // auth contains { keyId, name }
 *       return successResponse({ data });
 *     }
 *   );
 */
export function withAuth<T extends { api_key: string }>(
  handler: (
    args: Omit<T, "api_key">,
    auth: { keyId: string; name: string },
  ) => Promise<ToolResponse>,
) {
  return async (args: T): Promise<ToolResponse> => {
    const { api_key, ...restArgs } = args;

    const authResult = await validateApiKey(api_key);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error);
    }

    return handler(restArgs as Omit<T, "api_key">, {
      keyId: authResult.keyId,
      name: authResult.name,
    });
  };
}
