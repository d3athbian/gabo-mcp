/**
 * generate-key.ts
 *
 * Standalone script to rotate the MCP API key.
 * Run with: npm run generate:key
 *
 * What it does:
 *  1. Loads .env (MONGODB_URI, MCP_KEY_PEPPER required)
 *  2. Connects to MongoDB
 *  3. Revokes / deletes ALL existing api_keys documents
 *  4. Removes MCP_API_KEY from .env
 *  5. Runs the standard ensureApiKeyExists() bootstrap
 *     → generates a new key, hashes it (with existing pepper), saves:
 *        - hash  → MongoDB api_keys collection
 *        - plain → .env  MCP_API_KEY=<new-key>
 *  6. Prints the new key so you can copy it to your MCP client config
 *
 * The pepper (MCP_KEY_PEPPER) is PRESERVED — no need to re-hash old data.
 * If you also want a new pepper, delete MCP_KEY_PEPPER from .env first.
 */

// ── Load .env before anything else ───────────────────────────────────────────
import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

// ── Imports ───────────────────────────────────────────────────────────────────
import { connectToDatabase, closeDatabase } from "../src/db/client.js";
import { revokeAllApiKeys } from "../src/db/api-keys.js";
import {
    removeEnvVariable,
    ensurePepperExists,
    generateApiKey,
    hashApiKey,
    writeEnvVariable,
} from "../src/utils/api-key/index.js";
import { createApiKey } from "../src/db/api-keys.js";

// ── Colour helpers (no external deps) ────────────────────────────────────────
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const log = {
    info: (msg: string) => console.error(`${CYAN}ℹ${RESET}  ${msg}`),
    ok: (msg: string) => console.error(`${GREEN}✔${RESET}  ${msg}`),
    warn: (msg: string) => console.error(`${YELLOW}⚠${RESET}  ${msg}`),
    error: (msg: string) => console.error(`${RED}✖${RESET}  ${msg}`),
    box: (msg: string) => console.error(`\n${BOLD}${GREEN}${msg}${RESET}\n`),
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function rotateKey(): Promise<void> {
    console.error(`\n${BOLD}╔══════════════════════════════════════╗`);
    console.error(`║     gabo-mcp · API Key Rotation      ║`);
    console.error(`╚══════════════════════════════════════╝${RESET}\n`);

    // 1. Validate env prerequisites
    if (!process.env.MONGODB_URI) {
        log.error("MONGODB_URI is not set. Add it to your .env file.");
        process.exit(1);
    }

    // 2. Connect to MongoDB
    log.info("Connecting to MongoDB...");
    await connectToDatabase();
    log.ok("Connected.");

    // 3. Revoke all existing keys in MongoDB
    log.info("Revoking existing API keys from MongoDB...");
    const deleted = await revokeAllApiKeys();
    log.ok(`Revoked ${deleted} key(s) from the database.`);

    // 4. Clear MCP_API_KEY from .env
    log.info("Removing MCP_API_KEY from .env...");
    removeEnvVariable("MCP_API_KEY");
    delete process.env.MCP_API_KEY;   // also clear from current process
    log.ok("MCP_API_KEY removed from .env.");

    // 5. Ensure pepper exists (keep the existing one)
    log.info("Ensuring pepper (MCP_KEY_PEPPER) is present...");
    const isNewPepper = !process.env.MCP_KEY_PEPPER;
    ensurePepperExists();
    if (isNewPepper) {
        log.warn("No existing pepper found — a NEW pepper was generated.");
        log.warn("This is normal on a clean install.");
    } else {
        log.ok("Existing pepper retained — no re-hashing needed.");
    }

    // 6. Generate new key → hash → save to DB and .env
    log.info("Generating new API key...");
    const newKey = generateApiKey();
    const keyHash = await hashApiKey(newKey);

    await createApiKey(keyHash);
    writeEnvVariable("MCP_API_KEY", newKey);
    process.env.MCP_API_KEY = newKey;

    log.ok("New key created and saved to .env.");

    // 7. Print results
    log.box("╔══════════════════════════════════════════════╗\n" +
        "║          New API Key Generated ✔             ║\n" +
        "╚══════════════════════════════════════════════╝");

    // Print the key to STDOUT so it can be captured cleanly
    console.log(newKey);

    console.error(`
${BOLD}Next steps:${RESET}
  1. Copy the key above.
  2. Update your MCP client config (e.g. Claude Desktop / Cline):
       "env": { "MCP_API_KEY": "${newKey}" }
  3. Restart your MCP client so the new key takes effect.

${YELLOW}⚠  The key is already saved in .env — do NOT commit .env to git.${RESET}
`);

    await closeDatabase();
}

rotateKey().catch(async (err) => {
    console.error(`\n${RED}${BOLD}Fatal error:${RESET} ${err?.message ?? err}`);
    await closeDatabase().catch(() => { });
    process.exit(1);
});
