# Guidelines para Agregar Nuevos Tipos

Este documento describe el proceso recomendado para agregar nuevos tipos al proyecto, asegurando que se mantenga la arquitectura DRY y el Single Source of Truth.

## Paso 1: Evaluar la Genericidad del Tipo

**Pregúntate**: "¿Será este tipo reutilizado en múltiples módulos?"

### Ejemplos de Tipos Genéricos (→ `base.type.ts`)

- ✅ `EntityId` - usado en BD, handlers, types, etc.
- ✅ `PaginationParams` - usado en handlers, queries, etc.
- ✅ `ApiResponse<T>` - patrón de respuesta genérico
- ✅ `QueryError` - error de BD genérico
- ✅ `LoggerInterface` - interfaz de logging genérica

### Ejemplos de Tipos Específicos (→ `module.type.ts`)

- ✅ `StoreKnowledgeInput` - solo para handlers
- ✅ `KnowledgeEntryRow` - específico de queries
- ✅ `DatabaseSchema` - específico de client
- ✅ `EmbeddingResponse` - específico de embeddings

## Paso 2: Seleccionar la Ubicación

```
    ¿Es un tipo primitivo o patrón genérico?
             │
    ┌────────┴────────┐
    │                 │
   SÍ                NO
    │                 │
    ↓                 ↓
base.type.ts     ¿Tiene una dependencia clara
                 de un módulo?
                      │
                  ┌────┴────┐
                  │          │
                 SÍ         NO
                  │          │
                  ↓          ↓
            module.type.ts   types.ts
```

## Paso 3: Estructura del Archivo

### Estructura Recomendada para un Nuevo `module.type.ts`

```typescript
// 1. Header con descripción
/// Type definitions for [module name]
/// Extends base.type.ts for common patterns

// 2. Imports de base.type.ts (solo lo que uses)
import type { EntityId, ApiResponse, PaginationParams } from '../base.type.ts';

// 3. Tipos específicos
export type SpecificInput = {
  id: EntityId;  // Usa tipos de base
  name: string;
};

// 4. Reutiliza patrones genéricos
export type SpecificResult = ApiResponse<SpecificData>;
```

## Paso 4: Patrones Comunes a Reutilizar

Antes de crear un nuevo tipo, verifica si alguno de estos patrones encaja:

### 1. Respuestas

```typescript
// Use ApiResponse<T> para envueltas de éxito/error
export type MyResponse = ApiResponse<MyData>;

// Nunca crees tu propio patrón de respuesta
// ❌ MALO: type MyResponse = { ok: boolean; data?: T; error?: string };
```

### 2. Identificadores

```typescript
// Use EntityId para identificadores genéricos
export type User = {
  id: EntityId;  // ✅ Correcto
  // id: string;  ❌ Malo - sin tipo específico
};
```

### 3. Timestamps

```typescript
// Use EntityTimestamp para fechas ISO 8601
export type User = {
  created_at: EntityTimestamp;  // ✅ Correcto
  // created_at: string;         ❌ Malo - sin semántica
};
```

### 4. Paginación

```typescript
// Use PaginationParams para limit/offset
export type SearchInput = PaginationParams & {
  query: string;  // Extiende con & si necesitas campos adicionales
};
```

### 5. Bases de Datos

```typescript
// Use DatabaseRow como base para todas las filas
export type UserRow = DatabaseRow & {
  email: string;
  // Extiende con & para campos específicos
};
```

### 6. Embeddings

```typescript
// Use Embedding para vectors (number[])
export type VectorData = {
  vector: Embedding;
};

// Use EmbeddingBatch para lotes (number[][])
export type VectorBatch = EmbeddingBatch;
```

## Paso 5: Ejemplos Prácticos

### Ejemplo 1: Agregar un Nuevo Módulo "Analytics"

**Archivo**: `src/analytics/analytics.type.ts`

```typescript
import type { 
  EntityId, 
  EntityTimestamp, 
  ApiResponse, 
  PaginationParams 
} from '../base.type.ts';

export type AnalyticsEvent = {
  id: EntityId;
  user_id: EntityId;
  event_type: 'view' | 'click' | 'search';
  created_at: EntityTimestamp;
};

export type AnalyticsQuery = PaginationParams & {
  user_id?: EntityId;
  event_type?: string;
};

export type AnalyticsResult = ApiResponse<AnalyticsEvent[]>;
```

**Análisis**:
- ✅ Reutiliza `EntityId` (de base)
- ✅ Reutiliza `EntityTimestamp` (de base)
- ✅ Extiende `PaginationParams` (de base)
- ✅ Usa `ApiResponse` (de base)
- ✅ Sin duplicación de patrones

### Ejemplo 2: Agregar un Tipo de Entrada

**Archivo**: `src/handlers/export.type.ts`

```typescript
import type { EntityId, ApiResponse } from '../base.type.ts';

export type ExportFormat = 'json' | 'csv' | 'pdf';

export type ExportInput = {
  user_id: EntityId;
  format: ExportFormat;
  include_metadata?: boolean;
};

export type ExportResult = ApiResponse<{
  file_url: string;
  size: number;
}>;
```

