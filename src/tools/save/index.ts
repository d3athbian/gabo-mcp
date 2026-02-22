import {
  successResponse,
  errorResponse,
} from "../../utils/tool-handler/index.js";
import { storeKnowledge } from "../../db/queries.js";
import { sanitizeAllFields } from "../../middleware/sanitization/index.js";
import { searchKnowledgeVector } from "../../db/vector-search.js";
import { generateEmbedding } from "../../embeddings/index.js";
import { SaveKnowledgeSchema } from "./save.type.js";
import type { ToolDefinition } from "../index.type.js";
import type { SaveKnowledgeArgs } from "./save.type.js";

export const saveKnowledgeTool: ToolDefinition<SaveKnowledgeArgs> = {
  name: "save",
  title: "Save Knowledge",
  description:
    "Save knowledge to the database. Automatically blocks PII (emails, phones, IPs, etc.) and credentials (passwords, API keys, tokens). No exceptions allowed.",
  inputSchema: SaveKnowledgeSchema,
  auditAction: "store_knowledge",
  handler: async (args) => {
    const {
      type,
      title,
      content,
      tags,
      source,
      embedding: providedEmbedding,
      metadata,
    } = args;

    const sanitizationResult = sanitizeAllFields({
      title,
      content,
      tags,
      source,
      metadata,
    });

    if (!sanitizationResult.allowed) {
      return errorResponse(
        sanitizationResult.errorMessage ||
          "Blocked: Sensitive data detected. Cannot save.",
        "SANITIZATION_ERROR",
      );
    }

    let embedding = providedEmbedding;

    if (!embedding) {
      const embeddingResult = await generateEmbedding(title, content);
      if (embeddingResult.embedding) {
        embedding = embeddingResult.embedding;
      }
    }

    const similarEntries: Array<{
      id: string;
      title: string;
      type: string;
      similarity: number;
    }> = [];
    if (embedding && embedding.length > 0) {
      const similar = await searchKnowledgeVector(embedding, 3, type);
      for (const entry of similar) {
        if (entry.embedding_score && entry.embedding_score > 0.85) {
          similarEntries.push({
            id: entry.id,
            title: entry.title,
            type: entry.type,
            similarity: Math.round(entry.embedding_score * 100),
          });
        }
      }
    }

    const entry = await storeKnowledge({
      type,
      title,
      content,
      tags,
      source,
      embedding,
      metadata,
    });

    return successResponse({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      created_at: entry.created_at,
      similar_entries: similarEntries.length > 0 ? similarEntries : undefined,
      message: "Knowledge saved successfully",
    });
  },
};
