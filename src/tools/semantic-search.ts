/**
 * Semantic Search Tool
 * Handles AI-powered semantic search using vector similarity
 * Falls back to hybrid search (vector + text) if available, otherwise uses text search
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  validationError,
  successResponse,
} from "../utils/tool-handler.js";
import {
  searchKnowledgeVector,
  searchKnowledgeHybrid,
  isVectorSearchAvailable,
} from "../db/vector-search.js";
import { generateEmbedding } from "../embeddings/index.js";
import { withAuth } from "../middleware/auth.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

// Extended schema with api_key
const SemanticSearchSchemaWithAuth = z.object({
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
  limit: z.number().positive().int().default(10),
});

type SemanticSearchArgsWithAuth = z.infer<typeof SemanticSearchSchemaWithAuth>;

const handler = async (
  args: Omit<SemanticSearchArgsWithAuth, "api_key">,
  auth: { keyId: string; name: string },
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

  // Check if vector search is available
  const vectorAvailable = await isVectorSearchAvailable();

  let results;
  let searchType: string;

  if (vectorAvailable) {
    // Use hybrid search for best results (combines vector + text)
    results = await searchKnowledgeHybrid(
      auth.keyId,
      query,
      queryVector,
      limit,
      type,
      0.7, // 70% vector weight, 30% text weight
    );
    searchType = "hybrid";
    logger.info(
      `🔍 Hybrid search for "${query}": found ${results.length} results`,
    );
  } else {
    // Fallback to pure vector search (will fail gracefully if no index)
    try {
      results = await searchKnowledgeVector(
        auth.keyId,
        queryVector,
        limit,
        type,
      );
      searchType = "semantic";
      logger.info(
        `🔍 Semantic search for "${query}": found ${results.length} results`,
      );
    } catch (error) {
      // If vector search fails, return helpful error message
      logger.warn(
        `Vector search failed, index may not be configured: ${error}`,
      );
      return validationError(
        "Vector search not available. Run 'check_vector_search' tool to verify configuration, or create the vector index in MongoDB Atlas.",
      );
    }
  }

  return successResponse({
    query,
    results,
    count: results.length,
    search_type: searchType,
    vector_index_available: vectorAvailable,
  });
};

export const semanticSearchTool: ToolDefinition<SemanticSearchArgsWithAuth> = {
  name: "semantic_search",
  title: "Semantic Search",
  description:
    "AI-powered semantic search using vector similarity. Automatically uses hybrid search (vector + text) when available for best results. Requires API key authentication.",
  inputSchema: SemanticSearchSchemaWithAuth,
  handler: async (args, _userId) => {
    try {
      const authHandler = withAuth<SemanticSearchArgsWithAuth>(handler);
      return await authHandler(args as SemanticSearchArgsWithAuth);
    } catch (error) {
      return handleToolError(error, "Semantic search");
    }
  },
};
