# AGENTS.md - Guidelines for AI Agents

This file provides guidelines and conventions for AI agents working in this codebase.

---

## Build, Lint & Test Commands

### Development

```bash
npm run dev              # Watch mode with tsx
npm run dev:local        # Local development with NODE_ENV=development
npm run dev:inspector   # Run with MCP Inspector (visual debugging)
npm run build           # Build to dist/ (TypeScript + copy prompts)
npm run start           # Run production build from dist/
```

### Quality Checks

```bash
npm run type-check      # TypeScript type checking (tsc --noEmit)
npm run lint            # Biome linter with auto-fix (biome check --write src)
npm run lint -- --src   # Lint specific directory
```

### Testing

```bash
npm run test            # Run all unit tests (vitest run)
npm run test:watch      # Watch mode (vitest)
npm run test:coverage   # Run tests with coverage report

# Run tests matching a pattern
npx vitest run --testNamePattern "sanitization"

# Run a specific test file
npx vitest run src/__tests__/sanitization/credentials.test.ts

# Run tests in watch mode for a specific file
npx vitest run src/db/api-keys.test.ts --watch
```

---

## Code Style Guidelines

### Formatting (Biome)

- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes (`'`)
- **Trailing commas**: ES5 style
- **Import extensions**: Use `.js` for local imports (TypeScript resolves to JS)

### TypeScript Conventions

1. **Use `type` over `interface`** unless extending or merging is needed
2. **Use `z.infer<typeof Schema>`** to derive types from Zod schemas
3. **Avoid `any`** - use `unknown` or specific types
4. **Use `import type`** for type-only imports
5. **Never use `as any`** - use proper typing or type guards

### Naming Conventions

| Element          | Convention                 | Example                              |
| ---------------- | -------------------------- | ------------------------------------ |
| Files            | kebab-case                 | `api-keys.ts`, `prompt-builder.ts`   |
| Directories      | kebab-case                 | `sanitization/detectors/pii/`        |
| Types/Interfaces | PascalCase                 | `ApiKey`, `SanitizationResult`       |
| Functions        | camelCase                  | `findApiKeyByKey`, `sanitizeContent` |
| Variables        | camelCase                  | `keyDoc`, `activeDocs`               |
| Constants        | SCREAMING_SNAKE_CASE       | `LOGGING`, `MAX_LOG_SIZE`            |
| Database fields  | snake_case                 | `key_hash`, `created_at`             |
| Zod schemas      | PascalCase + Schema suffix | `ApiKeySchema`                       |

### Import Order

```typescript
// 1. Node.js built-ins
import * as fs from "node:fs";

// 2. External packages (alphabetical)
import { config } from "../../config/config.js";
import { z } from "zod";

// 3. Internal packages - relative imports with .js extension
import { recordAuditLog } from "../../db/audit-log.js";
import { logger } from "../../utils/logger/index.js";

// 4. Types (can be interleaved using 'type' keyword)
import type { AuthResult } from "../../types.js";
```

### Error Handling

1. **Use the `AppError` class** for domain errors:

   ```typescript
   throw new AppError("Message", "ERROR_CODE", 400);
   ```

2. **Use try-catch with proper error logging**:

   ```typescript
   try {
     // operation
   } catch (error) {
     logger.error("Operation failed", error);
     throw error;
   }
   ```

3. **Unused catch variables** should use underscore prefix:

   ```typescript
   } catch (_e) { /* ignore */ }
   ```

4. **Never expose internal errors** to external callers - wrap in user-friendly messages

### Logging

- Use `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()`
- Log meaningful context but avoid PII
- Errors should include the error object: `logger.error('msg', error)`

### Project Structure

```
src/
├── config/           # Configuration (Zod + constants)
├── db/               # Database layer (MongoDB)
├── embeddings/       # Embeddings service
├── init/             # Bootstrap & initialization
├── middleware/       # Auth, sanitization
├── prompts/          # Prompt templates
├── schemas/          # Zod schemas (source of truth)
├── tools/            # MCP tool implementations
└── utils/            # Utilities (errors, logger, api-key, etc.)
```

### Testing Conventions

1. **Test files**: `{module}.test.ts` co-located or in `src/__tests__/`
2. **Use Vitest** with mocks for external dependencies
3. **Unit tests should NOT require external services** (mock MongoDB, etc.)
4. **Mock pattern**: Use shared mocks in `mocks.ts` for integration tests

### Zod as Source of Truth

- All input validation uses Zod schemas
- Derive TypeScript types using `z.infer`
- Never duplicate validation logic outside schemas

---

## Environment Variables

Required:

- `MONGODB_URI` - MongoDB connection string
- `MCP_API_KEY` - API key for authentication (auto-generated on first boot)

Optional:

- `MCP_KEY_PEPPER` - Pepper for bcrypt (auto-generated)
- `NODE_ENV` - Set to `development` for debug logs

---

## Common Patterns

### Tool Handler Pattern

```typescript
export const tool = {
  name: "tool_name",
  description: "...",
  inputSchema: zodSchema,
  handler: withAuth(async (args, auth) => {
    // implementation
  }),
};
```

### Database Queries

```typescript
export async function getSomething(): Promise<Something | null> {
  const collection = getCollection();
  const doc = await collection.findOne({
    /* query */
  });
  return doc ? transform(doc) : null;
}
```

### Middleware Composition

```typescript
// Auth wrapper
const withAuth = (handler) => async (args, auth, context) => {
  // auth logic
  return handler(args, auth, context);
};
```
