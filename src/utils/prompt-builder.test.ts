import * as fs from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from './errors/Error.js';
import { PromptBuilder } from './prompt-builder.js';

vi.mock('node:fs', async () => {
  return {
    ...((await vi.importActual('node:fs')) as any),
    existsSync: vi.fn(),
    promises: {
      readFile: vi.fn(),
    },
  };
});

vi.mock('../logger/index.js', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('PromptBuilder', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should set variables and replace them in the template', async () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.promises.readFile as any).mockResolvedValue('Hello {{name}}, welcome to {{place}}.');

    const builder = new PromptBuilder('test_template.md');
    builder.setVariable('name', 'Alice');
    builder.setVariable('place', 'Wonderland');

    const result = await builder.build();
    expect(result).toBe('Hello Alice, welcome to Wonderland.');
  });

  it('should set multiple variables at once', async () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.promises.readFile as any).mockResolvedValue('{{a}} + {{b}} = {{c}}');

    const builder = new PromptBuilder('math_template.md');
    builder.setVariables({ a: '1', b: '2', c: '3' });

    const result = await builder.build();
    expect(result).toBe('1 + 2 = 3');
  });

  it('should append additional sections to the template', async () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.promises.readFile as any).mockResolvedValue('Base Template');

    const builder = new PromptBuilder('template.md');
    builder.addSection('Section 1');
    builder.addSection('Section 2');

    const result = await builder.build();
    expect(result).toBe('Base Template\n\nSection 1\n\nSection 2');
  });

  it('should ignore falsy section additions', async () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.promises.readFile as any).mockResolvedValue('Base');

    const builder = new PromptBuilder('empty_section.md');
    builder.addSection('');

    const result = await builder.build();
    expect(result).toBe('Base');
  });

  it('should throw AppError if template is not found anywhere', async () => {
    (fs.existsSync as any).mockReturnValue(false);

    const builder = new PromptBuilder('missing_template.md');
    await expect(builder.build()).rejects.toThrow(AppError);
  });
});
