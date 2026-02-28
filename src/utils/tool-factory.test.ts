import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTool } from './tool-factory.js';
import { recordAuditLog } from '../db/audit-log.js';

vi.mock('../db/audit-log.js', () => ({
    recordAuditLog: vi.fn(),
}));

vi.mock('../db/client.js', () => ({
    getKnowledgeAuditLogCollection: vi.fn(),
}));

describe('Tool Factory', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should create tool without audit action', async () => {
        const handler = vi.fn().mockResolvedValue({ isError: false, content: [] });
        const tool = createTool({
            name: 't1',
            title: 'T1',
            description: 'D1',
            inputSchema: {} as any,
        }, handler);

        expect(tool.name).toBe('t1');
        expect(tool.auditAction).toBeUndefined();

        await (tool.handler as Function)({}, { keyId: 'k1' });
        expect(handler).toHaveBeenCalledWith({}, { keyId: 'k1' }, undefined);
        expect(recordAuditLog).not.toHaveBeenCalled();
    });

    it('should apply withAudit if auditAction is provided', async () => {
        const handler = vi.fn().mockResolvedValue({ isError: false, content: [] });
        const tool = createTool({
            name: 't2',
            title: 'T2',
            description: 'D2',
            inputSchema: {} as any,
            auditAction: 'search_knowledge' as any,
        }, handler);

        await (tool.handler as Function)({}, { keyId: 'k1' });
        expect(handler).toHaveBeenCalledWith({}, { keyId: 'k1' }, undefined);
        expect(recordAuditLog).toHaveBeenCalled();
    });

    it('should provide default auth object if omitted', async () => {
        const handler = vi.fn().mockResolvedValue({ isError: false, content: [] });
        const tool = createTool({
            name: 't3',
            title: 'T3',
            description: 'D3',
            inputSchema: {} as any,
        }, handler);

        await (tool.handler as Function)({});
        expect(handler).toHaveBeenCalledWith({}, { keyId: 'default' }, undefined);
    });
});
