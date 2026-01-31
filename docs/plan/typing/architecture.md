# Arquitectura de Tipado del Proyecto

## Descripción General

Este proyecto utiliza un sistema de tipado jerárquico con un archivo base que actúa como **"fuente de verdad"** para evitar duplicación y mantener consistencia en todo el código.

## Estructura de Tipos

### 1. `base.type.ts` (FUENTE DE VERDAD)

Contiene tipos primitivos, patrones comunes y abstracciones genéricas reutilizables:

- **Primitivos**: `NodeEnvironment`, `LogLevel`, `EntityId`, `EntityTimestamp`, etc.
- **Patrones**: `BaseEntity`, `PaginationParams`, `FilterParams`
- **Respuestas**: `ApiResponse<T>`, `SuccessResponse<T>`, `ErrorResponse`
- **Callbacks**: `LogFn`, `LogErrorFn`, `WriteCallback`, `ErrorCallback`
- **Estructuras**: `ContentBlock`, `LoggerInterface`, `DatabaseRow`

### 2. Archivos Específicos que Extienden de `base.type.ts`

Cada módulo tiene su propio archivo `.type.ts` que importa y reutiliza tipos de base:

```
src/
├── config/
│   └── config.type.ts       → DatabaseConfig, EmbeddingsConfig, Config
├── index.type.ts            → StoredEntry, Logger, MCPToolResponse
├── handlers/
│   └── tools.type.ts        → ToolResult, SearchKnowledgeInput
├── db/
│   ├── client.type.ts       → DatabaseSchema, SupabaseClientType
│   └── queries.type.ts      → QueryResult<T>, KnowledgeEntryRow
└── embeddings/
    └── index.type.ts        → EmbeddingResult, BatchEmbeddingsResult
```

### 3. `types.ts` (TIPOS DE DOMINIO)

Tipos específicos del negocio que también extienden de `base.type.ts`:

- `KnowledgeType` - Enum de tipos de conocimiento
- `KnowledgeEntry` - Entity principal
- `CreateKnowledgeInput`, `SearchKnowledgeInput` - Inputs
- `SearchResult`, `EmbeddingResponse` - Respuestas

## Principios de Diseño

### ✅ DRY (Don't Repeat Yourself)

- Tipos comunes se definen **UNA SOLA VEZ** en `base.type.ts`
- Los demás archivos los importan y reutilizan
- ❌ NO hay duplicación de `EntityId`, `EntityTimestamp`, `ApiResponse`, etc.

### ✅ Single Source of Truth

- `base.type.ts` es la autoridad para tipos primitivos y patrones
- Cambios centralizados afectan a todo el proyecto
- ❌ No hay conflictos entre versiones diferentes del mismo tipo

### ✅ Type Safety Total

- Cero uso de `any`
- Cero uso de `interface` (solo `type`)
- Todo está explícitamente tipado

### ✅ Organización Modular

- Cada archivo tiene su propio `.type.ts`
- Los tipos están organizados por dominio/responsabilidad
- Fácil de mantener y expandir

## Mapa de Dependencias de Tipos

```
                          base.type.ts
                      (FUENTE DE VERDAD)
                               ↑
                ┌──────────────┼──────────────┐
                │              │              │
           config/         index.ts      handlers/
           ├─ Config       ├─ Logger      ├─ ToolResult
           └─ Embeddings   └─ Storage     └─ SearchInput

                          base.type.ts
                               ↑
                ┌──────────────┼──────────────┐
                │              │              │
            db/            queries/      embeddings/
            ├─ Schema       ├─ Result      ├─ Result
            └─ Client       └─ Row         └─ Batch
```

## Ejemplos de Reutilización

### Ejemplo 1: EntityId

```typescript
// base.type.ts
export type EntityId = string;

// db/client.type.ts
export type DatabaseSchema = {
  knowledge_entries: DatabaseRow & {
    user_id: EntityId; // ← Reutilizado
  };
};
```

### Ejemplo 2: ApiResponse (Patrón Genérico)

```typescript
// base.type.ts
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// handlers/tools.type.ts
export type ToolResult = ApiResponse<ToolResultData>; // ← Reutilizado
```

