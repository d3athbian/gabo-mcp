/**
 * Get Knowledge Tool - Sin validación
 */

import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { getKnowledge } from "../db/queries.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const GetSchema = z.object({
  id: z.string().min(1),
});

type GetArgs = z.infer<typeof GetSchema>;

const handler = async (args: GetArgs) => {
  const entry = await getKnowledge("dev-user-123", args.id);
  return successResponse({ entry });
};

export const getKnowledgeTool: ToolDefinition<GetArgs> = {
  name: "get_knowledge",
  title: "Get Knowledge",
  description: "Get entry by ID.",
  inputSchema: GetSchema,
  handler: async (args, _userId) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Get");
    }
  },
};
