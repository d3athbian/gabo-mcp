/**
 * Authentication Middleware
 * Validates API key from process.env.MCP_API_KEY against MongoDB record
 */

import {
  findApiKeyByKey,
  hasAnyApiKeys,
  createApiKey,
} from "../../db/api-keys.js";
import {
  generateApiKey,
  isValidApiKeyFormat,
} from "../../utils/api-key/index.js";
import { logger } from "../../utils/logger/index.js";
import { type ToolResponse } from "../../utils/tool-handler/tool-handler.type.js";
import type { AuthResult } from "./auth.type.js";

export async function isBootstrapAvailable(): Promise<boolean> {
  return !(await hasAnyApiKeys());
}

export async function validateApiKey(apiKey: string): Promise<AuthResult> {
  if (!apiKey || typeof apiKey !== "string") {
    return {
      success: false,
      error: "API key is required. Set MCP_API_KEY in your MCP server config.",
    };
  }

  if (!isValidApiKeyFormat(apiKey)) {
    logger.warn(`Invalid API key format`);
    return {
      success: false,
      error: "Invalid API key format. Key should start with 'gabo_'.",
    };
  }

  const keyDoc = await findApiKeyByKey(apiKey);

  if (!keyDoc) {
    logger.warn(`API key not found in MongoDB`);
    return {
      success: false,
      error: "Invalid API key. Key not found in database.",
    };
  }

  if (!keyDoc.is_active) {
    logger.warn(`Revoked API key attempted`);
    return { success: false, error: "API key has been revoked." };
  }

  return {
    success: true,
    keyId: keyDoc.id,
  };
}

export async function ensureApiKeyExists(): Promise<string> {
  const hasExistingKey = await hasAnyApiKeys();

  if (hasExistingKey) {
    return "";
  }

  const key = generateApiKey();
  await createApiKey(key);

  const preview = `...${key.slice(-8)}`;
  logger.info(`First-time API key generated: ${preview}`);
  logger.warn("SAVE THIS KEY - Add to your MCP config env!");

  return key;
}

export function createAuthErrorResponse(error: string): ToolResponse {
  let help = "";

  if (error.includes("required")) {
    help =
      "API key is required. Add 'MCP_API_KEY' to your MCP server env config.";
  } else if (error.includes("format")) {
    help = "Invalid key format. Keys should start with 'gabo_'.";
  } else if (error.includes("not found")) {
    help = "Key not found in MongoDB. Check your database api_keys collection.";
  } else if (error.includes("revoked")) {
    help =
      "This key was revoked. Delete the record from MongoDB and restart to generate a new one.";
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          { success: false, error, code: "AUTH_ERROR", help },
          null,
          2,
        ),
      },
    ],
    isError: true,
  };
}

export function withAuth<T>(
  handler: (args: T, auth: { keyId: string }) => Promise<ToolResponse>,
) {
  return async (args: T): Promise<ToolResponse> => {
    const apiKey = process.env.MCP_API_KEY;

    if (!apiKey) {
      logger.error("MCP_API_KEY environment variable not set");
      return createAuthErrorResponse(
        "MCP_API_KEY not configured. Set it in your MCP server config.",
      );
    }

    const authResult = await validateApiKey(apiKey);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error);
    }

    return await handler(args, {
      keyId: authResult.keyId,
    });
  };
}
