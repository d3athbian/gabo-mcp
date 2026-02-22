import * as fs from 'node:fs';
import * as path from 'node:path';
import type { LogErrorFn, LogFn, Logger } from '../../base.type.js';
import { LOGGING } from '../../config/constants.js';

const LOG_DIR = LOGGING.DIR;
const LOG_FILE = LOGGING.FILE;
const MAX_LOG_SIZE = LOGGING.MAX_SIZE_BYTES;
const MAX_LOG_AGE_DAYS = LOGGING.MAX_AGE_DAYS;

export function createLogger(): Logger {
  const getLogPath = () => path.join(LOG_DIR, LOG_FILE);

  const getTimestamp = (): string => new Date().toISOString();

  const rotateIfNeeded = () => {
    const filePath = getLogPath();
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > MAX_LOG_SIZE) {
          const oldPath = `${filePath}.old`;
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
          fs.renameSync(filePath, oldPath);
        }
      }
    } catch (_e) {}
  };

  const writeLog = (message: string) => {
    rotateIfNeeded();
    const filePath = getLogPath();
    try {
      fs.appendFileSync(filePath, `${message}\n`);
    } catch (_error) {}
  };

  const formatMessage = (msg: string): string => {
    const timestamp = getTimestamp();
    return `[${timestamp}] ${msg}`;
  };

  const info: LogFn = (msg: string) => {
    writeLog(formatMessage(msg));
  };

  const warn: LogFn = (msg: string) => {
    writeLog(formatMessage(`WARNING: ${msg}`));
  };

  const error: LogErrorFn = (msg: string, err?: unknown) => {
    const errorMsg = err instanceof Error ? err.message : String(err);
    writeLog(formatMessage(`ERROR: ${msg} - ${errorMsg}`));
  };

  const debug: LogFn = (msg: string) => {
    if (process.env.MCP_DEBUG === 'true') {
      writeLog(formatMessage(`DEBUG: ${msg}`));
    }
  };

  const cleanup = () => {
    try {
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;
      const files = fs.readdirSync(LOG_DIR);

      for (const file of files) {
        if (file.startsWith('gabo-mcp')) {
          const filePath = path.join(LOG_DIR, file);
          const stats = fs.statSync(filePath);
          const ageInDays = (now - stats.mtime.getTime()) / msPerDay;

          if (ageInDays > MAX_LOG_AGE_DAYS) {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (_e) {}
  };

  return { info, warn, error, debug, cleanup };
}

export const logger = createLogger();

export function getLogFilePath(): string {
  return path.join(LOG_DIR, LOG_FILE);
}
