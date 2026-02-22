/**
 * Tools Index
 * Central export point for all MCP tools and registration utilities
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { withAuth } from '../middleware/auth/index.js';
import { withAudit, withErrorHandler } from '../utils/tool-handler/index.js';
import { deleteKnowledgeTool } from './delete-knowledge/index.js';
import { getAuditLogsTool } from './get-audit-logs/index.js';
import { getKnowledgeTool } from './get-knowledge/index.js';
import { listKnowledgeTool } from './list-knowledge/index.js';
import { saveKnowledgeTool } from './save/index.js';
import { searchTool } from './search/index.js';

export { saveKnowledgeTool, searchTool, listKnowledgeTool, getKnowledgeTool, deleteKnowledgeTool };

export type {
  BaseToolHandler,
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
    let finalHandler: any = tool.handler;

    if (!tool.skipAuth) {
      finalHandler = withAuth(finalHandler);
    }

    if (tool.auditAction) {
      finalHandler = withAudit(tool.name, tool.auditAction, finalHandler);
    }

    finalHandler = withErrorHandler(tool.name, finalHandler);

    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema as any,
      },
      async (args: any) => finalHandler(args)
    );
  }
}
