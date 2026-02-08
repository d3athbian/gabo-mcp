import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { withAuth } from "../middleware/auth.js";
import { searchKnowledgeVector } from "../db/vector-search.js";
import { SemanticSearchSchema } from "../schemas/index.schema.js";
import type { SemanticSearchArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (args: Omit<SemanticSearchArgs, "api_key">) => {
  const { query_vector, type, limit } = args;
  const results = await searchKnowledgeVector(query_vector, limit, type);

  return successResponse({
    results,
    count: results.length,
  });
};

export const semanticSearchTool: ToolDefinition<SemanticSearchArgs> = {
  name: "semantic_search",
  title: "Vector Search",
  description: "Search knowledge using a provided vector.",
  inputSchema: SemanticSearchSchema,
  handler: withAuth(async (args) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "SemanticSearch");
    }
  }),
};
