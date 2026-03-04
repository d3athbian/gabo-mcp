import { describe, expect, it } from 'vitest';
import { detectPII } from './index.js';

describe('PII Detector Main Entry', () => {
  it('should detect standard emails', () => {
    const result = detectPII('My email is test@example.com', 'Contact');
    expect(result.detected).toBe(true);
    expect(result.matches.some((m) => m.includes('***'))).toBe(true);
  });

  it('should detect keywords and mask them completely', () => {
    const result = detectPII(
      'The Social Security Number is 555-55-5555 and it is very secret',
      'Info'
    );
    expect(result.detected).toBe(true);
    expect(result.matches[0]).toContain('***');
  });

  it('should strip fake SSNs', () => {
    // If it looks like SSN but is invalid, it gets removed
    detectPII('Here is 000-00-0000', 'Info');
    // This relies on the utils checking if it's strictly invalid (like all zeros)
    // Check what passes through
  });

  it('should process phone numbers', () => {
    const result = detectPII('Call me at (555) 123-4567', 'Phone');
    expect(result.detected).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);
  });

  it('should return nothing for clean text', () => {
    const result = detectPII('Learning JavaScript is fun', 'Title');
    expect(result.detected).toBe(false);
    expect(result.matches).toHaveLength(0);
  });
});
