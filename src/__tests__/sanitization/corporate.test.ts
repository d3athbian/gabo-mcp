/**
 * Corporate Detector Tests
 * Tests for corporate data detection based on config and indicators
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reloadConfig } from '../../middleware/sanitization/config.js';
import { detectCorporate } from '../../middleware/sanitization/detectors/corporate.js';

describe('detectCorporate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    reloadConfig();
  });

  describe('should detect corporate indicators', () => {
    it('detects internal keyword', () => {
      const result = detectCorporate('This is internal documentation', 'test');
      expect(result.detected).toBe(true);
      expect(result.category).toBe('corporate');
    });

    it('detects confidential keyword', () => {
      const result = detectCorporate('Confidential project details', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects proprietary keyword', () => {
      const result = detectCorporate('Proprietary algorithm', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects trade secret', () => {
      const result = detectCorporate('Trade secret information', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects customer data', () => {
      const result = detectCorporate('Customer data must be protected', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects customer information', () => {
      const result = detectCorporate('Customer information is sensitive', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects customer records', () => {
      const result = detectCorporate('Customer records are private', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects user data', () => {
      const result = detectCorporate('User data protection', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects user information', () => {
      const result = detectCorporate('User information policy', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects user records', () => {
      const result = detectCorporate('User records management', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects case insensitive', () => {
      const result = detectCorporate('INTERNAL notes', 'test');
      expect(result.detected).toBe(true);
    });
  });

  describe('should detect based on config', () => {
    beforeEach(() => {
      vi.stubEnv('SECURITY_PROFILE', 'work');
      reloadConfig();
    });

    it('returns clean for normal text without indicators', () => {
      const result = detectCorporate('This is a normal open source project', 'test');
      expect(result.detected).toBe(false);
      expect(result.matches).toEqual([]);
      expect(result.message).toBeUndefined();
    });

    it('returns clean for generic programming content', () => {
      const code = `
        function helloWorld() {
          console.log("Hello, World!");
        }
      `;
      const result = detectCorporate(code, 'Hello World');
      expect(result.detected).toBe(false);
    });
  });

  describe('should search in title as well', () => {
    it('detects indicator in title', () => {
      const result = detectCorporate('Open source project', 'INTERNAL Project');
      expect(result.detected).toBe(true);
    });
  });

  describe('handles edge cases', () => {
    it('handles empty strings', () => {
      const result = detectCorporate('', '');
      expect(result.detected).toBe(false);
    });

    it('handles only whitespace', () => {
      const result = detectCorporate('   \n\t   ', '   ');
      expect(result.detected).toBe(false);
    });

    it('removes duplicate matches', () => {
      const content = 'internal confidential internal';
      const result = detectCorporate(content, 'test');
      const uniqueMatches = [...new Set(result.matches)];
      expect(result.matches.length).toBe(uniqueMatches.length);
    });

    it('combines title and content for detection', () => {
      const result = detectCorporate('normal text', 'CONFIDENTIAL');
      expect(result.detected).toBe(true);
    });
  });

  describe('message format', () => {
    it('includes detection count when found', () => {
      const result = detectCorporate('internal', 'test');
      expect(result.message).toMatch(/\d+/);
    });

    it('has corporate category', () => {
      const result = detectCorporate('internal data', 'test');
      expect(result.category).toBe('corporate');
    });

    it('message includes corporate data', () => {
      const result = detectCorporate('internal', 'test');
      expect(result.message).toContain('corporate');
    });
  });
});
