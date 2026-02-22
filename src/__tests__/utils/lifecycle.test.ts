/**
 * Lifecycle Tests
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('../../db/client.js', () => ({
  closeDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../db/health-monitor.js', () => ({
  stopHealthMonitor: vi.fn(),
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

describe('lifecycle', () => {
  it('exports graceful shutdown function', async () => {
    const { gracefulShutdown } = await import('../../utils/lifecycle.js');
    expect(typeof gracefulShutdown).toBe('function');
  });

  it('exports register shutdown handlers', async () => {
    const { registerShutdownHandlers } = await import('../../utils/lifecycle.js');
    expect(typeof registerShutdownHandlers).toBe('function');
  });

  it('imports SHUTDOWN_SIGNALS from constants', async () => {
    const { SHUTDOWN_SIGNALS } = await import('../../config/constants.js');
    expect(SHUTDOWN_SIGNALS).toContain('SIGINT');
    expect(SHUTDOWN_SIGNALS).toContain('SIGTERM');
  });
});
