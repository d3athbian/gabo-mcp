import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const { BACKUP: BACKUP_FROM_SRC } = await import('../src/constants.js');

export const BACKUP_CONFIG = {
  MAX_RETRIES: BACKUP_FROM_SRC.MAX_RETRIES,
  RETRY_DELAY_MS: BACKUP_FROM_SRC.RETRY_DELAY_MS,
  KEEP_BACKUPS: BACKUP_FROM_SRC.KEEP_COUNT,
  DEFAULT_SUBDIR: BACKUP_FROM_SRC.DEFAULT_SUBDIR,
} as const;

export const BACKUP_FLAGS = {
  FORCE: '--force',
} as const;

export const BACKUP_PATHS = {
  getBasename: () =>
    process.env.BACKUP_PATH || join(process.env.HOME || '', BACKUP_CONFIG.DEFAULT_SUBDIR),
} as const;
