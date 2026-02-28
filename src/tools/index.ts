/**
 * Tools Index
 * Central export point for all MCP tools and registration utilities
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { withAuth } from '../middleware/auth/index.js';
import { withAudit, withErrorHandler } from '../utils/tool-handler/index.js';
import type { ToolResponse } from '../utils/tool-handler/tool-handler.type.js';
import { defaultToolContext } from './default-context.js';
import { deleteKnowledgeTool } from './delete-knowledge/index.js';
import { getAuditLogsTool } from './get-audit-logs/index.js';
import { getKnowledgeTool } from './get-knowledge/index.js';
import { listKnowledgeTool } from './list-knowledge/index.js';
import { saveKnowledgeTool } from './save/index.js';
import { searchTool } from './search/index.js';

export { saveKnowledgeTool, searchTool, listKnowledgeTool, getKnowledgeTool, deleteKnowledgeTool };

export type {
  BaseToolHandler,
  ToolContext,
  ToolDefinition,
  ToolRegistrar,
} from './index.type.js';

export function registerAllTools(server: McpServer): void {
  const tools = [
    saveKnowledgeTool,
    searchTool,
    listKnowledgeTool,
    getKnowledgeTool,
    deleteKnowledgeTool,
    getAuditLogsTool,
  ];

  for (const tool of tools) {
    let finalHandler: (args: unknown) => Promise<ToolResponse> = (args) =>
      tool.handler(args as any, { keyId: 'system' }, defaultToolContext);

    if (!tool.skipAuth) {
      finalHandler = withAuth(finalHandler);
    }

    if (tool.auditAction) {
      finalHandler = withAudit(tool.name, tool.auditAction, finalHandler);
    }

    finalHandler = withErrorHandler(tool.name, finalHandler);

    const handlerWrapper = (args: unknown): Promise<ToolResponse> => {
      return finalHandler(args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = tool.inputSchema as any;

    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: schema,
      },
      handlerWrapper
    );
  }
}
