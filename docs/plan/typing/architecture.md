# Arquitectura de Tipado del Proyecto

## Descripción General

Este proyecto utiliza **esquemas Zod como fuente de verdad** para todas las definiciones de tipos. Los tipos TypeScript se generan automáticamente usando `z.infer<typeof Schema>`, garantizando que la validación en runtime y el tipado estático estén siempre sincronizados.

**Stack Actual:** Node.js + TypeScript + MongoDB Atlas (M0 Free Tier) + Ollama (embeddings locales)

## Jerarquía de Tipos

### 1. `base.type.ts` - Tipos Base Genéricos (Sin Zod)

Tipos primitivos y patrones abstractos reutilizables. **No necesitan validación Zod** porque son abstracciones de bajo nivel:

- **Primitivos**: `NodeEnvironment`, `LogLevel`, `EntityId`, `EntityTimestamp`
- **Patrones**: `BaseEntity`, `PaginationParams`, `FilterParams`
- **Respuestas**: `ApiResponse<T>`, `SuccessResponse<T>`, `ErrorResponse`
- **Logging**: `LogFn`, `LogErrorFn`, `LoggerInterface`
- **Estructuras**: `ContentBlock`, `ResponseContent`

### 2. `schemas/index.schema.ts` - FUENTE DE VERDAD

**Este es el archivo principal donde se definen todos los esquemas Zod.**

Cada esquema Zod define:

- Validación en runtime
- Tipado estático via `z.infer<typeof Schema>`
- Documentación implícita de la estructura

```typescript
// schemas/index.schema.ts
export const KnowledgeEntrySchema = z.object({
  id: z.string(), // MongoDB ObjectId como string
  user_id: z.string(),
  type: z.string(),
  title: z.string(),
  content: z.string(),
  embedding: z.array(z.number()).optional(), // Array de 768 floats
  tags: z.array(z.string()),
  source: z.string().optional(),
  created_at: z.string(),
});

// El tipo se genera automáticamente
export type KnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>;
```

### 3. `types.ts` y `index.type.ts` - Re-exportaciones

Estos archivos simplemente re-exportan los tipos generados:

```typescript
// types.ts
export type { KnowledgeEntry, KnowledgeType, ... } from "./schemas/index.schema.js";
```

## Estructura de Archivos

```
src/
├── base.type.ts              ← Tipos primitivos y patrones genéricos
├── types.ts                  ← Re-exporta tipos desde schemas
├── index.type.ts             ← Re-exporta tipos específicos del servidor
├── index.ts                  ← Entry point del servidor MCP (mínimo, delega a tools/)
├── schemas/                  ← FUENTE DE VERDAD (esquemas Zod)
│   └── index.schema.ts       ← Todos los esquemas y tipos inferidos
├── db/                       ← MongoDB Atlas Integration
│   ├── client.ts             ← MongoDB client connection
│   ├── queries.ts            ← Database operations
│   └── vector-search.ts      ← Vector search utilities
├── tools/                    ← MCP Tools (modularizado)
│   ├── index.ts              ← Registro centralizado de tools
│   ├── index.type.ts         ← Tipos para tools
│   ├── store-knowledge.ts    ← Tool: almacenar conocimiento
│   ├── search-knowledge.ts   ← Tool: búsqueda por texto
│   ├── semantic-search.ts    ← Tool: búsqueda semántica (vector)
│   ├── list-knowledge.ts     ← Tool: listar entradas
│   └── get-knowledge.ts      ← Tool: obtener entrada
├── utils/                    ← Funciones reutilizables
│   ├── logger.ts             ← Logging estructurado
│   ├── tool-handler.ts       ← Manejo de errores estandarizado para tools
│   ├── id.ts                 ← Generación de IDs únicos
│   └── seed.ts               ← Datos de ejemplo
└── embeddings/
    └── index.ts              ← Ollama embeddings integration
```

## MongoDB Atlas Arquitectura

### Esquema de Colecciones

