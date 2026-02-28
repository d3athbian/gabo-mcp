import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../utils/errors/Error.js';
import { getKnowledgeEntriesCollection } from './client.js';
import {
  deleteKnowledge,
  getKnowledge,
  getUserTags,
  listKnowledge,
  searchKnowledge,
  storeKnowledge,
  updateKnowledge,
} from './queries.js';

vi.mock('./client.js', () => ({
  getKnowledgeEntriesCollection: vi.fn(),
}));

describe('Database Queries: Knowledge', () => {
  let mockCollection: any;

  beforeEach(() => {
    mockCollection = {
      insertOne: vi.fn(),
      find: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      findOne: vi.fn(),
      countDocuments: vi.fn(),
      findOneAndUpdate: vi.fn(),
      deleteOne: vi.fn(),
      distinct: vi.fn(),
    };
    (getKnowledgeEntriesCollection as any).mockReturnValue(mockCollection);
  });

  describe('storeKnowledge', () => {
    it('should store a knowledge entry and return it', async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });

      const input = {
        type: 'NOTE' as const,
        title: ' Test Title ',
        content: ' Test Content ',
        tags: ['test'],
      };

      const result = await storeKnowledge(input as any);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
          content: 'Test Content',
          tags: ['test'],
          visibility: 'private',
        })
      );
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Title');
    });
  });

  describe('searchKnowledge', () => {
    it('should search using regex pattern', async () => {
      mockCollection.toArray.mockResolvedValue([
        { _id: new ObjectId(), title: 'Res', content: 'Cont', type: 'NOTE', created_at: '' },
      ]);

      const result = await searchKnowledge({ query: 'search', type: 'NOTE' } as any);
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          type: 'NOTE',
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Res');
    });
  });

  describe('getKnowledge', () => {
    it('should get knowledge by ID', async () => {
      const id = new ObjectId();
      mockCollection.findOne.mockResolvedValue({
        _id: id,
        title: 'T',
        content: 'C',
      });

      const result = await getKnowledge(id.toString());
      expect(result.title).toBe('T');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: id });
    });

    it('should throw if not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      await expect(getKnowledge(new ObjectId().toString())).rejects.toThrow(AppError);
    });

    it('should throw if invalid ID', async () => {
      await expect(getKnowledge('invalid')).rejects.toThrow('Invalid ObjectId');
    });
  });

  describe('listKnowledge', () => {
    it('should list knowledge entries', async () => {
      mockCollection.toArray.mockResolvedValue([{ _id: new ObjectId(), title: 'T' }]);
      mockCollection.countDocuments.mockResolvedValue(1);

      const result = await listKnowledge('NOTE', 5, 0);
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(mockCollection.find).toHaveBeenCalledWith({ type: 'NOTE' });
    });
  });

  describe('updateKnowledge', () => {
    it('should update knowledge and return doc', async () => {
      const id = new ObjectId();
      mockCollection.findOneAndUpdate.mockResolvedValue({
        _id: id,
        title: 'Updated',
      });

      const result = await updateKnowledge(id.toString(), { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw if doc not found on update', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue(null);
      await expect(updateKnowledge(new ObjectId().toString(), { title: 'X' })).rejects.toThrow(
        AppError
      );
    });
  });

  describe('deleteKnowledge', () => {
    it('should delete knowledge', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
      await deleteKnowledge(new ObjectId().toString());
      expect(mockCollection.deleteOne).toHaveBeenCalled();
    });

    it('should throw if not deleted', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
      await expect(deleteKnowledge(new ObjectId().toString())).rejects.toThrow(AppError);
    });
  });

  describe('getUserTags', () => {
    it('should return unique tags sorted', async () => {
      mockCollection.distinct.mockResolvedValue([
        ['b', 'a'],
        ['c', 'a'],
      ]);
      const result = await getUserTags();
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });
});
