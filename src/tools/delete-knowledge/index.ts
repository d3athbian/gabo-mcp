import { deleteKnowledge } from '../../db/queries.js';
import { successResponse } from '../../utils/tool-handler/index.js';
import type { ToolDefinition } from '../index.type.js';
import type { DeleteKnowledgeArgs } from './delete-knowledge.type.js';
import { DeleteKnowledgeSchema } from './delete-knowledge.type.js';

export const deleteKnowledgeTool: ToolDefinition<DeleteKnowledgeArgs> = {
  name: 'delete',
  title: 'Delete Knowledge',
  description: 'Delete a knowledge entry by ID.',
  inputSchema: DeleteKnowledgeSchema,
  auditAction: 'delete_knowledge',
  handler: async (args) => {
    await deleteKnowledge(args.id);
    return successResponse({
      message: `Entry ${args.id} deleted successfully`,
      id: args.id,
    });
  },
};
