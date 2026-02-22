/**
 * Environment Variables Detector Tests
 */

import { describe, expect, it } from 'vitest';
import { detectEnvVars } from '../../middleware/sanitization/detectors/env-vars.js';

describe('detectEnvVars', () => {
  describe('should detect environment variable references', () => {
    it('detects process.env usage', () => {
      const result = detectEnvVars('const apiKey = process.env.API_KEY', 'test');
      expect(result.detected).toBe(true);
      expect(result.category).toBe('env_vars');
    });

    it('detects process.env array access', () => {
      const result = detectEnvVars("const key = process.env['API_KEY']", 'test');
      expect(result.detected).toBe(true);
    });

    it('detects Python os.environ', () => {
      const result = detectEnvVars("import os; key = os.environ['API_KEY']", 'test');
      expect(result.detected).toBe(true);
    });

    it('detects Python os.getenv', () => {
      const result = detectEnvVars("key = os.getenv('API_KEY')", 'test');
      expect(result.detected).toBe(true);
    });

    it('detects shell export', () => {
      const result = detectEnvVars('export API_KEY=value', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects Docker ENV', () => {
      const result = detectEnvVars('ENV API_KEY=value', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects .env file references', () => {
      const result = detectEnvVars('Loaded from .env.local file', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects process.env in title', () => {
      const result = detectEnvVars('Code snippet', 'process.env.API_KEY usage');
      expect(result.detected).toBe(true);
    });

    it('detects variable interpolation ${VAR}', () => {
      const result = detectEnvVars('${CUSTOM_VAR}:/usr/bin', 'test');
      expect(result.detected).toBe(true);
    });

    it('detects os.environ in content', () => {
      const result = detectEnvVars("os.environ['API_KEY'] is used", 'test');
      expect(result.detected).toBe(true);
    });

    it('detects export in content', () => {
      const result = detectEnvVars('Run: export SECRET=value', 'test');
      expect(result.detected).toBe(true);
    });
  });

  describe('should filter common false positives', () => {
    it('filters node_env', () => {
      const result = detectEnvVars('process.env.NODE_ENV', 'test');
      expect(result.detected).toBe(false);
    });

    it('filters PATH', () => {
      const result = detectEnvVars('$PATH variable', 'test');
      expect(result.detected).toBe(false);
    });

    it('filters HOME', () => {
      const result = detectEnvVars('$HOME directory', 'test');
      expect(result.detected).toBe(false);
    });

    it('filters case insensitive', () => {
      const result = detectEnvVars('${HOME}', 'test');
      expect(result.detected).toBe(false);
    });
  });

  describe('should not detect when no env vars present', () => {
    it('returns clean for normal text', () => {
      const result = detectEnvVars('This is a normal text without environment variables', 'test');
      expect(result.detected).toBe(false);
      expect(result.matches).toEqual([]);
      expect(result.message).toBeUndefined();
    });

    it('returns clean for code without env vars', () => {
      const code = `
        const apiUrl = "https://api.example.com";
        const timeout = 5000;
        fetch(apiUrl, { timeout });
      `;
      const result = detectEnvVars(code, 'API client');
      expect(result.detected).toBe(false);
    });

    it('returns clean for variable declarations not related to env', () => {
      const result = detectEnvVars("const myVariable = 'hello'", 'test');
      expect(result.detected).toBe(false);
    });
  });

  describe('handles edge cases', () => {
    it('handles empty strings', () => {
      const result = detectEnvVars('', '');
      expect(result.detected).toBe(false);
    });

    it('handles only whitespace', () => {
      const result = detectEnvVars('   \n\t   ', '   ');
      expect(result.detected).toBe(false);
    });

    it('removes duplicate matches', () => {
      const content = 'process.env.API_KEY process.env.API_KEY';
      const result = detectEnvVars(content, 'test');
      const uniqueMatches = [...new Set(result.matches)];
      expect(result.matches.length).toBe(uniqueMatches.length);
    });

    it('handles mixed case env vars', () => {
      const result = detectEnvVars('process.env.ApiKeY123', 'test');
      expect(result.detected).toBe(true);
    });
  });

  describe('message format', () => {
    it('includes detection count when found', () => {
      const result = detectEnvVars('process.env.API_KEY and process.env.SECRET', 'test');
      expect(result.message).toMatch(/\d+/);
    });

    it('has env_vars category', () => {
      const result = detectEnvVars('process.env.KEY', 'test');
      expect(result.category).toBe('env_vars');
    });

    it('message describes env var references', () => {
      const result = detectEnvVars('process.env.KEY', 'test');
      expect(result.message).toContain('environment variable');
    });
  });
});
