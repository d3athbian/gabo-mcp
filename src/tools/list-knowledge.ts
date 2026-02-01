/**
 * List Knowledge Tool
 * Handles listing all knowledge entries with pagination
 */

import { logger } from "../utils/logger.js";
import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { listKnowledge } from "../db/queries.js";
import { withAuth } from "../middleware/auth.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

// Extended schema with api_key
const ListKnowledgeSchemaWithAuth = z.object({
  api_key: z.string().min(1, "API key is required"),
  limit: z.number().positive().int().default(10),
});

type ListKnowledgeArgsWithAuth = z.infer<typeof ListKnowledgeSchemaWithAuth>;

const handler = async (
  args: Omit<ListKnowledgeArgsWithAuth, "api_key">,
  auth: { keyId: string; name: string },
): Promise<ReturnType<typeof successResponse>> => {
  const { limit } = args;
  const { data: entries, count } = await listKnowledge(
    auth.keyId,
    undefined,
    limit,
  );

  logger.info(`📚 Listing ${entries.length} entries (total: ${count})`);

  return successResponse({
    entries,
    total: count,
  });
};

export const listKnowledgeTool: ToolDefinition<ListKnowledgeArgsWithAuth> = {
  name: "list_knowledge",
  title: "List Knowledge Entries",
  description: "List all knowledge entries. Requires API key authentication.",
  inputSchema: ListKnowledgeSchemaWithAuth,
  handler: async (args, _userId) => {
    try {
      const authHandler = withAuth<ListKnowledgeArgsWithAuth>(handler);
      return await authHandler(args as ListKnowledgeArgsWithAuth);
    } catch (error) {
      return handleToolError(error, "List knowledge");
    }
  },
};
