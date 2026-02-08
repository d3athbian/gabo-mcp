/**
 * PII (Personally Identifiable Information) Detector
 * Detects emails, phone numbers, credit cards, SSN, and other personal data
 */

import type { DetectionResult } from "../sanitization.type.js";

const PII_PATTERNS = [
    // Email addresses
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

    // Phone numbers (various formats)
    /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,

    // Credit card numbers (basic pattern)
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,

    // SSN (US Social Security Number)
    /\b\d{3}-\d{2}-\d{4}\b/g,

    // IP addresses (can be considered PII in some contexts)
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
];

export function detectPII(
    content: string,
    title: string,
): DetectionResult {
    const matches: string[] = [];
    const combinedText = `${title} ${content}`;

    for (const pattern of PII_PATTERNS) {
        const found = combinedText.match(pattern);
        if (found) {
            // Redact partially for security
            matches.push(...found.map(m => {
                if (m.includes('@')) return `***@${m.split('@')[1]}`; // Email
                if (m.length > 10) return `${m.substring(0, 4)}***`; // Long numbers
                return '***';
            }));
        }
    }

    return {
        detected: matches.length > 0,
        category: "pii",
        matches: [...new Set(matches)],
        message: matches.length > 0
            ? `Detected ${matches.length} PII item(s): emails, phone numbers, or sensitive identifiers`
            : undefined,
    };
}
