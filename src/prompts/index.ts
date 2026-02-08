import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getActiveProfile } from "../middleware/sanitization/profiles.js";
import { PromptBuilder } from "../utils/prompt-builder.js";
import { logger } from "../utils/logger/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, "../../docs");

export function registerPrompts(server: McpServer) {
    // START TASK Prompt
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
                logger.error("Could not load RULES.md for prompt injection", e);
                rulesContent = "WARNING: Could not load rules file. Please consult the MCP Resources manually.";
            }

            const promptText = await new PromptBuilder("start_task.md")
                .setVariables({
                    TASK: task,
                    RULES_CONTENT: rulesContent,
                    PROFILE_NAME: profile.name.toUpperCase(),
                    PROFILE_DESC: profile.description,
                    CREDENTIALS_BLOCKED: String(profile.detectors.credentials),
                    PII_BLOCKED: String(profile.detectors.pii),
                    CORPORATE_BLOCKED: String(profile.detectors.corporate),
                    ENV_VARS_BLOCKED: String(profile.detectors.envVars)
                })
                .build();

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: promptText,
                        },
                    },
                ],
            };
        }
    );

    // REVIEW CODE Prompt
    server.prompt(
        "review_code",
        {
            code: z.string().describe("The code snippet to review"),
        },
        async ({ code }) => {
            const profile = getActiveProfile();

            const promptText = await new PromptBuilder("review_code.md")
                .setVariables({
                    CODE: code,
                    PROFILE_NAME: profile.name.toUpperCase()
                })
                .build();

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: promptText,
                        },
                    },
                ],
            };
        }
    );
}
