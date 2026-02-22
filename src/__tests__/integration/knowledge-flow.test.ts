/**
 * Integration Tests - Knowledge Management Flow
 * Modularized: mocks extracted to ./mocks.ts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockDeleteKnowledge,
  mockGetKnowledge,
  mockListKnowledge,
  mockSanitizeAllFields,
  mockSearchKnowledge,
  mockSearchKnowledgeVector,
  mockStoreKnowledge,
  parseResult,
  setupMocks,
  setupTestEnv,
  testEntry,
} from './mocks.js';

setupMocks();

describe('Knowledge Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupTestEnv();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Save Knowledge Flow', () => {
    it('should save a new knowledge entry', async () => {
      mockStoreKnowledge.mockResolvedValueOnce({
        ...testEntry,
        id: '507f1f77bcf86cd799439011',
      });
      mockSearchKnowledgeVector.mockResolvedValueOnce([]);
      const { saveKnowledgeTool } = await import('../../tools/index.js');
      const result = await (saveKnowledgeTool.handler as any)({
        type: 'PATTERN',
        title: 'Test',
        content: 'Content',
      });
      const parsed = parseResult(result);
      expect(parsed.success).toBe(true);
      expect(parsed.id).toBe('507f1f77bcf86cd799439011');
    });

    it('should return warning when similar entry detected', async () => {
      mockStoreKnowledge.mockResolvedValueOnce(testEntry);
      mockSearchKnowledgeVector.mockResolvedValueOnce([
        { id: '1', title: 'Similar', type: 'PATTERN', embedding_score: 0.92 },
      ]);
      const { saveKnowledgeTool } = await import('../../tools/index.js');
      const result = await (saveKnowledgeTool.handler as any)({
        type: 'PATTERN',
        title: 'New',
        content: 'Content',
      });
      const parsed = parseResult(result);
      expect(parsed.similar_entries).toBeDefined();
    });
  });

  describe('Search Knowledge Flow', () => {
    it('should search with text mode', async () => {
      mockSearchKnowledge.mockResolvedValueOnce([
        {
          id: '1',
          title: 'TypeScript',
          content: 'Content',
          type: 'PATTERN',
          created_at: '2024-01-01',
        },
      ]);
      const { searchTool } = await import('../../tools/index.js');
      const result = await (searchTool.handler as any)({
        query: 'typescript',
        mode: 'text',
        limit: 10,
      });
      expect(parseResult(result).mode).toBe('text');
    });

    it('should search with semantic mode', async () => {
      mockSearchKnowledgeVector.mockResolvedValueOnce([
        {
          id: '1',
          title: 'Similar',
          content: 'Content',
          type: 'PATTERN',
          created_at: '2024-01-01',
          embedding_score: 0.85,
        },
      ]);
      const { searchTool } = await import('../../tools/index.js');
      const result = await (searchTool.handler as any)({
        query: 'async pattern',
        mode: 'semantic',
        limit: 10,
      });
      expect(parseResult(result).mode).toBe('semantic');
    });
  });

  describe('List Knowledge Flow', () => {
    it('should list knowledge entries', async () => {
      mockListKnowledge.mockResolvedValueOnce({
        data: [{ ...testEntry }],
        count: 1,
      });
      const { listKnowledgeTool } = await import('../../tools/index.js');
      const result = await (listKnowledgeTool.handler as any)({
        limit: 10,
        offset: 0,
      });
      expect(parseResult(result).total).toBe(1);
    });
  });

  describe('Get Knowledge Flow', () => {
    it('should get knowledge by ID', async () => {
      mockGetKnowledge.mockResolvedValueOnce(testEntry);
      const { getKnowledgeTool } = await import('../../tools/index.js');
      const result = await (getKnowledgeTool.handler as any)({
        id: '507f1f77bcf86cd799439011',
        format: 'json',
      });
      expect(parseResult(result).entry.id).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('Delete Knowledge Flow', () => {
    it('should delete knowledge entry', async () => {
      mockDeleteKnowledge.mockResolvedValueOnce(undefined);
      const { deleteKnowledgeTool } = await import('../../tools/index.js');
      const result = await (deleteKnowledgeTool.handler as any)({
        id: '507f1f77bcf86cd799439011',
      });
      expect(parseResult(result).message).toContain('deleted');
    });
  });

  describe('Sanitization Integration', () => {
    it('should block save with credentials detected', async () => {
      mockSanitizeAllFields.mockReturnValueOnce({
        allowed: false,
        violations: [{ category: 'credentials' }],
        errorMessage: 'Blocked',
      });
      const { saveKnowledgeTool } = await import('../../tools/index.js');
      const result = await (saveKnowledgeTool.handler as any)({
        type: 'PATTERN',
        title: 'API',
        content: 'api_key=sk-123',
      });
      expect(result.isError).toBe(true);
      expect(parseResult(result).code).toBe('SANITIZATION_ERROR');
    });
  });

  describe('Full Workflow Integration', () => {
    it('should complete save -> search -> get -> delete', async () => {
      mockStoreKnowledge.mockResolvedValueOnce(testEntry);
      mockSearchKnowledgeVector.mockResolvedValueOnce([]);
      mockSearchKnowledge.mockResolvedValueOnce([testEntry]);
      mockGetKnowledge.mockResolvedValueOnce(testEntry);
      mockDeleteKnowledge.mockResolvedValueOnce(undefined);

      const { saveKnowledgeTool, searchTool, getKnowledgeTool, deleteKnowledgeTool } = await import(
        '../../tools/index.js'
      );

      const saveResult = await (saveKnowledgeTool.handler as any)({
        type: 'PATTERN',
        title: 'Workflow',
        content: 'Content',
      });
      expect(parseResult(saveResult).success).toBe(true);

      const searchResult = await (searchTool.handler as any)({
        query: 'workflow',
        mode: 'text',
        limit: 10,
      });
      expect(parseResult(searchResult).success).toBe(true);

      const getResult = await (getKnowledgeTool.handler as any)({
        id: '507f1f77bcf86cd799439011',
        format: 'json',
      });
      expect(parseResult(getResult).success).toBe(true);

      const deleteResult = await (deleteKnowledgeTool.handler as any)({
        id: '507f1f77bcf86cd799439011',
      });
      expect(parseResult(deleteResult).success).toBe(true);
    });
  });
});
