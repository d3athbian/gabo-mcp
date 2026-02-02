/**
 * Store Knowledge Tool - Sin validación
 */

import { logger } from "../utils/logger.js";
import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { storeKnowledge } from "../db/queries.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const StoreSchema = z.object({
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
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

type StoreArgs = z.infer<typeof StoreSchema>;

const handler = async (args: StoreArgs) => {
  const { type, title, content, tags, source } = args;

  const entry = await storeKnowledge("dev-user-123", {
    type,
    title,
    content,
    tags: tags || [],
    source,
  });

  logger.info(`✅ Stored: ${title} (${entry.id})`);

  return successResponse({
    id: entry.id,
    message: "Stored",
  });
};

export const storeKnowledgeTool: ToolDefinition<StoreArgs> = {
  name: "store_knowledge",
  title: "Store Knowledge",
  description: "Store knowledge.",
  inputSchema: StoreSchema,
  handler: async (args, _userId) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleToolError(error, "Store");
    }
  },
};
