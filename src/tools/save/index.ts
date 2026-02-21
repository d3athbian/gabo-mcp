import { successResponse } from "../../utils/tool-handler/index.js";
import { storeKnowledge } from "../../db/queries.js";
import { sanitizeContent } from "../../middleware/sanitization/index.js";
import { searchKnowledgeVector } from "../../db/vector-search.js";
import { generateEmbedding } from "../../embeddings/index.js";
import { SaveKnowledgeSchema } from "./save.type.js";
import type { ToolDefinition } from "../index.type.js";
import type { SaveKnowledgeArgs } from "./save.type.js";

export const saveKnowledgeTool: ToolDefinition<SaveKnowledgeArgs> = {
  name: "save",
  title: "Save Knowledge",
  description:
    "Save knowledge directly to the database. Sanitization warnings will be returned but the user decides whether to proceed.",
  inputSchema: SaveKnowledgeSchema,
  handler: async (args) => {
    const {
      type,
      title,
      content,
      tags,
      source,
      embedding: providedEmbedding,
      metadata,
      skip_sanitization,
    } = args;

    const warnings: string[] = [];

    if (!skip_sanitization) {
      const sanitizationResult = sanitizeContent(title, content);
      if (!sanitizationResult.allowed && sanitizationResult.violations) {
        for (const violation of sanitizationResult.violations) {
          warnings.push(
            `${violation.category.toUpperCase()}: ${violation.message}`,
          );
        }
      }
    }

    let embedding = providedEmbedding;
    let embeddingWarning: string | undefined;

    if (!embedding) {
      const embeddingResult = await generateEmbedding(title, content);
      if (embeddingResult.warning) {
        embeddingWarning = embeddingResult.warning;
      } else {
        embedding = embeddingResult.embedding;
      }
    }

    if (embeddingWarning) {
      warnings.push(embeddingWarning);
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
      warnings: warnings.length > 0 ? warnings : undefined,
      similar_entries: similarEntries.length > 0 ? similarEntries : undefined,
      message:
        warnings.length > 0
          ? `Saved with ${warnings.length} warning(s). Review before relying on this knowledge.`
          : "Knowledge saved successfully",
    });
  },
};
