import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getActiveProfile } from "../middleware/sanitization/profiles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, "../../docs");

export function registerPrompts(server: McpServer) {
    // START TASK Prompt
    // Injects:
    // 1. Core Rules (docs/RULES.md)
    // 2. Active Security Profile
    // 3. Command to search knowledge base
    server.prompt(
        "start_task",
        {
            task: z.string().describe("The task description"),
        },
        async ({ task }) => {
            const profile = getActiveProfile();
            const rulesPath = path.join(DOCS_DIR, "RULES.md");
            let rulesContent = "";

            try {
                rulesContent = await fs.promises.readFile(rulesPath, "utf-8");
            } catch (e) {
                rulesContent = "WARNING: Could not load rules file.";
            }

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `TASK: ${task}

----
SYSTEM CONTEXT & RULES (MANDATORY):
${rulesContent}

----
SECURITY PROFILE: ${profile.name.toUpperCase()}
- Description: ${profile.description}
- Credentials Blocked: ${profile.detectors.credentials}
- PII Blocked: ${profile.detectors.pii}
- Corporate Data Blocked: ${profile.detectors.corporate}
- Env Vars Blocked: ${profile.detectors.envVars}

INSTRUCTIONS:
1. Search the knowledge base for existing patterns related to this task.
2. Check for known pitfalls.
3. Plan your implementation based on the retrieved knowledge.
4. Execute the task, adhering to the security profile.
`,
                        },
                    },
                ],
            };
        }
    );

    // REVIEW CODE Prompt
    // Injects sanitization rules and asks for review
    server.prompt(
        "review_code",
        {
            code: z.string().describe("The code snippet to review"),
        },
        async ({ code }) => {
            const profile = getActiveProfile();

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `Please review the following code for security issues and pattern adherence.

CODE:
${code}

----
SECURITY CONTEXT:
Profile: ${profile.name.toUpperCase()}
Using 'gabo-mcp-local' knowledge base.

CHECKLIST:
1. Does it contain sensitive data (Passwords, PII, Corporate Names)?
2. Does it follow established patterns in the knowledge base?
3. Are there duplications of existing logic?
`,
                        },
                    },
                ],
            };
        }
    );
}
