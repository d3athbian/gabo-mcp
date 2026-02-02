/**
 * List Knowledge Tool - Sin validación
 */

import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { listKnowledge } from "../db/queries.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const ListSchema = z.object({
  limit: z.number().positive().int().default(10),
});

type ListArgs = z.infer<typeof ListSchema>;

const handler = async (args: ListArgs) => {
  const { limit } = args;
  const { data: entries, count } = await listKnowledge(
    "dev-user-123",
    undefined,
    limit,
  );

  return successResponse({
    entries,
    total: count,
  });
};

export const listKnowledgeTool: ToolDefinition<ListArgs> = {
  name: "list_knowledge",
  title: "List Knowledge",
  description: "List knowledge entries.",
  inputSchema: ListSchema,
  handler: async (args, _userId) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "List");
    }
  },
};
