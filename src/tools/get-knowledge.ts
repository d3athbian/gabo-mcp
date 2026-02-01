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
import { GetKnowledgeSchema } from "../schemas/index.schema.js";
import type { GetKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (
  args: GetKnowledgeArgs,
  userId: string,
): Promise<ReturnType<typeof successResponse>> => {
  const { id } = args;

  if (!id) {
    return validationError("id is required");
  }

  const entry = await getKnowledge(userId, id);

  logger.info(`✅ Retrieved entry: ${id}`);

  return successResponse({ entry });
};

export const getKnowledgeTool: ToolDefinition<GetKnowledgeArgs> = {
  name: "get_knowledge",
  title: "Get Knowledge Entry",
  description: "Get a specific knowledge entry by ID",
  inputSchema: GetKnowledgeSchema,
  handler: async (args, userId) => {
    try {
      return await handler(args, userId);
    } catch (error) {
      return handleToolError(error, "Get knowledge", {
        customMessage: "Entry not found",
        logLevel: "warn",
      });
    }
  },
};
