# Agent Guidelines for gabo-mcp

This file provides guidelines for AI agents working on this codebase.

---

## 1. Build, Lint, and Test Commands

### Development

```bash
npm run dev              # Watch mode with tsx
npm run dev:local       # Run locally with NODE_ENV=development
npm run dev:inspector   # Run with MCP Inspector UI
```

### Building

```bash
npm run build           # Compile TypeScript
npm run start           # Run compiled version
```

### Testing

```bash
npm run test            # Run all unit tests (vitest run)
npm run test:watch      # Watch mode (vitest)
npm run test:coverage   # Run tests with coverage report
```

### Running a Single Test

```bash
# Run tests matching a pattern
npx vitest run --testNamePattern "sanitization"

# Run a specific test file
npx vitest run src/__tests__/sanitization/credentials.test.ts
```

### Code Quality

```bash
npm run type-check      # TypeScript type checking (tsc --noEmit)
npm run lint            # Biome linter (biome check --write src)
```

---

## 2. Code Style Guidelines

### Formatting & Linting

- **Formatter**: Biome is configured. Run `npm run lint` before committing.
- **Indentation**: 2 spaces
- **Line width**: 100 characters max
- **Quotes**: Single quotes for JavaScript/TypeScript
- **Trailing commas**: ES5 style

### Import Conventions

- Use explicit file extensions: `import { foo } from './foo.js'`
- Order imports: external → internal → types
- Use `import type` for type-only imports ( Biome rule enabled)
- Group: 1) external libs, 2) relative imports, 3) type imports

Example:

```typescript
import { z } from "zod";
import { ObjectId } from "mongodb";

import { config } from "../config/config.js";
import type { SomeType } from "../types.js";
```

### Type Conventions

- **Use Zod** for runtime validation and type inference
- Prefer `type` over `interface` unless extension needed
- Avoid `any` - use `unknown` or explicit types
- Export types from central `src/types.ts` for shared domain types

### Naming Conventions

- **Files**: kebab-case (e.g., `tool-handler.ts`, `api-keys.ts`)
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for runtime constants, PascalCase for Zod schemas
- **Types**: PascalCase
- **Tests**: `{module}.test.ts` (e.g., `api-keys.test.ts`)

### Error Handling

- Use Zod for input validation
- Use `AppError` class from `src/utils/errors/Error.ts` for structured errors
- Always wrap async operations in try/catch for logging
- Return typed error responses (never throw in MCP handlers)
- Log errors with context before returning

Example:

```typescript
try {
  const result = await someOperation();
  return successResponse(result);
} catch (error) {
  logger.error("Operation failed", error);
  return errorResponse("Failed to complete operation");
}
```

### Project Structure

```
src/
├── config/           # Configuration (constants.ts, config.ts)
├── db/               # Database client, queries, operations
├── embeddings/       # Ollama/OpenAI embedding services
├── init/            # App initialization (bootstrap, health monitor, backup)
├── middleware/       # Auth, sanitization
├── schemas/         # Zod schemas (source of truth)
├── tools/           # MCP tools (save, search, list, etc.)
├── utils/           # Logger, API keys, helpers, tool-factory, errors
├── types.ts         # Centralized domain types
└── index.ts         # Entry point
```

### Testing Guidelines

- Tests go in `src/__tests__/` mirroring source structure
- Use Vitest with mocks for external dependencies (MongoDB, etc.)
- Unit tests should NOT require external services
- Mock `src/db/client.js` for database tests
- Run `npm run lint` before committing changes

### Constants & Configuration

- All hardcoded constants should be in `src/config/constants.ts`
- Environment variables with defaults belong in `src/config/config.ts`
- Import constants from `src/config/constants.js` not relative paths

### Database

- Use MongoDB driver directly (not an ORM)
- Always use `toObjectId()` helper for \_id fields
- Index creation in `src/db/client.ts` via `setupIndexes()`
- Audit logs for all operations in `src/db/audit-log.ts`

### Security

- NEVER log secrets, API keys, or credentials
- Use bcrypt for password/key hashing
- API keys use `gabo_` prefix
- Sanitize all user input (see `src/middleware/sanitization/`)

---

## 3. Before Committing

Run these commands:

```bash
npm run type-check   # Must pass
npm run lint        # Auto-fixes issues
npm run test        # Must pass
```

---

## 4. Tech Stack

- **Runtime**: Node.js 24+
- **Language**: TypeScript 5.6+
- **Protocol**: MCP SDK
- **Database**: MongoDB Atlas
- **Validation**: Zod
- **Testing**: Vitest
- **Linting**: Biome
- **Embeddings**: Ollama (local)

---

## 5. Key Files

- `src/config/constants.ts` - All application constants
- `src/types.ts` - Centralized type exports
- `src/db/client.ts` - MongoDB connection & indexes
- `src/middleware/sanitization/` - Security & data sanitization
- `src/utils/errors/Error.ts` - Structured error handling with AppError
- `src/utils/tool-factory.ts` - Factory for standardized tool creation
- `src/tools/` - MCP tool implementations
- `src/init/` - App bootstrap, health monitor, backup triggers

---

For questions about architecture decisions, see `docs/DECISIONES.md`.
