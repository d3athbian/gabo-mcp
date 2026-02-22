/**
 * Vitest Setup File
 */

import { afterEach, beforeEach, vi } from 'vitest';

vi.mock('../db/client.js', () => ({
  connectToDatabase: vi.fn().mockResolvedValue({}),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
  getDatabase: vi.fn().mockReturnValue({}),
  getKnowledgeEntriesCollection: vi.fn().mockReturnValue({}),
  getKnowledgeTagsCollection: vi.fn().mockReturnValue({}),
  getKnowledgeAuditLogCollection: vi.fn().mockReturnValue({}),
  getApiKeysCollection: vi.fn().mockReturnValue({}),
  setupIndexes: vi.fn().mockResolvedValue(undefined),
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
}));

vi.mock('../db/audit-log.js', () => ({
  recordAuditLog: vi.fn().mockResolvedValue(undefined),
  setupAuditLogIndex: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    cleanup: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
