/**
 * Test Mocks - Reusable mocks for integration tests
 */

import { ObjectId } from 'mongodb';
import { vi } from 'vitest';

type EmbeddingResult = { embedding?: number[]; warning?: string };

export const mockStoreKnowledge = vi.fn();
export const mockSearchKnowledge = vi.fn();
export const mockGetKnowledge = vi.fn();
export const mockListKnowledge = vi.fn();
export const mockDeleteKnowledge = vi.fn();
export const mockSearchKnowledgeVector = vi.fn();
export const mockGenerateEmbedding =
  vi.fn<(_title: string, _content: string) => Promise<EmbeddingResult>>();
export const mockGenerateQueryEmbedding = vi.fn<(_query: string) => Promise<EmbeddingResult>>();
export const mockSanitizeAllFields =
  vi.fn<
    (_params?: unknown) => {
      allowed: boolean;
      violations: Array<{ category: string }>;
      errorMessage?: string;
    }
  >();

export const testEntry = {
  id: '507f1f77bcf86cd799439011',
  type: 'PATTERN' as const,
  title: 'Test Pattern',
  content: 'Test content',
  tags: ['test'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function setupMocks() {
  vi.mock('../../db/client.js', () => ({
    connectToDatabase: vi.fn().mockResolvedValue({}),
    getDatabase: vi.fn().mockReturnValue({
      collection: vi.fn().mockReturnValue({
        createIndex: vi.fn().mockResolvedValue({}),
        find: vi.fn(),
        insertOne: vi.fn().mockResolvedValue({ insertedId: new ObjectId() }),
        findOne: vi.fn(),
        deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
        countDocuments: vi.fn().mockResolvedValue(0),
        aggregate: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
        indexes: vi.fn().mockResolvedValue([]),
        createSearchIndex: vi.fn().mockResolvedValue({}),
      }),
    }),
    getKnowledgeEntriesCollection: vi.fn().mockReturnValue({
      insertOne: vi.fn().mockResolvedValue({
        insertedId: new ObjectId('507f1f77bcf86cd799439011'),
      }),
      findOne: vi.fn(),
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      aggregate: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      countDocuments: vi.fn().mockResolvedValue(0),
    }),
    getApiKeysCollection: vi.fn(),
    getKnowledgeAuditLogCollection: vi.fn(),
    setupIndexes: vi.fn().mockResolvedValue({}),
    checkDatabaseHealth: vi.fn().mockResolvedValue(true),
    closeDatabase: vi.fn().mockResolvedValue({}),
  }));

  vi.mock('../../db/queries.js', () => ({
    storeKnowledge: (...args: [unknown]) => mockStoreKnowledge(...args),
    searchKnowledge: (...args: [unknown]) => mockSearchKnowledge(...args),
    getKnowledge: (...args: [unknown]) => mockGetKnowledge(...args),
    listKnowledge: (...args: [unknown]) => mockListKnowledge(...args),
    updateKnowledge: vi.fn(),
    deleteKnowledge: (...args: [unknown]) => mockDeleteKnowledge(...args),
    getUserTags: vi.fn().mockResolvedValue([]),
  }));

  vi.mock('../../db/vector-search.js', () => ({
    searchKnowledgeVector: (...args: [unknown]) => mockSearchKnowledgeVector(...args),
    isVectorSearchAvailable: vi.fn().mockResolvedValue(false),
  }));

  vi.mock('../../embeddings/index.js', () => ({
    initializeEmbeddingService: vi.fn().mockResolvedValue({
      embedder: null,
      status: {
        available: false,
        error: 'Embedding service disabled in tests',
      },
    }),
    generateEmbedding: (...args: [string, string]) => mockGenerateEmbedding(...args),
    generateQueryEmbedding: (...args: [string]) => mockGenerateQueryEmbedding(...args),
    getEmbeddingStatus: vi.fn().mockResolvedValue({ available: false }),
    isEmbeddingEnabled: vi.fn().mockReturnValue(false),
  }));

  vi.mock('../../db/audit-log.js', () => ({
    recordAuditLog: vi.fn().mockResolvedValue({}),
    setupAuditLogIndex: vi.fn().mockResolvedValue({}),
  }));

  vi.mock('../../db/api-keys.js', () => ({
    findApiKeyByKey: vi.fn().mockResolvedValue(null),
    hasAnyApiKeys: vi.fn().mockResolvedValue(true),
    createApiKey: vi.fn().mockResolvedValue({}),
  }));

  vi.mock('../../utils/logger/index.js', () => ({
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      cleanup: vi.fn(),
    },
  }));

  vi.mock('../../utils/api-key/index.js', () => ({
    ensurePepperExists: vi.fn(),
    generateApiKey: vi.fn().mockReturnValue('gabo_test_key_12345678'),
    hashApiKey: vi.fn().mockResolvedValue('hashed_test_key'),
    isValidApiKeyFormat: vi.fn().mockReturnValue(true),
    writeEnvVariable: vi.fn(),
  }));

  vi.mock('../../middleware/sanitization/index.js', () => ({
    sanitizeAllFields: () => mockSanitizeAllFields(),
  }));
}

export function setupTestEnv() {
  vi.stubEnv('MCP_API_KEY', 'gabo_test_key_12345678');
  vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/test');
  vi.stubEnv('NODE_ENV', 'test');
  mockSanitizeAllFields.mockReturnValue({ allowed: true, violations: [] });
  mockGenerateEmbedding.mockResolvedValue({ embedding: Array(768).fill(0.1) });
  mockGenerateQueryEmbedding.mockResolvedValue({
    embedding: Array(768).fill(0.1),
  });
}

export function parseResult(result: unknown) {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid result');
  }
  const r = result as { content: Array<{ text: string }> };
  return JSON.parse(r.content[0].text);
}
