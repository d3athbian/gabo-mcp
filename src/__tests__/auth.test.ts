/**
 * Authentication Middleware Tests
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import * as apiKeysDb from '../db/api-keys.js';
import {
  createAuthErrorResponse,
  isBootstrapAvailable,
  validateApiKey,
  withAuth,
} from '../middleware/auth/index.js';
import type { AuthResult } from '../types.js';

vi.mock('../db/client.js', () => ({
  getDatabase: vi.fn().mockReturnValue({
    collection: vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null),
      insertOne: vi.fn().mockResolvedValue({ insertedId: 'test-id' }),
    }),
  }),
  connectToDatabase: vi.fn().mockResolvedValue({}),
  getKnowledgeEntriesCollection: vi.fn(),
  getApiKeysCollection: vi.fn(),
  getKnowledgeAuditLogCollection: vi.fn(),
}));

vi.mock('../db/audit-log.js', () => ({
  recordAuditLog: vi.fn().mockResolvedValue({}),
}));

vi.mock('../utils/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../utils/api-key/index.js', () => ({
  ensurePepperExists: vi.fn(),
  generateApiKey: vi.fn().mockReturnValue('gabo_test_key_12345678'),
  hashApiKey: vi.fn().mockResolvedValue('hashed_test_key'),
  isValidApiKeyFormat: vi.fn().mockImplementation((key: string) => key.startsWith('gabo_')),
  verifyApiKey: vi.fn().mockResolvedValue(true),
  writeEnvVariable: vi.fn(),
}));

describe('validateApiKey', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns error for missing API key', async () => {
    const result = await validateApiKey('');
    expect(result.success).toBe(false);
    const errorResult = result as Extract<AuthResult, { success: false }>;
    expect(errorResult.error).toContain('API key is required');
  });

  it('returns error for null API key', async () => {
    const result = await validateApiKey(null as any);
    expect(result.success).toBe(false);
    const errorResult = result as Extract<AuthResult, { success: false }>;
    expect(errorResult.error).toContain('API key is required');
  });

  it('returns error for undefined API key', async () => {
    const result = await validateApiKey(undefined as any);
    expect(result.success).toBe(false);
    const errorResult = result as Extract<AuthResult, { success: false }>;
    expect(errorResult.error).toContain('API key is required');
  });

  it('returns error for invalid format', async () => {
    vi.spyOn(apiKeysDb, 'findApiKeyByKey').mockResolvedValue(null);
    const result = await validateApiKey('invalid_key');
    expect(result.success).toBe(false);
    const errorResult = result as Extract<AuthResult, { success: false }>;
    expect(errorResult.error).toContain('Invalid API key format');
  });

  it('returns error for non-existent key', async () => {
    vi.spyOn(apiKeysDb, 'findApiKeyByKey').mockResolvedValue(null);
    const result = await validateApiKey('gabo_abc123_test');
    expect(result.success).toBe(false);
    const errorResult = result as Extract<AuthResult, { success: false }>;
    expect(errorResult.error).toContain('Invalid API key');
  });

  it.skip('returns error for revoked key', async () => {
    vi.spyOn(apiKeysDb, 'findApiKeyByKey').mockResolvedValue({
      id: 'test-id',
      key_hash: 'hashed_key',
      created_at: '2024-01-01',
      last_used: undefined,
      is_active: false,
    });
    const result = await validateApiKey('gabo_valid_key');
    expect(result.success).toBe(false);
    const errorResult = result as Extract<AuthResult, { success: false }>;
    expect(errorResult.error).toContain('revoked');
  });

  it.skip('returns success for valid active key', async () => {
    vi.spyOn(apiKeysDb, 'findApiKeyByKey').mockResolvedValue({
      id: 'test-id-123',
      key_hash: 'hashed_key_abc',
      created_at: '2024-01-01',
      last_used: '2024-01-15T10:00:00Z',
      is_active: true,
    });
    const result = await validateApiKey('gabo_valid_key');
    expect(result.success).toBe(true);
    const successResult = result as Extract<AuthResult, { success: true }>;
    expect(successResult.keyId).toBe('test-id-123');
  });
});

describe('isBootstrapAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when no API keys exist', async () => {
    vi.spyOn(apiKeysDb, 'hasAnyApiKeys').mockResolvedValue(false);
    const result = await isBootstrapAvailable();
    expect(result).toBe(true);
  });

  it('returns false when API keys exist', async () => {
    vi.spyOn(apiKeysDb, 'hasAnyApiKeys').mockResolvedValue(true);
    const result = await isBootstrapAvailable();
    expect(result).toBe(false);
  });
});

describe('createAuthErrorResponse', () => {
  it('returns help for missing API key', () => {
    const response = createAuthErrorResponse('API key is required');
    const content = JSON.parse(response.content[0].text);
    expect(content.error).toBe('API key is required');
    expect(content.code).toBe('AUTH_ERROR');
    expect(content.help).toContain('MCP_API_KEY');
  });

  it('returns help for invalid format', () => {
    const response = createAuthErrorResponse('Invalid API key format');
    const content = JSON.parse(response.content[0].text);
    expect(content.error).toBe('Invalid API key format');
    expect(content.help).toContain('gabo_');
  });

  it('returns help for non-existent key', () => {
    const response = createAuthErrorResponse('Key not found in database');
    const content = JSON.parse(response.content[0].text);
    expect(content.error).toBe('Key not found in database');
    expect(content.help).toContain('database');
  });

  it('returns help for revoked key', () => {
    const response = createAuthErrorResponse('API key has been revoked');
    const content = JSON.parse(response.content[0].text);
    expect(content.error).toBe('API key has been revoked');
    expect(content.help).toContain('revoked');
  });

  it('marks response as error', () => {
    const response = createAuthErrorResponse('API key is required');
    expect(response.isError).toBe(true);
  });

  it('returns empty help for unknown error', () => {
    const response = createAuthErrorResponse('Unknown error');
    const content = JSON.parse(response.content[0].text);
    expect(content.help).toBe('');
  });
});

describe('withAuth middleware', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns auth error when API key missing', async () => {
    const handler = vi.fn().mockResolvedValue({ content: [], isError: false });
    const wrapped = withAuth(handler);

    const response = await wrapped({ api_key: '' } as any);

    expect(response.isError).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns auth error for invalid format', async () => {
    const handler = vi.fn().mockResolvedValue({ content: [], isError: false });
    const wrapped = withAuth(handler);

    const response = await wrapped({ api_key: 'invalid' } as any);

    expect(response.isError).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns auth error for non-existent key', async () => {
    vi.spyOn(apiKeysDb, 'findApiKeyByKey').mockResolvedValue(null);
    const handler = vi.fn().mockResolvedValue({ content: [], isError: false });
    const wrapped = withAuth(handler);

    const response = await wrapped({ api_key: 'gabo_test123' } as any);

    expect(response.isError).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns auth error for revoked key', async () => {
    vi.spyOn(apiKeysDb, 'findApiKeyByKey').mockResolvedValue({
      id: 'test-id',
      key_hash: 'hashed_key',
      created_at: '2024-01-01',
      last_used: undefined,
      is_active: false,
    });
    const handler = vi.fn().mockResolvedValue({ content: [], isError: false });
    const wrapped = withAuth(handler);

    const response = await wrapped({ api_key: 'gabo_test' } as any);

    expect(response.isError).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });

  it.skip('calls handler with args when key valid', async () => {
    vi.stubEnv('MCP_API_KEY', 'gabo_valid_key');

    vi.spyOn(apiKeysDb, 'findApiKeyByKey').mockResolvedValue({
      id: 'key-id',
      key_hash: 'hashed_valid_key',
      created_at: '2024-01-01',
      last_used: undefined,
      is_active: true,
    });

    const handler = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: '{}' }] });
    const wrapped = withAuth(handler);

    const args = { query: 'test' };
    await wrapped(args as any);

    expect(handler).toHaveBeenCalled();
  });

  it.skip('passes auth context to handler', async () => {
    vi.stubEnv('MCP_API_KEY', 'gabo_test456');

    vi.spyOn(apiKeysDb, 'findApiKeyByKey').mockResolvedValue({
      id: 'abc123',
      key_hash: 'hashed_test_key',
      created_at: '2024-01-01',
      last_used: undefined,
      is_active: true,
    });

    const handler = vi.fn().mockResolvedValue({ content: [] });
    const wrapped = withAuth(handler);

    await wrapped({} as any);

    expect(handler).toHaveBeenCalled();
  });
});
