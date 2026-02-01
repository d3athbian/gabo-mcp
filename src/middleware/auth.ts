/**
 * Authentication Middleware
 * Validates API keys for all protected operations
 * Requires MCP_API_KEY in config to match MongoDB record
 */

import {
  findApiKeyByHash,
  updateApiKeyLastUsed,
  hasAnyApiKeys,
} from "../db/api-keys.js";
import { hashApiKey, isValidApiKeyFormat } from "../utils/api-key.js";
import { config } from "../config/config.js";
import { logger } from "../utils/logger.js";
import type { ToolResponse } from "../utils/tool-handler.js";

export type AuthResult =
  | { success: true; keyId: string; name: string }
  | { success: false; error: string };

export async function validateApiKey(apiKey: string): Promise<AuthResult> {
  if (!apiKey || typeof apiKey !== "string") {
    return { success: false, error: "API key is required" };
  }

  if (!isValidApiKeyFormat(apiKey)) {
    logger.warn(`Invalid API key format attempted`);
    return { success: false, error: "Invalid API key format" };
  }

  if (!config.mcp.apiKey) {
    logger.warn("MCP_API_KEY not configured in server");
    return { success: false, error: "Server not configured with API key" };
  }

  if (apiKey !== config.mcp.apiKey) {
    logger.warn("API key doesn't match server configuration");
    return { success: false, error: "Invalid API key" };
  }

  const keyHash = hashApiKey(apiKey);
  const keyDoc = await findApiKeyByHash(keyHash);

  if (!keyDoc) {
    logger.warn(`API key not found in MongoDB`);
    return { success: false, error: "API key not registered in database" };
  }

  if (!keyDoc.is_active) {
    logger.warn(`Revoked API key attempted: ${keyDoc.key_preview}`);
    return { success: false, error: "API key has been revoked" };
  }

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

export async function isBootstrapAvailable(): Promise<boolean> {
  const hasKeys = await hasAnyApiKeys();
  return !hasKeys;
}

export function isApiKeyInConfig(): boolean {
  return !!config.mcp.apiKey;
}

export function createAuthErrorResponse(error: string): ToolResponse {
  let help = "";
  const configHasKey = isApiKeyInConfig();

  if (error === "API key is required") {
    help =
      "⚠️  No API key provided in the request.\n\n" +
      "Add api_key to your request or configure MCP_API_KEY in .env";
  } else if (error === "Server not configured with API key") {
    help =
      "⚠️  MCP_API_KEY not configured in server.\n\n" +
      "1. Run 'create_first_api_key' to generate a key\n" +
      "2. Add the key to your .env file: MCP_API_KEY=your-key\n" +
      "3. Restart the MCP server";
  } else if (error === "Invalid API key format") {
    help = "API key format is invalid. Keys should start with 'gabo_'.";
  } else if (error === "Invalid API key") {
    if (configHasKey) {
      help =
        "API key doesn't match server configuration.\n" +
        "Ensure the key in your request matches MCP_API_KEY in .env";
    } else {
      help =
        "API key is invalid.\n" +
        "1. Run 'create_first_api_key' if this is your first time\n" +
        "2. Add the generated key to your .env file";
    }
  } else if (error === "API key not registered in database") {
    help =
      "API key not found in MongoDB.\n" +
      "The key must exist in both .env and MongoDB.\n" +
      "Run 'create_first_api_key' to register your key.";
  } else if (error === "API key has been revoked") {
    help =
      "This API key has been revoked. Run 'create_first_api_key' to create a new one.";
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: false,
            error,
            code: "AUTH_ERROR",
            help,
            config_status: configHasKey ? "configured" : "missing",
          },
          null,
          2,
        ),
      },
    ],
    isError: true,
  };
}

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
