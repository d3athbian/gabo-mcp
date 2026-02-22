import { listKnowledge } from '../../db/queries.js';
import { createTool } from '../../utils/tool-factory.js';
import { successResponse } from '../../utils/tool-handler/index.js';
import type { ListKnowledgeArgs } from './list-knowledge.type.js';
import { ListKnowledgeSchema } from './list-knowledge.type.js';

export const listKnowledgeTool = createTool(
  {
    name: 'list',
    title: 'List Knowledge',
    description: 'List knowledge entries with pagination and optional type filter.',
    inputSchema: ListKnowledgeSchema,
    auditAction: 'list_knowledge',
  },
  async (args) => {
    const { type, limit, offset } = args as ListKnowledgeArgs;
    const { data: entries, count } = await listKnowledge(type, limit, offset);

    return successResponse({
      entries,
      total: count,
    });
  }
);
