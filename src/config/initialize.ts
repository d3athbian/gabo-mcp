/**
 * Configuration Initialization
 * This file MUST be imported first to ensure config is loaded before any other module
 *
 * Import this at the very top of your entry point, before any other imports
 */

import { config } from './config.js';

// Force config to be loaded synchronously
// This ensures all environment variables are read at startup
void config;

export { config };
