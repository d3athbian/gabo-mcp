/**
 * MongoDB Atlas Client
 * Connection and database instance for Personal Knowledge MCP
 * Uses M0 Free Tier with Vector Search
 */

// Suppress dotenv output to prevent breaking MCP protocol on stdout
process.env.DOTENV_CONFIG_QUIET = 'true';

import { config } from 'dotenv';
import { APP_PATHS, DATABASE } from '../config/constants.js';

config({ path: APP_PATHS.ENV_FILE, override: true }); // Load .env from project root and force override any existing vars

import { type Db, MongoClient } from 'mongodb';
import { logger } from '../utils/logger/index.js';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGO_WAKE_RETRY = DATABASE.MONGO.WAKE_RETRY;
const MONGO_WAKE_DELAY = DATABASE.MONGO.WAKE_DELAY_MS;

function validateMongoUri(): void {
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is required. ' +
        'Get it from MongoDB Atlas: https://cloud.mongodb.com'
    );
  }
}

/**
 * MongoDB client instance
 * Singleton pattern to reuse connection
 */
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB Atlas with retry logic for serverless instances
 * Serverless instances may need a "wake" ping to start
 */
export async function connectToDatabase(): Promise<Db> {
  validateMongoUri();

  if (db) {
    return db;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MONGO_WAKE_RETRY; attempt++) {
    try {
      logger.info(`Connecting to MongoDB Atlas (attempt ${attempt}/${MONGO_WAKE_RETRY})...`);

      client = new MongoClient(MONGODB_URI!, {
        maxPoolSize: DATABASE.MONGO.POOL_SIZE,
        serverSelectionTimeoutMS: DATABASE.MONGO.SERVER_SELECTION_TIMEOUT_MS,
        socketTimeoutMS: DATABASE.MONGO.SOCKET_TIMEOUT_MS,
        connectTimeoutMS: DATABASE.MONGO.CONNECT_TIMEOUT_MS,
      });

      await client.connect();

      db = client.db();

      await db.command({ ping: 1 });

      logger.info('Connected to MongoDB Atlas successfully');
      logger.info(`   Database: ${db.databaseName}`);
      logger.info('   Ping: OK');

      await setupIndexes();

      return db;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (client) {
        try {
          await client.close();
        } catch {
          // Ignore close errors
        }
        client = null;
        db = null;
      }

      if (attempt < MONGO_WAKE_RETRY) {
        logger.warn(`Connection attempt ${attempt} failed. Retrying in ${MONGO_WAKE_DELAY}ms...`);
        await new Promise((resolve) => setTimeout(resolve, MONGO_WAKE_DELAY));
      }
    }
  }

  logger.error(`Failed to connect to MongoDB after ${MONGO_WAKE_RETRY} attempts`, lastError);
  throw new Error(
    `MongoDB connection failed after ${MONGO_WAKE_RETRY} attempts: ${lastError?.message}`
  );
}

/**
 * Get database instance
 * Must call connectToDatabase() first
 */
export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
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
    logger.info('📴 MongoDB connection closed');
  }
}

/**
 * Collection accessors
 * These ensure we have type-safe access to collections
 */
export function getKnowledgeEntriesCollection() {
  return getDatabase().collection(DATABASE.COLLECTIONS.KNOWLEDGE_ENTRIES);
}

export function getKnowledgeTagsCollection() {
  return getDatabase().collection(DATABASE.COLLECTIONS.KNOWLEDGE_TAGS);
}

export function getKnowledgeAuditLogCollection() {
  return getDatabase().collection(DATABASE.COLLECTIONS.KNOWLEDGE_AUDIT_LOG);
}

export function getApiKeysCollection() {
  return getDatabase().collection(DATABASE.COLLECTIONS.API_KEYS);
}

/**
 * Setup database indexes
 * Creates necessary indexes for optimal query performance
 * Should be called after connecting to database
 */
export async function setupIndexes(): Promise<void> {
  try {
    const entriesCollection = getKnowledgeEntriesCollection();

    logger.info('🔧 Setting up database indexes...');

    // Index for type queries
    await entriesCollection.createIndex({ type: 1 });
    logger.info('   ✓ Index: type');

    // Index for sorting by creation date
    await entriesCollection.createIndex({ created_at: -1 });
    logger.info('   ✓ Index: created_at');

    // Index for tags (allows efficient tag filtering)
    await entriesCollection.createIndex({ tags: 1 });
    logger.info('   ✓ Index: tags');

    // Text index for full-text search on title and content
    await entriesCollection.createIndex(
      { title: 'text', content: 'text' },
      {
        weights: {
          title: 10, // Title matches are more important
          content: 1,
        },
        name: 'text_search_index',
      }
    );
    logger.info('   ✓ Text index: title + content');

    // API Keys indexes
    const apiKeysCollection = getApiKeysCollection();
    await apiKeysCollection.createIndex({ key: 1 }, { unique: true });
    logger.info('   ✓ Index: api_keys.key (unique)');

    await apiKeysCollection.createIndex({ is_active: 1, created_at: -1 });
    logger.info('   ✓ Index: api_keys.is_active + created_at');

    // Audit Log setup
    const { setupAuditLogIndex } = await import('./audit-log.js');
    const retentionDays = parseInt(process.env.MCP_AUDIT_RETENTION_DAYS || '90', 10);
    await setupAuditLogIndex(retentionDays);

    logger.info('✅ All indexes created successfully');

    await setupVectorIndex();
  } catch (error) {
    logger.error('❌ Failed to create indexes', error);
    // Don't throw - indexes might already exist
  }
}

/**
 * Setup vector search index automatically
 * Creates the vector index if it doesn't exist
 */
async function setupVectorIndex(): Promise<void> {
  try {
    const entriesCollection = getKnowledgeEntriesCollection();

    const { config } = await import('../config/config.js');
    const embeddingDimensions = config.embedding.dimensions;

    // Check if vector index already exists
    const existingIndexes = await entriesCollection.indexes();
    const vectorIndexExists = existingIndexes.some(
      (idx: { name?: string }) => idx.name === 'vector_index'
    );

    if (vectorIndexExists) {
      logger.info('   ✓ Vector index already exists');
      return;
    }

    logger.info('   🔬 Creating vector search index...');

    // Create vector search index (MongoDB Atlas Search)
    await entriesCollection.createSearchIndex({
      name: 'vector_index',
      definition: {
        analyzer: 'lucene.standard',
        searchAnalyzer: 'lucene.standard',
        mappings: {
          dynamic: false,
          fields: {
            embedding: {
              type: 'knnVector',
              dimensions: embeddingDimensions,
              similarity: 'cosine',
            },
          },
        },
      },
    });

    logger.info('   ✓ Vector index created successfully');
    logger.info(`     - Dimensions: ${embeddingDimensions}`);
    logger.info('     - Similarity: cosine');
    logger.info('');
  } catch (error) {
    const err = error as any;
    // Ignore error if vector search is not available (e.g., M0 free tier limitations)
    if (err.message?.includes('atlas') || err.codeName === 'AtlasSearchDisabled') {
      logger.warn('   ⚠️  Vector search not available on this tier');
      logger.warn('     Upgrade to M10+ for vector search support');
    } else {
      logger.warn(`   ⚠️  Could not create vector index: ${err.message}`);
    }
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
