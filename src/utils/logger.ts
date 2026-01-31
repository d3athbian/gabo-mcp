/**
 * Logger utility for MCP Server
 * Provides consistent logging to stderr (stdout is reserved for MCP protocol)
 */

import type { LoggerInterface, LogFn, LogErrorFn } from "../base.type.ts";

export type Logger = LoggerInterface;

export function createLogger(): Logger {
  const getTimestamp = (): string => new Date().toISOString();

  const formatMessage = (emoji: string, msg: string): string => {
    const timestamp = getTimestamp();
    return `[${timestamp}] ${emoji} ${msg}`;
  };

  const info: LogFn = (msg: string) => {
    process.stderr.write(`${formatMessage("ℹ️", msg)}\n`);
  };

  const warn: LogFn = (msg: string) => {
    process.stderr.write(`${formatMessage("⚠️", msg)}\n`);
  };

  const error: LogErrorFn = (msg: string, error?: unknown) => {
    const errorMsg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${formatMessage("❌", msg)} - ${errorMsg}\n`);
  };

  return { info, warn, error };
}

export const logger = createLogger();
