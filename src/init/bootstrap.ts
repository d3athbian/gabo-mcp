import { config } from '../config/config.js';
import { closeDatabase, connectToDatabase } from '../db/client.js';
import { AppError } from '../utils/errors/Error.js';

const apiKey = config.mcp.apiKey;

export async function bootstrapAPIKey(): Promise<string> {
  if (apiKey?.trim()) {
    return apiKey;
  }
  throw new AppError(
    'API key not configured. Set MCP_API_KEY or API_KEY in environment.',
    'API_KEY_NOT_CONFIGURED',
    500
  );
}

export async function bootstrap(): Promise<void> {
  await bootstrapAPIKey();
  await connectToDatabase();
}

export async function shutdown(): Promise<void> {
  await closeDatabase();
}
