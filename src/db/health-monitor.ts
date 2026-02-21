import { getDatabase } from "./client.js";
import type { HealthCheckConfig } from "./health-monitor.type.js";

let healthCheckInterval: ReturnType<typeof setInterval> | null = null;
let currentConfig: HealthCheckConfig | null = null;

export function startHealthMonitor(config: HealthCheckConfig): void {
  if (!config.enabled) {
    return;
  }

  if (healthCheckInterval) {
    stopHealthMonitor();
  }

  currentConfig = config;

  const runHealthCheck = async () => {
    try {
      const db = getDatabase();
      await db.command({ ping: 1 });
    } catch (error) {
      console.error("Health check failed:", error);
    }
  };

  runHealthCheck();

  healthCheckInterval = setInterval(runHealthCheck, config.intervalMs);
}

export function stopHealthMonitor(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

export function restartHealthMonitor(newConfig: HealthCheckConfig): void {
  stopHealthMonitor();
  startHealthMonitor(newConfig);
}

export function isHealthMonitorRunning(): boolean {
  return healthCheckInterval !== null;
}

export function getHealthMonitorStatus(): {
  running: boolean;
  intervalMs: number | null;
} {
  return {
    running: isHealthMonitorRunning(),
    intervalMs: currentConfig?.intervalMs ?? null,
  };
}
