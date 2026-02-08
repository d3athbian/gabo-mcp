import { successResponse } from "../../utils/tool-handler/index.js";
import { searchKnowledgeVector } from "../../db/vector-search.js";
import { SemanticSearchSchema } from "../../schemas/index.schema.js";
import type { ToolDefinition } from "../index.type.js";
import type { SemanticSearchArgs } from "./semantic-search.type.js";

export const semanticSearchTool: ToolDefinition<SemanticSearchArgs> = {
    name: "semantic_search",
    title: "Vector Search",
    description: "Search knowledge using a provided vector.",
    inputSchema: SemanticSearchSchema,
    handler: async (args) => {
        const { query_vector, type, limit } = args;
        const results = await searchKnowledgeVector(query_vector, limit, type);

        return successResponse({
            results,
            count: results.length,
        });
    },
};
