export type EmbeddingServiceConfig = {
    enabled: boolean;
    provider: "ollama" | "openai";
    model: string;
    ollamaUrl: string;
    autoStart: boolean;
    timeout: number;
    cacheEnabled: boolean;
    cacheTTL: number;
};
