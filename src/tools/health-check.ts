/**
 * Health Check Tool - Sin auth
 */

import { successResponse } from "../utils/tool-handler.js";
import { checkDatabaseHealth } from "../db/client.js";
import { z } from "zod";
import type { ToolDefinition } from "./index.type.js";

const HealthCheckSchema = z.object({});

type HealthCheckArgs = z.infer<typeof HealthCheckSchema>;

const handler = async () => {
  const dbHealthy = await checkDatabaseHealth();
  return successResponse({
    server: "running",
    database: dbHealthy ? "connected" : "disconnected",
  });
};

export const healthCheckTool: ToolDefinition<HealthCheckArgs> = {
  name: "health_check",
  title: "Health Check",
  description: "Check server status.",
  inputSchema: HealthCheckSchema,
  handler,
};
