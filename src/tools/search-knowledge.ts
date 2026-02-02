/**
 * Search Knowledge Tool - Sin validación
 */

import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { searchKnowledge } from "../db/queries.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const SearchSchema = z.object({
  query: z.string().min(1),
  type: z
    .enum([
      "UI_REASONING",
      "ARCH_DECISION",
      "PROMPT",
      "ERROR_CORRECTION",
      "CODE_SNIPPET",
      "DESIGN_DECISION",
      "TECHNICAL_INSIGHT",
      "REACT_PATTERN",
    ])
    .optional(),
});

type SearchArgs = z.infer<typeof SearchSchema>;

const handler = async (args: SearchArgs) => {
  const { query, type } = args;
  const results = await searchKnowledge("dev-user-123", {
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

export const searchKnowledgeTool: ToolDefinition<SearchArgs> = {
  name: "search_knowledge",
  title: "Search Knowledge",
  description: "Search knowledge.",
  inputSchema: SearchSchema,
  handler: async (args, _userId) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Search");
    }
  },
};
