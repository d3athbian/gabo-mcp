/**
 * Health Check Tool
 * Server status without authentication - useful for debugging
 */

import { logger } from "../utils/logger.js";
import { successResponse } from "../utils/tool-handler.js";
import { isBootstrapAvailable } from "../middleware/auth.js";
import { checkDatabaseHealth } from "../db/client.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const HealthCheckSchema = z.object({});

type HealthCheckArgs = z.infer<typeof HealthCheckSchema>;

const handler = async (
  _args: HealthCheckArgs,
): Promise<ReturnType<typeof successResponse>> => {
  const dbHealthy = await checkDatabaseHealth();
  const bootstrapAvailable = await isBootstrapAvailable();

  const status = {
    server: "running",
    database: dbHealthy ? "connected" : "disconnected",
    api_keys_configured: !bootstrapAvailable,
    bootstrap_mode: bootstrapAvailable,
    timestamp: new Date().toISOString(),
  };

  if (!dbHealthy) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: "Database not connected",
              status,
              help: "Check MongoDB connection in .env file",
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }

  if (bootstrapAvailable) {
    logger.warn("No API keys configured - bootstrap mode active");
  }

  return successResponse({
    status,
    message: bootstrapAvailable
      ? "Server running. No API keys found. Run 'create_first_api_key' to get started."
      : "Server running. API keys are configured.",
  });
};

export const healthCheckTool: ToolDefinition<HealthCheckArgs> = {
  name: "health_check",
  title: "Health Check",
  description:
    "Check server status and database connectivity. No authentication required.",
  inputSchema: HealthCheckSchema,
  handler,
};
