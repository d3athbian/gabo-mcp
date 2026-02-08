import { successResponse } from "../../utils/tool-handler/index.js";
import { searchKnowledge } from "../../db/queries.js";
import { SuggestPatternsSchema } from "../../schemas/index.schema.ts";
import type { ToolDefinition } from "../index.type.js";
import type { SuggestPatternsArgs } from "./suggest-patterns.type.js";

/**
 * Suggest Patterns Tool
 * Analyzes a query and context to find similar existing patterns
 * and suggest categories/tags.
 */
export const suggestPatternsTool: ToolDefinition<SuggestPatternsArgs> = {
    name: "suggest_patterns",
    title: "Suggest Patterns",
    description: "Analyze current task to suggest relevant patterns or detect duplicates.",
    inputSchema: SuggestPatternsSchema,
    handler: async (args) => {
        const { query, context } = args;

        // Search for similar existing knowledge
        const results = await searchKnowledge({
            query,
            limit: 5,
            offset: 0,
        });

        const suggestions = results.map(r => ({
            id: r.id,
            title: r.title,
            type: r.type,
            matchReason: "Similar keywords found in title/content"
        }));

        return successResponse({
            query,
            context,
            suggestions,
            count: suggestions.length,
            recommendation: suggestions.length > 0
                ? "Review similar items to avoid duplicates or refine context."
                : "No direct duplicates found. Ready for new entry."
        });
    },
};
