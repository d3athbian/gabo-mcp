import { describe, expect, it } from 'vitest';
import { detectCredentials } from './credentials.js';

describe('Credentials Detector', () => {
  it('should detect passwords', () => {
    const result = detectCredentials('My password=supersecret123', 'Config');
    expect(result.detected).toBe(true);
    expect(result.matches.some((m) => m.includes('password=supersecret123'))).toBe(true);
  });

  it('should detect generic API keys', () => {
    const result = detectCredentials('api_key="12345-abc"', 'Settings');
    expect(result.detected).toBe(true);
    expect(result.matches.some((m) => m.includes('api_key="12345-abc"'))).toBe(true);
  });

  it('should detect specific tokens like AWS', () => {
    // AKIA + 16 chars
    const result = detectCredentials('AKIAIOSFODNN7EXAMPLE', 'AWS');
    expect(result.detected).toBe(true);
    expect(result.matches).toContain('AKIAIOSFODNN7EXAMPLE');
  });

  it('should detect database connection strings', () => {
    const result = detectCredentials('Use mongodb+srv://user:pass@cluster.mongodb.net/db', 'Mongo');
    expect(result.detected).toBe(true);
    expect(result.matches.some((m) => m.includes('mongodb+srv://'))).toBe(true);
  });

  it('should not detect clean strings', () => {
    const result = detectCredentials('Hello world string', 'Title');
    expect(result.detected).toBe(false);
    expect(result.matches).toHaveLength(0);
  });
});
