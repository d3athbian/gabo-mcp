/**
 * Bootstrap Tests
 */

import { describe, expect, it, vi } from 'vitest';
import { bootstrap, bootstrapAPIKey, shutdown } from '../../init/bootstrap.js';

vi.mock('../../config/config.js', () => ({
  config: {
    mcp: {
      apiKey: 'gabo_test_key_123',
    },
  },
}));

vi.mock('../../db/client.js', () => ({
  connectToDatabase: vi.fn().mockResolvedValue({}),
  closeDatabase: vi.fn().mockResolvedValue({}),
}));

describe('bootstrapAPIKey', () => {
  it('should return API key when configured', async () => {
    const result = await bootstrapAPIKey();
    expect(result).toBe('gabo_test_key_123');
  });
});

describe('bootstrap', () => {
  it('should bootstrap successfully', async () => {
    await bootstrap();
    const { connectToDatabase } = await import('../../db/client.js');
    expect(connectToDatabase).toHaveBeenCalled();
  });
});

describe('shutdown', () => {
  it('should close database connection', async () => {
    await shutdown();
    const { closeDatabase } = await import('../../db/client.js');
    expect(closeDatabase).toHaveBeenCalled();
  });
});
