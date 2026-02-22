import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const APP_PATHS = {
  ENV_FILE: join(__dirname, '../../.env'),
  DOCS_DIR: join(__dirname, '../../docs'),
  TEMPLATES_SRC: join(__dirname, '../prompts/templates'),
  TEMPLATES_DIST: join(__dirname, '../prompts/templates'),
  SANITIZATION_CONFIG: join(__dirname, '../../sanitization.config.json'),
} as const;

export const APP_CONSTANTS = {
  PROCESS_TITLE: 'gabo-mcp',
  SERVER_NAME: 'gabo-mcp',
  SERVER_VERSION: '1.0.0',
} as const;

export const APP = APP_CONSTANTS;

export const API_KEY = {
  PREFIX: 'gabo_',
  BCRYPT_ROUNDS: 10,
} as const;

export const DATABASE = {
  MONGO: {
    DEFAULT_URI: 'mongodb://localhost:27017',
    WAKE_RETRY: parseInt(process.env.MONGO_WAKE_RETRY || '3', 10),
    WAKE_DELAY_MS: parseInt(process.env.MONGO_WAKE_DELAY || '5000', 10),
    POOL_SIZE: 10,
    SERVER_SELECTION_TIMEOUT_MS: 10000,
    SOCKET_TIMEOUT_MS: 45000,
    CONNECT_TIMEOUT_MS: 30000,
  },
  COLLECTIONS: {
    KNOWLEDGE_ENTRIES: 'knowledge_entries',
    KNOWLEDGE_TAGS: 'knowledge_tags',
    KNOWLEDGE_AUDIT_LOG: 'knowledge_audit_log',
    API_KEYS: 'api_keys',
  },
} as const;

export const LOGGING = {
  DIR: '/tmp',
  FILE: 'gabo-mcp.log',
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_AGE_DAYS: 3,
} as const;

export const BACKUP = {
  MAX_RETRIES: 6,
  RETRY_DELAY_MS: 10000,
  KEEP_COUNT: 2,
  DEFAULT_SUBDIR: 'mongodb-backups/gabo-mcp',
} as const;

export const SEARCH = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  SIMILARITY_THRESHOLD: 0.92,
  PITFALL_TYPES: ['PITFALL', 'ERROR_CORRECTION'],
} as const;

export const AUDIT_TOOL_NAMES = {
  GET_AUDIT_LOGS: 'get_audit_logs',
  GET_AUDIT_LOGS_TITLE: 'Get Audit Logs',
} as const;

export type AuditToolName = (typeof AUDIT_TOOL_NAMES)[keyof typeof AUDIT_TOOL_NAMES];

export const BACKUP_CONSTANTS = {
  SCRIPTS_PATH_TS: 'scripts/backup-db.ts',
  SCRIPTS_PATH_JS: 'dist/scripts/backup-db.js',
} as const;

export const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const;
