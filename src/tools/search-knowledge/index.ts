import { successResponse } from "../../utils/tool-handler/index.js";
import { searchKnowledge } from "../../db/queries.js";
import { SearchKnowledgeSchema } from "../../schemas/index.schema.js";
import type { ToolDefinition } from "../index.type.js";
import type { SearchKnowledgeArgs } from "./search-knowledge.type.js";

export const searchKnowledgeTool: ToolDefinition<SearchKnowledgeArgs> = {
    name: "search_knowledge",
    title: "Search Knowledge",
    description: "Search knowledge.",
    inputSchema: SearchKnowledgeSchema,
    handler: async (args) => {
        const { query, type } = args;
        const results = await searchKnowledge({
            query,
            type,
            limit: 10,
            offset: 0,
        });

        return successResponse({
            query,
            results,
            count: results.length,
        });
    },
};
