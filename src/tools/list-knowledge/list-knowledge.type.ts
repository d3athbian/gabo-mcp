import { z } from 'zod';
import { KnowledgeTypeSchema, PaginationSchema } from '../../schemas/base.schema.js';

export const ListKnowledgeSchema = z
  .object({
    type: KnowledgeTypeSchema.optional().describe('Filter by knowledge type'),
  })
  .merge(PaginationSchema);

export type ListKnowledgeArgs = z.infer<typeof ListKnowledgeSchema>;
