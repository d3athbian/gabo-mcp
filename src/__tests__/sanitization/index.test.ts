/**
 * Sanitization System Tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reloadConfig } from '../../middleware/sanitization/config.js';
import { sanitizeContent } from '../../middleware/sanitization/index.js';
import {
  getActiveProfile,
  getAllProfiles,
  getProfile,
} from '../../middleware/sanitization/profiles.js';

describe('sanitizeContent', () => {
  describe('work profile', () => {
    beforeEach(() => {
      vi.stubEnv('SECURITY_PROFILE', 'work');
      reloadConfig();
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('blocks credentials', () => {
      const result = sanitizeContent('API Key Config', 'api_key=sk-test123');
      expect(result.allowed).toBe(false);
      expect(result.violations.some((v) => v.category === 'credentials')).toBe(true);
    });

    it('blocks PII', () => {
      const result = sanitizeContent('User Contact', 'email=user@example.com');
      expect(result.allowed).toBe(false);
      expect(result.violations.some((v) => v.category === 'pii')).toBe(true);
    });

    it('allows corporate data (not blocking yet)', () => {
      const result = sanitizeContent('Google Internal', 'Google Inc. proprietary code');
      expect(result.allowed).toBe(true);
    });

    it('allows environment variables (not blocking yet)', () => {
      const result = sanitizeContent('Config', 'process.env.API_KEY');
      expect(result.allowed).toBe(true);
    });

    it('allows clean content', () => {
      const result = sanitizeContent(
        'Open Source Pattern',
        'A useful pattern for handling async operations'
      );
      expect(result.allowed).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it('returns error message when blocked', () => {
      const result = sanitizeContent('API Key', 'password=secret');
      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toContain('Blocked');
      expect(result.errorMessage).toContain('Cannot save');
    });
  });

  describe('personal profile', () => {
    beforeEach(() => {
      vi.stubEnv('SECURITY_PROFILE', 'personal');
      reloadConfig();
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('blocks credentials', () => {
      const result = sanitizeContent('API Key', 'api_key=sk-test123');
      expect(result.allowed).toBe(false);
      expect(result.violations.some((v) => v.category === 'credentials')).toBe(true);
    });

    it('blocks PII', () => {
      const result = sanitizeContent('Email', 'test@example.com');
      expect(result.allowed).toBe(false);
      expect(result.violations.some((v) => v.category === 'pii')).toBe(true);
    });

    it('allows corporate data in personal profile', () => {
      const result = sanitizeContent('Google Project', 'Google Inc. internal project');
      expect(result.allowed).toBe(true);
    });

    it('allows environment variables in personal profile', () => {
      const result = sanitizeContent('Config', 'process.env.API_KEY');
      expect(result.allowed).toBe(true);
    });

    it('allows clean content', () => {
      const result = sanitizeContent('My Project', 'A useful personal project pattern');
      expect(result.allowed).toBe(true);
    });
  });

  describe('default profile', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('defaults to personal profile', () => {
      vi.stubEnv('SECURITY_PROFILE', undefined);
      reloadConfig();
      const result = sanitizeContent('Test', 'Google Inc.');
      expect(result.allowed).toBe(true);
    });

    it('falls back to personal for invalid profile', () => {
      vi.stubEnv('SECURITY_PROFILE', 'invalid_profile');
      reloadConfig();
      const result = sanitizeContent('Test', 'Google Inc.');
      expect(result.allowed).toBe(true);
    });
  });

  describe('error message format', () => {
    beforeEach(() => {
      vi.stubEnv('SECURITY_PROFILE', 'work');
      reloadConfig();
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('includes violation details', () => {
      const result = sanitizeContent('Test', 'password=secret and email@test.com');
      expect(result.errorMessage).toContain('Blocked');
      expect(result.errorMessage).toContain('CREDENTIALS');
      expect(result.errorMessage).toContain('PII');
    });

    it('includes helpful tip to remove data', () => {
      const result = sanitizeContent('Test', 'password=secret');
      expect(result.errorMessage).toContain('Remove sensitive data');
    });
  });
});

describe('profiles', () => {
  describe('getActiveProfile', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('returns work profile when set', () => {
      vi.stubEnv('SECURITY_PROFILE', 'work');
      reloadConfig();
      const profile = getActiveProfile();
      expect(profile.name).toBe('work');
    });

    it('returns personal profile when set', () => {
      vi.stubEnv('SECURITY_PROFILE', 'personal');
      reloadConfig();
      const profile = getActiveProfile();
      expect(profile.name).toBe('personal');
    });

    it('returns personal as default', () => {
      vi.stubEnv('SECURITY_PROFILE', undefined);
      reloadConfig();
      const profile = getActiveProfile();
      expect(profile.name).toBe('personal');
    });
  });

  describe('getProfile', () => {
    it('returns work profile', () => {
      const profile = getProfile('work');
      expect(profile.name).toBe('work');
      expect(profile.detectors.credentials).toBe(true);
      expect(profile.detectors.corporate).toBe(true);
    });

    it('returns personal profile', () => {
      const profile = getProfile('personal');
      expect(profile.name).toBe('personal');
      expect(profile.detectors.credentials).toBe(true);
      expect(profile.detectors.corporate).toBe(false);
    });
  });

  describe('getAllProfiles', () => {
    it('returns all available profiles', () => {
      const profiles = getAllProfiles();
      expect(profiles.length).toBe(2);
      expect(profiles.map((p) => p.name)).toContain('work');
      expect(profiles.map((p) => p.name)).toContain('personal');
    });
  });
});
