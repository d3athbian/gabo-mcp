/**
 * Database Queries Tests
 */

import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { KnowledgeType } from '../../types.js';

vi.mock('../../db/client.js', () => ({
  getKnowledgeEntriesCollection: vi.fn(),
  getDatabase: vi.fn(),
}));

const mockCollection = {
  insertOne: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
  deleteOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  countDocuments: vi.fn(),
  distinct: vi.fn(),
};

const { getKnowledgeEntriesCollection } = await import('../../db/client.js');

describe('storeKnowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getKnowledgeEntriesCollection as any).mockReturnValue(mockCollection);
    mockCollection.insertOne.mockResolvedValue({
      insertedId: new ObjectId('507f1f77bcf86cd799439011'),
    });
  });

  it('stores knowledge entry successfully', async () => {
    const { storeKnowledge } = await import('../../db/queries.js');
    const input = {
      type: 'PATTERN' as KnowledgeType,
      title: 'Test Pattern',
      content: 'This is a test pattern',
      tags: ['test', 'pattern'],
      source: 'test-source',
    };

    const result = await storeKnowledge(input);

    expect(result.id).toBe('507f1f77bcf86cd799439011');
    expect(result.type).toBe('PATTERN');
    expect(result.title).toBe('Test Pattern');
    expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
  });

  it('trims title and content', async () => {
    const { storeKnowledge } = await import('../../db/queries.js');
    const input = {
      type: 'PATTERN' as KnowledgeType,
      title: '  Test Title  ',
      content: '  Test Content  ',
      tags: [],
      source: 'test',
    };

    const result = await storeKnowledge(input);

    expect(result.title).toBe('Test Title');
    expect(result.content).toBe('Test Content');
  });

  it('defaults empty tags to empty array', async () => {
    const { storeKnowledge } = await import('../../db/queries.js');
    const input = {
      type: 'PATTERN' as KnowledgeType,
      title: 'Test',
      content: 'Content',
      source: 'test',
    };

    const result = await storeKnowledge(input);

    expect(result.tags).toEqual([]);
  });

  it('generates timestamps', async () => {
    const { storeKnowledge } = await import('../../db/queries.js');
    const input = {
      type: 'PATTERN' as KnowledgeType,
      title: 'Test',
      content: 'Content',
      source: 'test',
    };

    const result = await storeKnowledge(input);

    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
  });
});

describe('searchKnowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getKnowledgeEntriesCollection as any).mockReturnValue(mockCollection);
  });

  it('searches by keyword in title', async () => {
    mockCollection.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        {
          _id: new ObjectId(),
          title: 'Test Result',
          content: 'Content',
          type: 'PATTERN',
          created_at: '2024-01-01',
        },
      ]),
    });

    const { searchKnowledge } = await import('../../db/queries.js');
    const results = await searchKnowledge({
      query: 'Test',
      limit: 10,
      offset: 0,
    });

    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Test Result');
  });

  it('searches by keyword in content', async () => {
    mockCollection.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        {
          _id: new ObjectId(),
          title: 'Result',
          content: 'Matching content',
          type: 'PATTERN',
          created_at: '2024-01-01',
        },
      ]),
    });

    const { searchKnowledge } = await import('../../db/queries.js');
    const results = await searchKnowledge({
      query: 'Matching',
      limit: 10,
      offset: 0,
    });

    expect(results.length).toBe(1);
    expect(results[0].content).toBe('Matching content');
  });

  it('maps results to correct format', async () => {
    const docId = new ObjectId();
    mockCollection.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        {
          _id: docId,
          title: 'Test',
          content: 'Content',
          type: 'PATTERN',
          tags: ['tag1'],
          source: 'source',
          visibility: 'private',
          embedding: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-02',
        },
      ]),
    });

    const { searchKnowledge } = await import('../../db/queries.js');
    const results = await searchKnowledge({
      query: 'test',
      limit: 10,
      offset: 0,
    });

    expect(results[0].id).toBe(docId.toString());
    expect(results[0].relevance_score).toBeUndefined();
    expect(results[0].embedding_score).toBeUndefined();
  });
});

