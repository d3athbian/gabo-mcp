import { getKnowledge } from '../../db/queries.js';
import type { KnowledgeEntry } from '../../schemas/index.schema.js';
import { createTool } from '../../utils/tool-factory.js';
import { successResponse } from '../../utils/tool-handler/index.js';
import type { GetKnowledgeArgs } from './get-knowledge.type.js';
import { GetKnowledgeSchema } from './get-knowledge.type.js';

function formatAsMarkdown(entry: KnowledgeEntry): string {
  const tags =
    entry.tags?.length > 0 ? entry.tags.map((t: string) => `\`${t}\``).join(' ') : '_None_';
  const typeBadge = `\`${entry.type}\``;
  const createdDate = new Date(entry.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const updatedDate = entry.updated_at
    ? new Date(entry.updated_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  let metadataSection = '';
  if (entry.source || entry.metadata || updatedDate) {
    const metadataRows: string[] = [];
    if (entry.source) metadataRows.push(`| **Source** | ${entry.source} |`);
    if (updatedDate) metadataRows.push(`| **Actualizado** | ${updatedDate} |`);
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      for (const [key, value] of Object.entries(entry.metadata)) {
        const displayValue = typeof value === 'string' ? value : JSON.stringify(value);
        metadataRows.push(`| **${key}** | ${displayValue.slice(0, 100)} |`);
      }
    }
    if (metadataRows.length > 0) {
      metadataSection = `\n### Metadata\n\n${metadataRows.join('\n')}\n`;
    }
  }

  return `# ${entry.title}

> **Tipo:** ${typeBadge} | **Tags:** ${tags} | **Creado:** ${createdDate}

---

${entry.content}

---

${metadataSection}
_Fuente: ${entry.source || 'No especificada'}_`;
}

export const getKnowledgeTool = createTool(
  {
    name: 'get',
    title: 'Get Knowledge',
    description: 'Get knowledge entry by ID. Supports json, markdown, or plain output format.',
    inputSchema: GetKnowledgeSchema,
    auditAction: 'get_knowledge',
  },
  async (args) => {
    const { id, format } = args as GetKnowledgeArgs;
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
  }
);
