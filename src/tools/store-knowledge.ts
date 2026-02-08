import { logger } from "../utils/logger.js";
import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { withAuth } from "../middleware/auth.js";
import { storeKnowledge } from "../db/queries.js";
import { StoreKnowledgeSchema } from "../schemas/index.schema.js";
import type { StoreKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";

const handler = async (args: Omit<StoreKnowledgeArgs, "api_key">) => {
  const { type, title, content, tags, source, embedding } = args;

  const entry = await storeKnowledge({
    type,
    title,
    content,
    tags: tags || [],
    source,
    embedding,
  });

  logger.info(`✅ Stored: ${title} (${entry.id})`);

  return successResponse({
    id: entry.id,
    message: "Stored",
  });
};

export const storeKnowledgeTool: ToolDefinition<StoreKnowledgeArgs> = {
  name: "store_knowledge",
  title: "Store Knowledge",
  description: "Store knowledge.",
  inputSchema: StoreKnowledgeSchema,
  handler: withAuth(async (args) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Store");
    }
  }),
};
