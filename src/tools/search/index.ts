import { SEARCH } from '../../config/constants.js';
import type { KnowledgeType, SearchResult } from '../../schemas/index.schema.js';
import { createTool } from '../../utils/tool-factory.js';
import { successResponse } from '../../utils/tool-handler/index.js';
import type { SearchArgs } from './search.type.js';
import { SearchSchema } from './search.type.js';

const PITFALL_TYPES = SEARCH.PITFALL_TYPES;

export const searchTool = createTool(
  {
    name: 'search',
    title: 'Search Knowledge',
    description:
      'Search knowledge using text, semantic vectors, or hybrid mode. Supports filtering by type and including pitfalls/patterns in results.',
    inputSchema: SearchSchema,
    auditAction: 'search_knowledge',
  },
  async (args, _auth, context) => {
    const ctx = context!;
    const searchArgs = args as SearchArgs;

    const {
      query,
      type,
      mode,
      query_vector: providedQueryVector,
      include_pitfalls,
      include_patterns,
      limit,
    } = searchArgs;

    const results: SearchResult[] = [];
    const pitfalls: SearchResult[] = [];
    const patterns: SearchResult[] = [];
    const warnings: string[] = [];

    const vectorAvailable = await ctx.isVectorSearchAvailable!();

    let queryVector = providedQueryVector;

    if (!queryVector && (mode === 'semantic' || mode === 'hybrid')) {
      const embeddingResult = await ctx.generateQueryEmbedding!(query);
      if (embeddingResult.warning) {
        warnings.push(embeddingResult.warning);
      } else {
        queryVector = embeddingResult.embedding;
      }
    }

    if (mode === 'semantic' || (mode === 'hybrid' && queryVector)) {
      const vectorResults = await ctx.searchKnowledgeVector!(queryVector!, limit * 2, type);
      results.push(...vectorResults);
    }

    if (mode === 'text' || mode === 'hybrid') {
      const textResults = await ctx.searchKnowledge!({
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
        filterTypes.push('PATTERN');
      }

      for (const filterType of filterTypes) {
        const filtered = await ctx.searchKnowledge!({
          query,
          type: filterType as KnowledgeType,
          limit: 5,
          offset: 0,
        });

        if (filterType === 'PATTERN') {
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
  }
);
