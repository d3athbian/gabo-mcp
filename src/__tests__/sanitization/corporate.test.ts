/**
 * Corporate Detector Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reloadConfig } from '../../middleware/sanitization/config.js';
import { detectCorporate } from '../../middleware/sanitization/detectors/corporate.js';

describe('detectCorporate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    reloadConfig();
  });

  it('detects internal keyword', () => {
    const result = detectCorporate('This is internal documentation', 'test');
    expect(result.detected).toBe(true);
    expect(result.category).toBe('corporate');
  });

  it('detects confidential', () => {
    const result = detectCorporate('Confidential project details', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects proprietary', () => {
    const result = detectCorporate('Proprietary algorithm', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects trade secret', () => {
    const result = detectCorporate('Trade secret information', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects case insensitive', () => {
    const result = detectCorporate('INTERNAL notes', 'test');
    expect(result.detected).toBe(true);
  });

  it('detects in title', () => {
    const result = detectCorporate('Open source project', 'INTERNAL Project');
    expect(result.detected).toBe(true);
  });

  it('returns clean for normal text', () => {
    const result = detectCorporate('This is normal open source code', 'test');
    expect(result.detected).toBe(false);
  });

  it('handles empty strings', () => {
    const result = detectCorporate('', '');
    expect(result.detected).toBe(false);
  });
});
