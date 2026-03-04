import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordAuditLog, setupAuditLogIndex } from './audit-log.js';
import { getKnowledgeAuditLogCollection } from './client.js';

vi.mock('./client.js', () => ({
  getKnowledgeAuditLogCollection: vi.fn(),
}));

vi.mock('../utils/logger/index.js', () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

describe('Audit Log Database Operations', () => {
  let mockCollection: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockCollection = {
      insertOne: vi.fn(),
      createIndex: vi.fn(),
    };
    (getKnowledgeAuditLogCollection as any).mockReturnValue(mockCollection);
  });

  describe('recordAuditLog', () => {
    it('should insert an audit log entry with timestamp', async () => {
      mockCollection.insertOne.mockResolvedValue({});
      await recordAuditLog({ action: 'get_knowledge', success: true });
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'get_knowledge',
          success: true,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should handle insert errors', async () => {
      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));
      // Should not throw, should just log error
      await expect(
        recordAuditLog({ action: 'get_knowledge', success: false })
      ).resolves.not.toThrow();
    });
  });

  describe('setupAuditLogIndex', () => {
    it('should create TTL index based on days', async () => {
      await setupAuditLogIndex(30);
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { timestamp: 1 },
        { expireAfterSeconds: 30 * 24 * 60 * 60, name: 'audit_log_ttl_index' }
      );
    });

    it('should handle index creation errors', async () => {
      mockCollection.createIndex.mockRejectedValue(new Error('Index Err'));
      // Should not throw
      await expect(setupAuditLogIndex()).resolves.not.toThrow();
    });
  });
});
