import { describe, expect, it, vi } from 'vitest';
import { AppError } from './Error.js';
import { formatErrorResponse } from './formatErrorResponse.js';
import { parseError } from './parseError.js';

vi.mock('../tool-handler/index.js', () => ({
  errorResponse: (message: string, code: string) => ({
    isError: true,
    content: [{ type: 'text', text: `[${code}] ${message}` }],
  }),
}));

describe('Errors utility', () => {
  describe('AppError', () => {
    it('should create an instance with correct properties', () => {
      const error = new AppError('Test message', 'TEST_CODE', 400, { detail: 'test' });
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ detail: 'test' });
    });

    it('should use default status 500 when not provided', () => {
      const error = new AppError('Test message 2', 'TEST_CODE_2');
      expect(error.status).toBe(500);
    });
  });

  describe('parseError', () => {
    it('should return the same AppError if input is an AppError instance', () => {
      const original = new AppError('Original', 'ORIGINAL');
      const parsed = parseError(original);
      expect(parsed).toBe(original);
    });

    it('should wrap standard Error in an AppError with UNKNOWN code', () => {
      const stdError = new Error('Standard error message');
      const parsed = parseError(stdError);
      expect(parsed).toBeInstanceOf(AppError);
      expect(parsed.message).toBe('Standard error message');
      expect(parsed.code).toBe('UNKNOWN');
      expect(parsed.status).toBe(500);
      expect(parsed.details).toBe(stdError.stack);
    });

    it('should wrap arbitrary types in an AppError with UNKNOWN code', () => {
      const parsed = parseError('String error');
      expect(parsed).toBeInstanceOf(AppError);
      expect(parsed.message).toBe('String error');
      expect(parsed.code).toBe('UNKNOWN');
      expect(parsed.status).toBe(500);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format an error into a ToolResponse structure', () => {
      const error = new Error('Something failed');
      const response = formatErrorResponse(error);
      expect(response).toEqual({
        isError: true,
        content: [{ type: 'text', text: '[UNKNOWN] Something failed' }],
      });
    });

    it('should properly format existing AppErrors', () => {
      const appError = new AppError('Custom Error', 'CUSTOM_ERR');
      const response = formatErrorResponse(appError);
      expect(response).toEqual({
        isError: true,
        content: [{ type: 'text', text: '[CUSTOM_ERR] Custom Error' }],
      });
    });
  });
});
