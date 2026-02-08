/**
 * Tools Index
 * Central export point for all MCP tools and registration utilities
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { storeKnowledgeTool } from "./store-knowledge.js";
import { searchKnowledgeTool } from "./search-knowledge.js";
import { listKnowledgeTool } from "./list-knowledge.js";
import { getKnowledgeTool } from "./get-knowledge.js";
import { semanticSearchTool } from "./semantic-search.js";

export {
  storeKnowledgeTool,
  searchKnowledgeTool,
  listKnowledgeTool,
  getKnowledgeTool,
  semanticSearchTool,
};

export type {
  ToolDefinition,
  ToolHandler,
  ToolRegistrar,
} from "./index.type.js";

export function registerAllTools(server: McpServer): void {
  const tools = [
    storeKnowledgeTool,
    searchKnowledgeTool,
    listKnowledgeTool,
    getKnowledgeTool,
    semanticSearchTool,
  ];

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      // @ts-ignore - SDK type inference issue
      async (args: unknown) => tool.handler(args),
    );
  }
}
