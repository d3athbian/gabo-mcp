/**
 * Type definitions for configuration module
 * Extends base.type.ts for common patterns
 */

import type { NodeEnvironment, LogLevel } from "../base.type.ts";

export type EmbeddingProvider = "ollama" | "openai";

export type DatabaseConfig = {
  url: string;
};

export type EmbeddingsConfig = {
  model: string;
  provider: EmbeddingProvider;
  ollamaUrl: string;
  openaiApiKey: string | undefined;
  openaiModel: string;
  batchSize: number;
  cacheDir: string;
  cacheEnabled: boolean;
};

export type MCPConfig = {
  port: number;
  timeout: number;
  maxContextLength: number;
};

export type FeaturesConfig = {
  enableEmbeddings: boolean;
  enableCache: boolean;
  enableAuditLog: boolean;
};

export type Config = {
  readonly nodeEnv: NodeEnvironment;
  readonly logLevel: LogLevel;
  readonly database: DatabaseConfig;
  readonly embeddings: EmbeddingsConfig;
  readonly mcp: MCPConfig;
  readonly features: FeaturesConfig;
  readonly debug: boolean;
  readonly prettyLogs: boolean;
};
