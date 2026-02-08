import { successResponse } from "../../utils/tool-handler/index.js";
import { searchKnowledge } from "../../db/queries.js";
import { GetPitfallsSchema } from "../../schemas/index.schema.ts";
import type { ToolDefinition } from "../index.type.js";
import type { GetPitfallsArgs } from "./get-pitfalls.type.js";

/**
 * Get Pitfalls Tool
 * Retrieves known pitfalls and errors to generate a preventive checklist.
 * Searches specifically in PITFALL and ERROR_CORRECTION categories.
 */
export const getPitfallsTool: ToolDefinition<GetPitfallsArgs> = {
    name: "get_pitfalls",
    title: "Get Pitfalls",
    description: "Retrieve known pitfalls and errors for a specific context to prevent regressions.",
    inputSchema: GetPitfallsSchema,
    handler: async (args) => {
        const { query, context } = args;

        // Search for pitfalls and error corrections
        // Note: We search twice or use a broader search and filter
        const results = await searchKnowledge({
            query,
            type: undefined, // Search all first, then we filter or rely on keywords
            limit: 10,
            offset: 0,
        });

        const pitfalls = results
            .filter(r => r.type === "PITFALL" || r.type === "ERROR_CORRECTION")
            .map(r => ({
                id: r.id,
                title: r.title,
                type: r.type,
                content: r.content,
                preventiveCheck: r.title.startsWith("Pre-flight:") ? r.title : `Check: ${r.title}`
            }));

        return successResponse({
            query,
            context,
            pitfalls,
            count: pitfalls.length,
            checklist: pitfalls.map(p => `- [ ] ${p.preventiveCheck}`).join("\n"),
            status: pitfalls.length > 0
                ? "⚠️ Attention: Known pitfalls detected for this context."
                : "✅ Clear: No specific pitfalls registered for this context."
        });
    },
};
