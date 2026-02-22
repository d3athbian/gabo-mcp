export type EmbedderConfig = {
  enabled: boolean;
  provider: 'ollama' | 'openai';
  model: string;
  ollamaUrl: string;
  autoStart: boolean;
  timeout: number;
  cacheEnabled: boolean;
  cacheTTL: number;
};

export type EmbeddingResult = {
  embedding: number[];
  model: string;
  tokens?: number;
};

export type EmbeddingCacheEntry = {
  embedding: number[];
  timestamp: number;
};

export type ServiceStatus = {
  available: boolean;
  model?: string;
  error?: string;
};
