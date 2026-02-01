/**
 * List Knowledge Tool
 * Handles listing all knowledge entries with pagination
 */

import { logger } from "../utils/logger.js";
import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { listKnowledge } from "../db/queries.js";
import { ListKnowledgeSchema } from "../schemas/index.schema.js";
import type { ListKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (
  args: ListKnowledgeArgs,
  userId: string,
): Promise<ReturnType<typeof successResponse>> => {
  const { limit } = args;
  const { data: entries, count } = await listKnowledge(
    userId,
    undefined,
    limit,
  );

  logger.info(`📚 Listing ${entries.length} entries (total: ${count})`);

  return successResponse({
    entries,
    total: count,
  });
};

export const listKnowledgeTool: ToolDefinition<ListKnowledgeArgs> = {
  name: "list_knowledge",
  title: "List Knowledge Entries",
  description: "List all knowledge entries",
  inputSchema: ListKnowledgeSchema,
  handler: async (args, userId) => {
    try {
      return await handler(args, userId);
    } catch (error) {
      return handleToolError(error, "List knowledge");
    }
  },
};
