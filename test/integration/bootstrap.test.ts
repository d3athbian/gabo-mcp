import { bootstrap, shutdown } from '../../src/bootstrap';
import {
  deleteKnowledge,
  getKnowledge,
  listKnowledge,
  searchKnowledge,
  storeKnowledge,
} from '../../src/db/queries';
import type { KnowledgeType } from '../../src/types';

describe('Integration: bootstrap API key and CRUD flow', () => {
  const testDocIds: string[] = [];

  beforeAll(async () => {
    await bootstrap();
  });

  afterAll(async () => {
    for (const id of testDocIds) {
      try {
        await deleteKnowledge(id);
      } catch {
        // Ignore cleanup errors
      }
    }
    await shutdown();
  });

  test('bootstraps API key from environment', async () => {
    const key = process.env.MCP_API_KEY;
    expect(typeof key).toBe('string');
    expect(key?.length).toBeGreaterThan(0);
  });

  test('full CRUD: save → list → get → search → delete', async () => {
    const doc1 = await storeKnowledge({
      type: 'TESTING' as KnowledgeType,
      title: 'Integration Test Doc',
      content: 'This is a test document for integration testing',
      tags: ['integration', 'crud'],
      source: 'test',
    });

    const doc2 = await storeKnowledge({
      type: 'TESTING' as KnowledgeType,
      title: 'Second Test Doc',
      content: 'Another document for testing purposes',
      tags: ['test', 'crud'],
      source: 'test',
    });

    expect(doc1).toHaveProperty('id');
    expect(doc2).toHaveProperty('id');
    testDocIds.push(doc1.id, doc2.id);

    const listResult = await listKnowledge(undefined, 10, 0);
    expect(Array.isArray(listResult.data)).toBe(true);
    expect(listResult.count).toBeGreaterThanOrEqual(2);

    const getResult = await getKnowledge(doc1.id);
    expect(getResult).toHaveProperty('id');
    expect(getResult.title).toBe('Integration Test Doc');

    const searchResult = await searchKnowledge({
      query: 'integration',
      limit: 10,
      offset: 0,
    });
    expect(Array.isArray(searchResult)).toBe(true);
    expect(searchResult.length).toBeGreaterThanOrEqual(1);

    await deleteKnowledge(doc1.id);
    const index = testDocIds.indexOf(doc1.id);
    if (index > -1) testDocIds.splice(index, 1);

    await expect(getKnowledge(doc1.id)).rejects.toThrow();
  });
});
