/**
 * Health Monitor Tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getHealthMonitorStatus,
  isHealthMonitorRunning,
  restartHealthMonitor,
  startHealthMonitor,
  stopHealthMonitor,
} from '../../init/health-monitor.js';

vi.mock('../../db/client.js', () => ({
  getDatabase: vi.fn().mockReturnValue({
    command: vi.fn().mockResolvedValue({}),
  }),
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

describe('Health Monitor', () => {
  beforeEach(() => {
    stopHealthMonitor();
    vi.useFakeTimers();
  });

  afterEach(() => {
    stopHealthMonitor();
    vi.useRealTimers();
  });

  it('should not start when disabled', () => {
    startHealthMonitor({ enabled: false, intervalMs: 60000, timeoutMs: 5000 });
    expect(isHealthMonitorRunning()).toBe(false);
  });

  it('should start when enabled', () => {
    startHealthMonitor({ enabled: true, intervalMs: 60000, timeoutMs: 5000 });
    expect(isHealthMonitorRunning()).toBe(true);
  });

  it('should stop running health monitor', () => {
    startHealthMonitor({ enabled: true, intervalMs: 60000, timeoutMs: 5000 });
    stopHealthMonitor();
    expect(isHealthMonitorRunning()).toBe(false);
  });

  it('should restart with new config', () => {
    startHealthMonitor({ enabled: true, intervalMs: 60000, timeoutMs: 5000 });
    restartHealthMonitor({ enabled: true, intervalMs: 30000, timeoutMs: 5000 });
    expect(isHealthMonitorRunning()).toBe(true);
  });

  it('should return correct status', () => {
    const status = getHealthMonitorStatus();
    expect(status).toHaveProperty('running');
    expect(status).toHaveProperty('intervalMs');
  });
});
