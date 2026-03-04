import { beforeEach, describe, expect, it, vi } from 'vitest';
import { closeDatabase } from '../db/client.js';
import { stopHealthMonitor } from '../init/health-monitor.js';
import { gracefulShutdown, registerShutdownHandlers } from './lifecycle.js';
import { logger } from './logger/index.js';

vi.mock('../db/client.js', () => ({
  closeDatabase: vi.fn(),
}));

vi.mock('../init/health-monitor.js', () => ({
  stopHealthMonitor: vi.fn(),
}));

vi.mock('./logger/index.js', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

describe('Lifecycle Utils', () => {
  let originalExit: any;
  let exitMock: any;

  beforeEach(() => {
    vi.resetAllMocks();
    originalExit = process.exit;
    exitMock = vi.fn() as any;
    process.exit = exitMock;
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  describe('gracefulShutdown', () => {
    it('should complete successfully and exit with 0', async () => {
      (closeDatabase as any).mockResolvedValue(undefined);
      await gracefulShutdown('SIGTERM');

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('shutting down'));
      expect(stopHealthMonitor).toHaveBeenCalled();
      expect(closeDatabase).toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(0);
    });

    it('should handle errors and exit with 1', async () => {
      (closeDatabase as any).mockRejectedValue(new Error('DB failure'));
      await gracefulShutdown('SIGINT');

      expect(logger.error).toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(1);
    });
  });

  describe('registerShutdownHandlers', () => {
    let onSpy: any;
    let stdinOnSpy: any;

    beforeEach(() => {
      onSpy = vi.spyOn(process, 'on').mockImplementation((_event, _handler) => {
        return process;
      });
      stdinOnSpy = vi.spyOn(process.stdin, 'on').mockImplementation((_event, _handler) => {
        return process.stdin;
      });
    });

    afterEach(() => {
      onSpy.mockRestore();
      stdinOnSpy.mockRestore();
    });

    it('should register process listeners', () => {
      registerShutdownHandlers();

      expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(stdinOnSpy).toHaveBeenCalledWith('end', expect.any(Function));
    });
  });
});
