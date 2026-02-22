import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { PromptBuilder } from "../utils/prompt-builder.js";
import { logger } from "../utils/logger/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, "../../docs");

export function registerPrompts(server: McpServer) {
  server.prompt(
    "start_task",
    {
      task: z.string().describe("The task description") as any,
    },
    async ({ task }: { task: string }) => {
      const rulesPath = path.join(DOCS_DIR, "RULES.md");
      let rulesContent = "";

      try {
        rulesContent = await fs.promises.readFile(rulesPath, "utf-8");
      } catch (e) {
        logger.error("Could not load RULES.md for prompt injection", e);
        rulesContent =
          "WARNING: Could not load rules file. Please consult the MCP Resources manually.";
      }

      const promptText = await new PromptBuilder("start_task.md")
        .setVariables({
          TASK: task,
          RULES_CONTENT: rulesContent,
          PROFILE_NAME: "STRICT",
          PROFILE_DESC: "All sensitive data is blocked without exception",
          CREDENTIALS_BLOCKED: "YES",
          PII_BLOCKED: "YES",
          CORPORATE_BLOCKED: "NO",
          ENV_VARS_BLOCKED: "NO",
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
    },
  );

  server.prompt(
    "review_code",
    {
      code: z.string().describe("The code snippet to review") as any,
    },
    async ({ code }: { code: string }) => {
      const promptText = await new PromptBuilder("review_code.md")
        .setVariables({
          CODE: code,
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
    },
  );
}
