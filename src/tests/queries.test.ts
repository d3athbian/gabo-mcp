import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  storeKnowledge,
  searchKnowledge,
  getKnowledge,
  listKnowledge,
  updateKnowledge,
  deleteKnowledge,
} from "../db/queries.js";
import { connectToDatabase, closeDatabase } from "../db/client.js";
import { TEST_USER_ID } from "./setup.js";

const hasMongoDB = !!process.env.MONGODB_URI;

describe.skipIf(!hasMongoDB)("Knowledge Queries", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("storeKnowledge", () => {
    it("should store a knowledge entry", async () => {
      const entry = await storeKnowledge(TEST_USER_ID, {
        type: "REACT_PATTERN",
        title: "Test Entry",
        content: "Test content",
        tags: ["test", "react"],
      });

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.user_id).toBe(TEST_USER_ID);
      expect(entry.title).toBe("Test Entry");
      expect(entry.content).toBe("Test content");
      expect(entry.tags).toEqual(["test", "react"]);
    });

    it("should throw error if title is empty", async () => {
      await expect(
        storeKnowledge(TEST_USER_ID, {
          type: "REACT_PATTERN",
          title: "",
          content: "Test content",
        }),
      ).rejects.toThrow("Title is required");
    });

    it("should throw error if content is empty", async () => {
      await expect(
        storeKnowledge(TEST_USER_ID, {
          type: "REACT_PATTERN",
          title: "Test Entry",
          content: "",
        }),
      ).rejects.toThrow("Content is required");
    });
  });

  describe("searchKnowledge", () => {
    it("should search entries by keyword", async () => {
      // First store an entry
      await storeKnowledge(TEST_USER_ID, {
        type: "REACT_PATTERN",
        title: "React Hooks Pattern",
        content: "Using useEffect properly",
        tags: ["react", "hooks"],
      });

      const results = await searchKnowledge(TEST_USER_ID, {
        query: "React",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain("React");
    });

    it("should throw error if query is empty", async () => {
      await expect(
        searchKnowledge(TEST_USER_ID, { query: "" }),
      ).rejects.toThrow("Search query is required");
    });
  });

  describe("getKnowledge", () => {
    it("should retrieve an entry by ID", async () => {
      const stored = await storeKnowledge(TEST_USER_ID, {
        type: "REACT_PATTERN",
        title: "Get Test",
        content: "Content for get test",
      });

      const retrieved = await getKnowledge(TEST_USER_ID, stored.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(stored.id);
      expect(retrieved.title).toBe("Get Test");
    });

    it("should throw error for non-existent ID", async () => {
      await expect(
        getKnowledge(TEST_USER_ID, "507f1f77bcf86cd799439011"),
      ).rejects.toThrow("Knowledge entry not found");
    });
  });

  describe("listKnowledge", () => {
    it("should list entries with pagination", async () => {
      // Store a few entries
      await storeKnowledge(TEST_USER_ID, {
        type: "REACT_PATTERN",
        title: "List Test 1",
        content: "Content 1",
      });
      await storeKnowledge(TEST_USER_ID, {
        type: "REACT_PATTERN",
        title: "List Test 2",
        content: "Content 2",
      });

      const { data, count } = await listKnowledge(TEST_USER_ID, undefined, 10);

      expect(Array.isArray(data)).toBe(true);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe("updateKnowledge", () => {
    it("should update an existing entry", async () => {
      const stored = await storeKnowledge(TEST_USER_ID, {
        type: "REACT_PATTERN",
        title: "Update Test",
        content: "Original content",
      });

      const updated = await updateKnowledge(TEST_USER_ID, stored.id, {
        title: "Updated Title",
        content: "Updated content",
      });

      expect(updated.title).toBe("Updated Title");
      expect(updated.content).toBe("Updated content");
      expect(updated.updated_at).not.toBe(stored.updated_at);
    });
  });

  describe("deleteKnowledge", () => {
    it("should delete an entry", async () => {
      const stored = await storeKnowledge(TEST_USER_ID, {
        type: "REACT_PATTERN",
        title: "Delete Test",
        content: "Content to delete",
      });

      await deleteKnowledge(TEST_USER_ID, stored.id);

      // Verify it's gone
      await expect(getKnowledge(TEST_USER_ID, stored.id)).rejects.toThrow(
        "Knowledge entry not found",
      );
    });
  });
});
