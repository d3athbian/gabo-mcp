import { describe, expect, it, vi } from 'vitest';
import { detectCorporate } from './corporate.js';

vi.mock('../config.js', () => ({
  loadConfig: () => ({
    blacklistedCompanies: ['MegaCorp', 'EvilInc'],
    blacklistedDomains: ['megacorp.com', 'internal.evil.inc'],
    blacklistedKeywords: ['ProjectX', 'TopSecret'],
  }),
}));

describe('Corporate Detector', () => {
  it('should detect blacklisted companies', () => {
    const result = detectCorporate('I work at MegaCorp now', 'My Job');
    expect(result.detected).toBe(true);
    expect(result.matches).toContain('Company: MegaCorp');
  });

  it('should detect blacklisted domains', () => {
    const result = detectCorporate('Visit megacorp.com for details', 'Site');
    expect(result.detected).toBe(true);
    expect(result.matches).toContain('Domain: megacorp.com');
  });

  it('should detect blacklisted keywords', () => {
    const result = detectCorporate('We are starting ProjectX tomorrow', 'Plan');
    expect(result.detected).toBe(true);
    expect(result.matches).toContain('Keyword: ProjectX');
  });

  it('should detect corporate indicators', () => {
    const result = detectCorporate('This is strictly confidential', 'Notice');
    expect(result.detected).toBe(true);
    expect(result.matches).toContain('Indicator: confidential');
  });

  it('should return nothing for clean text', () => {
    const result = detectCorporate('Just a regular open source project', 'Hello');
    expect(result.detected).toBe(false);
    expect(result.matches).toHaveLength(0);
  });
});
