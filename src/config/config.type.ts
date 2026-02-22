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
  readonly nodeEnv: NodeEnvironment;
  readonly logLevel: LogLevel;
  readonly database: DatabaseConfig;
  readonly mcp: MCPConfig;
  readonly features: FeaturesConfig;
  readonly embedding: EmbeddingConfig;
  readonly healthCheck: HealthCheckConfig;
  readonly debug: boolean;
  readonly prettyLogs: boolean;
};
