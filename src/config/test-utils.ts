/**
 * Test Configuration Utilities
 * Helper functions for setting environment variables in tests
 */

import { config, reloadConfig } from './config.js';

export function setEnvVar(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

export function setTestConfig(overrides: {
  nodeEnv?: 'development' | 'production' | 'test';
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  mongodbUri?: string;
  mcpPort?: number;
  mcpApiKey?: string;
  mcpKeyPepper?: string;
  mcpDebug?: boolean;
  embedEnabled?: boolean;
  embedProvider?: 'ollama' | 'openai';
  embedModel?: string;
  embedDimensions?: number;
  embedOllamaUrl?: string;
  embedTimeout?: number;
  embedCacheEnabled?: boolean;
  embedCacheTTL?: number;
  healthCheckEnabled?: boolean;
  healthCheckIntervalMs?: number;
  healthCheckTimeoutMs?: number;
  enableCache?: boolean;
  enableAuditLog?: boolean;
  securityProfile?: 'work' | 'personal';
  debug?: boolean;
  prettyLogs?: boolean;
  auditRetentionDays?: number;
}): void {
  if (overrides.nodeEnv !== undefined) {
    process.env.NODE_ENV = overrides.nodeEnv;
  }
  if (overrides.logLevel !== undefined) {
    process.env.LOG_LEVEL = overrides.logLevel;
  }
  if (overrides.mongodbUri !== undefined) {
    process.env.MONGODB_URI = overrides.mongodbUri;
  }
  if (overrides.mcpPort !== undefined) {
    process.env.MCP_SERVER_PORT = String(overrides.mcpPort);
  }
  if (overrides.mcpApiKey !== undefined) {
    process.env.MCP_API_KEY = overrides.mcpApiKey;
  }
  if (overrides.mcpKeyPepper !== undefined) {
    process.env.MCP_KEY_PEPPER = overrides.mcpKeyPepper;
  }
  if (overrides.mcpDebug !== undefined) {
    process.env.MCP_DEBUG = overrides.mcpDebug ? 'true' : 'false';
  }
  if (overrides.embedEnabled !== undefined) {
    process.env.EMBED_ENABLED = overrides.embedEnabled ? 'true' : 'false';
  }
  if (overrides.embedProvider !== undefined) {
    process.env.EMBED_PROVIDER = overrides.embedProvider;
  }
  if (overrides.embedModel !== undefined) {
    process.env.EMBED_MODEL = overrides.embedModel;
  }
  if (overrides.embedDimensions !== undefined) {
    process.env.EMBED_DIMENSIONS = String(overrides.embedDimensions);
  }
  if (overrides.embedOllamaUrl !== undefined) {
    process.env.EMBED_OLLAMA_URL = overrides.embedOllamaUrl;
  }
  if (overrides.embedTimeout !== undefined) {
    process.env.EMBED_TIMEOUT = String(overrides.embedTimeout);
  }
  if (overrides.embedCacheEnabled !== undefined) {
    process.env.EMBED_CACHE_ENABLED = overrides.embedCacheEnabled ? 'true' : 'false';
  }
  if (overrides.embedCacheTTL !== undefined) {
    process.env.EMBED_CACHE_TTL = String(overrides.embedCacheTTL);
  }
  if (overrides.healthCheckEnabled !== undefined) {
    process.env.HEALTH_CHECK_ENABLED = overrides.healthCheckEnabled ? 'true' : 'false';
  }
  if (overrides.healthCheckIntervalMs !== undefined) {
    process.env.HEALTH_CHECK_INTERVAL_MS = String(overrides.healthCheckIntervalMs);
  }
  if (overrides.healthCheckTimeoutMs !== undefined) {
    process.env.HEALTH_CHECK_TIMEOUT_MS = String(overrides.healthCheckTimeoutMs);
  }
  if (overrides.enableCache !== undefined) {
    process.env.ENABLE_CACHE = overrides.enableCache ? 'true' : 'false';
  }
  if (overrides.enableAuditLog !== undefined) {
    process.env.ENABLE_AUDIT_LOG = overrides.enableAuditLog ? 'true' : 'false';
  }
  if (overrides.securityProfile !== undefined) {
    process.env.SECURITY_PROFILE = overrides.securityProfile;
  }
  if (overrides.debug !== undefined) {
    process.env.DEBUG = overrides.debug ? 'true' : 'false';
  }
  if (overrides.prettyLogs !== undefined) {
    process.env.PRETTY_LOGS = overrides.prettyLogs ? 'true' : 'false';
  }
  if (overrides.auditRetentionDays !== undefined) {
    process.env.MCP_AUDIT_RETENTION_DAYS = String(overrides.auditRetentionDays);
  }

  reloadConfig();
}

export function clearAllConfig(): void {
  const envVarsToClear = [
    'NODE_ENV',
    'LOG_LEVEL',
    'MONGODB_URI',
    'MCP_SERVER_PORT',
    'MCP_REQUEST_TIMEOUT',
    'MAX_CONTEXT_LENGTH',
    'MCP_API_KEY',
    'API_KEY',
    'MCP_KEY_PEPPER',
    'MCP_DEBUG',
    'EMBED_ENABLED',
    'EMBED_PROVIDER',
    'EMBED_MODEL',
    'EMBED_DIMENSIONS',
    'EMBED_OLLAMA_URL',
    'EMBED_AUTO_START',
    'EMBED_TIMEOUT',
    'EMBED_CACHE_ENABLED',
    'EMBED_CACHE_TTL',
    'HEALTH_CHECK_ENABLED',
    'HEALTH_CHECK_INTERVAL_MS',
    'HEALTH_CHECK_TIMEOUT_MS',
    'ENABLE_CACHE',
    'ENABLE_AUDIT_LOG',
    'SECURITY_PROFILE',
    'DEBUG',
    'PRETTY_LOGS',
    'MCP_INSPECTOR',
    'MCP_AUDIT_RETENTION_DAYS',
  ];

  for (const key of envVarsToClear) {
    delete process.env[key];
  }

  reloadConfig();
}

export { config, reloadConfig };
