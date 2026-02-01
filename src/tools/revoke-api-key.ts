/**
 * Revoke API Key Tool
 * Deactivates an API key by ID or name
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  successResponse,
  validationError,
} from "../utils/tool-handler.js";
import { revokeApiKey, revokeApiKeyByName } from "../db/api-keys.js";
import { RevokeApiKeySchema } from "../schemas/index.schema.js";
import type { RevokeApiKeyArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";
import { withAuth } from "../middleware/auth.js";

const handler = async (
  args: Omit<RevokeApiKeyArgs, "api_key">,
  auth: { keyId: string; name: string },
): Promise<ReturnType<typeof successResponse>> => {
  const { key_id } = args;

  if (!key_id) {
    return validationError("key_id is required");
  }

  // Prevent self-revocation
  if (key_id === auth.keyId) {
    return validationError(
      "Cannot revoke your own API key. Create another key first, or use a different device.",
    );
  }

  // Try to revoke by ID first
  let revoked = await revokeApiKey(key_id);

  // If not found by ID, try by name
  if (!revoked) {
    revoked = await revokeApiKeyByName(key_id);
  }

  if (!revoked) {
    return validationError(`API key not found: ${key_id}`);
  }

  logger.info(`🚫 API key revoked by ${auth.name}: ${key_id}`);

  return successResponse({
    revoked: true,
    key_id,
    revoked_by: auth.name,
    message:
      "API key has been revoked. The device using this key can no longer access the system.",
  });
};

export const revokeApiKeyTool: ToolDefinition<RevokeApiKeyArgs> = {
  name: "revoke_api_key",
  title: "Revoke API Key",
  description:
    "Revokes (deactivates) an API key by ID or name. The revoked key will immediately lose access. You cannot revoke your own key - use another device if needed.",
  inputSchema: RevokeApiKeySchema,
  handler: async (args: RevokeApiKeyArgs, _userId: string) => {
    try {
      const authHandler = withAuth<RevokeApiKeyArgs>(handler);
      return await authHandler(args as RevokeApiKeyArgs);
    } catch (error) {
      return handleToolError(error, "Revoke API key");
    }
  },
};
