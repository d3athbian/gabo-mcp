/**
 * MongoDB Atlas Client
 * Connection and database instance for Personal Knowledge MCP
 * Uses M0 Free Tier with Vector Search
 */

// Suppress dotenv output to prevent breaking MCP protocol on stdout
process.env.DOTENV_CONFIG_QUIET = "true";

import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../.env") }); // Load .env from project root

import { MongoClient, Db } from "mongodb";
import { logger } from "../utils/logger/index.js";

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

    // Setup indexes for optimal performance
    await setupIndexes();

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

export function getApiKeysCollection() {
  return getDatabase().collection("api_keys");
}

/**
 * Setup database indexes
 * Creates necessary indexes for optimal query performance
 * Should be called after connecting to database
 */
export async function setupIndexes(): Promise<void> {
  try {
    const entriesCollection = getKnowledgeEntriesCollection();

    logger.info("🔧 Setting up database indexes...");

    // Index for type queries
    await entriesCollection.createIndex({ type: 1 });
    logger.info("   ✓ Index: type");



    // Index for sorting by creation date
    await entriesCollection.createIndex({ created_at: -1 });
    logger.info("   ✓ Index: created_at");

    // Index for tags (allows efficient tag filtering)
    await entriesCollection.createIndex({ tags: 1 });
    logger.info("   ✓ Index: tags");

    // Text index for full-text search on title and content
    await entriesCollection.createIndex(
      { title: "text", content: "text" },
      {
        weights: {
          title: 10, // Title matches are more important
          content: 1,
        },
        name: "text_search_index",
      },
    );
    logger.info("   ✓ Text index: title + content");

    // API Keys indexes
    const apiKeysCollection = getApiKeysCollection();
    await apiKeysCollection.createIndex({ key: 1 }, { unique: true });
    logger.info("   ✓ Index: api_keys.key (unique)");

    await apiKeysCollection.createIndex({ is_active: 1, created_at: -1 });
    logger.info("   ✓ Index: api_keys.is_active + created_at");

    logger.info("✅ All indexes created successfully");

    // Note about vector search index
    logger.info("");
    logger.info("⚠️  IMPORTANT: Vector Search Index");
    logger.info(
      "   For vector search, you need to create a vector index manually in MongoDB Atlas:",
    );
    logger.info("   1. Go to: https://cloud.mongodb.com");
    logger.info("   2. Select your cluster → Search → Create Index");
    logger.info("   3. Choose: Vector Search");
    logger.info("   4. Collection: knowledge_entries");
    logger.info("   5. Index name: vector_index");
    logger.info("   6. Path: embedding");
    logger.info("   7. Dimensions: 768 (for nomic-embed-text)");
    logger.info("   8. Similarity: cosine");
    logger.info("");
  } catch (error) {
    logger.error("❌ Failed to create indexes", error);
    // Don't throw - indexes might already exist
  }
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
