/**
 * Authentication Middleware
 * Validates API key against MongoDB record
 */

import {
    findApiKeyByKey,
    hasAnyApiKeys,
    createApiKey,
} from "../../db/api-keys.js";
import { generateApiKey, isValidApiKeyFormat } from "../../utils/api-key/index.js";
import { logger } from "../../utils/logger/index.js";
import { type ToolResponse } from "../../utils/tool-handler/tool-handler.type.js";
import type { AuthResult } from "./auth.type.js";

export async function isBootstrapAvailable(): Promise<boolean> {
    return !(await hasAnyApiKeys());
}

export async function validateApiKey(apiKey: string): Promise<AuthResult> {
    if (!apiKey || typeof apiKey !== "string") {
        return { success: false, error: "API key is required" };
    }

    if (!isValidApiKeyFormat(apiKey)) {
        logger.warn(`Invalid API key format`);
        return { success: false, error: "Invalid API key format" };
    }

    const keyDoc = await findApiKeyByKey(apiKey);

    if (!keyDoc) {
        logger.warn(`API key not found in MongoDB`);
        return { success: false, error: "Invalid API key" };
    }

    if (!keyDoc.is_active) {
        logger.warn(`Revoked API key attempted`);
        return { success: false, error: "API key has been revoked" };
    }

    logger.info(`API key validated: ${keyDoc.id}`);

    return {
        success: true,
        keyId: keyDoc.id,
    };
}

export async function ensureApiKeyExists(): Promise<string> {
    const hasExistingKey = await hasAnyApiKeys();

    if (hasExistingKey) {
        return "";
    }

    const key = generateApiKey();
    await createApiKey(key);

    const preview = `...${key.slice(-8)}`;
    logger.info(`🔑 First-time API key generated: ${preview}`);
    logger.warn("⚠️  SAVE THIS KEY - Add to your MCP config!");

    return key;
}

export function createAuthErrorResponse(error: string): ToolResponse {
    let help = "";

    if (error === "API key is required") {
        help =
            "API key is required. Check MongoDB for the generated key or add it to your Continue.dev config.";
    } else if (error === "Invalid API key format") {
        help = "Invalid key format. Keys should start with 'gabo_'.";
    } else if (error === "Invalid API key") {
        help =
            "Key not found in MongoDB. Check your MongoDB collection for the key.";
    } else if (error === "API key has been revoked") {
        help =
            "This key was revoked. Delete the record from MongoDB and restart to generate a new one.";
    }

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(
                    { success: false, error, code: "AUTH_ERROR", help },
                    null,
                    2,
                ),
            },
        ],
        isError: true,
    };
}

export function withAuth<T extends { api_key: string }>(
    handler: (
        args: Omit<T, "api_key">,
        auth: { keyId: string },
    ) => Promise<ToolResponse>,
) {
    return async (args: T): Promise<ToolResponse> => {
        const { api_key, ...restArgs } = args;
        const authResult = await validateApiKey(api_key);

        if (!authResult.success) {
            return createAuthErrorResponse(authResult.error);
        }

        return await handler(restArgs as Omit<T, "api_key">, {
            keyId: authResult.keyId,
        });
    };
}
