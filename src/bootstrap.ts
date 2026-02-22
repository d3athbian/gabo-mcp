import { closeDatabase, connectToDatabase } from './db/client.js';

const apiKey = process.env.MCP_API_KEY || process.env.API_KEY;

export async function bootstrapAPIKey(): Promise<string> {
  if (apiKey?.trim()) {
    return apiKey;
  }
  throw new Error('API key not configured. Set MCP_API_KEY or API_KEY in environment.');
}

export async function bootstrap(): Promise<void> {
  await bootstrapAPIKey();
  await connectToDatabase();
}

export async function shutdown(): Promise<void> {
  await closeDatabase();
}
