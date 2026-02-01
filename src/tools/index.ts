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
import { checkVectorSearchTool } from "./check-vector-search.js";

// Export all tool definitions
export {
  storeKnowledgeTool,
  searchKnowledgeTool,
  listKnowledgeTool,
  getKnowledgeTool,
  semanticSearchTool,
  checkVectorSearchTool,
};

// Export types
export type {
  ToolDefinition,
  ToolHandler,
  ToolRegistrar,
} from "./index.type.js";

/**
 * Register all tools with the MCP server
 * Centralized registration following Single Responsibility Principle
 *
 * Usage:
 *   import { registerAllTools } from "./tools/index.js";
 *   registerAllTools(server, DEV_USER_ID);
 */
export function registerAllTools(server: McpServer, userId: string): void {
  const tools = [
    storeKnowledgeTool,
    searchKnowledgeTool,
    listKnowledgeTool,
    getKnowledgeTool,
    semanticSearchTool,
    checkVectorSearchTool,
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
      async (args: unknown) => tool.handler(args, userId),
    );
  }
}
