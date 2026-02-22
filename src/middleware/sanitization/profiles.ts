/**
 * Security Profiles for Content Sanitization
 * Defines what types of content are blocked for each profile
 */

import { logger } from '../../utils/logger/index.js';
import type { SecurityProfile, SecurityProfileName } from './sanitization.type.js';

const PROFILES: Record<SecurityProfileName, SecurityProfile> = {
  work: {
    name: 'work',
    description:
      'Maximum security - blocks corporate data, user data, credentials, PII, and environment variables',
    detectors: {
      credentials: true,
      pii: true,
      corporate: true,
      envVars: true,
    },
  },
  personal: {
    name: 'personal',
    description: 'Standard security - blocks credentials, tokens, API keys, and critical PII',
    detectors: {
      credentials: true,
      pii: true,
      corporate: false,
      envVars: false,
    },
  },
};

/**
 * Get the active security profile from environment variable
 * Defaults to 'personal' for safety
 */
export function getActiveProfile(): SecurityProfile {
  const profileName = (process.env.SECURITY_PROFILE || 'personal') as SecurityProfileName;

  if (!PROFILES[profileName]) {
    logger.warn(`Invalid SECURITY_PROFILE: ${profileName}, defaulting to 'personal'`);
    return PROFILES.personal;
  }

  logger.info(`Active security profile: ${profileName}`);
  return PROFILES[profileName];
}

/**
 * Get a specific profile by name
 */
export function getProfile(name: SecurityProfileName): SecurityProfile {
  return PROFILES[name];
}

/**
 * Get all available profiles
 */
export function getAllProfiles(): SecurityProfile[] {
  return Object.values(PROFILES);
}
