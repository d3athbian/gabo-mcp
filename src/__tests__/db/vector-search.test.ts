/**
 * Vector Search Tests
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('../../db/client.js', () => ({
  getKnowledgeEntriesCollection: vi.fn().mockReturnValue({
    aggregate: vi.fn().mockReturnValue({
      toArray: vi.fn().mockResolvedValue([]),
    }),
    countDocuments: vi.fn().mockResolvedValue(0),
  }),
}));

describe('isVectorSearchAvailable', () => {
  it('should return false when no embeddings exist', async () => {
    const { isVectorSearchAvailable } = await import('../../db/vector-search.js');
    const result = await isVectorSearchAvailable();
    expect(result).toBe(false);
  });
});