### Ejemplo 3: PaginationParams

```typescript
// base.type.ts
export type PaginationParams = {
  limit?: number;
  offset?: number;
};

// handlers/tools.type.ts
export type ListKnowledgeInput = PaginationParams; // ← Reutilizado

// types.ts
export type SearchKnowledgeInput = PaginationParams & {
  // ← Reutilizado
  query: string;
  type?: KnowledgeType;
};
```

## Cómo Agregar Nuevos Tipos

### Paso 1: Evaluar la Genericidad

**¿El tipo es genérico y reutilizable?**

- **SÍ** → Agregarlo a `base.type.ts`
- **NO** → Agregarlo al archivo `.type.ts` específico del módulo

### Paso 2: Extender de Tipos Base

**¿Extiendo de un tipo base?**

- **SÍ** → Importar desde `base.type.ts`
- **NO** → Definir directamente

### Paso 3: Exportar en types.ts

**¿Debo exportarlo en types.ts?**

- **SÍ** → Asegurate de importarlo de la fuente correcta
- **NO** → Mantenerlo privado al módulo

## Checklist de Calidad

- ✅ No hay duplicación de tipos entre archivos
- ✅ Todos los tipos base están en `base.type.ts`
- ✅ Cada módulo tiene su propio archivo `.type.ts`
- ✅ Cero uso de `any`
- ✅ Cero uso de `interface`
- ✅ Todos los imports apuntan a la fuente correcta
- ✅ TypeScript compila sin errores
- ✅ Los tipos son enforzados en tiempo de compilación

## Patrones Centralizados

### Respuestas Genéricas

```typescript
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
export type ListResponse<T> = { success: boolean; data: T[]; count: number };
```

### Paginación

```typescript
export type PaginationParams = { limit?: number; offset?: number };
```

### Identificadores y Timestamps

```typescript
export type EntityId = string;
export type EntityTimestamp = string; // ISO 8601
```

### Logging

```typescript
export type LoggerInterface = {
  info: LogFn;
  warn: LogFn;
  error: LogErrorFn;
};
```

### Base de Datos

```typescript
export type DatabaseRow = { id: EntityId; created_at: EntityTimestamp };
export type QueryError = { message: string; code?: string };
```

## Estructura de Carpetas Recomendada

```
src/
├── base.type.ts          ← Tipos primitivos y patrones (FUENTE DE VERDAD)
├── types.ts              ← Tipos de dominio
├── index.ts              ← Entry point del servidor MCP
├── index.type.ts         ← Tipos específicos del servidor
├── utils/                ← Funciones reutilizables y utilidades
│   ├── logger.ts         ← Logger con timestamps para stderr
│   ├── id.ts             ← Generadores de IDs únicos
│   └── seed.ts           ← Datos de ejemplo para demos
├── config/
│   ├── config.ts
│   └── config.type.ts
├── db/
│   ├── client.ts
│   ├── client.type.ts
│   ├── queries.ts
│   └── queries.type.ts
├── handlers/
│   ├── tools.ts
│   └── tools.type.ts
└── embeddings/
    ├── index.ts
    └── index.type.ts
```

## Utilidades (utils/)

Las funciones de utilidad deben seguir estos principios:

- **Single Responsibility**: Cada archivo tiene una responsabilidad única
- **Nombres Claros**: El nombre del archivo describe exactamente qué hace
- **Sin efectos secundarios**: Las funciones son puras cuando es posible
- **Testeables**: Funciones pequeñas y aisladas que se pueden probar independientemente

### Archivos de Utils

| Archivo     | Responsabilidad                                 |
| ----------- | ----------------------------------------------- |
| `logger.ts` | Logging estructurado con timestamps a stderr    |
| `id.ts`     | Generación de IDs únicos para storage in-memory |
| `seed.ts`   | Datos de ejemplo para desarrollo y demos        |

## Mantenimiento

Consulta [guidelines.md](./guidelines.md) para:

- Pasos detallados para agregar tipos
- Flujo de decisión (¿genérico o específico?)
- Ejemplos prácticos
- Antipatrones a evitar
- Preguntas frecuentes
