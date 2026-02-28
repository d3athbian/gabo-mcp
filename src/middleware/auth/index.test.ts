import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '../../config/config.js';
import * as apiKeysDb from '../../db/api-keys.js';
import * as apiKeyUtils from '../../utils/api-key/index.js';
import {
  createAuthErrorResponse,
  ensureApiKeyExists,
  isBootstrapAvailable,
  validateApiKey,
  withAuth,
} from './index.js';

vi.mock('../../db/api-keys.js', () => ({
  hasAnyApiKeys: vi.fn(),
  findApiKeyByKey: vi.fn(),
  createApiKey: vi.fn(),
}));

vi.mock('../../db/audit-log.js', () => ({
  recordAuditLog: vi.fn(),
}));

vi.mock('../../utils/api-key/index.js', () => ({
  isValidApiKeyFormat: vi.fn(),
  ensurePepperExists: vi.fn(),
  generateApiKey: vi.fn(),
  hashApiKey: vi.fn(),
  writeEnvVariable: vi.fn(),
}));

vi.mock('../../config/config.js', () => ({
  config: { mcp: { apiKey: 'key' }, mcpKeyPepper: 'pepper' },
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('isBootstrapAvailable', () => {
    it('should return true if no keys exist', async () => {
      (apiKeysDb.hasAnyApiKeys as any).mockResolvedValue(false);
      expect(await isBootstrapAvailable()).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('should fail if no key provided', async () => {
      const auth = await validateApiKey('');
      expect(auth.success).toBe(false);
    });

    it('should fail if format invalid', async () => {
      (apiKeyUtils.isValidApiKeyFormat as any).mockReturnValue(false);
      const auth = await validateApiKey('bad_key');
      expect(auth.success).toBe(false);
    });

    it('should fail if not found in db', async () => {
      (apiKeyUtils.isValidApiKeyFormat as any).mockReturnValue(true);
      (apiKeysDb.findApiKeyByKey as any).mockResolvedValue(null);
      const auth = await validateApiKey('gabo_key');
      expect(auth.success).toBe(false);
    });

    it('should return success and id for active keys', async () => {
      (apiKeyUtils.isValidApiKeyFormat as any).mockReturnValue(true);
      (apiKeysDb.findApiKeyByKey as any).mockResolvedValue({ id: '123', is_active: true });
      const auth = await validateApiKey('gabo_key');
      expect(auth.success).toBe(true);
      expect((auth as any).keyId).toBe('123');
    });
  });

  describe('ensureApiKeyExists', () => {
    it('should generate new key if none exist', async () => {
      (apiKeysDb.hasAnyApiKeys as any).mockResolvedValue(false);
      (apiKeyUtils.generateApiKey as any).mockReturnValue('new_key');
      (apiKeyUtils.hashApiKey as any).mockResolvedValue('hash');

      const res = await ensureApiKeyExists();
      expect(res).toBe('new_key');
      expect(apiKeysDb.createApiKey).toHaveBeenCalledWith('hash');
      expect(apiKeyUtils.writeEnvVariable).toHaveBeenCalledWith('MCP_API_KEY', 'new_key');
    });

    it('should return empty string if key already exists', async () => {
      (apiKeysDb.hasAnyApiKeys as any).mockResolvedValue(true);
      const res = await ensureApiKeyExists();
      expect(res).toBe('');
      expect(apiKeysDb.createApiKey).not.toHaveBeenCalled();
    });
  });

  describe('createAuthErrorResponse', () => {
    it('should return correct format for required', () => {
      const res = createAuthErrorResponse('API key is required');
      expect(res.isError).toBe(true);
      expect(res.content[0].text).toContain('MCP_API_KEY');
    });

    it('should return correct format for format error', () => {
      const res = createAuthErrorResponse('format');
      expect(res.isError).toBe(true);
      expect(res.content[0].text).toContain('gabo_');
    });

    it('should return correct format for not found error', () => {
      const res = createAuthErrorResponse('not found');
      expect(res.content[0].text).toContain('MongoDB');
    });

    it('should return correct format for revoked error', () => {
      const res = createAuthErrorResponse('revoked');
      expect(res.content[0].text).toContain('revoked');
    });
  });

  describe('withAuth', () => {
    it('should fail if no api key in config', async () => {
      config.mcp.apiKey = '';
      const handler = vi.fn();
      const wrapped = withAuth(handler);
      const res = await wrapped({});

      expect(res.isError).toBe(true);
      expect(res.content[0].text).toContain('not configured');
    });

    it('should fail if validation fails', async () => {
      config.mcp.apiKey = 'key';
      (apiKeyUtils.isValidApiKeyFormat as any).mockReturnValue(false); // validation fails

      const handler = vi.fn();
      const wrapped = withAuth(handler);
      const res = await wrapped({});

      expect(res.isError).toBe(true);
    });

    it('should call handler if validation succeeds', async () => {
      config.mcp.apiKey = 'gabo_valid';
      (apiKeyUtils.isValidApiKeyFormat as any).mockReturnValue(true);
      (apiKeysDb.findApiKeyByKey as any).mockResolvedValue({ id: 'id1', is_active: true });

      const handler = vi.fn().mockResolvedValue({ isError: false, content: [] });
      const wrapped = withAuth(handler);
      const res = await wrapped({});

      expect(handler).toHaveBeenCalledWith({}, { keyId: 'id1' }, undefined);
      expect(res.isError).toBe(false);
    });
  });
});
