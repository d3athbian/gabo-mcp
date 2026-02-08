import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { withAuth } from "../middleware/auth.js";
import { searchKnowledge } from "../db/queries.js";
import { SearchKnowledgeSchema } from "../schemas/index.schema.js";
import type { SearchKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (args: Omit<SearchKnowledgeArgs, "api_key">) => {
  const { query, type } = args;
  const results = await searchKnowledge({
    query,
    type,
    limit: 10,
    offset: 0,
  });

  return successResponse({
    query,
    results,
    count: results.length,
  });
};

export const searchKnowledgeTool: ToolDefinition<SearchKnowledgeArgs> = {
  name: "search_knowledge",
  title: "Search Knowledge",
  description: "Search knowledge.",
  inputSchema: SearchKnowledgeSchema,
  handler: withAuth(async (args) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Search");
    }
  }),
};
