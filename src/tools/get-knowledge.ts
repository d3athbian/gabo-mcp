import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { withAuth } from "../middleware/auth.js";
import { getKnowledge } from "../db/queries.js";
import { GetKnowledgeSchema } from "../schemas/index.schema.js";
import type { GetKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (args: Omit<GetKnowledgeArgs, "api_key">) => {
  const entry = await getKnowledge(args.id);
  return successResponse({ entry });
};

export const getKnowledgeTool: ToolDefinition<GetKnowledgeArgs> = {
  name: "get_knowledge",
  title: "Get Knowledge",
  description: "Get entry by ID.",
  inputSchema: GetKnowledgeSchema,
  handler: withAuth(async (args) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Get");
    }
  }),
};
