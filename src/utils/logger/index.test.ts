import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import { createLogger } from './index.js';
import { config } from '../../config/config.js';

vi.mock('node:fs', () => ({
    existsSync: vi.fn(),
    statSync: vi.fn(),
    unlinkSync: vi.fn(),
    renameSync: vi.fn(),
    appendFileSync: vi.fn(),
    readdirSync: vi.fn(),
}));

describe('Logger', () => {
    let logger: ReturnType<typeof createLogger>;

    beforeEach(() => {
        vi.resetAllMocks();
        logger = createLogger();
    });

    describe('writeLog and rotation', () => {
        it('should append log line', () => {
            (fs.existsSync as any).mockReturnValue(false);
            logger.info('Test info');
            expect(fs.appendFileSync).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('Test info\n'));
        });

        it('should rotate log if size exceeds max', () => {
            (fs.existsSync as any).mockReturnValue(true);
            (fs.statSync as any).mockReturnValue({ size: 10 * 1024 * 1024 + 1 }); // Over 10MB

            logger.warn('Test warning');
            expect(fs.renameSync).toHaveBeenCalled();
        });
    });

    describe('error logging', () => {
        it('should log Error object', () => {
            logger.error('failed', new Error('Oops'));
            expect(fs.appendFileSync).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('ERROR: failed - Oops\n'));
        });

        it('should log string error', () => {
            logger.error('failed', 'Oops');
            expect(fs.appendFileSync).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('ERROR: failed - Oops\n'));
        });
    });

    describe('debug logging', () => {
        it('should not log debug if disabled', () => {
            config.mcpDebug = false;
            logger.debug('dbg msg');
            expect(fs.appendFileSync).not.toHaveBeenCalled();
        });

        it('should log debug if enabled', () => {
            config.mcpDebug = true;
            logger.debug('dbg msg 2');
            expect(fs.appendFileSync).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('DEBUG: dbg msg 2\n'));
        });
    });

    describe('cleanup', () => {
        it('should delete old files', () => {
            (fs.readdirSync as any).mockReturnValue(['gabo-mcp.log']);
            // set modification time to 91 days ago
            (fs.statSync as any).mockReturnValue({
                mtime: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000)
            });

            logger.cleanup();
            expect(fs.unlinkSync).toHaveBeenCalled();
        });

        it('should not delete fresh files', () => {
            (fs.readdirSync as any).mockReturnValue(['gabo-mcp.log']);
            (fs.statSync as any).mockReturnValue({
                mtime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day old
            });

            logger.cleanup();
            expect(fs.unlinkSync).not.toHaveBeenCalled();
        });
    });
});
