/**
 * Content Sanitization Middleware
 * Prevents sensitive data from being stored in the knowledge base
 */

import type { SanitizationResult } from "./sanitization.type.js";
import { getActiveProfile } from "./profiles.js";
import { detectCredentials } from "./detectors/credentials.js";
import { detectPII } from "./detectors/pii.js";
import { detectCorporate } from "./detectors/corporate.js";
import { detectEnvVars } from "./detectors/env-vars.js";
import { logger } from "../../utils/logger/index.js";

/**
 * Main sanitization function
 * Checks content against active security profile
 */
export function sanitizeContent(
    title: string,
    content: string,
): SanitizationResult {
    const profile = getActiveProfile();

    logger.debug(`Sanitizing content with profile: ${profile.name}`);

    // Define detector registry with their enable flags
    const detectorRegistry = [
        { name: "credentials", enabled: profile.detectors.credentials, fn: detectCredentials },
        { name: "pii", enabled: profile.detectors.pii, fn: detectPII },
        { name: "corporate", enabled: profile.detectors.corporate, fn: detectCorporate },
        { name: "envVars", enabled: profile.detectors.envVars, fn: detectEnvVars },
    ] as const;

    // Functional approach: filter enabled detectors, run them, filter violations
    const violations = detectorRegistry
        .filter(detector => detector.enabled)
        .map(detector => detector.fn(content, title))
        .filter(result => result.detected);

    // Build error message if violations found
    if (violations.length > 0) {
        const errorMessage = buildErrorMessage(profile.name, violations);
        logger.warn(`Content rejected by sanitization: ${violations.length} violation(s)`);

        return {
            allowed: false,
            violations,
            errorMessage,
        };
    }

    return {
        allowed: true,
        violations: [],
    };
}

/**
 * Build a detailed error message for violations
 */
function buildErrorMessage(
    profileName: string,
    violations: any[],
): string {
    const lines = [
        `🔒 CONTENT REJECTED - Security Profile: ${profileName.toUpperCase()}`,
        "",
        `Your content contains ${violations.length} type(s) of sensitive information that cannot be stored:`,
        "",
    ];

    for (const violation of violations) {
        lines.push(`❌ ${violation.category.toUpperCase()}: ${violation.message}`);
        if (violation.matches.length > 0) {
            const preview = violation.matches.slice(0, 3).join(", ");
            lines.push(`   Examples: ${preview}${violation.matches.length > 3 ? "..." : ""}`);
        }
        lines.push("");
    }

    lines.push("💡 TIP: Remove or redact the sensitive information before saving.");
    lines.push(`   Current profile: ${profileName} - Change via SECURITY_PROFILE env var`);

    return lines.join("\n");
}
