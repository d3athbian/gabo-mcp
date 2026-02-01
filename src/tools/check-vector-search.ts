/**
 * Check Vector Search Tool
 * Verifies if Atlas Vector Search index is properly configured
 */

import { logger } from "../utils/logger.js";
import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { isVectorSearchAvailable } from "../db/vector-search.js";
import { withAuth } from "../middleware/auth.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

// Extended schema with api_key
const CheckVectorSearchSchemaWithAuth = z.object({
  api_key: z.string().min(1, "API key is required"),
});

type CheckVectorSearchArgsWithAuth = z.infer<
  typeof CheckVectorSearchSchemaWithAuth
>;

const handler = async (
  _args: Omit<CheckVectorSearchArgsWithAuth, "api_key">,
  _auth: { keyId: string; name: string },
): Promise<ReturnType<typeof successResponse>> => {
  const isAvailable = await isVectorSearchAvailable();

  if (isAvailable) {
    logger.info("✅ Vector search is available and configured");
    return successResponse({
      available: true,
      message: "Atlas Vector Search index is properly configured",
      index_name: "vector_index",
      dimensions: 768,
      similarity: "cosine",
    });
  } else {
    logger.warn("❌ Vector search is not available");
    return successResponse({
      available: false,
      message: "Atlas Vector Search index is not configured",
      instructions: [
        "1. Go to: https://cloud.mongodb.com",
        "2. Select your cluster → Search → Create Index",
        "3. Choose: Vector Search",
        "4. Collection: knowledge_entries",
        "5. Index name: vector_index",
        "6. Path: embedding",
        "7. Dimensions: 768 (for nomic-embed-text)",
        "8. Similarity: cosine",
      ],
    });
  }
};

export const checkVectorSearchTool: ToolDefinition<CheckVectorSearchArgsWithAuth> =
  {
    name: "check_vector_search",
    title: "Check Vector Search",
    description:
      "Verify if Atlas Vector Search index is configured. Run this to check if semantic_search will work. Requires API key authentication.",
    inputSchema: CheckVectorSearchSchemaWithAuth,
    handler: async (args, _userId) => {
      try {
        const authHandler = withAuth<CheckVectorSearchArgsWithAuth>(handler);
        return await authHandler(args as CheckVectorSearchArgsWithAuth);
      } catch (error) {
        return handleToolError(error, "Check vector search");
      }
    },
  };
