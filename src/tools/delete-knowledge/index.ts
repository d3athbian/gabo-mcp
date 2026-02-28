import { successResponse } from '../../utils/tool-handler/index.js';
import type { ToolContext, ToolDefinition } from '../index.type.js';
import type { DeleteKnowledgeArgs } from './delete-knowledge.type.js';
import { DeleteKnowledgeSchema } from './delete-knowledge.type.js';

export const deleteKnowledgeTool: ToolDefinition<DeleteKnowledgeArgs> = {
  name: 'delete',
  title: 'Delete Knowledge',
  description: 'Delete a knowledge entry by ID.',
  inputSchema: DeleteKnowledgeSchema,
  auditAction: 'delete_knowledge',
  handler: async (args, _auth, context?: Partial<ToolContext>) => {
    const ctx = context!;
    await ctx.deleteKnowledge!(args.id);
    return successResponse({
      message: `Entry ${args.id} deleted successfully`,
      id: args.id,
    });
  },
};
