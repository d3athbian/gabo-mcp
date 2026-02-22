import { config } from '../config/config.js';
import { connectToDatabase } from '../db/client.js';
import { initializeEmbeddingService } from '../embeddings/index.js';
import { ensureApiKeyExists } from '../middleware/auth/index.js';
import { logger } from '../utils/logger/index.js';
import { triggerBackgroundBackup } from './backup-trigger.js';
import { startHealthMonitor } from './health-monitor.js';

export async function bootstrapInfrastructure(): Promise<void> {
  logger.cleanup();

  triggerBackgroundBackup();

  logger.info('Initializing embedding service...');
  const { status: embeddingStatus } = await initializeEmbeddingService(config.embedding);

  if (embeddingStatus.available) {
    logger.info(`Embedding service ready: ${embeddingStatus.model}`);
  } else {
    logger.warn(`Embedding service: ${embeddingStatus.error}`);
  }

  await connectToDatabase();

  if (config.healthCheck.enabled) {
    startHealthMonitor(config.healthCheck);
    logger.info(`Health check enabled: every ${config.healthCheck.intervalMs}ms`);
  }

  const newKey = await ensureApiKeyExists();
  if (newKey) {
    logger.info(`First-time API key generated: ${newKey}`);
    logger.warn('Add this key to your MCP config');
  }
}
