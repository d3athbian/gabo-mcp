/**
 * Sanitization System Tests
 */

import { describe, expect, it } from 'vitest';
import { sanitizeContent } from '../../middleware/sanitization/index.js';

describe('sanitizeContent', () => {
    it('blocks credentials', () => {
        const result = sanitizeContent('API Key Config', 'api_key=sk-test123');
        expect(result.allowed).toBe(false);
        expect(result.violations.some((v) => v.category === 'credentials')).toBe(true);
    });

    it('blocks PII', () => {
        const result = sanitizeContent('User Contact', 'email=user@example.com');
        expect(result.allowed).toBe(false);
        expect(result.violations.some((v) => v.category === 'pii')).toBe(true);
    });

    it('allows clean content', () => {
        const result = sanitizeContent(
            'Open Source Pattern',
            'A useful pattern for handling async operations'
        );
        expect(result.allowed).toBe(true);
        expect(result.violations).toEqual([]);
    });

    it('returns error message when blocked', () => {
        const result = sanitizeContent('API Key', 'password=secret');
        expect(result.errorMessage).toBeDefined();
        expect(result.errorMessage).toContain('Blocked');
        expect(result.errorMessage).toContain('Cannot save');
    });

    describe('error message format', () => {
        it('includes violation details', () => {
            const result = sanitizeContent('Test', 'password=secret and email@test.com');
            expect(result.errorMessage).toContain('Blocked');
            expect(result.errorMessage).toContain('CREDENTIALS');
            expect(result.errorMessage).toContain('PII');
        });

        it('includes helpful tip to remove data', () => {
            const result = sanitizeContent('Test', 'password=secret');
            expect(result.errorMessage).toContain('Remove sensitive data');
        });
    });
});
