/**
 * API Key Utilities
 * Key generation, pepper management, and .env file writing
 */

import { randomBytes } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { hash, compare } from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, "../../../.env");

const KEY_PREFIX = "gabo_";
const BCRYPT_ROUNDS = 10;

// ============================================================================
// KEY GENERATION
// ============================================================================

export function generateApiKey(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = randomBytes(8).toString("hex").slice(0, 8);
    return `${KEY_PREFIX}${timestamp}_${randomPart}`;
}

export function isValidApiKeyFormat(key: string): boolean {
    if (!key || typeof key !== "string") return false;
    return key.startsWith(KEY_PREFIX) && key.includes("_");
}

// ============================================================================
// PEPPER MANAGEMENT
// ============================================================================

/**
 * Generates a cryptographically secure pepper.
 * Should only be called once per installation.
 */
export function generatePepper(): string {
    return randomBytes(32).toString("hex");
}

/**
 * Gets the current pepper from env.
 * Throws explicitly if not set — the MCP should not run without it.
 */
export function getPepper(): string {
    const pepper = process.env.MCP_KEY_PEPPER;
    if (!pepper) {
        throw new Error(
            "MCP_KEY_PEPPER is not set. The server cannot validate API keys without a pepper. " +
            "Delete your api_keys collection and MCP_API_KEY from .env to trigger a full bootstrap."
        );
    }
    return pepper;
}

// ============================================================================
// BCRYPT HASHING
// ============================================================================

/**
 * Hashes an API key using bcrypt + pepper.
 * The pepper is appended to the key before hashing.
 */
export async function hashApiKey(key: string): Promise<string> {
    const pepper = getPepper();
    return hash(key + pepper, BCRYPT_ROUNDS);
}

/**
 * Verifies an API key against a stored bcrypt hash.
 * Uses pepper from environment.
 */
export async function verifyApiKey(
    key: string,
    storedHash: string
): Promise<boolean> {
    const pepper = getPepper();
    return compare(key + pepper, storedHash);
}

// ============================================================================
// .ENV FILE MANAGEMENT
// ============================================================================

/**
 * Reads the current .env file content.
 * Returns empty string if file does not exist.
 */
function readEnvFile(): string {
    if (!existsSync(ENV_PATH)) return "";
    return readFileSync(ENV_PATH, "utf-8");
}

/**
 * Writes or replaces a single key=value pair in the .env file.
 * If the key already exists, its value is replaced in-place.
 * If it does not exist, it is appended at the end.
 */
export function writeEnvVariable(key: string, value: string): void {
    let content = readEnvFile();
    const lineRegex = new RegExp(`^${key}=.*$`, "m");

    if (lineRegex.test(content)) {
        // Replace existing value
        content = content.replace(lineRegex, `${key}=${value}`);
    } else {
        // Append new variable (ensure there's a newline before it)
        if (content.length > 0 && !content.endsWith("\n")) {
            content += "\n";
        }
        content += `${key}=${value}\n`;
    }

    writeFileSync(ENV_PATH, content, "utf-8");
}

/**
 * Removes a key=value line from the .env file entirely.
 * If the key is not present, this is a no-op.
 */
export function removeEnvVariable(key: string): void {
    let content = readEnvFile();
    const lineRegex = new RegExp(`^${key}=.*$\\n?`, "m");
    content = content.replace(lineRegex, "");
    writeFileSync(ENV_PATH, content, "utf-8");
}

/**
 * Ensures MCP_KEY_PEPPER exists in .env.
 * If it does not exist, generates one and writes it.
 * Returns the pepper value (whether new or existing).
 */
export function ensurePepperExists(): string {
    const existing = process.env.MCP_KEY_PEPPER;
    if (existing) {
        return existing;
    }

    const newPepper = generatePepper();
    writeEnvVariable("MCP_KEY_PEPPER", newPepper);

    // Make it available immediately in the current process
    process.env.MCP_KEY_PEPPER = newPepper;

    return newPepper;
}
