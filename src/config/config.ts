// Environment variables are loaded natively by Node 24 via --env-file flag
// No dotenv dependency needed!

import type { Config } from "./config.type";

const requiredVars = ["NODE_ENV", "MONGODB_URI"];

const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`,
  );
}

export const config: Config = {
  nodeEnv: (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test",
  logLevel: (process.env.LOG_LEVEL || "info") as
    | "debug"
    | "info"
    | "warn"
    | "error",

  database: {
    url: process.env.MONGODB_URI!,
  },

  mcp: {
    port: parseInt(process.env.MCP_SERVER_PORT || "3000", 10),
    timeout: parseInt(process.env.MCP_REQUEST_TIMEOUT || "30000", 10),
    maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH || "2048", 10),
    apiKey: process.env.MCP_API_KEY,
  },

  features: {
    enableCache: process.env.ENABLE_CACHE === "true",
    enableAuditLog: process.env.ENABLE_AUDIT_LOG === "true",
  },

  debug: process.env.DEBUG === "true",
  prettyLogs: process.env.PRETTY_LOGS === "true",
};

// Validate critical config
if (config.nodeEnv === "production" && !process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required in production");
}
