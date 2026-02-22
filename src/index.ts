/**
 * MCP Server Implementation with MongoDB Atlas
 * Run locally: npm run dev:local
 * Connect via MCP Inspector for web UI: npx @modelcontextprotocol/inspector tsx src/index.ts
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from './config/config.js';
import { closeDatabase, connectToDatabase } from './db/client.js';
import { startHealthMonitor, stopHealthMonitor } from './db/health-monitor.js';
import { initializeEmbeddingService } from './embeddings/index.js';
import { ensureApiKeyExists } from './middleware/auth/index.js';
import { registerAllTools } from './tools/index.js';
import { logger } from './utils/logger/index.js';

process.title = 'gabo-mcp-server';

const isInspector =
  process.env.MCP_INSPECTOR === 'true' || process.argv.some((arg) => arg.includes('inspector'));

import { registerPrompts } from './prompts/index.js';
import { registerResources } from './resources/index.js';

const server = new McpServer({
  name: 'gabo-mcp-local',
  version: '0.1.0',
});

registerAllTools(server);
registerResources(server);
registerPrompts(server);

async function main() {
  const startBackend = async () => {
    try {
      logger.cleanup();

      // Fire-and-forget backup in background
      import('node:child_process')
        .then(({ spawn }) => {
          const isTS = import.meta.url.endsWith('.ts');
          const scriptPath = isTS ? 'scripts/backup-db.ts' : 'dist/scripts/backup-db.js';

          const backupProcess = spawn(
            isTS ? 'npx' : 'node',
            [isTS ? 'tsx' : '', scriptPath].filter(Boolean),
            {
              detached: true,
              stdio: 'ignore',
              cwd: process.cwd(),
            }
          );
          backupProcess.unref();
        })
        .catch((err) => logger.error('Failed to spawn backup process', err));

      logger.info('Initializing embedding service...');
      const { status: embeddingStatus } = await initializeEmbeddingService({
        enabled: config.embedding.enabled,
        provider: config.embedding.provider,
        model: config.embedding.model,
        ollamaUrl: config.embedding.ollamaUrl,
        autoStart: config.embedding.autoStart,
        timeout: config.embedding.timeout,
        cacheEnabled: config.embedding.cacheEnabled,
        cacheTTL: config.embedding.cacheTTL,
      });

      if (embeddingStatus.available) {
        logger.info(`Embedding service ready: ${embeddingStatus.model}`);
      } else {
        logger.warn(`Embedding service: ${embeddingStatus.error}`);
      }

      await connectToDatabase();

      if (config.healthCheck.enabled) {
        startHealthMonitor({
          enabled: config.healthCheck.enabled,
          intervalMs: config.healthCheck.intervalMs,
          timeoutMs: config.healthCheck.timeoutMs,
        });
        logger.info(`Health check enabled: every ${config.healthCheck.intervalMs}ms`);
      }

      const newKey = await ensureApiKeyExists();
      if (newKey) {
        logger.info(`First-time API key generated: ${newKey}`);
        logger.warn('Add this key to your MCP config');
      }
    } catch (error) {
      logger.error('Failed to start backend services', error);
      process.exit(1);
    }
  };

  try {
    const transport = new StdioServerTransport();

    await server.connect(transport);
    logger.info('Gabo MCP Server connected and ready! (Transport: stdio)');

    await startBackend();

    if (isInspector) {
      logger.info('MCP Inspector ready at http://localhost:5173');
    }

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down...`);
      stopHealthMonitor();
      await closeDatabase();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));

    process.on('disconnect', async () => {
      logger.info('Parent process disconnected, shutting down...');
      await closeDatabase();
      process.exit(0);
    });

    process.stdin.on('end', async () => {
      logger.info('Input stream closed, shutting down...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    await closeDatabase();
    process.exit(1);
  }
}

main().catch(async (error) => {
  logger.error('Unexpected error', error);
  await closeDatabase();
  process.exit(1);
});
