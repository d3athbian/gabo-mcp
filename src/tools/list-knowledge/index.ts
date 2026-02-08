import { successResponse } from "../../utils/tool-handler/index.js";
import { listKnowledge } from "../../db/queries.js";
import { ListKnowledgeSchema } from "../../schemas/index.schema.js";
import type { ToolDefinition } from "../index.type.js";
import type { ListKnowledgeArgs } from "./list-knowledge.type.js";

export const listKnowledgeTool: ToolDefinition<ListKnowledgeArgs> = {
    name: "list_knowledge",
    title: "List Knowledge",
    description: "List knowledge entries.",
    inputSchema: ListKnowledgeSchema,
    handler: async (args) => {
        const { limit } = args;
        const { data: entries, count } = await listKnowledge(undefined, limit);

        return successResponse({
            entries,
            total: count,
        });
    },
};
