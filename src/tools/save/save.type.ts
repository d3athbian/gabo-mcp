import { z } from 'zod';

export const SaveKnowledgeSchema = z.object({
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
    .describe('Type of knowledge to store'),
  title: z.string().min(1, 'Title is required').describe('Title of the knowledge entry'),
  content: z.string().min(1, 'Content is required').describe('Content of the knowledge entry'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
  source: z.string().optional().describe('Context or pattern this knowledge applies to'),
  embedding: z.array(z.number()).optional().describe('Vector embedding for semantic search'),
  metadata: z.record(z.any()).optional().describe('Additional metadata'),
});

export type SaveKnowledgeArgs = z.infer<typeof SaveKnowledgeSchema>;
