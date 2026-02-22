/**
 * Environment Variables Detector Tests
 */

import { describe, expect, it } from 'vitest';
import { detectEnvVars } from '../../middleware/sanitization/detectors/env-vars.js';

describe('detectEnvVars', () => {
  it('detects process.env', () => {
    const result = detectEnvVars('const apiKey = process.env.API_KEY', 'test');
    expect(result.detected).toBe(true);
    expect(result.category).toBe('env_vars');
  });

  it('detects Python os.environ', () => {
    const result = detectEnvVars("import os; key = os.environ['API_KEY']", 'test');
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

  it('detects in title', () => {
    const result = detectEnvVars('Code snippet', 'process.env.API_KEY usage');
    expect(result.detected).toBe(true);
  });

  it('filters NODE_ENV', () => {
    const result = detectEnvVars('process.env.NODE_ENV', 'test');
    expect(result.detected).toBe(false);
  });

  it('filters PATH and HOME', () => {
    expect(detectEnvVars('$PATH variable', 'test').detected).toBe(false);
    expect(detectEnvVars('$HOME directory', 'test').detected).toBe(false);
  });

  it('returns clean for normal text', () => {
    const result = detectEnvVars('This is normal text', 'test');
    expect(result.detected).toBe(false);
    expect(result.matches).toEqual([]);
  });

  it('handles empty strings', () => {
    const result = detectEnvVars('', '');
    expect(result.detected).toBe(false);
  });
});
