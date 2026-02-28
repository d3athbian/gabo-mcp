import * as fs from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadConfig, reloadConfig } from './config.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock('../../utils/logger/index.js', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

describe('Sanitization Config', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Force cachedConfig reset via reloadConfig call
  });

  it('should load config from file if it exists', () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(
      JSON.stringify({
        blacklistedCompanies: ['TestCo'],
      })
    );

    const config = reloadConfig();
    expect(config.blacklistedCompanies).toContain('TestCo');
  });

  it('should fallback to default if no file', () => {
    (fs.existsSync as any).mockReturnValue(false);

    const config = reloadConfig();
    expect(config.blacklistedCompanies).toEqual([]);
  });

  it('should fallback to default on error', () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockImplementation(() => {
      throw new Error('ERR');
    });

    const config = reloadConfig();
    expect(config.blacklistedCompanies).toEqual([]);
  });

  it('should cache config', () => {
    (fs.existsSync as any).mockReturnValue(false);
    reloadConfig();
    (fs.existsSync as any).mockReturnValue(true);

    // Should return cached default
    const config = loadConfig();
    expect(config.blacklistedCompanies).toEqual([]);
  });
});
