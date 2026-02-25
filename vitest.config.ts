import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['zod', 'mongodb'],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['src/**/integration/**', 'test/integration/**', 'coverage/'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 35,
        functions: 35,
        branches: 35,
        statements: 35,
      },
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.test.ts',
        '**/*.spec.ts',
        // Entry points and orchestration (hard to unit test)
        'src/index.ts',
        'src/bootstrap.ts',
        'src/base.type.ts',
        // Just type definitions
        'src/schemas/**',
        'src/config/config.type.ts',
        // Scripts
        'scripts/**',
        // Templates and resources
        'src/prompts/**',
        'src/resources/**',
      ],
    },
    setupFiles: ['./src/tests/setup.ts'],
  },
});
