/**
 * Check Vector Search - Sin validación
 */

import { handleToolError, successResponse } from "../utils/tool-handler.js";
import { isVectorSearchAvailable } from "../db/vector-search.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const CheckSchema = z.object({});

type CheckArgs = z.infer<typeof CheckSchema>;

const handler = async () => {
  const isAvailable = await isVectorSearchAvailable();
  return successResponse({
    available: isAvailable,
    message: isAvailable
      ? "Vector search available"
      : "Vector search not configured",
  });
};

export const checkVectorSearchTool: ToolDefinition<CheckArgs> = {
  name: "check_vector_search",
  title: "Check Vector",
  description: "Check vector search.",
  inputSchema: CheckSchema,
  handler: async (_args, _userId) => {
    try {
      return await handler();
    } catch (error) {
      return handleToolError(error, "Check");
    }
  },
};
