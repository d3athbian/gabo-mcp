/**
 * Tools Index
 * Central export point for all MCP tools and registration utilities
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { storeKnowledgeTool } from "./store-knowledge/index.js";
import { searchKnowledgeTool } from "./search-knowledge/index.js";
import { listKnowledgeTool } from "./list-knowledge/index.js";
import { getKnowledgeTool } from "./get-knowledge/index.js";
import { deleteKnowledgeTool } from "./delete-knowledge/index.js";
import { semanticSearchTool } from "./semantic-search/index.js";
import { suggestPatternsTool } from "./suggest-patterns/index.js";
import { getPitfallsTool } from "./get-pitfalls/index.js";

import { withAuth } from "../middleware/auth/index.js";
import { withErrorHandler } from "../utils/tool-handler/index.js";

export {
  storeKnowledgeTool,
  searchKnowledgeTool,
  listKnowledgeTool,
  getKnowledgeTool,
  deleteKnowledgeTool,
  semanticSearchTool,
  suggestPatternsTool,
  getPitfallsTool,
};

export type {
  ToolDefinition,
  BaseToolHandler,
  ToolRegistrar,
} from "./index.type.js";

export function registerAllTools(server: McpServer): void {
  const tools = [
    storeKnowledgeTool,
    searchKnowledgeTool,
    listKnowledgeTool,
    getKnowledgeTool,
    deleteKnowledgeTool,
    semanticSearchTool,
    suggestPatternsTool,
    getPitfallsTool,
  ];

  for (const tool of tools) {
    // 1. Start with the core handler
    let finalHandler: any = tool.handler;

    // 2. Wrap with Auth (unless skipped)
    if (!tool.skipAuth) {
      finalHandler = withAuth(finalHandler);
    }

    // 3. Wrap with Global Error Handling
    finalHandler = withErrorHandler(tool.name, finalHandler);

    // 4. Register in MCP server
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      // @ts-ignore - types are handled by our wrappers
      async (args: any) => finalHandler(args),
    );
  }
}
