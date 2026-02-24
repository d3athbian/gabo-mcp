import { config as loadDotenv } from 'dotenv';
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
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
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
    apiKey: process.env.MCP_API_KEY,
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
};

// Validate critical config
if (config.nodeEnv === 'production' && !process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required in production');
}
