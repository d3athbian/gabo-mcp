import { z } from 'zod';

export const GetKnowledgeSchema = z.object({
  id: z.string().min(1, 'ID is required').describe('Knowledge entry ID'),
  format: z.enum(['json', 'markdown', 'plain']).default('json').describe('Output format'),
});

export type GetKnowledgeArgs = z.infer<typeof GetKnowledgeSchema>;
