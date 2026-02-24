import { config as loadDotenv } from 'dotenv';
import { AppError } from '../utils/errors/Error.js';
import type { Config } from './config.type.js';
import { APP_PATHS, EMBEDDING, HEALTH_CHECK, MCP } from './constants.js';

// Suppress dotenv output to prevent breaking MCP protocol on stdout
process.env.DOTENV_CONFIG_QUIET = 'true';

// Fallback: Load .env if MONGODB_URI is missing (for Node < 20.6 or if --env-file is omitted)
if (!process.env.MONGODB_URI) {
  loadDotenv({ path: APP_PATHS.ENV_FILE });
}

const requiredVars = ['MONGODB_URI'];

const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  throw new AppError(
    `Missing required environment variables: ${missingVars.join(', ')}`,
    'MISSING_ENV_VARS',
    500,
    { missingVars }
  );
}

export const config: Config = {
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',

  database: {
    url: process.env.MONGODB_URI!,
  },

  mcp: {
    port: parseInt(process.env.MCP_SERVER_PORT || String(MCP.DEFAULT_PORT), 10),
    timeout: parseInt(process.env.MCP_REQUEST_TIMEOUT || String(MCP.DEFAULT_TIMEOUT_MS), 10),
    maxContextLength: parseInt(
      process.env.MAX_CONTEXT_LENGTH || String(MCP.DEFAULT_MAX_CONTEXT_LENGTH),
      10
    ),
    apiKey: process.env.MCP_API_KEY || process.env.API_KEY,
  },

  features: {
    enableCache: process.env.ENABLE_CACHE !== 'false',
    enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false',
  },

  embedding: {
    enabled: process.env.EMBED_ENABLED !== 'false',
    provider: (process.env.EMBED_PROVIDER || 'ollama') as 'ollama' | 'openai',
    model: process.env.EMBED_MODEL || EMBEDDING.DEFAULT_MODEL,
    dimensions: parseInt(process.env.EMBED_DIMENSIONS || String(EMBEDDING.DEFAULT_DIMENSIONS), 10),
    ollamaUrl: process.env.EMBED_OLLAMA_URL || EMBEDDING.DEFAULT_URL,
    autoStart: process.env.EMBED_AUTO_START !== 'false',
    timeout: parseInt(process.env.EMBED_TIMEOUT || String(EMBEDDING.DEFAULT_TIMEOUT_MS), 10),
    cacheEnabled: process.env.EMBED_CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(process.env.EMBED_CACHE_TTL || String(EMBEDDING.DEFAULT_CACHE_TTL), 10),
  },

  healthCheck: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    intervalMs: parseInt(
      process.env.HEALTH_CHECK_INTERVAL_MS || String(HEALTH_CHECK.DEFAULT_INTERVAL_MS),
      10
    ),
    timeoutMs: parseInt(
      process.env.HEALTH_CHECK_TIMEOUT_MS || String(HEALTH_CHECK.DEFAULT_TIMEOUT_MS),
      10
    ),
  },

  debug: process.env.DEBUG === 'true',
  prettyLogs: process.env.PRETTY_LOGS === 'true',
  isInspector:
    process.env.MCP_INSPECTOR === 'true' || process.argv.some((arg) => arg.includes('inspector')),
  mcpKeyPepper: process.env.MCP_KEY_PEPPER,
  mcpDebug: process.env.MCP_DEBUG === 'true',
  auditRetentionDays: parseInt(process.env.MCP_AUDIT_RETENTION_DAYS || '90', 10),
};

// Validate critical config
if (config.nodeEnv === 'production' && !process.env.MONGODB_URI) {
  throw new AppError('MONGODB_URI is required in production', 'MISSING_MONGODB_URI', 500);
}

export function reloadConfig(): void {
  config.nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  config.logLevel = (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error';
  config.database.url = process.env.MONGODB_URI!;
  config.mcp.port = parseInt(process.env.MCP_SERVER_PORT || String(MCP.DEFAULT_PORT), 10);
  config.mcp.timeout = parseInt(
    process.env.MCP_REQUEST_TIMEOUT || String(MCP.DEFAULT_TIMEOUT_MS),
    10
  );
  config.mcp.maxContextLength = parseInt(
    process.env.MAX_CONTEXT_LENGTH || String(MCP.DEFAULT_MAX_CONTEXT_LENGTH),
    10
  );
  config.mcp.apiKey = process.env.MCP_API_KEY || process.env.API_KEY;
  config.features.enableCache = process.env.ENABLE_CACHE !== 'false';
  config.features.enableAuditLog = process.env.ENABLE_AUDIT_LOG !== 'false';
  config.embedding.enabled = process.env.EMBED_ENABLED !== 'false';
  config.embedding.provider = (process.env.EMBED_PROVIDER || 'ollama') as 'ollama' | 'openai';
  config.embedding.model = process.env.EMBED_MODEL || EMBEDDING.DEFAULT_MODEL;
  config.embedding.dimensions = parseInt(
    process.env.EMBED_DIMENSIONS || String(EMBEDDING.DEFAULT_DIMENSIONS),
    10
  );
  config.embedding.ollamaUrl = process.env.EMBED_OLLAMA_URL || EMBEDDING.DEFAULT_URL;
  config.embedding.autoStart = process.env.EMBED_AUTO_START !== 'false';
  config.embedding.timeout = parseInt(
    process.env.EMBED_TIMEOUT || String(EMBEDDING.DEFAULT_TIMEOUT_MS),
    10
  );
  config.embedding.cacheEnabled = process.env.EMBED_CACHE_ENABLED !== 'false';
  config.embedding.cacheTTL = parseInt(
    process.env.EMBED_CACHE_TTL || String(EMBEDDING.DEFAULT_CACHE_TTL),
    10
  );
  config.healthCheck.enabled = process.env.HEALTH_CHECK_ENABLED !== 'false';
  config.healthCheck.intervalMs = parseInt(
    process.env.HEALTH_CHECK_INTERVAL_MS || String(HEALTH_CHECK.DEFAULT_INTERVAL_MS),
    10
  );
  config.healthCheck.timeoutMs = parseInt(
    process.env.HEALTH_CHECK_TIMEOUT_MS || String(HEALTH_CHECK.DEFAULT_TIMEOUT_MS),
    10
  );
  config.debug = process.env.DEBUG === 'true';
  config.prettyLogs = process.env.PRETTY_LOGS === 'true';
  config.mcpKeyPepper = process.env.MCP_KEY_PEPPER;
  config.mcpDebug = process.env.MCP_DEBUG === 'true';
  config.auditRetentionDays = parseInt(process.env.MCP_AUDIT_RETENTION_DAYS || '90', 10);
}
