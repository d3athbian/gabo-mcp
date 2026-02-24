/**
 * Type definitions for configuration module
 * Extends base.type.ts for common patterns
 */

import type { LogLevel, NodeEnvironment } from '../base.type.ts';

export type DatabaseConfig = {
  url: string;
};

export type MCPConfig = {
  port: number;
  timeout: number;
  maxContextLength: number;
  apiKey: string | undefined;
};

export type FeaturesConfig = {
  enableCache: boolean;
  enableAuditLog: boolean;
};

export type EmbeddingConfig = {
  enabled: boolean;
  provider: 'ollama' | 'openai';
  model: string;
  dimensions: number;
  ollamaUrl: string;
  autoStart: boolean;
  timeout: number;
  cacheEnabled: boolean;
  cacheTTL: number;
};

export type HealthCheckConfig = {
  enabled: boolean;
  intervalMs: number;
  timeoutMs: number;
};

export type Config = {
  nodeEnv: NodeEnvironment;
  logLevel: LogLevel;
  database: DatabaseConfig;
  mcp: MCPConfig;
  features: FeaturesConfig;
  embedding: EmbeddingConfig;
  healthCheck: HealthCheckConfig;
  debug: boolean;
  prettyLogs: boolean;
  isInspector: boolean;
  mcpKeyPepper: string | undefined;
  mcpDebug: boolean;
  auditRetentionDays: number;
};
