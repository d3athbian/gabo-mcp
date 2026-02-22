/**
 * Credentials Detector Tests
 */

import { describe, expect, it } from 'vitest';
import { detectCredentials } from '../../middleware/sanitization/detectors/credentials.js';

describe('detectCredentials', () => {
  it('detects password assignment', () => {
    const result = detectCredentials('password=secret123', 'test');
    expect(result.detected).toBe(true);
    expect(result.category).toBe('credentials');
  });

  it('detects api_key', () => {
    const result = detectCredentials('api_key=sk-test123', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects Bearer token', () => {
    const result = detectCredentials(
      'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      'test'
    );
    expect(result.detected).toBe(true);
  });

  it('detects Bearer token', () => {
    const result = detectCredentials('Authorization: Bearer abc123.xyz', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects MongoDB connection string', () => {
    const result = detectCredentials('mongodb://user:pass@localhost:27017/test', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects PostgreSQL connection string', () => {
    const result = detectCredentials('postgres://user:pass@localhost:5432/testdb', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects in title', () => {
    const result = detectCredentials('Normal content', 'API: secret=mykey');
    expect(result.detected).toBe(true);
  });

  it('returns clean for normal text', () => {
    const result = detectCredentials('This is normal code', 'test');
    expect(result.detected).toBe(false);
    expect(result.matches).toEqual([]);
  });

  it('handles empty strings', () => {
    const result = detectCredentials('', '');
    expect(result.detected).toBe(false);
  });
});
