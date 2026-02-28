import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyApiKey } from '../utils/api-key/index.js';
import {
  createApiKey,
  findApiKeyByKey,
  hasAnyApiKeys,
  listApiKeys,
  revokeAllApiKeys,
} from './api-keys.js';
import { getApiKeysCollection } from './client.js';

vi.mock('./client.js', () => ({
  getApiKeysCollection: vi.fn(),
}));

vi.mock('../utils/api-key/index.js', () => ({
  verifyApiKey: vi.fn(),
}));

describe('Database Queries: API Keys', () => {
  let mockCollection: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockCollection = {
      countDocuments: vi.fn(),
      insertOne: vi.fn(),
      find: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      deleteMany: vi.fn(),
      sort: vi.fn().mockReturnThis(),
    };
    (getApiKeysCollection as any).mockReturnValue(mockCollection);
  });

  describe('hasAnyApiKeys', () => {
    it('should return true if count > 0', async () => {
      mockCollection.countDocuments.mockResolvedValue(1);
      const res = await hasAnyApiKeys();
      expect(res).toBe(true);
    });

    it('should return false if count === 0', async () => {
      mockCollection.countDocuments.mockResolvedValue(0);
      const res = await hasAnyApiKeys();
      expect(res).toBe(false);
    });
  });

  describe('createApiKey', () => {
    it('should insert a new active key hash', async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });
      const res = await createApiKey('hash_value');
      expect(res.key_hash).toBe('hash_value');
      expect(res.is_active).toBe(true);
    });
  });

  describe('findApiKeyByKey', () => {
    it('should return key if verified successfully', async () => {
      const id = new ObjectId();
      mockCollection.toArray.mockResolvedValue([{ _id: id, key_hash: 'hash1', is_active: true }]);
      (verifyApiKey as any).mockResolvedValue(true);

      const res = await findApiKeyByKey('plain_key');
      expect(verifyApiKey).toHaveBeenCalledWith('plain_key', 'hash1');
      expect(res?.id).toBe(id.toString());
    });

    it('should return null if no keys match', async () => {
      mockCollection.toArray.mockResolvedValue([
        { _id: new ObjectId(), key_hash: 'hash1', is_active: true },
      ]);
      (verifyApiKey as any).mockResolvedValue(false);

      const res = await findApiKeyByKey('plain_key');
      expect(res).toBeNull();
    });
  });

  describe('revokeAllApiKeys', () => {
    it('should delete all keys', async () => {
      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 5 });
      const res = await revokeAllApiKeys();
      expect(res).toBe(5);
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({});
    });
  });

  describe('listApiKeys', () => {
    it('should return a list minus hashes', async () => {
      mockCollection.toArray.mockResolvedValue([
        { _id: new ObjectId(), key_hash: 'hash', is_active: true },
      ]);
      const res = await listApiKeys();
      expect(res[0]).not.toHaveProperty('key_hash');
      expect(res[0]).toHaveProperty('is_active', true);
    });
  });
});
