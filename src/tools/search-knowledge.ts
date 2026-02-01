/**
 * Search Knowledge Tool
 * Handles keyword-based search of knowledge entries
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  validationError,
  successResponse,
} from "../utils/tool-handler.js";
import { searchKnowledge } from "../db/queries.js";
import { withAuth } from "../middleware/auth.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

// Extended schema with api_key
const SearchKnowledgeSchemaWithAuth = z.object({
  api_key: z.string().min(1, "API key is required"),
  query: z.string().min(1, "Query is required"),
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

type SearchKnowledgeArgsWithAuth = z.infer<
  typeof SearchKnowledgeSchemaWithAuth
>;

const handler = async (
  args: Omit<SearchKnowledgeArgsWithAuth, "api_key">,
  auth: { keyId: string; name: string },
): Promise<ReturnType<typeof successResponse>> => {
  const { query, type } = args;

  if (!query) {
    return validationError("query is required");
  }

  const results = await searchKnowledge(auth.keyId, {
    query,
    type,
    limit: 10,
    offset: 0,
  });

  logger.info(`🔍 Search for "${query}": found ${results.length} results`);

  return successResponse({
    query,
    results,
    count: results.length,
  });
};

export const searchKnowledgeTool: ToolDefinition<SearchKnowledgeArgsWithAuth> =
  {
    name: "search_knowledge",
    title: "Search Knowledge",
    description:
      "Search knowledge entries by keywords. Requires API key authentication.",
    inputSchema: SearchKnowledgeSchemaWithAuth,
    handler: async (args, _userId) => {
      try {
        const authHandler = withAuth<SearchKnowledgeArgsWithAuth>(handler);
        return await authHandler(args as SearchKnowledgeArgsWithAuth);
      } catch (error) {
        return handleToolError(error, "Search knowledge");
      }
    },
  };
