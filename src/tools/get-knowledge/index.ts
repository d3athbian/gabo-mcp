import { successResponse } from "../../utils/tool-handler/index.js";
import { getKnowledge } from "../../db/queries.js";
import { GetKnowledgeSchema } from "../../schemas/index.schema.js";
import type { ToolDefinition } from "../index.type.js";
import type { GetKnowledgeArgs } from "./get-knowledge.type.js";

export const getKnowledgeTool: ToolDefinition<GetKnowledgeArgs> = {
    name: "get_knowledge",
    title: "Get Knowledge",
    description: "Get entry by ID.",
    inputSchema: GetKnowledgeSchema,
    handler: async (args) => {
        const entry = await getKnowledge(args.id);
        return successResponse({ entry });
    },
};
