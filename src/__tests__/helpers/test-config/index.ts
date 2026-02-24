/**
 * Test Configuration Utilities
 * Helper functions for setting environment variables in tests
 * Follows the pattern: Testing with Variable Configurations
 */

import { config, reloadConfig } from '../../../config/config.js';

type EnvVarName =
  | 'NODE_ENV'
  | 'LOG_LEVEL'
  | 'MONGODB_URI'
  | 'MCP_SERVER_PORT'
  | 'MCP_REQUEST_TIMEOUT'
  | 'MAX_CONTEXT_LENGTH'
  | 'MCP_API_KEY'
  | 'API_KEY'
  | 'MCP_KEY_PEPPER'
  | 'MCP_DEBUG'
  | 'EMBED_ENABLED'
  | 'EMBED_PROVIDER'
  | 'EMBED_MODEL'
  | 'EMBED_DIMENSIONS'
  | 'EMBED_OLLAMA_URL'
  | 'EMBED_AUTO_START'
  | 'EMBED_TIMEOUT'
  | 'EMBED_CACHE_ENABLED'
  | 'EMBED_CACHE_TTL'
  | 'HEALTH_CHECK_ENABLED'
  | 'HEALTH_CHECK_INTERVAL_MS'
  | 'HEALTH_CHECK_TIMEOUT_MS'
  | 'ENABLE_CACHE'
  | 'ENABLE_AUDIT_LOG'
  | 'SECURITY_PROFILE'
  | 'DEBUG'
  | 'PRETTY_LOGS'
  | 'MCP_INSPECTOR'
  | 'MCP_AUDIT_RETENTION_DAYS';

const ALL_ENV_VARS: EnvVarName[] = [
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

function setEnv(key: EnvVarName, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function setBooleanEnv(key: EnvVarName, value: boolean | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value ? 'true' : 'false';
  }
}

function setNumericEnv(key: EnvVarName, value: number | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = String(value);
  }
}

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
  setEnv('NODE_ENV', overrides.nodeEnv);
  setEnv('LOG_LEVEL', overrides.logLevel);
  setEnv('MONGODB_URI', overrides.mongodbUri);
  setNumericEnv('MCP_SERVER_PORT', overrides.mcpPort);
  setEnv('MCP_API_KEY', overrides.mcpApiKey);
  setEnv('MCP_KEY_PEPPER', overrides.mcpKeyPepper);
  setBooleanEnv('MCP_DEBUG', overrides.mcpDebug);
  setBooleanEnv('EMBED_ENABLED', overrides.embedEnabled);
  setEnv('EMBED_PROVIDER', overrides.embedProvider);
  setEnv('EMBED_MODEL', overrides.embedModel);
  setNumericEnv('EMBED_DIMENSIONS', overrides.embedDimensions);
  setEnv('EMBED_OLLAMA_URL', overrides.embedOllamaUrl);
  setNumericEnv('EMBED_TIMEOUT', overrides.embedTimeout);
  setBooleanEnv('EMBED_CACHE_ENABLED', overrides.embedCacheEnabled);
  setNumericEnv('EMBED_CACHE_TTL', overrides.embedCacheTTL);
  setBooleanEnv('HEALTH_CHECK_ENABLED', overrides.healthCheckEnabled);
  setNumericEnv('HEALTH_CHECK_INTERVAL_MS', overrides.healthCheckIntervalMs);
  setNumericEnv('HEALTH_CHECK_TIMEOUT_MS', overrides.healthCheckTimeoutMs);
  setBooleanEnv('ENABLE_CACHE', overrides.enableCache);
  setBooleanEnv('ENABLE_AUDIT_LOG', overrides.enableAuditLog);
  setEnv('SECURITY_PROFILE', overrides.securityProfile);
  setBooleanEnv('DEBUG', overrides.debug);
  setBooleanEnv('PRETTY_LOGS', overrides.prettyLogs);
  setNumericEnv('MCP_AUDIT_RETENTION_DAYS', overrides.auditRetentionDays);

  reloadConfig();
}

export function clearAllConfig(): void {
  for (const key of ALL_ENV_VARS) {
    delete process.env[key];
  }
  reloadConfig();
}

export { config, reloadConfig };
