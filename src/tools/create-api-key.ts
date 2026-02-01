/**
 * Create API Key Tool
 * Creates a new API key (requires authentication)
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  successResponse,
  validationError,
} from "../utils/tool-handler.js";
import { generateApiKey } from "../utils/api-key.js";
import { createApiKey } from "../db/api-keys.js";
import { CreateApiKeySchema } from "../schemas/index.schema.js";
import type { CreateApiKeyArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";
import { withAuth } from "../middleware/auth.js";

const handler = async (
  args: Omit<CreateApiKeyArgs, "api_key">,
  auth: { keyId: string; name: string },
): Promise<ReturnType<typeof successResponse>> => {
  const { name } = args;

  if (!name) {
    return validationError("name is required");
  }

  // Generate new API key
  const { key, hash, preview } = generateApiKey();

  // Store in database
  const apiKeyDoc = await createApiKey(hash, preview, name, auth.keyId);

  logger.info(`🔑 New API key created by ${auth.name}: ${name} (${preview})`);

  return successResponse({
    api_key: key,
    name: apiKeyDoc.name,
    id: apiKeyDoc.id,
    created_by: auth.name,
    warning: "SAVE THIS KEY NOW - It will never be shown again!",
    next_steps: [
      "1. Copy the api_key to the new device's .env file:",
      `   MCP_API_KEY=${key}`,
      "2. Update Continue.dev config on the new device",
      "3. The new device can now use all tools",
    ],
  });
};

export const createApiKeyTool: ToolDefinition<CreateApiKeyArgs> = {
  name: "create_api_key",
  title: "Create API Key",
  description:
    "Creates a new API key for an additional device. Requires an existing valid API key. The new key can be used on another machine and can be revoked independently.",
  inputSchema: CreateApiKeySchema,
  handler: async (args: CreateApiKeyArgs, _userId: string) => {
    try {
      // withAuth wrapper validates the api_key and provides auth context
      const authHandler = withAuth<CreateApiKeyArgs>(handler);
      return await authHandler(args as CreateApiKeyArgs);
    } catch (error) {
      return handleToolError(error, "Create API key");
    }
  },
};
