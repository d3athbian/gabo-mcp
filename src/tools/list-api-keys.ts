/**
 * List API Keys Tool
 * Lists all API keys (without sensitive hash data)
 */

import { logger } from "../utils/logger.js";
import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { listApiKeys } from "../db/api-keys.js";
import { ListApiKeysSchema } from "../schemas/index.schema.js";
import type { ListApiKeysArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";
import { withAuth } from "../middleware/auth.js";

const handler = async (
  _args: Omit<ListApiKeysArgs, "api_key">,
  auth: { keyId: string; name: string },
): Promise<ReturnType<typeof successResponse>> => {
  const keys = await listApiKeys();

  logger.info(`📋 API keys listed by ${auth.name}: ${keys.length} keys found`);

  // Count active vs inactive
  const active = keys.filter((k) => k.is_active);
  const inactive = keys.filter((k) => !k.is_active);

  return successResponse({
    total_keys: keys.length,
    active_keys: active.length,
    inactive_keys: inactive.length,
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      preview: k.key_preview,
      is_active: k.is_active,
      created_at: k.created_at,
      last_used: k.last_used,
      created_by: k.created_by,
    })),
  });
};

export const listApiKeysTool: ToolDefinition<ListApiKeysArgs> = {
  name: "list_api_keys",
  title: "List API Keys",
  description:
    "Lists all API keys with their status, preview, and metadata. Does not expose the full key for security. Use this to audit which devices have access.",
  inputSchema: ListApiKeysSchema,
  handler: async (args: ListApiKeysArgs, _userId: string) => {
    try {
      const authHandler = withAuth<ListApiKeysArgs>(handler);
      return await authHandler(args as ListApiKeysArgs);
    } catch (error) {
      return handleToolError(error, "List API keys");
    }
  },
};
