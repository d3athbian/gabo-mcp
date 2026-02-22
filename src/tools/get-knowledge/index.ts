import { getKnowledge } from '../../db/queries.js';
import { successResponse } from '../../utils/tool-handler/index.js';
import type { ToolDefinition } from '../index.type.js';
import type { GetKnowledgeArgs } from './get-knowledge.type.js';
import { GetKnowledgeSchema } from './get-knowledge.type.js';

function formatAsMarkdown(entry: any): string {
  const tags = entry.tags?.length > 0 ? entry.tags.map((t: string) => `#${t}`).join(' ') : '';

  return `## ${entry.title}

**Tipo:** ${entry.type} ${tags ? `| ${tags}` : ''}

${entry.content}

---
*Creado: ${new Date(entry.created_at).toLocaleDateString()}*`;
}

export const getKnowledgeTool: ToolDefinition<GetKnowledgeArgs> = {
  name: 'get',
  title: 'Get Knowledge',
  description: 'Get knowledge entry by ID. Supports json, markdown, or plain output format.',
  inputSchema: GetKnowledgeSchema,
  auditAction: 'get_knowledge',
  handler: async (args) => {
    const { id, format } = args;
    const entry = await getKnowledge(id);

    if (format === 'markdown') {
      const markdown = formatAsMarkdown(entry);
      return successResponse({
        entry,
        formatted: markdown,
      });
    }

    if (format === 'plain') {
      return successResponse({
        text: entry.content,
        title: entry.title,
        type: entry.type,
      });
    }

    return successResponse({ entry });
  },
};
