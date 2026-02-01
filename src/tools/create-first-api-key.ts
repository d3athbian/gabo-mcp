/**
 * Create First API Key Tool (Bootstrap)
 * Creates the GLOBAL API key when no keys exist in the database
 * This is the ONLY operation that doesn't require authentication
 * The key is stored in MongoDB for cross-device recovery
 */

import { logger } from "../utils/logger.js";
import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { generateApiKey } from "../utils/api-key.js";
import {
  createApiKey,
  hasAnyApiKeys,
  getGlobalApiKey,
} from "../db/api-keys.js";
import { config } from "../config/config.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const CreateFirstApiKeySchema = z.object({
  name: z.string().optional(),
});

type CreateFirstApiKeyArgs = z.infer<typeof CreateFirstApiKeySchema>;

const handler = async (
  args: CreateFirstApiKeyArgs,
): Promise<ReturnType<typeof successResponse>> => {
  const name = args.name || `device-${Date.now().toString(36)}`;

  const hasKeys = await hasAnyApiKeys();

  if (hasKeys) {
    const existingKey = await getGlobalApiKey();
    if (existingKey) {
      return successResponse({
        success: true,
        message: "Global API key already exists",
        api_key: config.mcp.apiKey || "[Check MongoDB for recovery]",
        name: existingKey.name,
        id: existingKey.id,
        note: "Use the existing key or set MCP_API_KEY in your .env file",
        next_steps: [
          "1. If you have the key in .env, you're ready!",
          "2. If not, check MongoDB or your account for the key",
          "3. Add to .env:",
          `   MCP_API_KEY=${config.mcp.apiKey || "[your-key]"}`,
        ],
      });
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: "Keys exist but no global key found",
          }),
        },
      ],
      isError: true,
    };
  }

  const { key, hash, preview, deviceId } = generateApiKey();
  const apiKeyDoc = await createApiKey(hash, preview, name, deviceId);

  logger.info(`🔑 Global API key created: ${name} (${preview})`);
  logger.warn("⚠️  SAVE THIS KEY NOW - It will never be shown again!");
  logger.info(`   Device ID: ${deviceId}`);

  return successResponse({
    success: true,
    api_key: key,
    name: apiKeyDoc.name,
    id: apiKeyDoc.id,
    device_id: deviceId,
    warning: "SAVE THIS KEY NOW - It will never be shown again!",
    storage: {
      mongodb: "✅ Stored (for account recovery)",
      config: "✅ Add to MCP_API_KEY in .env",
    },
    next_steps: [
      "1. Copy the api_key above to your .env file:",
      `   MCP_API_KEY=${key}`,
      "2. Restart the MCP server",
      "3. This single key works on all your devices",
    ],
  });
};

export const createFirstApiKeyTool: ToolDefinition<CreateFirstApiKeyArgs> = {
  name: "create_first_api_key",
  title: "Create Global API Key",
  description:
    "Creates the GLOBAL API key when no keys exist. No authentication required. The key is stored in MongoDB for cross-device recovery. WARNING: The key will only be shown once - save it immediately!",
  inputSchema: CreateFirstApiKeySchema,
  handler: async (args: CreateFirstApiKeyArgs, _userId: string) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Create global API key");
    }
  },
};
