/**
 * API Keys Database Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../db/client.js', () => ({
  getApiKeysCollection: vi.fn(),
}));

const mockCollection = {
  countDocuments: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
};

const { getApiKeysCollection } = await import('../../db/client.js');

beforeEach(() => {
  vi.clearAllMocks();
  (getApiKeysCollection as ReturnType<typeof vi.fn>).mockReturnValue(mockCollection);
});

describe('hasAnyApiKeys', () => {
  it('returns true when keys exist', async () => {
    mockCollection.countDocuments.mockResolvedValue(1);
    const { hasAnyApiKeys } = await import('../../db/api-keys.js');
    const result = await hasAnyApiKeys();
    expect(result).toBe(true);
  });

  it('returns false when no keys', async () => {
    mockCollection.countDocuments.mockResolvedValue(0);
    const { hasAnyApiKeys } = await import('../../db/api-keys.js');
    const result = await hasAnyApiKeys();
    expect(result).toBe(false);
  });
});

describe('createApiKey', () => {
  it('creates new API key', async () => {
    mockCollection.insertOne.mockResolvedValue({ insertedId: 'new-id' });
    const { createApiKey } = await import('../../db/api-keys.js');
    const result = await createApiKey('hash123');
    expect(result.key_hash).toBe('hash123');
  });
});
