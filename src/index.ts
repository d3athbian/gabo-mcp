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
  const logPath = "/tmp/gabo-mcp-traffic.log";
  const logFile = fs.createWriteStream(logPath, { flags: "w" });

  try {
    await connectToDatabase();

    const newKey = await ensureApiKeyExists();
    if (newKey) {
      logger.info(`🔑 First-time API key generated: ${newKey}`);
      logger.warn("⚠️  Add this key to your MCP config (e.g. Continue.dev or Cursor)");
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
        "📤 OUT",
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
      trace("📥 IN", chunk.toString());
    } catch (e) { }
  });

  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("🚀 Gabo MCP Server connected and ready! (Transport: stdio)");

    if (isInspector) {
      logger.info("🌐 MCP Inspector ready at http://localhost:5173");
    }

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n🛑 Received ${signal}, shutting down...`);
      await closeDatabase();
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
