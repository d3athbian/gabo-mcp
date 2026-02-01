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
import { createFirstApiKeyTool } from "./create-first-api-key.js";
import { createApiKeyTool } from "./create-api-key.js";
import { listApiKeysTool } from "./list-api-keys.js";
import { revokeApiKeyTool } from "./revoke-api-key.js";

// Export all tool definitions
export {
  storeKnowledgeTool,
  searchKnowledgeTool,
  listKnowledgeTool,
  getKnowledgeTool,
  semanticSearchTool,
  checkVectorSearchTool,
  createFirstApiKeyTool,
  createApiKeyTool,
  listApiKeysTool,
  revokeApiKeyTool,
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
    // API Key Management (must be first - bootstrap needs to be available)
    createFirstApiKeyTool,
    createApiKeyTool,
    listApiKeysTool,
    revokeApiKeyTool,
    // Knowledge Management
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
