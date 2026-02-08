/**
 * MCP Server Implementation with MongoDB Atlas
 * Run locally: npm run dev:local
 * Connect via MCP Inspector for web UI: npx @modelcontextprotocol/inspector tsx src/index.ts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs";
import { logger } from "./utils/logger/index.js";
import { connectToDatabase, closeDatabase } from "./db/client.js";
import { registerAllTools } from "./tools/index.js";
import { ensureApiKeyExists } from "./middleware/auth/index.js";

process.title = "gabo-mcp-server";

const isInspector =
  process.env.MCP_INSPECTOR === "true" ||
  process.argv.some((arg) => arg.includes("inspector"));



const server = new McpServer({
  name: "gabo-mcp-local",
  version: "0.1.0",
});

registerAllTools(server);

async function main() {
  // Log startup info (now inside main to ensure proper initialization order)
  logger.info(
    `🔖 Process started with title: ${process.title} (PID: ${process.pid})`,
  );

  const logPath = "/tmp/gabo-mcp-traffic.log";
  const logFile = fs.createWriteStream(logPath, { flags: "w" });

  logger.info(`📝 MCP Traffic Logs: ${logPath}`);

  try {
    logger.info("🔗 Connecting to MongoDB Atlas...");
    await connectToDatabase();
    logger.info("✅ MongoDB connection established");

    const newKey = await ensureApiKeyExists();
    if (newKey) {
      logger.info("");
      logger.info("🔑 FIRST TIME SETUP - API KEY GENERATED");
      logger.info("   Key: " + newKey);
      logger.info("   Add to your Continue.dev config:");
      logger.info(`   MCP_API_KEY=${newKey}`);
      logger.info("");
    }
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
    } catch (e) { }

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
    } catch (e) { }
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
  logger.info("  • Vector Search: ✅ Enabled (via Atlas)");
  logger.info("");
  logger.info("Available Tools:");
  logger.info("    • API key is auto-generated on first run or check MongoDB");
  logger.info("    • Use the key in your client (Continue.dev, Cursor, etc.)");
  logger.info("");
  logger.info("  📚 Knowledge Management:");
  logger.info("    1. store_knowledge - Store a new knowledge entry");
  logger.info("    2. search_knowledge - Search knowledge entries (text)");
  logger.info("    3. semantic_search - Vector search (provide vector)");
  logger.info("    4. list_knowledge - List all knowledge entries");
  logger.info("    5. get_knowledge - Get a specific knowledge entry");
  logger.info("");
  logger.info(`📝 MCP Traffic Logs: ${logPath}`);
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
