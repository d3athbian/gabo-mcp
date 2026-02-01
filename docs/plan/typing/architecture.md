# Arquitectura de Tipado del Proyecto

## Descripción General

Este proyecto utiliza **esquemas Zod como fuente de verdad** para todas las definiciones de tipos. Los tipos TypeScript se generan automáticamente usando `z.infer<typeof Schema>`, garantizando que la validación en runtime y el tipado estático estén siempre sincronizados.

## Jerarquía de Tipos

### 1. `base.type.ts` - Tipos Base Genéricos (Sin Zod)

Tipos primitivos y patrones abstractos reutilizables. **No necesitan validación Zod** porque son abstracciones de bajo nivel:

- **Primitivos**: `NodeEnvironment`, `LogLevel`, `EntityId`, `EntityTimestamp`
- **Patrones**: `BaseEntity`, `PaginationParams`, `FilterParams`
- **Respuestas**: `ApiResponse<T>`, `SuccessResponse<T>`, `ErrorResponse`
- **Logging**: `LogFn`, `LogErrorFn`, `LoggerInterface`
- **Estructuras**: `ContentBlock`, `ResponseContent`, `DatabaseRow`
- **Database**: `DatabaseRow`, `QueryError`

### 2. `schemas/index.schema.ts` - FUENTE DE VERDAD

**Este es el archivo principal donde se definen todos los esquemas Zod.**

Cada esquema Zod define:

- Validación en runtime
- Tipado estático via `z.infer<typeof Schema>`
- Documentación implícita de la estructura

```typescript
// schemas/index.schema.ts
export const StoredEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  source: z.string().optional(),
  created_at: z.string(),
});

// El tipo se genera automáticamente
export type StoredEntry = z.infer<typeof StoredEntrySchema>;
```

### 3. `types.ts` y `index.type.ts` - Re-exportaciones

Estos archivos simplemente re-exportan los tipos generados:

```typescript
// types.ts
export type { StoredEntry, KnowledgeType, ... } from "./schemas/index.schema.js";
```

## Estructura de Archivos

```
src/
├── base.type.ts              ← Tipos primitivos y patrones genéricos (sin validación Zod)
├── types.ts                  ← Re-exporta tipos desde schemas
├── index.type.ts             ← Re-exporta tipos específicos del servidor
├── index.ts                  ← Entry point del servidor MCP
├── schemas/                  ← FUENTE DE VERDAD (esquemas Zod)
│   └── index.schema.ts       ← Todos los esquemas y tipos inferidos
├── utils/                    ← Funciones reutilizables
│   ├── logger.ts             ← Logging estructurado
│   ├── id.ts                 ← Generación de IDs únicos
│   └── seed.ts               ← Datos de ejemplo
├── config/
│   ├── config.ts
│   └── config.type.ts        ← Tipos de configuración (tipos puros)
├── db/
│   ├── client.ts
│   ├── client.type.ts        ← Tipos de Supabase (tipos puros)
│   ├── queries.ts
│   └── queries.type.ts       ← Tipos de queries (tipos puros)
└── embeddings/
    ├── index.ts
    └── index.type.ts         ← Tipos de embeddings (tipos puros)
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

## Utilidades (utils/)

| Archivo     | Responsabilidad                                 |
| ----------- | ----------------------------------------------- |
| `logger.ts` | Logging estructurado con timestamps a stderr    |
| `id.ts`     | Generación de IDs únicos para storage in-memory |
| `seed.ts`   | Datos de ejemplo para desarrollo y demos        |

## Checklist de Calidad

- ✅ Todos los tipos provienen de esquemas Zod
- ✅ Los esquemas incluyen validación (no son solo types vacíos)
- ✅ Los archivos `.type.ts` solo re-exportan, no redefinen
- ✅ Cero uso de `any`
- ✅ Cero uso de `interface`
- ✅ TypeScript compila sin errores
- ✅ La validación runtime coincide con los tipos

## Beneficios de Esta Arquitectura

1. **Consistencia**: Un solo lugar para definir estructuras
2. **Documentación**: Los esquemas documentan la forma de los datos
3. **Validación**: Verificación automática en runtime
4. **Tipado**: Type-safety garantizado
5. **Mantenimiento**: Cambios centralizados
