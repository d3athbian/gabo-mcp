/**
 * Credentials Detector Tests
 */

import { describe, it, expect } from "vitest";
import { detectCredentials } from "../../middleware/sanitization/detectors/credentials.js";

describe("detectCredentials", () => {
  describe("should detect generic credential patterns", () => {
    it("detects password assignment", () => {
      const result = detectCredentials("password=secret123", "test");
      expect(result.detected).toBe(true);
      expect(result.category).toBe("credentials");
    });

    it("detects api_key assignment", () => {
      const result = detectCredentials("api_key=sk-test123", "test");
      expect(result.detected).toBe(true);
    });

    it("detects secret assignment", () => {
      const result = detectCredentials('secret="my-secret-value"', "test");
      expect(result.detected).toBe(true);
    });

    it("detects token assignment", () => {
      const result = detectCredentials("token=abc123.xyz", "test");
      expect(result.detected).toBe(true);
    });

    it("detects auth assignment", () => {
      const result = detectCredentials("auth=bearer-token", "test");
      expect(result.detected).toBe(true);
    });
  });

  describe("should detect specific service patterns", () => {
    it("detects Bearer token", () => {
      const result = detectCredentials(
        "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        "test",
      );
      expect(result.detected).toBe(true);
    });

    it("detects JWT tokens", () => {
      const result = detectCredentials(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        "test",
      );
      expect(result.detected).toBe(true);
    });

    it("detects MongoDB connection string", () => {
      const result = detectCredentials(
        "mongodb://user:pass@localhost:27017/test",
        "test",
      );
      expect(result.detected).toBe(true);
    });

    it("detects MongoDB+srv connection string", () => {
      const result = detectCredentials(
        "mongodb+srv://user:pass@cluster.mongodb.net/test",
        "test",
      );
      expect(result.detected).toBe(true);
    });

    it("detects PostgreSQL connection string", () => {
      const result = detectCredentials(
        "postgres://user:pass@localhost:5432/testdb",
        "test",
      );
      expect(result.detected).toBe(true);
    });

    it("detects MySQL connection string", () => {
      const result = detectCredentials(
        "mysql://user:pass@localhost:3306/testdb",
        "test",
      );
      expect(result.detected).toBe(true);
    });
  });

  describe("should not detect when no credentials present", () => {
    it("returns clean for normal text", () => {
      const result = detectCredentials(
        "This is a normal code snippet without secrets",
        "test",
      );
      expect(result.detected).toBe(false);
      expect(result.matches).toEqual([]);
      expect(result.message).toBeUndefined();
    });

    it("returns clean for generic programming content", () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
        const result = calculateSum(1, 2);
      `;
      const result = detectCredentials(code, "Math helper");
      expect(result.detected).toBe(false);
    });
  });

  describe("should search in title as well", () => {
    it("detects credential in title", () => {
      const result = detectCredentials(
        "Normal content",
        "API configuration: secret=mykey",
      );
      expect(result.detected).toBe(true);
    });
  });

  describe("handles edge cases", () => {
    it("handles empty strings", () => {
      const result = detectCredentials("", "");
      expect(result.detected).toBe(false);
    });

    it("handles only whitespace", () => {
      const result = detectCredentials("   \n\t   ", "   ");
      expect(result.detected).toBe(false);
    });

    it("truncates long matches for safety", () => {
      const longPassword = "password=" + "a".repeat(100);
      const result = detectCredentials(longPassword, "test");
      expect(result.detected).toBe(true);
      if (result.matches.length > 0) {
        expect(result.matches[0].length).toBeLessThan(60);
      }
    });

    it("removes duplicate matches", () => {
      const content = "token=abc token=abc token=abc";
      const result = detectCredentials(content, "test");
      const uniqueMatches = [...new Set(result.matches)];
      expect(result.matches.length).toBe(uniqueMatches.length);
    });
  });

  describe("message format", () => {
    it("includes credential count", () => {
      const result = detectCredentials("password=123 and token=abc", "test");
      expect(result.message).toContain("2");
    });

    it("has credentials category", () => {
      const result = detectCredentials("password=secret", "test");
      expect(result.category).toBe("credentials");
    });

    it("message describes credentials", () => {
      const result = detectCredentials("password=secret", "test");
      expect(result.message).toContain("credential");
    });
  });
});
