/**
 * Tools Index
 * Central export point for all MCP tools and registration utilities
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { saveKnowledgeTool } from "./save/index.js";
import { searchTool } from "./search/index.js";
import { listKnowledgeTool } from "./list-knowledge/index.js";
import { getKnowledgeTool } from "./get-knowledge/index.js";
import { deleteKnowledgeTool } from "./delete-knowledge/index.js";

import { withAuth } from "../middleware/auth/index.js";
import { withErrorHandler } from "../utils/tool-handler/index.js";

export {
  saveKnowledgeTool,
  searchTool,
  listKnowledgeTool,
  getKnowledgeTool,
  deleteKnowledgeTool,
};

export type {
  ToolDefinition,
  BaseToolHandler,
  ToolRegistrar,
} from "./index.type.js";

export function registerAllTools(server: McpServer): void {
  const tools = [
    saveKnowledgeTool,
    searchTool,
    listKnowledgeTool,
    getKnowledgeTool,
    deleteKnowledgeTool,
  ];

  for (const tool of tools) {
    let finalHandler: any = tool.handler;

    if (!tool.skipAuth) {
      finalHandler = withAuth(finalHandler);
    }

    finalHandler = withErrorHandler(tool.name, finalHandler);

    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema as any,
      },
      async (args: any) => finalHandler(args),
    );
  }
}
