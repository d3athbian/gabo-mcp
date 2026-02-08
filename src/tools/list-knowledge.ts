import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { withAuth } from "../middleware/auth.js";
import { listKnowledge } from "../db/queries.js";
import { ListKnowledgeSchema } from "../schemas/index.schema.js";
import type { ListKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (args: Omit<ListKnowledgeArgs, "api_key">) => {
  const { limit } = args;
  const { data: entries, count } = await listKnowledge(undefined, limit);

  return successResponse({
    entries,
    total: count,
  });
};

export const listKnowledgeTool: ToolDefinition<ListKnowledgeArgs> = {
  name: "list_knowledge",
  title: "List Knowledge",
  description: "List knowledge entries.",
  inputSchema: ListKnowledgeSchema,
  handler: withAuth(async (args) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "List");
    }
  }),
};
