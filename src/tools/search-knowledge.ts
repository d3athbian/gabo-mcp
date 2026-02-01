/**
 * Search Knowledge Tool
 * Handles keyword-based search of knowledge entries
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  validationError,
  successResponse,
} from "../utils/tool-handler.js";
import { searchKnowledge } from "../db/queries.js";
import { SearchKnowledgeSchema } from "../schemas/index.schema.js";
import type { SearchKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (
  args: SearchKnowledgeArgs,
  userId: string,
): Promise<ReturnType<typeof successResponse>> => {
  const { query, type } = args;

  if (!query) {
    return validationError("query is required");
  }

  const results = await searchKnowledge(userId, {
    query,
    type,
    limit: 10,
    offset: 0,
  });

  logger.info(`🔍 Search for "${query}": found ${results.length} results`);

  return successResponse({
    query,
    results,
    count: results.length,
  });
};

export const searchKnowledgeTool: ToolDefinition<SearchKnowledgeArgs> = {
  name: "search_knowledge",
  title: "Search Knowledge",
  description: "Search knowledge entries by keywords",
  inputSchema: SearchKnowledgeSchema,
  handler: async (args, userId) => {
    try {
      return await handler(args, userId);
    } catch (error) {
      return handleToolError(error, "Search knowledge");
    }
  },
};
