/**
 * MongoDB Atlas Client
 * Connection and database instance for Personal Knowledge MCP
 * Uses M0 Free Tier with Vector Search
 */

import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../.env") }); // Load .env from project root

import { MongoClient, Db } from "mongodb";
import { logger } from "../utils/logger.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI environment variable is required. " +
      "Get it from MongoDB Atlas: https://cloud.mongodb.com",
  );
}

/**
 * MongoDB client instance
 * Singleton pattern to reuse connection
 */
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB Atlas
 * Should be called once at server startup
 */
export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    logger.info("🔗 Connecting to MongoDB Atlas...");

    client = new MongoClient(MONGODB_URI!, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();

    // Use default database from connection string
    db = client.db();

    logger.info("✅ Connected to MongoDB Atlas successfully");
    logger.info(`   Database: ${db.databaseName}`);

    // Verify connection with ping
    await db.command({ ping: 1 });
    logger.info("   Ping: OK");

    return db;
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB Atlas", error);
    throw new Error(
      `MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get database instance
 * Must call connectToDatabase() first
 */
export function getDatabase(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectToDatabase() first.");
  }
  return db;
}

/**
 * Close database connection
 * Call this on server shutdown
 */
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info("📴 MongoDB connection closed");
  }
}

/**
 * Collection accessors
 * These ensure we have type-safe access to collections
 */
export function getKnowledgeEntriesCollection() {
  return getDatabase().collection("knowledge_entries");
}

export function getKnowledgeTagsCollection() {
  return getDatabase().collection("knowledge_tags");
}

export function getKnowledgeAuditLogCollection() {
  return getDatabase().collection("knowledge_audit_log");
}

/**
 * Health check
 * Verify database is connected and responsive
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const database = getDatabase();
    await database.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
