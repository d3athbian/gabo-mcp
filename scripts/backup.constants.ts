import { join } from 'node:path';

export const BACKUP_CONFIG = {
    MAX_RETRIES: 6,
    RETRY_DELAY_MS: 10000,
    KEEP_BACKUPS: 2,
    DEFAULT_SUBDIR: 'mongodb-backups/gabo-mcp',
} as const;

export const BACKUP_FLAGS = {
    FORCE: '--force',
} as const;

export const BACKUP_PATHS = {
    getBasename: () => process.env.BACKUP_PATH || join(process.env.HOME || '', BACKUP_CONFIG.DEFAULT_SUBDIR),
} as const;
