import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordAuditLog } from '../../db/audit-log.js';
import { parseError } from '../errors/parseError.js';
import { logger } from '../logger/index.js';
import {
  errorResponse,
  handleToolError,
  successResponse,
  withAudit,
  withErrorHandler,
} from './index.js';

vi.mock('../errors/parseError.js', () => ({
  parseError: vi.fn(),
}));

vi.mock('../logger/index.js', () => ({
  logger: { warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../../db/audit-log.js', () => ({
  recordAuditLog: vi.fn(),
}));

describe('Tool Handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('errorResponse', () => {
    it('should format correctly', () => {
      const resp = errorResponse('Bad Request', '400');
      expect(resp.isError).toBe(true);
      expect(resp.content[0].text).toContain('"success": false');
      expect(resp.content[0].text).toContain('"error": "Bad Request"');
    });

    it('should use default code if omitted', () => {
      const resp = errorResponse('err');
      expect(resp.content[0].text).toContain('"code": "ERROR"');
    });
  });

  describe('successResponse', () => {
    it('should format success response', () => {
      const resp = successResponse({ data: 123 });
      expect(resp.content[0].text).toContain('"success": true');
      expect(resp.content[0].text).toContain('"data": 123');
    });
  });

  describe('handleToolError', () => {
    it('should parse error and log properly', () => {
      (parseError as any).mockReturnValue({ message: 'Parsed message', code: 'P1' });
      const resp = handleToolError(new Error('err'), 'Op1');
      expect(logger.error).toHaveBeenCalled();
      expect(resp.isError).toBe(true);
    });

    it('should support warn log level', () => {
      (parseError as any).mockReturnValue({ message: 'Warn msg', code: 'P2' });
      handleToolError(new Error('err'), 'Op1', { logLevel: 'warn' });
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should use customMessage', () => {
      (parseError as any).mockReturnValue({ message: 'Original', code: 'P3' });
      const resp = handleToolError(new Error('err'), 'Op1', { customMessage: 'Custom' });
      expect(resp.content[0].text).toContain('Custom');
    });
  });

  describe('withErrorHandler', () => {
    it('should return result if handler succeeds', async () => {
      const handler = async () => ({ content: [] });
      const wrapped = withErrorHandler('Op', handler);
      const res = await wrapped({});
      expect(res.content).toEqual([]);
    });

    it('should catch error and return handleToolError result', async () => {
      const handler = async () => {
        throw new Error('fail');
      };
      (parseError as any).mockReturnValue({ message: 'fail', code: 'F' });
      const wrapped = withErrorHandler('Op', handler);
      const res = await wrapped({});
      expect(res.isError).toBe(true);
    });
  });

  describe('withAudit', () => {
    it('should record audit log and return result', async () => {
      const handler = async () => ({ content: [], isError: false });
      const wrapped = withAudit('Op', 'store_knowledge', handler);
      const res = await wrapped({});

      expect(recordAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'store_knowledge',
          success: true,
        })
      );
      expect(res.isError).toBe(false);
    });

    it('should log failure if response isError', async () => {
      const handler = async () => ({ content: [], isError: true });
      const wrapped = withAudit('Op', 'get_knowledge', handler);
      await wrapped({});

      expect(recordAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'get_knowledge',
          success: false,
        })
      );
    });
  });
});
