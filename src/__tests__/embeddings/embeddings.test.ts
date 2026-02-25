/**
 * Embeddings Services Tests
 */

import { describe, expect, it, vi } from 'vitest';
import {
  generateEmbedding,
  generateQueryEmbedding,
  getEmbeddingStatus,
  initializeEmbeddingService,
} from '../../embeddings/services.js';

vi.mock('../../embeddings/launcher.js', () => ({
  ensureOllamaRunning: vi.fn().mockResolvedValue({
    available: false,
    message: 'Ollama is not running',
  }),
  checkOllamaStatus: vi.fn().mockResolvedValue(false),
}));

vi.mock('../../embeddings/ollama-client.js', () => ({
  OllamaClient: vi.fn().mockImplementation(() => ({
    checkConnection: vi.fn().mockResolvedValue(false),
    generate: vi.fn().mockResolvedValue({
      embedding: Array(768).fill(0.1),
    }),
  })),
}));

vi.mock('../../embeddings/embedder.js', () => ({
  Embedder: vi.fn().mockImplementation(() => ({
    generateTextForEmbedding: vi.fn().mockReturnValue('combined text'),
    generateEmbedding: vi.fn().mockResolvedValue({
      embedding: Array(768).fill(0.1),
    }),
  })),
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

describe('Embedding Services', () => {
  describe('initializeEmbeddingService', () => {
    it('should return disabled status when enabled is false', async () => {
      const result = await initializeEmbeddingService({
        enabled: false,
        provider: 'ollama',
        model: 'nomic-embed-text',
        ollamaUrl: 'http://localhost:11434',
        timeout: 30000,
        autoStart: false,
        cacheEnabled: false,
        cacheTTL: 3600,
      });

      expect(result.status.available).toBe(false);
      expect(result.status.error).toBe('Embedding service disabled');
      expect(result.embedder).toBeNull();
    });

    it('should handle when Ollama is not available', async () => {
      const { ensureOllamaRunning } = await import('../../embeddings/launcher.js');
      vi.mocked(ensureOllamaRunning).mockResolvedValueOnce({
        available: false,
        message: 'Ollama is not running',
      });

      const result = await initializeEmbeddingService({
        enabled: true,
        provider: 'ollama',
        model: 'nomic-embed-text',
        ollamaUrl: 'http://localhost:11434',
        timeout: 30000,
        autoStart: false,
        cacheEnabled: false,
        cacheTTL: 3600,
      });

      expect(result.status.available).toBe(false);
      expect(result.status.error).toBe('Ollama is not running');
    });
  });

  describe('generateEmbedding', () => {
    it('should return warning when service unavailable', async () => {
      const result = await generateEmbedding('title', 'content');

      expect(result).toHaveProperty('warning');
      expect(result.warning).toContain('unavailable');
      expect(result.embedding).toBeUndefined();
    });
  });

  describe('generateQueryEmbedding', () => {
    it('should return warning when service unavailable', async () => {
      const result = await generateQueryEmbedding('test query');

      expect(result).toHaveProperty('warning');
      expect(result.warning).toContain('disabled');
      expect(result.embedding).toBeUndefined();
    });
  });

  describe('getEmbeddingStatus', () => {
    it('should return error when embedder not initialized', async () => {
      const status = await getEmbeddingStatus();

      expect(status.available).toBe(false);
      expect(status.error).toMatch(/disabled|not initialized/);
    });
  });
});
