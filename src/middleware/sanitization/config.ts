/**
 * Sanitization Configuration
 * Loads blacklists from config file or environment
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { SanitizationConfig } from "./sanitization.type.js";
import { logger } from "../../utils/logger/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "../../../sanitization.config.json");

let cachedConfig: SanitizationConfig | null = null;

/**
 * Load sanitization configuration from file
 */
export function loadConfig(): SanitizationConfig {
    if (cachedConfig) {
        return cachedConfig;
    }

    const defaultConfig: SanitizationConfig = {
        blacklistedCompanies: [],
        blacklistedDomains: [],
        blacklistedKeywords: [],
    };

    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const fileContent = fs.readFileSync(CONFIG_PATH, "utf-8");
            const config = JSON.parse(fileContent) as SanitizationConfig;
            cachedConfig = { ...defaultConfig, ...config };
            logger.info(`Loaded sanitization config from ${CONFIG_PATH}`);
        } else {
            cachedConfig = defaultConfig;
            logger.info("No sanitization.config.json found, using defaults");
        }
    } catch (error) {
        logger.error("Failed to load sanitization config", error);
        cachedConfig = defaultConfig;
    }

    return cachedConfig;
}

/**
 * Reload configuration (useful for testing or runtime updates)
 */
export function reloadConfig(): SanitizationConfig {
    cachedConfig = null;
    return loadConfig();
}
