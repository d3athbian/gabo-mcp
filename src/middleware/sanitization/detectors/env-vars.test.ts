import { describe, expect, it } from 'vitest';
import { detectEnvVars } from './env-vars.js';

describe('Environment Variables Detector', () => {
  it('should detect Node process.env', () => {
    const result = detectEnvVars('const k = process.env.SECRET_KEY', 'Code');
    expect(result.detected).toBe(true);
    expect(result.matches).toContain('process.env.SECRET_KEY');
  });

  it('should detect Python os.environ', () => {
    const result = detectEnvVars('key = os.environ["API_KEY"]', 'Code');
    expect(result.detected).toBe(true);
    expect(result.matches).toContain('os.environ["API_KEY"]');
  });

  it('should detect bash export', () => {
    const result = detectEnvVars('export AWS_KEY=', 'Shell');
    expect(result.detected).toBe(true);
    expect(result.matches).toContain('export AWS_KEY=');
  });

  it('should ignore common dev vars like NODE_ENV or PATH', () => {
    const result = detectEnvVars('process.env.NODE_ENV === "development"', 'Check');
    expect(result.detected).toBe(false);
    expect(result.matches).toHaveLength(0);
  });

  it('should return clean for normal text', () => {
    const result = detectEnvVars('Just some regular text', 'Hello');
    expect(result.detected).toBe(false);
  });
});
