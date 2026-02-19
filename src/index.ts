/**
 * MCP Server Implementation with MongoDB Atlas
 * Run locally: npm run dev:local
 * Connect via MCP Inspector for web UI: npx @modelcontextprotocol/inspector tsx src/index.ts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { logger } from "./utils/logger/index.js";
import { connectToDatabase, closeDatabase } from "./db/client.js";
import { registerAllTools } from "./tools/index.js";
import { ensureApiKeyExists } from "./middleware/auth/index.js";

process.title = "gabo-mcp-server";

const isInspector =
  process.env.MCP_INSPECTOR === "true" ||
  process.argv.some((arg) => arg.includes("inspector"));

import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

const server = new McpServer({
  name: "gabo-mcp-local",
  version: "0.1.0",
});

registerAllTools(server);
registerResources(server);
registerPrompts(server);

async function main() {
  const startBackend = async () => {
    try {
      logger.cleanup();

      await connectToDatabase();

      const newKey = await ensureApiKeyExists();
      if (newKey) {
        logger.info(`First-time API key generated: ${newKey}`);
        logger.warn("Add this key to your MCP config");
      }
    } catch (error) {
      logger.error("Failed to connect to MongoDB", error);
      process.exit(1);
    }
  };

  try {
    const transport = new StdioServerTransport();

    await server.connect(transport);
    logger.info("Gabo MCP Server connected and ready! (Transport: stdio)");

    await startBackend();

    if (isInspector) {
      logger.info("MCP Inspector ready at http://localhost:5173");
    }

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down...`);
      await closeDatabase();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGQUIT", () => shutdown("SIGQUIT"));

    process.on("disconnect", async () => {
      logger.info("Parent process disconnected, shutting down...");
      await closeDatabase();
      process.exit(0);
    });

    process.stdin.on("end", async () => {
      logger.info("Input stream closed, shutting down...");
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
