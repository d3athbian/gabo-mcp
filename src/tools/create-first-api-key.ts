/**
 * Create First API Key Tool (Bootstrap)
 * Creates the first API key when no keys exist in the database
 * This is the ONLY operation that doesn't require authentication
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  successResponse,
  validationError,
} from "../utils/tool-handler.js";
import { generateApiKey } from "../utils/api-key.js";
import { createApiKey, hasAnyApiKeys } from "../db/api-keys.js";
import { CreateFirstApiKeySchema } from "../schemas/index.schema.js";
import type { CreateFirstApiKeyArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (
  args: CreateFirstApiKeyArgs,
): Promise<ReturnType<typeof successResponse>> => {
  const { name } = args;

  if (!name) {
    return validationError("name is required");
  }

  // Check if bootstrap is available (no keys exist)
  const hasKeys = await hasAnyApiKeys();
  if (hasKeys) {
    return validationError(
      "Bootstrap not available. API keys already exist. Use 'create_api_key' with an existing key instead.",
    );
  }

  // Generate new API key
  const { key, hash, preview } = generateApiKey();

  // Store in database
  const apiKeyDoc = await createApiKey(hash, preview, name, "bootstrap");

  logger.info(`🔑 First API key created: ${name} (${preview})`);
  logger.warn("⚠️  SAVE THIS KEY NOW - It will never be shown again!");

  return successResponse({
    api_key: key,
    name: apiKeyDoc.name,
    id: apiKeyDoc.id,
    warning: "SAVE THIS KEY NOW - It will never be shown again!",
    next_steps: [
      "1. Copy the api_key above to your .env file:",
      `   MCP_API_KEY=${key}`,
      "2. Update your Continue.dev config:",
      "   mcpServers:",
      "     gabo-mcp-local:",
      "       env:",
      `         MCP_API_KEY: "${key}"`,
      "3. Restart the MCP server",
      "4. All subsequent operations will require this API key",
    ],
  });
};

export const createFirstApiKeyTool: ToolDefinition<CreateFirstApiKeyArgs> = {
  name: "create_first_api_key",
  title: "Create First API Key (Bootstrap)",
  description:
    "Creates the first API key when no keys exist. This is the ONLY operation that doesn't require authentication. Use this to bootstrap your authentication system. WARNING: The key will only be shown once - save it immediately!",
  inputSchema: CreateFirstApiKeySchema,
  handler: async (args: CreateFirstApiKeyArgs, _userId: string) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Create first API key");
    }
  },
};