**Análisis**:
- ✅ Reutiliza `EntityId`
- ✅ Usa `ApiResponse` para envolvente
- ✅ Tipos específicos del módulo en `export.type.ts`
- ✅ Limpio y sin redundancias

## Paso 6: Validación

Antes de hacer commit, verifica:

**CHECKLIST:**
- [ ] `npm run build` compila sin errores
- [ ] No hay uso de `any`
- [ ] No hay uso de `interface`
- [ ] No hay duplicación de tipos primitivos
- [ ] Los tipos genéricos están en `base.type.ts`
- [ ] Los tipos específicos están en `module.type.ts`
- [ ] Todos los imports vienen de la fuente correcta
- [ ] La documentación del tipo es clara
- [ ] Reutilizas patrones de `base.type.ts` donde es posible

## Paso 7: Actualizar Documentación

### Si agregaste un nuevo tipo genérico a `base.type.ts`:

1. Actualiza `base.type.ts` con comentarios JSDoc
2. Agrega un ejemplo en `docs/plan/typing/architecture.md`
3. Actualiza este archivo de guidelines
4. Commit con mensaje: `type: add new generic type [TypeName]`

### Si agregaste un nuevo módulo:

1. Crea `module.type.ts`
2. Crea `module.ts` con la implementación
3. Actualiza imports en los módulos que lo usen
4. Documenta el nuevo patrón si es repetible
5. Commit con mensaje: `feat: add [module-name] with full typing`

## Antipatrones a Evitar

### ❌ Duplicar tipos primitivos

```typescript
// MALO
export type UserId = string;

// BUENO
import type { EntityId } from '../base.type.ts';
// Use EntityId instead of UserId
```

### ❌ Crear patrones de respuesta personalizados

```typescript
// MALO
type MyResponse = { ok: boolean; data?: T; error?: string };

// BUENO
import type { ApiResponse } from '../base.type.ts';
export type MyResponse = ApiResponse<T>;
```

### ❌ Usar `any` en ningún caso

```typescript
// MALO
function process(data: any) {}

// BUENO
type ProcessData = { /* ... */ };
function process(data: ProcessData) {}
```

### ❌ Definir timestamps como string plano

```typescript
// MALO
created_at: string;

// BUENO
import type { EntityTimestamp } from '../base.type.ts';
created_at: EntityTimestamp;
```

### ❌ Crear interfaces en lugar de types

```typescript
// MALO
interface User { /* ... */ }

// BUENO
type User = { /* ... */ };
```

### ❌ No reutilizar `DatabaseRow` para tablas BD

```typescript
// MALO
type UserRow = { 
  id: string; 
  created_at: string; 
  /* ... */ 
};

// BUENO
import type { DatabaseRow } from '../base.type.ts';
type UserRow = DatabaseRow & {
  email: string;
  /* ... */
};
```

## Migrando Código Existente

Si encuentras código antiguo que no sigue estos patrones:

### Plan de Migración

1. Identifica el tipo primitivo duplicado
2. Verifica que existe en `base.type.ts`
3. Reemplaza el tipo antiguo con el de `base.type.ts`
4. Actualiza todos los imports
5. Ejecuta `npm run build` para verificar
6. Commit: `refactor: deduplicate types, use base.type.ts`

### Ejemplo

**ANTES** (en `module.type.ts`):
```typescript
export type UserId = string;
export type Timestamp = string;
```

**DESPUÉS** (en `module.type.ts`):
```typescript
import type { EntityId, EntityTimestamp } from '../base.type.ts';
// UserId y Timestamp se reemplazan con imports
```

## Preguntas Frecuentes

### P: ¿Dónde va un tipo que es usado por 2 módulos?

**R**: 
- Si es genérico (p.ej., `PaginationParams`) → `base.type.ts`
- Si es específico del dominio → `types.ts`

### P: ¿Puedo extender `ApiResponse` con más campos?

**R**: Sí, usa `&` para extender:

```typescript
type MyResponse = ApiResponse<Data> & { meta: object };
```

### P: ¿Necesito un `.type.ts` si mi módulo es pequeño?

**R**: Sí, mantenlo consistente. Un `.type.ts` vacío es mejor que tipos inline. Deja el `.type.ts` como futuro hogar para tipos.

### P: ¿Qué pasa si necesito un tipo muy específico?

**R**: Puede existir solo en `module.type.ts`. No todo debe ser genérico. Solo asegúrate que no sea una versión ligeramente diferente de un tipo que ya existe.

### P: ¿Cómo organizo tipos internos vs exportados?

**R**: Exporta los públicos, mantén privados los internos (sin `export`). Todos en el mismo `.type.ts`.

## Flujo de Trabajo Rápido

1. **¿Es genérico?** → `base.type.ts`
2. **¿Es específico de un módulo?** → `module.type.ts`
3. **¿Es del dominio?** → `types.ts`
4. **Importa patrones base** → Desde `base.type.ts`
5. **Compila y valida** → `npm run build`
6. **Actualiza docs** → Este archivo o `architecture.md`
7. **Haz commit** → Mensaje descriptivo
