/**
 * Authentication Middleware
 * Validates API key from process.env.MCP_API_KEY against MongoDB record.
 *
 * Security model:
 *  - MCP_KEY_PEPPER lives ONLY in .env (auto-generated on first boot)
 *  - MCP_API_KEY lives ONLY in .env (auto-generated on first boot)
 *  - MongoDB stores ONLY the bcrypt hash of (key + pepper)
 */

import {
  findApiKeyByKey,
  hasAnyApiKeys,
  createApiKey,
} from "../../db/api-keys.js";
import {
  generateApiKey,
  isValidApiKeyFormat,
  hashApiKey,
  ensurePepperExists,
  writeEnvVariable,
} from "../../utils/api-key/index.js";
import { logger } from "../../utils/logger/index.js";
import { type ToolResponse } from "../../utils/tool-handler/tool-handler.type.js";
import type { AuthResult } from "./auth.type.js";
import { recordAuditLog } from "../../db/audit-log.js";

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
    await recordAuditLog({
      action: "auth_failed",
      success: false,
      metadata: { reason: "invalid_format", key_preview: apiKey.substring(0, 8) },
    });
    return {
      success: false,
      error: "Invalid API key format. Key should start with 'gabo_'.",
    };
  }

  const keyDoc = await findApiKeyByKey(apiKey);

  if (!keyDoc) {
    logger.warn(`API key not found in MongoDB`);
    await recordAuditLog({
      action: "auth_failed",
      success: false,
      metadata: { reason: "key_not_found", key_preview: apiKey.substring(0, 8) },
    });
    return {
      success: false,
      error: "Invalid API key. Key not found in database.",
    };
  }

  if (!keyDoc.is_active) {
    logger.warn(`Revoked API key attempted`);
    await recordAuditLog({
      key_id: keyDoc.id,
      action: "auth_failed",
      success: false,
      metadata: { reason: "key_revoked" },
    });
    return { success: false, error: "API key has been revoked." };
  }

  // Record SUCCESSFUL auth periodically or on every request
  // For security research, every request is better unless traffic is extreme
  await recordAuditLog({
    key_id: keyDoc.id,
    action: "auth_success",
    success: true,
  });

  return {
    success: true,
    keyId: keyDoc.id,
  };
}

/**
 * Bootstrap: ensures both MCP_KEY_PEPPER and a hashed API key exist.
 *
 * Order of operations:
 *  1. Ensure pepper exists in .env (generate if absent)
 *  2. Check if any API key hash exists in MongoDB
 *  3. If none: generate key → hash with pepper → save hash to DB → save plain key to .env
 *
 * Returns the plain-text key if one was just created, empty string otherwise.
 */
export async function ensureApiKeyExists(): Promise<string> {
  // Step 1: Bootstrap the pepper first — must exist before any hashing
  const isNewPepper = !process.env.MCP_KEY_PEPPER;
  ensurePepperExists();

  if (isNewPepper) {
    logger.info("First-time setup: MCP_KEY_PEPPER generated and saved to .env");
  }

  // Step 2: Check if we already have a key in DB
  const hasExistingKey = await hasAnyApiKeys();
  if (hasExistingKey) {
    return "";
  }

  // Step 3: Generate key, hash it, store hash in DB, write plain key to .env
  const key = generateApiKey();
  const keyHash = await hashApiKey(key);

  await createApiKey(keyHash);

  writeEnvVariable("MCP_API_KEY", key);
  // Make it immediately available in this process
  process.env.MCP_API_KEY = key;

  logger.info(`First-time API key created and saved to .env`);
  logger.info(`  Key preview: ...${key.slice(-8)}`);
  logger.warn("  MongoDB stores only the bcrypt hash — the .env holds the key");
  logger.warn("  NEVER commit your .env file to version control");

  await recordAuditLog({
    action: "key_created",
    success: true,
    metadata: { is_bootstrap: true },
  });

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
