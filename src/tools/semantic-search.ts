/**
 * Semantic Search Tool
 * Handles AI-powered semantic search using vector similarity
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  validationError,
  successResponse,
} from "../utils/tool-handler.js";
import { searchKnowledgeVector } from "../db/vector-search.js";
import { generateEmbedding } from "../embeddings/index.js";
import { SemanticSearchSchema } from "../schemas/index.schema.js";
import type { SemanticSearchArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (
  args: SemanticSearchArgs,
  userId: string,
): Promise<ReturnType<typeof successResponse>> => {
  const { query, type, limit } = args;

  if (!query) {
    return validationError("query is required");
  }

  // Generate embedding for the query
  const queryVector = await generateEmbedding(query);

  if (queryVector.length === 0) {
    return validationError(
      "Failed to generate embedding. Ensure Ollama is running with nomic-embed-text model.",
    );
  }

  const results = await searchKnowledgeVector(userId, queryVector, limit, type);

  logger.info(
    `🔍 Semantic search for "${query}": found ${results.length} results`,
  );

  return successResponse({
    query,
    results,
    count: results.length,
    search_type: "semantic",
  });
};

export const semanticSearchTool: ToolDefinition<SemanticSearchArgs> = {
  name: "semantic_search",
  title: "Semantic Search",
  description:
    "Search knowledge entries using AI-powered semantic similarity (vector search). Requires Atlas Vector Search index.",
  inputSchema: SemanticSearchSchema,
  handler: async (args, userId) => {
    try {
      return await handler(args, userId);
    } catch (error) {
      return handleToolError(error, "Semantic search");
    }
  },
};
