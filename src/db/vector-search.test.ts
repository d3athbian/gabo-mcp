import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getKnowledgeEntriesCollection } from './client.js';
import {
  isVectorSearchAvailable,
  searchKnowledgeHybrid,
  searchKnowledgeVector,
} from './vector-search.js';

vi.mock('./client.js', () => ({
  getKnowledgeEntriesCollection: vi.fn(),
}));

vi.mock('../utils/logger/index.js', () => ({
  logger: { debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

describe('Vector Search', () => {
  let mockCollection: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockCollection = {
      aggregate: vi.fn(),
      find: vi.fn().mockReturnThis(),
      project: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      countDocuments: vi.fn(),
    };
    (getKnowledgeEntriesCollection as any).mockReturnValue(mockCollection);
  });

  describe('searchKnowledgeVector', () => {
    it('should return mapped results', async () => {
      mockCollection.aggregate.mockReturnValue({
        toArray: vi
          .fn()
          .mockResolvedValue([
            { _id: '123', title: 'T', content: 'C', type: 'NOTE', created_at: 'now', score: 0.99 },
          ]),
      });

      const results = await searchKnowledgeVector([0.1, 0.2]);
      expect(results).toHaveLength(1);
      expect(results[0].embedding_score).toBe(0.99);
      expect(mockCollection.aggregate).toHaveBeenCalled();
    });

    it('should handle Atlas search disabled cleanly', async () => {
      const err = new Error('atlas disabled');
      (err as any).codeName = 'AtlasSearchDisabled';

      mockCollection.aggregate.mockReturnValue({
        toArray: vi.fn().mockRejectedValue(err),
      });

      await expect(searchKnowledgeVector([0.1])).rejects.toThrow('atlas disabled');
    });
  });

  describe('searchKnowledgeHybrid', () => {
    it('should combine vector and text search results', async () => {
      // Mock vector search returning one doc
      mockCollection.aggregate.mockReturnValue({
        toArray: vi
          .fn()
          .mockResolvedValue([
            { _id: '1', title: 'VectorDoc', content: 'C', type: 'NOTE', score: 0.8 },
          ]),
      });
      // Mock text search returning two docs, one overlapping
      mockCollection.toArray.mockResolvedValue([
        { _id: '1', title: 'VectorDoc', content: 'C', type: 'NOTE', score: 0.5 },
        { _id: '2', title: 'TextDoc', content: 'C', type: 'NOTE', score: 0.6 },
      ]);

      const results = await searchKnowledgeHybrid('query', [0.1], 10, 'NOTE');

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1'); // Overlapping result gets higher combined score
      expect(results[1].id).toBe('2');
    });

    it('should handle vector search failures gracefully', async () => {
      mockCollection.aggregate.mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Atlas disabled')),
      });
      mockCollection.toArray.mockResolvedValue([
        { _id: '2', title: 'TextDoc', content: 'C', type: 'NOTE', score: 0.6 },
      ]);

      const results = await searchKnowledgeHybrid('query', [0.1], 10);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });
  });

  describe('isVectorSearchAvailable', () => {
    it('should return true if documents with embeddings exist', async () => {
      mockCollection.countDocuments.mockResolvedValue(5);
      expect(await isVectorSearchAvailable()).toBe(true);
    });

    it('should return false if count is 0', async () => {
      mockCollection.countDocuments.mockResolvedValue(0);
      expect(await isVectorSearchAvailable()).toBe(false);
    });
  });
});