```javascript
// knowledge_entries collection
{
  _id: ObjectId,
  user_id: string,           // Clerk o Auth0 user ID
  type: string,              // REACT_PATTERN | ARCH_DECISION | etc.
  title: string,
  content: string,
  embedding: [768 floats],   // Vector de nomic-embed-text
  tags: [string],
  source: string,
  visibility: "private" | "archived",
  created_at: ISODate,
  updated_at: ISODate
}

// knowledge_tags collection (normalizada)
{
  _id: ObjectId,
  user_id: string,
  tag: string,
  count: number,             // Usos del tag
  created_at: ISODate
}

// knowledge_audit_log collection
{
  _id: ObjectId,
  user_id: string,
  action: "INSERT" | "UPDATE" | "DELETE" | "SEARCH",
  entry_id: ObjectId,
  details: object,
  created_at: ISODate
}
```

### Índices Requeridos

```javascript
// Índices básicos
db.knowledge_entries.createIndex({ user_id: 1 });
db.knowledge_entries.createIndex({ type: 1 });
db.knowledge_entries.createIndex({ created_at: -1 });
db.knowledge_entries.createIndex({ tags: 1 });

// Índice de texto para búsqueda por palabras
db.knowledge_entries.createIndex({ title: "text", content: "text" });

// Índice vectorial (Atlas Vector Search)
// Configurado vía MongoDB Atlas UI
```

### Atlas Vector Search (M0 Free Tier)

**Configuración del índice vectorial:**

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

**Consulta de ejemplo:**

```javascript
db.knowledge_entries.aggregate([{
  $vectorSearch: {
    index: "vector_index",
    path: "embedding",
    queryVector: [0.12, -0.34, ...], // 768 dims
    numCandidates: 100,
    limit: 10
  }
}])
```

## Seguridad (RLS Equivalente)

MongoDB Atlas M0 no tiene Row Level Security (RLS) nativo. Implementamos seguridad a nivel de aplicación:

### Patrón de Seguridad

```typescript
// Cada query DEBE filtrar por user_id
const entries = await db.knowledge_entries
  .find({ user_id: currentUserId }) // ← Siempre filtrar
  .toArray();

// Operaciones de escritura verifican ownership
await db.knowledge_entries.updateOne(
  { _id: entryId, user_id: currentUserId }, // ← Verificar ownership
  { $set: updates },
);
```

### Middleware de Autenticación

```typescript
// src/db/client.ts
export async function withAuth<T>(
  userId: string,
  operation: () => Promise<T>,
): Promise<T> {
  if (!userId) throw new Error("Authentication required");
  return operation();
}
```

## Principios de Diseño

### ✅ Single Source of Truth

- **Los esquemas Zod son la fuente de verdad**
- Los tipos se generan con `z.infer`, no se escriben manualmente
- Cambios en un esquema se reflejan automáticamente en todos los tipos

### ✅ DRY (Don't Repeat Yourself)

- Una sola definición para validación y tipado
- No hay duplicación entre tipos y validación
- Los archivos `.type.ts` solo re-exportan, no redefinen

### ✅ Sincronización Runtime/Compile-time

- El esquema Zod valida datos en runtime
- El tipo inferido garantiza type-safety en compile-time
- Siempre están sincronizados

### ✅ Type Safety Total

- Cero uso de `any`
- Cero uso de `interface` (solo `type`)
- Todo está explícitamente tipado desde esquemas

## Cómo Agregar Nuevos Tipos

### Paso 1: Definir el Esquema Zod

```typescript
// schemas/index.schema.ts
export const NewEntitySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  value: z.number().positive(),
  tags: z.array(z.string()).optional(),
});

// El tipo se genera automáticamente
export type NewEntity = z.infer<typeof NewEntitySchema>;
```

### Paso 2: Re-exportar si es necesario

```typescript
// types.ts
export type { NewEntity } from "./schemas/index.schema.js";
```

### Paso 3: Usar en el código

```typescript
import { NewEntitySchema } from "./schemas/index.schema.js";
import type { NewEntity } from "./types.ts";

// Validación en runtime
const validated = NewEntitySchema.parse(data);

// Tipado estático
const entity: NewEntity = { ... };
```

## Patrones de Esquemas

### Schema con Validación

```typescript
export const UserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Min 8 characters"),
  age: z.number().min(18).optional(),
});

export type User = z.infer<typeof UserSchema>;
```

### Schema con Enums

```typescript
export const StatusSchema = z.enum(["pending", "active", "archived"]);

export type Status = z.infer<typeof StatusSchema>;
```

