/**
 * Get Knowledge Tool
 * Handles retrieving a specific knowledge entry by ID
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  validationError,
  successResponse,
} from "../utils/tool-handler.js";
import { getKnowledge } from "../db/queries.js";
import { withAuth } from "../middleware/auth.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

// Extended schema with api_key
const GetKnowledgeSchemaWithAuth = z.object({
  api_key: z.string().min(1, "API key is required"),
  id: z.string().min(1, "ID is required"),
});

type GetKnowledgeArgsWithAuth = z.infer<typeof GetKnowledgeSchemaWithAuth>;

const handler = async (
  args: Omit<GetKnowledgeArgsWithAuth, "api_key">,
  auth: { keyId: string; name: string },
): Promise<ReturnType<typeof successResponse>> => {
  const { id } = args;

  if (!id) {
    return validationError("id is required");
  }

  const entry = await getKnowledge(auth.keyId, id);

  logger.info(`✅ Retrieved entry: ${id}`);

  return successResponse({ entry });
};

export const getKnowledgeTool: ToolDefinition<GetKnowledgeArgsWithAuth> = {
  name: "get_knowledge",
  title: "Get Knowledge Entry",
  description:
    "Get a specific knowledge entry by ID. Requires API key authentication.",
  inputSchema: GetKnowledgeSchemaWithAuth,
  handler: async (args, _userId) => {
    try {
      const authHandler = withAuth<GetKnowledgeArgsWithAuth>(handler);
      return await authHandler(args as GetKnowledgeArgsWithAuth);
    } catch (error) {
      return handleToolError(error, "Get knowledge", {
        customMessage: "Entry not found",
        logLevel: "warn",
      });
    }
  },
};
