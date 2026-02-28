import { describe, it, expect } from 'vitest';
import { redactValue } from './redaction.js';

describe('Redaction Utilities', () => {
    it('should redact email strategy', () => {
        expect(redactValue('user@example.com', 'email')).toBe('us***@ex***.com');
    });

    it('should redact email strategy with local only or unknown format', () => {
        expect(redactValue('user@localhost', 'email')).toBe('us***@***');
        expect(redactValue('not_an_email', 'email')).toBe('***@***');
    });

    it('should redact partial strategy', () => {
        expect(redactValue('1234567890', 'partial')).toBe('12***90');
        expect(redactValue('123', 'partial')).toBe('***');
    });

    it('should redact full strategy', () => {
        expect(redactValue('anything', 'full')).toBe('***REDACTED***');
    });

    it('should handle default fallback', () => {
        expect(redactValue('short', 'unknown' as any)).toBe('***');
        expect(redactValue('this_is_very_long', 'unknown' as any)).toBe('this***');
    });
});
