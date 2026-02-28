import * as fs from 'node:fs';
import * as bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '../../config/config.js';
import { AppError } from '../errors/Error.js';
import {
  ensurePepperExists,
  generateApiKey,
  generatePepper,
  getPepper,
  hashApiKey,
  isValidApiKeyFormat,
  removeEnvVariable,
  verifyApiKey,
  writeEnvVariable,
} from './index.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('API Key Utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Key Generation', () => {
    it('should generate a valid API key', () => {
      const key = generateApiKey();
      expect(key).toBeTypeOf('string');
      expect(key.startsWith('gabo_')).toBe(true);
      expect(key).toContain('_');
    });

    it('should validate API key format', () => {
      expect(isValidApiKeyFormat('gabo_time_rand')).toBe(true);
      expect(isValidApiKeyFormat('invalid_key')).toBe(false);
      expect(isValidApiKeyFormat('')).toBe(false);
    });
  });

  describe('Pepper Management', () => {
    it('should generate pepper', () => {
      const pepper = generatePepper();
      expect(pepper).toHaveLength(64); // 32 bytes hex
    });

    it('should get pepper when set', () => {
      config.mcpKeyPepper = 'test_pepper';
      expect(getPepper()).toBe('test_pepper');
    });

    it('should throw an error when pepper is missing', () => {
      config.mcpKeyPepper = undefined;
      expect(() => getPepper()).toThrow(AppError);
    });
  });

  describe('Hashing and Verification', () => {
    it('should hash API key adding pepper', async () => {
      config.mcpKeyPepper = 'pepper';
      (bcrypt.hash as any).mockResolvedValue('hashed_value');
      const hash = await hashApiKey('my_key');
      expect(bcrypt.hash).toHaveBeenCalledWith('my_keypepper', 10);
      expect(hash).toBe('hashed_value');
    });

    it('should verify API key against hash', async () => {
      config.mcpKeyPepper = 'pepper';
      (bcrypt.compare as any).mockResolvedValue(true);
      const isMatch = await verifyApiKey('my_key', 'stored_hash');
      expect(bcrypt.compare).toHaveBeenCalledWith('my_keypepper', 'stored_hash');
      expect(isMatch).toBe(true);
    });
  });

  describe('Env Management', () => {
    it('should write new variable to an empty env', () => {
      (fs.existsSync as any).mockReturnValue(false); // empty
      writeEnvVariable('KEY', 'VALUE');
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), 'KEY=VALUE\n', 'utf-8');
    });

    it('should append new variable if not present', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('OLDVAR=old\n');

      writeEnvVariable('KEY', 'VALUE');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        'OLDVAR=old\nKEY=VALUE\n',
        'utf-8'
      );
    });

    it('should replace existing variable', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('OLDVAR=old\nKEY=OLDVAL\n');

      writeEnvVariable('KEY', 'VALUE');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        'OLDVAR=old\nKEY=VALUE\n',
        'utf-8'
      );
    });

    it('should remove variable', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('KEY=VALUE\nOTHER=other\n');
      removeEnvVariable('KEY');
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), 'OTHER=other\n', 'utf-8');
    });
  });

  describe('Ensure Pepper Exists', () => {
    it('should return existing pepper if config is set', () => {
      config.mcpKeyPepper = 'existing_pep';
      expect(ensurePepperExists()).toBe('existing_pep');
    });

    it('should generate and save pepper if not present', () => {
      config.mcpKeyPepper = undefined;
      (fs.existsSync as any).mockReturnValue(false);

      const newPepper = ensurePepperExists();
      expect(newPepper).toHaveLength(64);
      expect(config.mcpKeyPepper).toBe(newPepper);
      expect(process.env.MCP_KEY_PEPPER).toBe(newPepper);
    });
  });
});
