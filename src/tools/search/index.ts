import { successResponse } from "../../utils/tool-handler/index.js";
import { searchKnowledge } from "../../db/queries.js";
import { searchKnowledgeVector } from "../../db/vector-search.js";
import { isVectorSearchAvailable } from "../../db/vector-search.js";
import { generateQueryEmbedding } from "../../embeddings/index.js";
import { SearchSchema } from "./search.type.js";
import type { ToolDefinition } from "../index.type.js";
import type { SearchArgs } from "./search.type.js";

const PITFALL_TYPES = ["PITFALL", "ERROR_CORRECTION"];

export const searchTool: ToolDefinition<SearchArgs> = {
  name: "search",
  title: "Search Knowledge",
  description:
    "Search knowledge using text, semantic vectors, or hybrid mode. Supports filtering by type and including pitfalls/patterns in results.",
  inputSchema: SearchSchema,
  handler: async (args) => {
    const {
      query,
      type,
      mode,
      query_vector: providedQueryVector,
      include_pitfalls,
      include_patterns,
      limit,
    } = args;

    const results: any[] = [];
    const pitfalls: any[] = [];
    const patterns: any[] = [];
    const warnings: string[] = [];

    const vectorAvailable = await isVectorSearchAvailable();

    let queryVector = providedQueryVector;

    if (!queryVector && (mode === "semantic" || mode === "hybrid")) {
      const embeddingResult = await generateQueryEmbedding(query);
      if (embeddingResult.warning) {
        warnings.push(embeddingResult.warning);
      } else {
        queryVector = embeddingResult.embedding;
      }
    }

    if (mode === "semantic" || (mode === "hybrid" && queryVector)) {
      const vectorResults = await searchKnowledgeVector(
        queryVector!,
        limit * 2,
        type,
      );
      results.push(...vectorResults);
    }

    if (mode === "text" || mode === "hybrid") {
      const textResults = await searchKnowledge({
        query,
        type,
        limit: limit * 2,
        offset: 0,
      });

      for (const r of textResults) {
        if (!results.find((existing) => existing.id === r.id)) {
          results.push(r);
        }
      }
    }

    if (include_pitfalls || include_patterns) {
      const filterTypes: string[] = [];

      if (include_pitfalls) {
        filterTypes.push(...PITFALL_TYPES);
      }
      if (include_patterns) {
        filterTypes.push("PATTERN");
      }

      for (const filterType of filterTypes) {
        const filtered = await searchKnowledge({
          query,
          type: filterType as any,
          limit: 5,
          offset: 0,
        });

        if (filterType === "PATTERN") {
          patterns.push(...filtered);
        } else {
          pitfalls.push(...filtered);
        }
      }
    }

    const finalResults = results.slice(0, limit);

    return successResponse({
      query,
      mode,
      results: finalResults,
      count: finalResults.length,
      warnings: warnings.length > 0 ? warnings : undefined,
      pitfalls: include_pitfalls ? pitfalls : undefined,
      patterns: include_patterns ? patterns : undefined,
      vector_available: vectorAvailable,
    });
  },
};
