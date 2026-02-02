/**
 * Semantic Search Tool - Solo texto, sin embeddings
 */

import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { searchKnowledge } from "../db/queries.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const SemanticSchema = z.object({
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
  limit: z.number().positive().int().default(10),
});

type SemanticArgs = z.infer<typeof SemanticSchema>;

const handler = async (args: SemanticArgs) => {
  const { query, type, limit } = args;
  const results = await searchKnowledge("dev-user-123", {
    query,
    type,
    limit,
    offset: 0,
  });

  return successResponse({
    query,
    results,
    count: results.length,
  });
};

export const semanticSearchTool: ToolDefinition<SemanticArgs> = {
  name: "semantic_search",
  title: "Search",
  description: "Search knowledge.",
  inputSchema: SemanticSchema,
  handler: async (args, _userId) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Search");
    }
  },
};
