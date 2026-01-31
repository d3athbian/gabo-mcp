/**
 * MCP Server Implementation with stdio transport
 * Run locally: npm run dev:local
 * Connect via MCP Inspector for web UI: npx @modelcontextprotocol/inspector tsx src/index.ts
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs";
import { logger } from "./utils/logger.js";
import type { StoredEntry } from "./index.type.js";
import { getSampleEntries } from "./utils/seed.js";
import { generateId } from "./utils/id.js";

const isInspector =
  process.env.MCP_INSPECTOR === "true" ||
  process.argv.some((arg) => arg.includes("inspector"));

const storage = new Map<string, StoredEntry>();

const server = new Server(
  {
    name: "gabo-mcp-local",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const TOOLS: Tool[] = [
  {
    name: "store_knowledge",
    description: "Store a new knowledge entry",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: [
            "UI_REASONING",
            "ARCH_DECISION",
            "PROMPT",
            "ERROR_CORRECTION",
            "CODE_SNIPPET",
            "DESIGN_DECISION",
            "TECHNICAL_INSIGHT",
            "REACT_PATTERN",
          ],
        },
        title: {
          type: "string",
          description: "Title of the knowledge entry",
        },
        content: {
          type: "string",
          description: "Full content/explanation",
        },
        tags: {
          type: "array",
          items: { type: "string" },
        },
        source: {
          type: "string",
        },
      },
      required: ["type", "title", "content"],
    } as Record<string, unknown> & { type: "object" },
  },
  {
    name: "search_knowledge",
    description: "Search knowledge entries",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
        },
        type: {
          type: "string",
        },
      },
      required: ["query"],
    } as Record<string, unknown> & { type: "object" },
  },
  {
    name: "list_knowledge",
    description: "List all knowledge entries",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          default: 10,
        },
      },
    } as Record<string, unknown> & { type: "object" },
  },
  {
    name: "get_knowledge",
    description: "Get a specific knowledge entry",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    } as Record<string, unknown> & { type: "object" },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info("📋 ListTools called");
  return { tools: TOOLS };
});

type CallToolRequest = {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
};

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    const { params } = request;
    const { name, arguments: args = {} } = params;

    logger.info(`🔧 Tool called: ${name}`);
    logger.info(`📋 Arguments: ${JSON.stringify(args)}`);

    try {
      switch (name) {
        case "store_knowledge": {
          const type = String(args.type);
          const title = String(args.title);
          const content = String(args.content);
          const tags = Array.isArray(args.tags) ? args.tags : [];
          const source = args.source ? String(args.source) : undefined;

          if (!title || !content) {
            throw new Error("title and content are required");
          }

          const id = generateId();
          const entry: StoredEntry = {
            id,
            type,
            title,
            content,
            tags,
            source: source || "mcp-local",
            created_at: new Date().toISOString(),
          };

          storage.set(id, entry);

          logger.info(`✅ Knowledge stored with ID: ${id}`);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    id,
                    message: "Knowledge stored successfully",
                    entry,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "search_knowledge": {
          const query = String(args.query);
          const type = args.type ? String(args.type) : undefined;

          if (!query) {
            throw new Error("query is required");
          }

          const results = Array.from(storage.values())
            .filter((entry) => {
              const matchesQuery =
                entry.title.toLowerCase().includes(query.toLowerCase()) ||
                entry.content.toLowerCase().includes(query.toLowerCase());
              const matchesType = !type || entry.type === type;
              return matchesQuery && matchesType;
            })
            .slice(0, 10);

          logger.info(
            `🔍 Search for "${query}": found ${results.length} results`,
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    query,
                    results,
                    count: results.length,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "list_knowledge": {
          const limit = typeof args.limit === "number" ? args.limit : 10;

          const entries = Array.from(storage.values())
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
            .slice(0, limit);

          logger.info(`📚 Listing ${entries.length} entries`);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    entries,
                    total: storage.size,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "get_knowledge": {
          const id = String(args.id);

          if (!id) {
            throw new Error("id is required");
          }

          const entry = storage.get(id);

          if (!entry) {
            logger.warn(`Entry not found: ${id}`);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: "Entry not found",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }

          logger.info(`✅ Retrieved entry: ${id}`);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    entry,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        default:
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: `Unknown tool: ${name}` }),
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Tool error: ${name}`, error);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: errorMsg,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  },
);

async function main() {
  const logPath = "/tmp/gabo-mcp-traffic.log";
  const logFile = fs.createWriteStream(logPath, { flags: "w" });

  logger.info(`📝 MCP Traffic Logs: ${logPath}`);

  const trace = (direction: string, data: string) => {
    const timestamp = new Date().toISOString();
    logFile.write(`[${timestamp}] ${direction}:\n${data}\n${"─".repeat(70)}\n`);
  };

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = function (
    chunk: string | Uint8Array,
    encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
    maybeCallback?: (error?: Error | null) => void,
  ): boolean {
    try {
      trace(
        "📤 OUT (Server -> Client)",
        typeof chunk === "string" ? chunk : chunk.toString(),
      );
    } catch (e) {}

    if (typeof encodingOrCallback === "function") {
      return originalStdoutWrite(chunk, encodingOrCallback);
    }

    if (typeof maybeCallback === "function") {
      return originalStdoutWrite(
        chunk,
        encodingOrCallback as BufferEncoding | undefined,
        maybeCallback,
      );
    }

    return originalStdoutWrite(
      chunk,
      encodingOrCallback as BufferEncoding | undefined,
    );
  };

  process.stdin.on("data", (chunk) => {
    try {
      trace("📥 IN (Client -> Server)", chunk.toString());
    } catch (e) {}
  });

  logger.info("");
  logger.info("═".repeat(60));
  logger.info("🚀 Knowledge MCP Server (Local)");
  logger.info("═".repeat(60));
  logger.info("");
  logger.info("Server Configuration:");
  logger.info("  • Name: gabo-mcp-local");
  logger.info("  • Version: 0.1.0");
  logger.info("  • Transport: stdio (no HTTP port)");
  logger.info("  • Mode: In-memory (no external dependencies)");
  logger.info("");
  logger.info("Available Tools:");
  TOOLS.forEach((tool, i) => {
    logger.info(`  ${i + 1}. ${tool.name} - ${tool.description}`);
  });
  logger.info("");
  logger.info("📝 MCP Traffic Logs: mcp_traffic.log");
  logger.info("");

  try {
    const samples = getSampleEntries();
    samples.forEach((entry) => storage.set(entry.id, entry));
    logger.info(`✅ Seeded ${samples.length} sample entries`);
    logger.info("");

    const transport = new StdioServerTransport();
    logger.info("🔗 Connecting via stdio...");

    await server.connect(transport);

    logger.info("✅ Server connected and ready!");
    logger.info("");

    if (isInspector) {
      logger.info("🌐 MCP Inspector Interface:");
      logger.info("  ► Web UI Port: 5173");
      logger.info("  ► URL: http://localhost:5173");
      logger.info("  ► Server Transport: stdio (embedded)");
      logger.info("");
    }

    logger.info("📖 How to Use:");
    logger.info("");
    logger.info("  Option 1: Web UI (Recommended)");
    logger.info("    $ npm run dev:inspector");
    logger.info("    → Open http://localhost:5173");
    logger.info("");
    logger.info("  Option 2: VS Code MCP Debugger");
    logger.info('    • Install extension: "MCP Debugger"');
    logger.info("    • Config: ~/.mcp/servers.json");
    logger.info("    • Server runs on: stdio");
    logger.info("");
    logger.info("  Option 3: Continue.dev");
    logger.info("    • Config: ~/.continue/config.yml");
    logger.info("    • Server runs on: stdio");
    logger.info("");
    logger.info("═".repeat(60));
    logger.info("Waiting for MCP protocol messages...");
    logger.info("═".repeat(60));
    logger.info("");
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error("Unexpected error", error);
  process.exit(1);
});
