/**
 * Logger utility for MCP Server
 * Writes logs to file ONLY - stdout/stderr reserved for MCP protocol
 */

import * as fs from "fs";
import type { LoggerInterface, LogFn, LogErrorFn } from "../base.type.ts";

export type Logger = LoggerInterface;

const LOG_FILE_PATH = "/tmp/gabo-mcp.log";

export function createLogger(): Logger {
  // Ensure log file exists and is writable
  let logStream: fs.WriteStream | null = null;

  try {
    logStream = fs.createWriteStream(LOG_FILE_PATH, { flags: "a" });
  } catch (error) {
    // Silent fail - we cannot write to stderr as it breaks MCP protocol
    // If file logging fails, we simply don't log
  }

  const getTimestamp = (): string => new Date().toISOString();

  const formatMessage = (emoji: string, msg: string): string => {
    const timestamp = getTimestamp();
    return `[${timestamp}] ${emoji} ${msg}`;
  };

  const writeLog = (message: string) => {
    const formattedMessage = `${message}\n`;

    if (logStream && !logStream.destroyed) {
      logStream.write(formattedMessage);
    }
    // IMPORTANT: Do NOT write to stdout or stderr
    // stdout is reserved for MCP JSON protocol
    // stderr may be captured by MCP clients as error output
  };

  const info: LogFn = (msg: string) => {
    writeLog(formatMessage("ℹ️", msg));
  };

  const warn: LogFn = (msg: string) => {
    writeLog(formatMessage("⚠️", msg));
  };

  const error: LogErrorFn = (msg: string, error?: unknown) => {
    const errorMsg = error instanceof Error ? error.message : String(error);
    writeLog(formatMessage("❌", `${msg} - ${errorMsg}`));
  };

  const debug: LogFn = (_msg: string) => {
    // Debug logging disabled by default
    // Enable by setting MCP_DEBUG=true
    if (process.env.MCP_DEBUG === "true") {
      writeLog(formatMessage("🐛", _msg));
    }
  };

  // Handle cleanup on process exit
  const cleanup = () => {
    if (logStream && !logStream.destroyed) {
      logStream.end();
    }
  };

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  return { info, warn, error, debug };
}

export const logger = createLogger();

/**
 * Get the log file path for external reference
 */
export function getLogFilePath(): string {
  return LOG_FILE_PATH;
}
