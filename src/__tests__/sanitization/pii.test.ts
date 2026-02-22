/**
 * PII Detector Tests
 */

import { describe, it, expect } from "vitest";
import { detectPII } from "../../middleware/sanitization/detectors/pii.js";

describe("detectPII", () => {
  describe("should detect email addresses", () => {
    it("detects standard email format", () => {
      const result = detectPII("Contact me at test@example.com", "test");
      expect(result.detected).toBe(true);
      expect(result.category).toBe("pii");
    });

    it("detects multiple emails", () => {
      const result = detectPII(
        " Emails: test@example.com, user@domain.org",
        "test",
      );
      expect(result.detected).toBe(true);
      expect(result.matches.length).toBeGreaterThanOrEqual(1);
    });

    it("detects email with subdomain", () => {
      const result = detectPII("Email: mail.server.co.uk@test.org", "test");
      expect(result.detected).toBe(true);
    });

    it("redacts email for security", () => {
      const result = detectPII("test@example.com", "test");
      expect(result.matches[0]).toContain("@");
      expect(result.matches[0]).not.toBe("test@example.com");
    });
  });

  describe("should detect phone numbers", () => {
    it("detects US format with dashes", () => {
      const result = detectPII("Phone: 555-123-4567", "test");
      expect(result.detected).toBe(true);
    });

    it("detects format with parentheses", () => {
      const result = detectPII("Call me at (555) 123-4567", "test");
      expect(result.detected).toBe(true);
    });

    it("detects international format", () => {
      const result = detectPII("International: +1-555-123-4567", "test");
      expect(result.detected).toBe(true);
    });

    it("detects simple 10-digit format", () => {
      const result = detectPII("Number: 5551234567", "test");
      expect(result.detected).toBe(true);
    });
  });

  describe("should detect credit card numbers", () => {
    it("detects credit card with spaces", () => {
      const result = detectPII("Card: 4532 1234 5678 9012", "test");
      expect(result.detected).toBe(true);
    });

    it("detects credit card with dashes", () => {
      const result = detectPII("Card: 4532-1234-5678-9012", "test");
      expect(result.detected).toBe(true);
    });

    it("detects credit card without separators", () => {
      const result = detectPII("Card: 4532123456789012", "test");
      expect(result.detected).toBe(true);
    });

    it("redacts credit card numbers", () => {
      const result = detectPII("Card: 4532 1234 5678 9012", "test");
      expect(result.matches[0]).not.toBe("4532123456789012");
    });
  });

  describe("should detect SSN", () => {
    it("detects US SSN format", () => {
      const result = detectPII("SSN: 123-45-6789", "test");
      expect(result.detected).toBe(true);
    });

    it("redacts SSN partially", () => {
      const result = detectPII("SSN: 123-45-6789", "test");
      expect(result.matches[0]).toContain("***");
    });
  });

  describe("should detect IP addresses", () => {
    it("detects IPv4 addresses", () => {
      const result = detectPII("Server: 192.168.1.100", "test");
      expect(result.detected).toBe(true);
    });

    it("detects localhost", () => {
      const result = detectPII("Connect to 127.0.0.1", "test");
      expect(result.detected).toBe(true);
    });
  });

  describe("should not detect when no PII present", () => {
    it("returns clean for normal text", () => {
      const result = detectPII(
        "This is a normal code snippet without personal data",
        "test",
      );
      expect(result.detected).toBe(false);
      expect(result.matches).toEqual([]);
      expect(result.message).toBeUndefined();
    });

    it("returns clean for generic programming content", () => {
      const code = `
        function processData(input) {
          return input.map(x => x * 2);
        }
        const result = processData([1, 2, 3]);
      `;
      const result = detectPII(code, "Data processor");
      expect(result.detected).toBe(false);
    });

    it("returns clean for code without emails", () => {
      const code = `
        const API_URL = "https://api.example.com/v1";
        fetch(API_URL).then(response => response.json());
      `;
      const result = detectPII(code, "API client");
      expect(result.detected).toBe(false);
    });
  });

  describe("should search in title as well", () => {
    it("detects PII in title", () => {
      const result = detectPII("Normal content", "Contact: john@email.com");
      expect(result.detected).toBe(true);
    });
  });

  describe("handles edge cases", () => {
    it("handles empty strings", () => {
      const result = detectPII("", "");
      expect(result.detected).toBe(false);
    });

    it("handles only whitespace", () => {
      const result = detectPII("   \n\t   ", "   ");
      expect(result.detected).toBe(false);
    });

    it("removes duplicate matches", () => {
      const content = "email@test.com email@test.com";
      const result = detectPII(content, "test");
      const uniqueMatches = [...new Set(result.matches)];
      expect(result.matches.length).toBe(uniqueMatches.length);
    });

    it("handles various number formats", () => {
      const result = detectPII("Numbers: 123-456-7890", "test");
      expect(result.detected).toBe(true);
    });
  });

  describe("message format", () => {
    it("includes detection count", () => {
      const result = detectPII("test@test.com", "test");
      expect(result.message).toMatch(/\d+/);
    });

    it("has pii category", () => {
      const result = detectPII("test@test.com", "test");
      expect(result.category).toBe("pii");
    });

    it("message describes PII items", () => {
      const result = detectPII("email@test.com", "test");
      expect(result.message).toContain("PII");
    });
  });
});
