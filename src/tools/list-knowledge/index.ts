import { successResponse } from '../../utils/tool-handler/index.js';
import type { ToolDefinition } from '../index.type.js';
import type { ListKnowledgeArgs } from './list-knowledge.type.js';
import { ListKnowledgeSchema } from './list-knowledge.type.js';

export const listKnowledgeTool: ToolDefinition<ListKnowledgeArgs> = {
  name: 'list',
  title: 'List Knowledge',
  description: 'List knowledge entries with pagination and optional type filter.',
  inputSchema: ListKnowledgeSchema,
  auditAction: 'list_knowledge',
  handler: async (args, _auth, context) => {
    const ctx = context!;
    const { type, limit, offset } = args;
    const { data: entries, count } = await ctx.listKnowledge!(type, limit, offset);

    return successResponse({
      entries,
      total: count,
    });
  },
};
