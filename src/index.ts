/**
 * MCP Server Implementation with MongoDB Atlas
 * Run locally: npm run dev:local
 */

// Initialize config first - MUST be imported before anything else
import './config/initialize.js';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from './config/config.js';
import { APP_CONSTANTS } from './config/constants.js';
import { bootstrapInfrastructure } from './init/bootstrap-infrastructure.js';
import { registerPrompts } from './prompts/index.js';
import { registerResources } from './resources/index.js';
import { registerAllTools } from './tools/index.js';
import { registerShutdownHandlers } from './utils/lifecycle.js';
import { logger } from './utils/logger/index.js';

process.title = APP_CONSTANTS.PROCESS_TITLE;

const server = new McpServer({
  name: APP_CONSTANTS.SERVER_NAME,
  version: APP_CONSTANTS.SERVER_VERSION,
});

// Register MCP components
registerAllTools(server);
registerResources(server);
registerPrompts(server);

/**
 * Main application entry point
 */
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info(`${APP_CONSTANTS.SERVER_NAME} connected and ready! (Transport: stdio)`);

    await bootstrapInfrastructure();

    if (config.isInspector) {
      logger.info('MCP Inspector ready at http://localhost:5173');
    }

    registerShutdownHandlers();
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

main().catch(async (error) => {
  logger.error('Unexpected fatal error', error);
  process.exit(1);
});
