import { z } from 'zod';

export const ListKnowledgeSchema = z.object({
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
  limit: z.number().int().positive().default(10).describe('Maximum results to return'),
  offset: z.number().int().nonnegative().default(0).describe('Number of results to skip'),
});

export type ListKnowledgeArgs = z.infer<typeof ListKnowledgeSchema>;
