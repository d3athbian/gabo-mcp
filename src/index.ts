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
import { registerAllTools } from "./tools/index.js";

// Set process title for easy identification and cleanup
process.title = "gabo-mcp-server";
logger.info(
  `🔖 Process started with title: ${process.title} (PID: ${process.pid})`,
);

const isInspector =
  process.env.MCP_INSPECTOR === "true" ||
  process.argv.some((arg) => arg.includes("inspector"));

const DEV_USER_ID = process.env.DEV_USER_ID || "dev-user-123";

const server = new McpServer({
  name: "gabo-mcp-local",
  version: "0.1.0",
});

// Register all tools from modular structure
registerAllTools(server, DEV_USER_ID);

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

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
  logger.info("  🔐 Authentication:");
  logger.info(
    "    1. create_first_api_key - Bootstrap authentication (run first!)",
  );
  logger.info("    2. create_api_key - Create key for new device");
  logger.info("    3. list_api_keys - List all keys");
  logger.info("    4. revoke_api_key - Revoke a key");
  logger.info("");
  logger.info("  📚 Knowledge Management:");
  logger.info("    5. store_knowledge - Store a new knowledge entry");
  logger.info("    6. search_knowledge - Search knowledge entries (text)");
  logger.info("    7. semantic_search - Search knowledge entries (AI/hybrid)");
  logger.info("    8. list_knowledge - List all knowledge entries");
  logger.info("    9. get_knowledge - Get a specific knowledge entry");
  logger.info(
    "   10. check_vector_search - Verify vector search configuration",
  );
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
    const shutdown = async (signal: string) => {
      logger.info(`\n🛑 Received ${signal}, shutting down...`);
      await closeDatabase();
      logger.info("👋 Server stopped");
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGQUIT", () => shutdown("SIGQUIT"));

    // Handle parent process disconnect (when VS Code closes)
    process.on("disconnect", async () => {
      logger.info("\n👋 Parent process disconnected, shutting down...");
      await closeDatabase();
      process.exit(0);
    });

    // Handle stdin close
    process.stdin.on("end", async () => {
      logger.info("\n👋 Input stream closed, shutting down...");
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