describe('getKnowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getKnowledgeEntriesCollection as any).mockReturnValue(mockCollection);
  });

  it('retrieves knowledge entry by ID', async () => {
    const docId = new ObjectId('507f1f77bcf86cd799439011');
    mockCollection.findOne.mockResolvedValue({
      _id: docId,
      title: 'Test',
      content: 'Content',
      type: 'PATTERN',
      tags: ['test'],
      source: 'source',
      visibility: 'private',
      embedding: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    });

    const { getKnowledge } = await import('../../db/queries.js');
    const result = await getKnowledge('507f1f77bcf86cd799439011');

    expect(result.id).toBe('507f1f77bcf86cd799439011');
    expect(result.title).toBe('Test');
  });

  it('throws error for non-existent entry', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const { getKnowledge } = await import('../../db/queries.js');
    await expect(getKnowledge('507f1f77bcf86cd799439011')).rejects.toThrow(
      'Knowledge entry not found'
    );
  });

  it('handles invalid ObjectId', async () => {
    const { getKnowledge } = await import('../../db/queries.js');
    await expect(getKnowledge('invalid-id')).rejects.toThrow('Invalid ObjectId');
  });
});

describe('listKnowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getKnowledgeEntriesCollection as any).mockReturnValue(mockCollection);
  });

  it('lists knowledge entries', async () => {
    mockCollection.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        {
          _id: new ObjectId(),
          title: 'Test1',
          content: 'Content1',
          type: 'PATTERN',
          created_at: '2024-01-01',
          tags: [],
          source: '',
          visibility: 'private',
          embedding: [],
          updated_at: '2024-01-01',
        },
        {
          _id: new ObjectId(),
          title: 'Test2',
          content: 'Content2',
          type: 'PATTERN',
          created_at: '2024-01-02',
          tags: [],
          source: '',
          visibility: 'private',
          embedding: [],
          updated_at: '2024-01-02',
        },
      ]),
    });
    mockCollection.countDocuments.mockResolvedValue(2);

    const { listKnowledge } = await import('../../db/queries.js');
    const result = await listKnowledge();

    expect(result.data.length).toBe(2);
    expect(result.count).toBe(2);
  });

  it('applies pagination', async () => {
    mockCollection.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
    });
    mockCollection.countDocuments.mockResolvedValue(100);

    const { listKnowledge } = await import('../../db/queries.js');
    const result = await listKnowledge(undefined, 10, 20);

    expect(result.data.length).toBe(0);
  });
});

describe('deleteKnowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getKnowledgeEntriesCollection as any).mockReturnValue(mockCollection);
  });

  it('deletes knowledge entry', async () => {
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const { deleteKnowledge } = await import('../../db/queries.js');
    await deleteKnowledge('507f1f77bcf86cd799439011');

    expect(mockCollection.deleteOne).toHaveBeenCalledWith({
      _id: expect.any(ObjectId),
    });
  });

  it('throws error for non-existent entry', async () => {
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

    const { deleteKnowledge } = await import('../../db/queries.js');
    await expect(deleteKnowledge('507f1f77bcf86cd799439011')).rejects.toThrow(
      'Knowledge entry not found'
    );
  });
});

describe('getUserTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getKnowledgeEntriesCollection as any).mockReturnValue(mockCollection);
  });

  it('returns sorted unique tags', async () => {
    mockCollection.distinct.mockResolvedValue(['tag3', 'tag1', 'tag2', 'tag1']);

    const { getUserTags } = await import('../../db/queries.js');
    const result = await getUserTags();

    expect(result).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('removes duplicates', async () => {
    mockCollection.distinct.mockResolvedValue(['a', 'b', 'a', 'c', 'b']);

    const { getUserTags } = await import('../../db/queries.js');
    const result = await getUserTags();

    expect(result.length).toBe(3);
  });

  it('sorts alphabetically', async () => {
    mockCollection.distinct.mockResolvedValue(['z', 'a', 'm', 'b']);

    const { getUserTags } = await import('../../db/queries.js');
    const result = await getUserTags();

    expect(result[0]).toBe('a');
    expect(result[result.length - 1]).toBe('z');
  });
});