### Schema Compuesto

```typescript
export const CreatePostInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  status: StatusSchema.default("pending"),
  tags: z.array(z.string()).optional(),
});

export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
```

## MCP Tools Architecture (tools/)

### Principio de Responsabilidad Única

Cada tool está aislada en su propio archivo con una estructura consistente:

```
tools/
├── [tool-name].ts          ← Implementación específica de la tool
├── index.ts                ← Registro centralizado
└── index.type.ts           ← Tipos compartidos
```

### Patrón de Implementación de Tools

```typescript
// tools/store-knowledge.ts
import { storeKnowledge } from "../db/queries.js";
import { StoreKnowledgeSchema } from "../schemas/index.schema.js";
import type { StoreKnowledgeArgs } from "../schemas/index.schema.js";
import type { ToolDefinition } from "./index.type.js";
import {
  handleToolError,
  validationError,
  successResponse,
} from "../utils/tool-handler.js";

const handler = async (args: StoreKnowledgeArgs, userId: string) => {
  // Validación
  if (!args.title) return validationError("title is required");

  // Lógica de negocio
  const entry = await storeKnowledge(userId, args);

  // Respuesta estandarizada
  return successResponse({ id: entry.id, entry });
};

export const storeKnowledgeTool: ToolDefinition<StoreKnowledgeArgs> = {
  name: "store_knowledge",
  title: "Store Knowledge Entry",
  description: "Store a new knowledge entry",
  inputSchema: StoreKnowledgeSchema,
  handler: async (args, userId) => {
    try {
      return await handler(args, userId);
    } catch (error) {
      return handleToolError(error, "Store knowledge");
    }
  },
};
```

### Registro Centralizado

```typescript
// tools/index.ts
export function registerAllTools(server: McpServer, userId: string): void {
  const tools = [
    storeKnowledgeTool,
    searchKnowledgeTool,
    // ... más tools
  ];

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args: unknown) => tool.handler(args, userId),
    );
  }
}
```

## Utilidades (utils/)

| Archivo           | Responsabilidad                               |
| ----------------- | --------------------------------------------- |
| `logger.ts`       | Logging estructurado con timestamps a stderr  |
| `tool-handler.ts` | Manejo de errores y respuestas estandarizadas |
| `id.ts`           | Generación de IDs únicos para MongoDB         |
| `seed.ts`         | Datos de ejemplo para desarrollo y demos      |

### Tool Handler Utility

El `tool-handler.ts` estandariza el manejo de errores siguiendo los patrones de `base.type.ts`:

```typescript
// Uso en catch blocks
} catch (error) {
  return handleToolError(error, "Operation name");
}

// Con mensaje personalizado
} catch (error) {
  return handleToolError(error, "Get knowledge", {
    customMessage: "Entry not found",
    logLevel: "warn",
  });
}
```

**Tipos utilizados de base.type.ts:**

- `ContentBlock` - Estructura de contenido MCP
- `ResponseContent` - Array de ContentBlock
- `ErrorResponse` - Patrón de error estandarizado
- `LogLevel` - Niveles de log tipados

## Checklist de Calidad

- ✅ Todos los tipos provienen de esquemas Zod
- ✅ Los esquemas incluyen validación (no son solo types vacíos)
- ✅ Los archivos `.type.ts` solo re-exportan, no redefinen
- ✅ Cero uso de `any`
- ✅ Cero uso de `interface`
- ✅ TypeScript compila sin errores
- ✅ La validación runtime coincide con los tipos
- ✅ Cada query MongoDB filtra por `user_id`
- ✅ Atlas Vector Search index configurado

## Beneficios de MongoDB Atlas M0

1. **Vector Search nativo** - Búsqueda semántica real con `$vectorSearch`
2. **Gratis para siempre** - 512 MB es suficiente para años de uso personal
3. **Escalabilidad** - Upgrade a M10 cuando sea necesario ($56/mes)
4. **Seguridad** - TLS/SSL, backups automáticos (con upgrade)
5. **Developer Experience** - MongoDB Compass, Atlas UI, métricas

## Referencias

- [MongoDB Atlas M0 Limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/)
- [Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Vector Search in M0 Free Tier](https://www.mongodb.com/community/forums/t/is-vector-search-feature-paid-or-free/267191)
