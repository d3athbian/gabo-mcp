import { z } from 'zod';

export const DeleteKnowledgeSchema = z.object({
  id: z.string().min(1, 'ID is required').describe('Knowledge entry ID to delete'),
});

export type DeleteKnowledgeArgs = z.infer<typeof DeleteKnowledgeSchema>;
