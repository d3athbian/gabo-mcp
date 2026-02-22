import { z } from 'zod';

export const SearchSchema = z.object({
  query: z.string().min(1, 'Query is required').describe('Search query'),
  type: z
    .enum([
      'UI_UX',
      'ARCH_DECISION',
      'PROMPT',
      'ERROR_CORRECTION',
      'CODE_SNIPPET',
      'DESIGN_DECISION',
      'TECHNICAL_INSIGHT',
      'PATTERN',
      'PITFALL',
      'INFRASTRUCTURE',
      'TESTING',
    ])
    .optional()
    .describe('Filter by knowledge type'),
  mode: z
    .enum(['text', 'semantic', 'hybrid'])
    .default('hybrid')
    .describe('Search mode: text (keywords), semantic (vectors), or hybrid (both)'),
  query_vector: z
    .array(z.number())
    .optional()
    .describe('Vector embedding for semantic search (required for semantic/hybrid mode)'),
  include_pitfalls: z
    .boolean()
    .default(false)
    .describe('Include PITFALL and ERROR_CORRECTION types in results'),
  include_patterns: z.boolean().default(false).describe('Include PATTERN type in results'),
  limit: z.number().int().positive().default(10).describe('Maximum results to return'),
});

export type SearchArgs = z.infer<typeof SearchSchema>;
