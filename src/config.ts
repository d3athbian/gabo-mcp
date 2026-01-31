// Environment variables are loaded natively by Node 24 via --env-file flag
// No dotenv dependency needed!

import type { Config } from './config.type.ts';

const requiredVars = [
  'NODE_ENV',
];

// Only require SUPABASE_URL if not in mock/offline mode
if (process.env.USE_MOCK_DB !== 'true') {
  requiredVars.push('SUPABASE_URL');
}

const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const config: Config = {
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  
  // Mock/offline mode for local testing without Supabase
  useMockDb: process.env.USE_MOCK_DB === 'true',
  
  database: {
    url: process.env.DATABASE_URL || process.env.SUPABASE_URL,
    supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'mock-key',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  embeddings: {
    model: process.env.EMBED_MODEL || 'nomic-embed-text',
    provider: (process.env.EMBED_PROVIDER || 'ollama') as 'ollama' | 'openai',
    ollamaUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    batchSize: parseInt(process.env.EMBED_BATCH_SIZE || '32', 10),
    cacheDir: process.env.EMBED_CACHE_DIR || './cache/embeddings',
    cacheEnabled: process.env.EMBED_CACHE_ENABLED === 'true',
  },
  
  mcp: {
    port: parseInt(process.env.MCP_SERVER_PORT || '3000', 10),
    timeout: parseInt(process.env.MCP_REQUEST_TIMEOUT || '30000', 10),
    maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH || '2048', 10),
  },
  
  features: {
    enableEmbeddings: process.env.ENABLE_EMBEDDINGS === 'true',
    enableCache: process.env.ENABLE_CACHE === 'true',
    enableAuditLog: process.env.ENABLE_AUDIT_LOG === 'true',
  },
  
  debug: process.env.DEBUG === 'true',
  prettyLogs: process.env.PRETTY_LOGS === 'true',
};

// Validate critical config
if (config.nodeEnv === 'production' && !config.useMockDb && !config.database.supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production');
}
