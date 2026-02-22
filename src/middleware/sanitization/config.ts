/**
 * Sanitization Configuration
 * Loads blacklists from config file or environment
 */

import * as fs from 'node:fs';
import { logger } from '../../utils/logger/index.js';
import { APP_PATHS } from '../../config/constants.js';
import type { SanitizationConfig } from './sanitization.type.js';

const CONFIG_PATH = APP_PATHS.SANITIZATION_CONFIG;

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
      const fileContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const config = JSON.parse(fileContent) as SanitizationConfig;
      cachedConfig = { ...defaultConfig, ...config };
      logger.info(`Loaded sanitization config from ${CONFIG_PATH}`);
    } else {
      cachedConfig = defaultConfig;
      logger.info('No sanitization.config.json found, using defaults');
    }
  } catch (error) {
    logger.error('Failed to load sanitization config', error);
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
