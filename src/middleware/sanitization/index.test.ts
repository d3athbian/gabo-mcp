import { beforeEach, describe, expect, it, vi } from 'vitest';
import { detectCredentials } from './detectors/credentials.js';
import { detectPII } from './detectors/pii/index.js';
import { sanitizeAllFields, sanitizeContent } from './index.js';

vi.mock('./detectors/credentials.js', () => ({
  detectCredentials: vi.fn(),
}));

vi.mock('./detectors/pii/index.js', () => ({
  detectPII: vi.fn(),
}));

vi.mock('../../utils/logger/index.js', () => ({
  logger: { warn: vi.fn() },
}));

describe('Sanitization Middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('sanitizeContent', () => {
    it('should allow clean content', () => {
      (detectCredentials as any).mockReturnValue({ detected: false });
      (detectPII as any).mockReturnValue({ detected: false });

      const res = sanitizeContent('title', 'content');
      expect(res.allowed).toBe(true);
    });

    it('should block if PII detected', () => {
      (detectCredentials as any).mockReturnValue({ detected: false });
      (detectPII as any).mockReturnValue({
        detected: true,
        category: 'pii',
        message: 'PII Found',
      });

      const res = sanitizeContent('title', 'content');
      expect(res.allowed).toBe(false);
      expect(res.errorMessage).toContain('PII Found');
    });
  });

  describe('sanitizeAllFields', () => {
    it('should allow clean multi-fields', () => {
      (detectCredentials as any).mockReturnValue({ detected: false });
      (detectPII as any).mockReturnValue({ detected: false });

      const res = sanitizeAllFields({
        title: 'clean',
        content: 'clean',
        tags: ['clean'],
        metadata: { a: 1 },
      });
      expect(res.allowed).toBe(true);
    });

    it('should block if credentials found in metadata', () => {
      (detectCredentials as any).mockReturnValue({
        detected: true,
        category: 'credentials',
        message: 'Key',
      });
      (detectPII as any).mockReturnValue({ detected: false });

      const res = sanitizeAllFields({ metadata: { password: 'pass' } });
      expect(res.allowed).toBe(false);
      expect(res.errorMessage).toContain('CREDENTIALS (Key)');
    });
  });
});
