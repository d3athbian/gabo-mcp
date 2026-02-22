import { SHUTDOWN_SIGNALS } from '../config/constants.js';
import { closeDatabase } from '../db/client.js';
import { stopHealthMonitor } from '../db/health-monitor.js';
import { logger } from './logger/index.js';

/**
 * Handles graceful shutdown of the application.
 */
export async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down...`);

  try {
    stopHealthMonitor();
    await closeDatabase();
    logger.info('Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', error);
    process.exit(1);
  }
}

/**
 * Registers all shutdown event listeners.
 */
export function registerShutdownHandlers(): void {
  SHUTDOWN_SIGNALS.forEach((signal) => {
    process.on(signal, () => gracefulShutdown(signal));
  });

  process.on('disconnect', async () => {
    logger.info('Parent process disconnected, shutting down...');
    await gracefulShutdown('DISCONNECT');
  });

  process.stdin.on('end', async () => {
    logger.info('Input stream closed, shutting down...');
    await gracefulShutdown('STDIN_END');
  });
}
