/**
 * API Key Utilities Tests
 */

import { describe, expect, it } from 'vitest';
import { generateApiKey, isValidApiKeyFormat } from '../../utils/api-key/index.js';

describe('generateApiKey', () => {
  it('generates key with correct prefix', () => {
    const key = generateApiKey();
    expect(key.startsWith('gabo_')).toBe(true);
  });

  it('generates key with underscore separator', () => {
    const key = generateApiKey();
    expect(key.includes('_')).toBe(true);
  });

  it('generates key with timestamp and random part', () => {
    const key = generateApiKey();
    const parts = key.split('_');
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe('gabo');
    expect(parts[1].length).toBeGreaterThan(0);
    expect(parts[2].length).toBeGreaterThan(0);
  });

  it('generates unique keys', () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      keys.add(generateApiKey());
    }
    expect(keys.size).toBe(100);
  });

  it('key format matches expected pattern', () => {
    const key = generateApiKey();
    const regex = /^gabo_[a-z0-9]+_[a-f0-9]{1,8}$/;
    expect(regex.test(key)).toBe(true);
  });

  it('random part is 8 hex characters max', () => {
    for (let i = 0; i < 50; i++) {
      const key = generateApiKey();
      const randomPart = key.split('_')[2];
      expect(randomPart.length).toBeLessThanOrEqual(8);
      expect(randomPart.length).toBeGreaterThan(0);
    }
  });
});

describe('isValidApiKeyFormat', () => {
  it('returns true for valid key', () => {
    const key = generateApiKey();
    expect(isValidApiKeyFormat(key)).toBe(true);
  });

  it('returns true for example valid key', () => {
    expect(isValidApiKeyFormat('gabo_abc123_def456')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidApiKeyFormat('')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidApiKeyFormat(null as any)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidApiKeyFormat(undefined as any)).toBe(false);
  });

  it('returns false for string without prefix', () => {
    expect(isValidApiKeyFormat('abc123_invalid')).toBe(false);
  });

  it('returns false for number', () => {
    expect(isValidApiKeyFormat(123 as any)).toBe(false);
  });

  it('returns false for object', () => {
    expect(isValidApiKeyFormat({ key: 'value' } as any)).toBe(false);
  });

  it('accepts key with only prefix and underscore', () => {
    expect(isValidApiKeyFormat('gabo_')).toBe(true);
  });

  it('accepts key with timestamp but no random part', () => {
    expect(isValidApiKeyFormat('gabo_abc123_')).toBe(true);
  });
});
