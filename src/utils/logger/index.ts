/**
 * Logger utility for MCP Server
 * Writes logs to file ONLY - stdout/stderr reserved for MCP protocol
 */

import * as fs from "fs";
import type { LogFn, LogErrorFn } from "../../base.type.js";
import type { Logger } from "./logger.type.js";

const LOG_FILE_PATH = "/tmp/gabo-mcp.log";

export function createLogger(): Logger {
    // Ensure log file exists and is writable
    let logStream: fs.WriteStream | null = null;

    try {
        logStream = fs.createWriteStream(LOG_FILE_PATH, { flags: "a" });
    } catch (error) {
        // Silent fail - we cannot write to stderr as it breaks MCP protocol
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
