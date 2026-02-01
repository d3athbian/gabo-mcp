/**
 * Store Knowledge Tool
 * Handles storing new knowledge entries with automatic embedding generation
 */

import { logger } from "../utils/logger.js";
import {
  handleToolError,
  validationError,
  successResponse,
} from "../utils/tool-handler.js";
import { storeKnowledge } from "../db/queries.js";
import { generateEmbedding } from "../embeddings/index.js";
import { StoreKnowledgeSchema } from "../schemas/index.schema.js";
import type { StoreKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (
  args: StoreKnowledgeArgs,
  userId: string,
): Promise<ReturnType<typeof successResponse>> => {
  const { type, title, content, tags, source } = args;

  if (!title || !content) {
    return validationError("title and content are required");
  }

  // Generate embedding for the content
  const embeddingText = `${title} ${content}`;
  const embedding = await generateEmbedding(embeddingText);

  const entry = await storeKnowledge(userId, {
    type,
    title,
    content,
    tags: tags || [],
    source,
    embedding: embedding.length > 0 ? embedding : undefined,
  });

  logger.info(`✅ Knowledge stored with ID: ${entry.id}`);
  if (embedding.length > 0) {
    logger.info(`   🧠 Generated embedding (${embedding.length} dims)`);
  }

  return successResponse({
    id: entry.id,
    message: "Knowledge stored successfully",
    entry,
  });
};

export const storeKnowledgeTool: ToolDefinition<StoreKnowledgeArgs> = {
  name: "store_knowledge",
  title: "Store Knowledge Entry",
  description:
    "Store a new knowledge entry with automatic embedding generation",
  inputSchema: StoreKnowledgeSchema,
  handler: async (args, userId) => {
    try {
      return await handler(args, userId);
    } catch (error) {
      return handleToolError(error, "Store knowledge");
    }
  },
};
