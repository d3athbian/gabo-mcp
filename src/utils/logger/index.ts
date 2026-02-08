import * as fs from "fs";
import * as path from "path";
import type { LogFn, LogErrorFn } from "../../base.type.js";
import type { Logger } from "./logger.type.js";

const LOG_DIR = "/tmp";
const MAIN_LOG_FILE = "gabo-mcp.log";
const TRAFFIC_LOG_FILE = "gabo-mcp-traffic.log";
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LOG_AGE_DAYS = 3;

export function createLogger(): Logger {
    const getLogPath = (filename: string) => path.join(LOG_DIR, filename);

    const getTimestamp = (): string => new Date().toISOString();

    const rotateIfNeeded = (filename: string) => {
        const filePath = getLogPath(filename);
        try {
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.size > MAX_LOG_SIZE) {
                    const oldPath = `${filePath}.old`;
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                    fs.renameSync(filePath, oldPath);
                }
            }
        } catch (e) {
            // Background rotation failure should not crash the server
        }
    };

    const writeLog = (filename: string, message: string) => {
        rotateIfNeeded(filename);
        const filePath = getLogPath(filename);
        try {
            fs.appendFileSync(filePath, `${message}\n`);
        } catch (error) {
            // Silent fail to avoid breaking MCP protocol
        }
    };

    const formatMessage = (emoji: string, msg: string): string => {
        const timestamp = getTimestamp();
        return `[${timestamp}] ${emoji} ${msg}`;
    };

    const info: LogFn = (msg: string) => {
        writeLog(MAIN_LOG_FILE, formatMessage("ℹ️", msg));
    };

    const warn: LogFn = (msg: string) => {
        writeLog(MAIN_LOG_FILE, formatMessage("⚠️", msg));
    };

    const error: LogErrorFn = (msg: string, error?: unknown) => {
        const errorMsg = error instanceof Error ? error.message : String(error);
        writeLog(MAIN_LOG_FILE, formatMessage("❌", `${msg} - ${errorMsg}`));
    };

    const debug: LogFn = (_msg: string) => {
        if (process.env.MCP_DEBUG === "true") {
            writeLog(MAIN_LOG_FILE, formatMessage("🐛", _msg));
        }
    };

    const logTraffic = (direction: string, data: string) => {
        const timestamp = getTimestamp();
        const separator = "─".repeat(70);
        const message = `[${timestamp}] ${direction}:\n${data}\n${separator}`;
        writeLog(TRAFFIC_LOG_FILE, message);
    };

    const cleanup = () => {
        try {
            const now = Date.now();
            const msPerDay = 24 * 60 * 60 * 1000;
            const files = fs.readdirSync(LOG_DIR);

            for (const file of files) {
                if (file.startsWith("gabo-mcp")) {
                    const filePath = path.join(LOG_DIR, file);
                    const stats = fs.statSync(filePath);
                    const ageInDays = (now - stats.mtime.getTime()) / msPerDay;

                    if (ageInDays > MAX_LOG_AGE_DAYS) {
                        fs.unlinkSync(filePath);
                    }
                }
            }
        } catch (e) {
            // Cleanup failure should not crash the server
        }
    };

    return { info, warn, error, debug, logTraffic, cleanup };
}

export const logger = createLogger();

export function getLogFilePath(): string {
    return path.join(LOG_DIR, MAIN_LOG_FILE);
}
