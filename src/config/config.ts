import { config as loadDotenv } from 'dotenv';
import { APP_PATHS } from './constants.js';
import type { Config } from './config.type.js';

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
    port: parseInt(process.env.MCP_SERVER_PORT || '3000', 10),
    timeout: parseInt(process.env.MCP_REQUEST_TIMEOUT || '30000', 10),
    maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH || '2048', 10),
    apiKey: process.env.MCP_API_KEY,
  },

  features: {
    enableCache: process.env.ENABLE_CACHE === 'true',
    enableAuditLog: process.env.ENABLE_AUDIT_LOG === 'true',
  },

  embedding: {
    enabled: process.env.EMBED_ENABLED !== 'false',
    provider: (process.env.EMBED_PROVIDER || 'ollama') as 'ollama' | 'openai',
    model: process.env.EMBED_MODEL || 'nomic-embed-text',
    dimensions: parseInt(process.env.EMBED_DIMENSIONS || '768', 10),
    ollamaUrl: process.env.EMBED_OLLAMA_URL || 'http://localhost:11434',
    autoStart: process.env.EMBED_AUTO_START !== 'false',
    timeout: parseInt(process.env.EMBED_TIMEOUT || '30000', 10),
    cacheEnabled: process.env.EMBED_CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(process.env.EMBED_CACHE_TTL || '3600', 10),
  },

  healthCheck: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    intervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL_MS || '900000', 10),
    timeoutMs: parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS || '5000', 10),
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
