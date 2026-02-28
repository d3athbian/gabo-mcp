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
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.type.ts',
        // Entry points and orchestration (hard to unit test)
        'src/index.ts',
        'src/bootstrap.ts',
        // Excluded config and non-essential types for coverage focus
        'vitest.config.ts',
        'vitest.integration.config.ts',
        'src/types.ts',
        // Non-essential for unit tests and coverage focus
        'src/init/bootstrap.ts',
        'src/init/backup-trigger.ts',
        'src/init/bootstrap-infrastructure.ts',
        'src/embeddings/**',
        'src/db/client.ts',
        'src/tools/**',
        'src/base.type.ts',
        // Just type definitions
        'src/schemas/**',
        'src/config/**',
        // Scripts
        'scripts/**',
        // Templates and resources
        'src/prompts/**',
        'src/resources/**',
        '**/__tests__/**',
      ],
    },
    setupFiles: ['./src/tests/setup.ts'],
  },
});
