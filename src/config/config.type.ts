/**
 * Type definitions for configuration module
 * Extends base.type.ts for common patterns
 */

import type { NodeEnvironment, LogLevel } from "../base.type.ts";

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

export type Config = {
  readonly nodeEnv: NodeEnvironment;
  readonly logLevel: LogLevel;
  readonly database: DatabaseConfig;
  readonly mcp: MCPConfig;
  readonly features: FeaturesConfig;
  readonly debug: boolean;
  readonly prettyLogs: boolean;
};
