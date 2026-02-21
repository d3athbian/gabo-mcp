import { OllamaClient } from "./ollama-client.js";
import type {
  EmbedderConfig,
  EmbeddingResult,
  EmbeddingCacheEntry,
} from "./embeddings.type.js";

export class Embedder {
  private client: OllamaClient;
  private config: EmbedderConfig;
  private cache: Map<string, EmbeddingCacheEntry> = new Map();

  constructor(config: EmbedderConfig, client: OllamaClient) {
    this.config = config;
    this.client = client;
  }

  private getCacheKey(text: string): string {
    return Buffer.from(text).toString("base64");
  }

  private getFromCache(text: string): number[] | null {
    if (!this.config.cacheEnabled) {
      return null;
    }

    const key = this.getCacheKey(text);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const ageInSeconds = (now - entry.timestamp) / 1000;

    if (ageInSeconds > this.config.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.embedding;
  }

  private setCache(text: string, embedding: number[]): void {
    if (!this.config.cacheEnabled) {
      return;
    }

    const key = this.getCacheKey(text);
    this.cache.set(key, {
      embedding,
      timestamp: Date.now(),
    });
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const cached = this.getFromCache(text);
    if (cached) {
      return {
        embedding: cached,
        model: this.config.model,
      };
    }

    const result = await this.client.generateEmbedding(text, this.config.model);
    this.setCache(text, result.embedding);

    return result;
  }

  generateTextForEmbedding(title: string, content: string): string {
    return `${title}. ${content}`.slice(0, 8000);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}
