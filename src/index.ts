/**
 * MCP Server Implementation with stdio transport
 * Run locally: npm run dev:local
 * Connect via MCP Inspector for web UI: npx @modelcontextprotocol/inspector tsx src/index.ts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs";
import { logger } from "./utils/logger.js";
import type { StoredEntry } from "./schemas/index.schema.js";
import { getSampleEntries } from "./utils/seed.js";
import { generateId } from "./utils/id.js";
import {
  StoreKnowledgeSchema,
  SearchKnowledgeSchema,
  ListKnowledgeSchema,
  GetKnowledgeSchema,
} from "./schemas/index.schema.js";
import type {
  StoreKnowledgeArgs,
  SearchKnowledgeArgs,
  ListKnowledgeArgs,
  GetKnowledgeArgs,
} from "./schemas/index.schema.js";

const isInspector =
  process.env.MCP_INSPECTOR === "true" ||
  process.argv.some((arg) => arg.includes("inspector"));

const storage = new Map<string, StoredEntry>();

const server = new McpServer({
  name: "gabo-mcp-local",
  version: "0.1.0",
});

server.registerTool(
  "store_knowledge",
  {
    title: "Store Knowledge Entry",
    description: "Store a new knowledge entry",
    inputSchema: StoreKnowledgeSchema,
  },
  // @ts-ignore - SDK type inference issue
  async (args: StoreKnowledgeArgs) => {
    const { type, title, content, tags, source } = args;
    if (!title || !content) {
      return {
        content: [
          { type: "text", text: "Error: title and content are required" },
        ],
        isError: true,
      };
    }

    const id = generateId();
    const entry: StoredEntry = {
      id,
      type,
      title,
      content,
      tags: tags || [],
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
  },
);

server.registerTool(
  "search_knowledge",
  {
    title: "Search Knowledge",
    description: "Search knowledge entries",
    inputSchema: SearchKnowledgeSchema,
  },
  // @ts-ignore - SDK type inference issue
  async (args: SearchKnowledgeArgs) => {
    const { query, type } = args;
    if (!query) {
      return {
        content: [{ type: "text", text: "Error: query is required" }],
        isError: true,
      };
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

    logger.info(`🔍 Search for "${query}": found ${results.length} results`);

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
  },
);

server.registerTool(
  "list_knowledge",
  {
    title: "List Knowledge Entries",
    description: "List all knowledge entries",
    inputSchema: ListKnowledgeSchema,
  },
  // @ts-ignore - SDK type inference issue
  async (args: ListKnowledgeArgs) => {
    const { limit } = args;
    const entries = Array.from(storage.values())
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
  },
);

server.registerTool(
  "get_knowledge",
  {
    title: "Get Knowledge Entry",
    description: "Get a specific knowledge entry",
    inputSchema: GetKnowledgeSchema,
  },
  // @ts-ignore - SDK type inference issue
  async (args: GetKnowledgeArgs) => {
    const { id } = args;
    if (!id) {
      return {
        content: [{ type: "text", text: "Error: id is required" }],
        isError: true,
      };
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
  logger.info("  1. store_knowledge - Store a new knowledge entry");
  logger.info("  2. search_knowledge - Search knowledge entries");
  logger.info("  3. list_knowledge - List all knowledge entries");
  logger.info("  4. get_knowledge - Get a specific knowledge entry");
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
