import { ensureOllamaRunning, checkOllamaStatus } from "./launcher.js";
import { OllamaClient } from "./ollama-client.js";
import { Embedder } from "./embedder.js";
import type { EmbedderConfig, ServiceStatus } from "./embeddings.type.js";
import type { EmbeddingServiceConfig } from "./services.type.js";

let embedder: Embedder | null = null;
let config: EmbedderConfig | null = null;

export async function initializeEmbeddingService(
  cfg: EmbeddingServiceConfig,
): Promise<{ embedder: Embedder; status: ServiceStatus }> {
  config = {
    enabled: cfg.enabled,
    provider: cfg.provider,
    model: cfg.model,
    ollamaUrl: cfg.ollamaUrl,
    autoStart: cfg.autoStart,
    timeout: cfg.timeout,
    cacheEnabled: cfg.cacheEnabled,
    cacheTTL: cfg.cacheTTL,
  };

  if (!cfg.enabled) {
    return {
      embedder: null as any,
      status: { available: false, error: "Embedding service disabled" },
    };
  }

  const launcherResult = await ensureOllamaRunning({
    ollamaUrl: cfg.ollamaUrl,
    timeout: cfg.timeout,
    autoStart: cfg.autoStart,
    maxRetries: 3,
    retryDelay: 3000,
  });

  if (!launcherResult.available) {
    return {
      embedder: null as any,
      status: { available: false, error: launcherResult.message },
    };
  }

  const client = new OllamaClient({
    baseUrl: cfg.ollamaUrl,
    timeout: cfg.timeout,
  });

  embedder = new Embedder(config, client);

  return {
    embedder,
    status: { available: true, model: cfg.model },
  };
}

export async function generateEmbedding(
  title: string,
  content: string,
): Promise<{ embedding?: number[]; warning?: string }> {
  if (!embedder || !config?.enabled) {
    return {
      warning: "Embedding service unavailable - semantic features disabled",
    };
  }

  try {
    const text = embedder.generateTextForEmbedding(title, content);
    const result = await embedder.generateEmbedding(text);
    return { embedding: result.embedding };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      warning: `Embedding generation failed: ${message}`,
    };
  }
}

export async function generateQueryEmbedding(
  query: string,
): Promise<{ embedding?: number[]; warning?: string }> {
  if (!embedder || !config?.enabled) {
    return {
      warning: "Embedding service unavailable - semantic search disabled",
    };
  }

  try {
    const result = await embedder.generateEmbedding(query);
    return { embedding: result.embedding };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      warning: `Query embedding failed: ${message}`,
    };
  }
}

export async function getEmbeddingStatus(): Promise<ServiceStatus> {
  if (!config?.enabled) {
    return { available: false, error: "Embedding service disabled" };
  }

  if (!embedder) {
    return { available: false, error: "Embedder not initialized" };
  }

  const available = await checkOllamaStatus(config.ollamaUrl, 5000);

  return {
    available,
    model: config.model,
    error: available ? undefined : "Ollama is not responding",
  };
}

export function isEmbeddingEnabled(): boolean {
  return config?.enabled ?? false;
}
