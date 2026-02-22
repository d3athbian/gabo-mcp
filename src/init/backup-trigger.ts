import { spawn } from 'node:child_process';
import { BACKUP_CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger/index.js';

export function triggerBackgroundBackup(): void {
  try {
    const isTS = import.meta.url.endsWith('.ts');
    const scriptPath = isTS ? BACKUP_CONSTANTS.SCRIPTS_PATH_TS : BACKUP_CONSTANTS.SCRIPTS_PATH_JS;

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
  } catch (err) {
    logger.error('Failed to spawn backup process', err);
  }
}
