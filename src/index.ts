/**
 * MCP Server Implementation with MongoDB Atlas
 * Run locally: npm run dev:local
 * Connect via MCP Inspector for web UI: npx @modelcontextprotocol/inspector tsx src/index.ts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs";
import { logger } from "./utils/logger.js";
import { connectToDatabase, closeDatabase } from "./db/client.js";
import {
  storeKnowledge,
  searchKnowledge,
  listKnowledge,
  getKnowledge,
} from "./db/queries.js";
import { searchKnowledgeVector } from "./db/vector-search.js";
import { generateEmbedding } from "./embeddings/index.js";
import {
  StoreKnowledgeSchema,
  SearchKnowledgeSchema,
  ListKnowledgeSchema,
  GetKnowledgeSchema,
  SemanticSearchSchema,
} from "./schemas/index.schema.js";
import type {
  StoreKnowledgeArgs,
  SearchKnowledgeArgs,
  ListKnowledgeArgs,
  GetKnowledgeArgs,
  SemanticSearchArgs,
} from "./schemas/index.schema.js";

const isInspector =
  process.env.MCP_INSPECTOR === "true" ||
  process.argv.some((arg) => arg.includes("inspector"));

const DEV_USER_ID = process.env.DEV_USER_ID || "dev-user-123";

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
    try {
      const { type, title, content, tags, source } = args;
      if (!title || !content) {
        return {
          content: [
            { type: "text", text: "Error: title and content are required" },
          ],
          isError: true,
        };
      }

      // Generate embedding for the content
      const embeddingText = `${title} ${content}`;
      const embedding = await generateEmbedding(embeddingText);

      const entry = await storeKnowledge(DEV_USER_ID, {
        type,
        title,
        content,
        tags: tags || [],
        source,
        embedding: embedding.length > 0 ? embedding : undefined,
      });

      logger.info(`✅ Knowledge stored with ID: ${entry.id}`);
      if (embedding.length > 0) {
        logger.info(`   🧠 Generated embedding (${embedding.length} dims)`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                id: entry.id,
                message: "Knowledge stored successfully",
                entry,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error("Failed to store knowledge", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : String(error),
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

server.registerTool(
  "search_knowledge",
  {
    title: "Search Knowledge",
    description: "Search knowledge entries by keywords",
    inputSchema: SearchKnowledgeSchema,
  },
  // @ts-ignore - SDK type inference issue
  async (args: SearchKnowledgeArgs) => {
    try {
      const { query, type } = args;
      if (!query) {
        return {
          content: [{ type: "text", text: "Error: query is required" }],
          isError: true,
        };
      }

      const results = await searchKnowledge(DEV_USER_ID, {
        query,
        type,
        limit: 10,
        offset: 0,
      });

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
    } catch (error) {
      logger.error("Failed to search knowledge", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : String(error),
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

server.registerTool(
  "list_knowledge",
  {
    title: "List Knowledge Entries",
    description: "List all knowledge entries",
    inputSchema: ListKnowledgeSchema,
  },
  // @ts-ignore - SDK type inference issue
  async (args: ListKnowledgeArgs) => {
    try {
      const { limit } = args;
      const { data: entries, count } = await listKnowledge(
        DEV_USER_ID,
        undefined,
        limit,
      );

      logger.info(`📚 Listing ${entries.length} entries (total: ${count})`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                entries,
                total: count,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error("Failed to list knowledge", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : String(error),
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

server.registerTool(
  "get_knowledge",
  {
    title: "Get Knowledge Entry",
    description: "Get a specific knowledge entry by ID",
    inputSchema: GetKnowledgeSchema,
  },
  // @ts-ignore - SDK type inference issue
  async (args: GetKnowledgeArgs) => {
    try {
      const { id } = args;
      if (!id) {
        return {
          content: [{ type: "text", text: "Error: id is required" }],
          isError: true,
        };
      }

      const entry = await getKnowledge(DEV_USER_ID, id);

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
    } catch (error) {
      logger.warn(
        `Entry not found or error: ${error instanceof Error ? error.message : String(error)}`,
      );
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
  },
);

server.registerTool(
  "semantic_search",
  {
    title: "Semantic Search",
    description:
      "Search knowledge entries using AI-powered semantic similarity (vector search). Requires Atlas Vector Search index.",
    inputSchema: SemanticSearchSchema,
  },
  // @ts-ignore - SDK type inference issue
  async (args: SemanticSearchArgs) => {
    try {
      const { query, type, limit } = args;
      if (!query) {
        return {
          content: [{ type: "text", text: "Error: query is required" }],
          isError: true,
        };
      }

      // Generate embedding for the query
      const queryVector = await generateEmbedding(query);

      if (queryVector.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Failed to generate embedding. Ensure Ollama is running with nomic-embed-text model.",
            },
          ],
          isError: true,
        };
      }

      const results = await searchKnowledgeVector(
        DEV_USER_ID,
        queryVector,
        limit,
        type,
      );

      logger.info(
        `🔍 Semantic search for "${query}": found ${results.length} results`,
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
                search_type: "semantic",
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error("Semantic search failed", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                note: "Ensure Atlas Vector Search index is configured in MongoDB Atlas. See server startup logs for instructions.",
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

  // Connect to MongoDB Atlas
  try {
    logger.info("🔗 Connecting to MongoDB Atlas...");
    await connectToDatabase();
    logger.info("✅ MongoDB connection established");
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  }

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
  logger.info("🚀 Knowledge MCP Server (MongoDB Atlas Edition)");
  logger.info("═".repeat(60));
  logger.info("");
  logger.info("Server Configuration:");
  logger.info("  • Name: gabo-mcp-local");
  logger.info("  • Version: 0.1.0");
  logger.info("  • Transport: stdio (no HTTP port)");
  logger.info("  • Database: MongoDB Atlas M0 (Free Tier)");
  logger.info("  • Vector Search: ✅ Enabled (768 dims)");
  logger.info("  • Embeddings: Ollama (nomic-embed-text)");
  logger.info("");
  logger.info("Available Tools:");
  logger.info("  1. store_knowledge - Store a new knowledge entry");
  logger.info("  2. search_knowledge - Search knowledge entries (text)");
  logger.info("  3. semantic_search - Search knowledge entries (AI/vector)");
  logger.info("  4. list_knowledge - List all knowledge entries");
  logger.info("  5. get_knowledge - Get a specific knowledge entry");
  logger.info("");
  logger.info("📝 MCP Traffic Logs: mcp_traffic.log");
  logger.info("");

  try {
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

    // Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("\n🛑 Shutting down...");
      await closeDatabase();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("\n🛑 Shutting down...");
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    await closeDatabase();
    process.exit(1);
  }
}

main().catch(async (error) => {
  logger.error("Unexpected error", error);
  await closeDatabase();
  process.exit(1);
});
