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
import { withAuth } from "../middleware/auth.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

// Extended schema with api_key
const StoreKnowledgeSchemaWithAuth = z.object({
  api_key: z.string().min(1, "API key is required"),
  type: z.enum([
    "UI_REASONING",
    "ARCH_DECISION",
    "PROMPT",
    "ERROR_CORRECTION",
    "CODE_SNIPPET",
    "DESIGN_DECISION",
    "TECHNICAL_INSIGHT",
    "REACT_PATTERN",
  ]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

type StoreKnowledgeArgsWithAuth = z.infer<typeof StoreKnowledgeSchemaWithAuth>;

const handler = async (
  args: Omit<StoreKnowledgeArgsWithAuth, "api_key">,
  auth: { keyId: string; name: string },
): Promise<ReturnType<typeof successResponse>> => {
  const { type, title, content, tags, source } = args;

  if (!title || !content) {
    return validationError("title and content are required");
  }

  // Generate embedding for the content
  const embeddingText = `${title} ${content}`;
  const embedding = await generateEmbedding(embeddingText);

  // Use the authenticated key ID as the user ID
  const entry = await storeKnowledge(auth.keyId, {
    type,
    title,
    content,
    tags: tags || [],
    source,
    embedding: embedding.length > 0 ? embedding : undefined,
  });

  logger.info(`✅ Knowledge stored with ID: ${entry.id} by ${auth.name}`);
  if (embedding.length > 0) {
    logger.info(`   🧠 Generated embedding (${embedding.length} dims)`);
  }

  return successResponse({
    id: entry.id,
    message: "Knowledge stored successfully",
    entry,
  });
};

export const storeKnowledgeTool: ToolDefinition<StoreKnowledgeArgsWithAuth> = {
  name: "store_knowledge",
  title: "Store Knowledge Entry",
  description:
    "Store a new knowledge entry with automatic embedding generation. Requires API key authentication.",
  inputSchema: StoreKnowledgeSchemaWithAuth,
  handler: async (args, _userId) => {
    try {
      const authHandler = withAuth<StoreKnowledgeArgsWithAuth>(handler);
      return await authHandler(args as StoreKnowledgeArgsWithAuth);
    } catch (error) {
      return handleToolError(error, "Store knowledge");
    }
  },
};
