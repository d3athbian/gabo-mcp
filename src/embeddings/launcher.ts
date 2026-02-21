import { spawn } from "child_process";
import { OllamaClient } from "./ollama-client.js";
import type { LauncherConfig } from "./launcher.type.js";

let ollamaProcess: ReturnType<typeof spawn> | null = null;
let isStarting = false;

export async function ensureOllamaRunning(
  config: LauncherConfig,
): Promise<{ available: boolean; message: string }> {
  const client = new OllamaClient({
    baseUrl: config.ollamaUrl,
    timeout: config.timeout,
  });

  const available = await client.checkConnection();

  if (available) {
    return {
      available: true,
      message: "Ollama is running",
    };
  }

  if (!config.autoStart) {
    return {
      available: false,
      message:
        "Ollama is not running and auto-start is disabled. Start with: ollama serve",
    };
  }

  if (isStarting) {
    return {
      available: false,
      message: "Ollama is starting...",
    };
  }

  isStarting = true;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      await startOllamaService();

      await new Promise((resolve) => setTimeout(resolve, config.retryDelay));

      const started = await client.checkConnection();
      if (started) {
        isStarting = false;
        return {
          available: true,
          message: `Ollama started successfully (attempt ${attempt})`,
        };
      }
    } catch (error) {
      console.error(`Ollama start attempt ${attempt} failed:`, error);
    }
  }

  isStarting = false;

  return {
    available: false,
    message: `Failed to start Ollama after ${config.maxRetries} attempts. Run 'ollama serve' manually.`,
  };
}

async function startOllamaService(): Promise<void> {
  return new Promise((resolve, reject) => {
    ollamaProcess = spawn("ollama", ["serve"], {
      detached: true,
      stdio: "ignore",
    });

    ollamaProcess.on("error", (error) => {
      reject(error);
    });

    ollamaProcess.on("spawn", () => {
      ollamaProcess?.unref();
      resolve();
    });

    setTimeout(() => {
      reject(new Error("Ollama spawn timeout"));
    }, 5000);
  });
}

export async function checkOllamaStatus(
  ollamaUrl: string,
  timeout: number,
): Promise<boolean> {
  const client = new OllamaClient({
    baseUrl: ollamaUrl,
    timeout,
  });
  return client.checkConnection();
}
