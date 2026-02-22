/**
 * PII Detector Tests
 */

import { describe, expect, it } from 'vitest';
import { detectPII } from '../../middleware/sanitization/detectors/pii/index.js';

describe('detectPII', () => {
  it('detects email', () => {
    const result = detectPII('Contact: test@example.com', 'test');
    expect(result.detected).toBe(true);
    expect(result.category).toBe('pii');
  });

  it('detects phone number', () => {
    const result = detectPII('Phone: 555-123-4567', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects credit card', () => {
    const result = detectPII('Card: 4532 1234 5678 9012', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects SSN', () => {
    const result = detectPII('SSN: 123-45-6789', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects IP address', () => {
    const result = detectPII('Server: 192.168.1.100', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects localhost', () => {
    const result = detectPII('Connect to 127.0.0.1', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects in title', () => {
    const result = detectPII('Normal content', 'Contact: john@email.com');
    expect(result.detected).toBe(true);
  });

  it('returns clean for normal text', () => {
    const result = detectPII('This is normal code', 'test');
    expect(result.detected).toBe(false);
    expect(result.matches).toEqual([]);
  });

  it('handles empty strings', () => {
    const result = detectPII('', '');
    expect(result.detected).toBe(false);
  });
});
