import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import { MongoClient, Db } from "mongodb";
import { connectToDatabase, closeDatabase } from "../db/client.js";

/**
 * Test setup for MongoDB Atlas
 * Uses real MongoDB connection for integration tests
 */

const TEST_USER_ID = "test-user-123";

// Skip tests if no MongoDB URI is available
const hasMongoDB = !!process.env.MONGODB_URI;

describe("Knowledge MCP Server - MongoDB", () => {
  beforeAll(async () => {
    if (hasMongoDB) {
      await connectToDatabase();
    }
  });

  afterAll(async () => {
    if (hasMongoDB) {
      await closeDatabase();
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.skipIf(!hasMongoDB)("should connect to MongoDB", async () => {
    const db = await connectToDatabase();
    expect(db).toBeDefined();
    expect(db.databaseName).toBe("knowledge_mcp");
  });

  it.skipIf(!hasMongoDB)("should ping MongoDB successfully", async () => {
    const db = await connectToDatabase();
    const result = await db.command({ ping: 1 });
    expect(result.ok).toBe(1);
  });
});

export { TEST_USER_ID };
