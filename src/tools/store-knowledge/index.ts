import { successResponse } from "../../utils/tool-handler/index.js";
import { storeKnowledge } from "../../db/queries.js";
import { StoreKnowledgeSchema } from "../../schemas/index.schema.js";
import type { ToolDefinition } from "../index.type.js";
import type { StoreKnowledgeArgs } from "./store-knowledge.type.js";

export const storeKnowledgeTool: ToolDefinition<StoreKnowledgeArgs> = {
    name: "store_knowledge",
    title: "Store Knowledge",
    description: "Store knowledge.",
    inputSchema: StoreKnowledgeSchema,
    handler: async (args) => {
        const { type, title, content, tags, source, embedding, metadata } = args;

        const entry = await storeKnowledge({
            type,
            title,
            content,
            tags: tags || [],
            source,
            embedding,
            metadata,
        });

        return successResponse({
            id: entry.id,
            message: "Stored",
        });
    },
};
