import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['src/**/integration/**', 'test/integration/**', 'coverage/'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 46,
        functions: 46,
        branches: 46,
        statements: 46,
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
        // Files that need external services
        'src/tools/**',
        'src/embeddings/**',
        'src/prompts/**',
        'src/resources/**',
        'src/init/**',
        // Just type definitions
        'src/schemas/**',
        'src/config/config.type.ts',
        // Scripts
        'scripts/**',
      ],
    },
    setupFiles: ['./src/tests/setup.ts'],
  },
});
