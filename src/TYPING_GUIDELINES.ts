/**
 * GUIDELINES PARA AGREGAR NUEVOS TIPOS
 * ================================================================================================
 * 
 * Este documento describe el proceso recomendado para agregar nuevos tipos al proyecto,
 * asegurando que se mantenga la arquitectura DRY y el Single Source of Truth.
 */

// ================================================================================================
// PASO 1: EVALUAR LA GENERICIDAD DEL TIPO
// ================================================================================================

/**
 * Preguntate: "¿Será este tipo reutilizado en múltiples módulos?"
 * 
 * EJEMPLOS DE TIPOS GENÉRICOS (→ base.type.ts):
 * ✓ EntityId (usado en BD, handlers, types, etc.)
 * ✓ PaginationParams (usado en handlers, queries, etc.)
 * ✓ ApiResponse<T> (patrón de respuesta genérico)
 * ✓ QueryError (error de BD genérico)
 * ✓ LoggerInterface (interfaz de logging genérica)
 * 
 * EJEMPLOS DE TIPOS ESPECÍFICOS (→ module.type.ts):
 * ✓ StoreKnowledgeInput (solo para handlers)
 * ✓ KnowledgeEntryRow (específico de queries)
 * ✓ DatabaseSchema (específico de client)
 * ✓ EmbeddingResponse (específico de embeddings)
 */

// ================================================================================================
// PASO 2: SELECCIONAR LA UBICACIÓN
// ================================================================================================

/**
 * 
 * ┌─────────────────────────────────────────────────────────────────────────────────┐
 * │ FLUJO DE DECISIÓN                                                               │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 * 
 *     ¿Es un tipo primitivo o patrón genérico?
 *              │
 *     ┌────────┴────────┐
 *     │                 │
 *    SÍ                NO
 *     │                 │
 *     ↓                 ↓
 * base.type.ts     ¿Tiene una dependencia clara?
 *                  de un módulo?
 *                       │
 *                  ┌────┴────┐
 *                  │          │
 *                 SÍ         NO
 *                  │          │
 *                  ↓          ↓
 *            module.type.ts   types.ts
 *
 */

// ================================================================================================
// PASO 3: ESTRUCTURA DEL ARCHIVO
// ================================================================================================

/**
 * ESTRUCTURA RECOMENDADA PARA UN NUEVO MODULE.TYPE.TS:
 * 
 * ```typescript
 * // 1. Header con descripción
 * /// Type definitions for [module name]
 * /// Extends base.type.ts for common patterns
 * 
 * // 2. Imports de base.type.ts (solo lo que uses)
 * import type { EntityId, ApiResponse, PaginationParams } from '../base.type.ts';
 * 
 * // 3. Tipos específicos
 * export type SpecificInput = {
 *   id: EntityId;  // Usa tipos de base
 *   name: string;
 * };
 * 
 * // 4. Reutiliza patrones genéricos
 * export type SpecificResult = ApiResponse<SpecificData>;
 * ```
 */

// ================================================================================================
// PASO 4: PATRONES COMUNES A REUTILIZAR
// ================================================================================================

/**
 * Antes de crear un nuevo tipo, verifica si alguno de estos patrones encaja:
 * 
 * 1. RESPUESTAS:
 *    - Use ApiResponse<T> para envueltas de éxito/error
 *    - Use SuccessResponse<T> o ErrorResponse específicamente si necesitas
 *    - Nunca crees tu propio patrón de respuesta
 * 
 * 2. IDENTIFICADORES:
 *    - Use EntityId para identificadores genéricos
 *    - Siempre es string, reutiliza en lugar de crear type UserId = string
 * 
 * 3. TIMESTAMPS:
 *    - Use EntityTimestamp para fechas ISO 8601
 *    - Nunca uses string plano para fechas
 * 
 * 4. PAGINACIÓN:
 *    - Use PaginationParams para limit/offset
 *    - Extiende con & si necesitas campos adicionales
 * 
 * 5. DATABASES:
 *    - Use DatabaseRow como base para todas las filas
 *    - Extiende con & para campos específicos
 * 
 * 6. EMBEDDINGS:
 *    - Use Embedding para vectors (number[])
 *    - Use EmbeddingBatch para lotes (number[][])
 */

// ================================================================================================
// PASO 5: EJEMPLOS PRÁCTICOS
// ================================================================================================

/**
 * EJEMPLO 1: Agregar un nuevo módulo "analytics"
 * 
 * Archivo: src/analytics/analytics.type.ts
 * 
 * ```typescript
 * import type { EntityId, EntityTimestamp, ApiResponse, PaginationParams } from '../base.type.ts';
 * 
 * export type AnalyticsEvent = {
 *   id: EntityId;
 *   user_id: EntityId;
 *   event_type: 'view' | 'click' | 'search';
 *   created_at: EntityTimestamp;
 * };
 * 
 * export type AnalyticsQuery = PaginationParams & {
 *   user_id?: EntityId;
 *   event_type?: string;
 * };
 * 
 * export type AnalyticsResult = ApiResponse<AnalyticsEvent[]>;
 * ```
 * 
 * ANÁLISIS:
 * ✓ Reutiliza EntityId (de base)
 * ✓ Reutiliza EntityTimestamp (de base)
 * ✓ Extiende PaginationParams (de base)
 * ✓ Usa ApiResponse (de base)
 * ✓ Sin duplicación de patrones
 */

/**
 * EJEMPLO 2: Agregar un tipo de entrada
 * 
 * Archivo: src/handlers/export.type.ts
 * 
 * ```typescript
 * import type { EntityId, ApiResponse } from '../base.type.ts';
 * 
 * export type ExportFormat = 'json' | 'csv' | 'pdf';
 * 
 * export type ExportInput = {
 *   user_id: EntityId;
 *   format: ExportFormat;
 *   include_metadata?: boolean;
 * };
 * 
 * export type ExportResult = ApiResponse<{
 *   file_url: string;
 *   size: number;
 * }>;
 * ```
 * 
 * ANÁLISIS:
 * ✓ Reutiliza EntityId
 * ✓ Usa ApiResponse para envolvente
 * ✓ Tipos específicos del módulo en export.type.ts
 * ✓ Limpio y sin redundancias
 */

// ================================================================================================
// PASO 6: VALIDACIÓN
// ================================================================================================

/**
 * Antes de hacer commit, verifica:
 * 
 * CHECKLIST:
 * □ npm run build compila sin errores
 * □ No hay uso de 'any'
 * □ No hay uso de 'interface'
 * □ No hay duplicación de tipos primitivos
 * □ Los tipos genéricos están en base.type.ts
 * □ Los tipos específicos están en module.type.ts
 * □ Todos los imports vienen de la fuente correcta
 * □ La documentación del tipo es clara
 * □ Reutilizas patrones de base.type.ts donde es posible
 */

// ================================================================================================
// PASO 7: ACTUALIZAR DOCUMENTACIÓN
// ================================================================================================

/**
 * Si agregaste un nuevo tipo genérico a base.type.ts:
 * 
 * 1. Actualiza base.type.ts con comentarios JSDoc
 * 2. Agrega un ejemplo en TYPING_ARCHITECTURE.ts
 * 3. Actualiza este archivo de guidelines
 * 4. Commit con mensaje: "type: add new generic type [TypeName]"
 * 
 * Si agregaste un nuevo módulo:
 * 
 * 1. Crea module.type.ts
 * 2. Crea module.ts con la implementación
 * 3. Actualiza imports en los módulos que lo usen
 * 4. Documenta el nuevo patrón si es repetible
 * 5. Commit con mensaje: "feat: add [module-name] with full typing"
 */

// ================================================================================================
// ANTIPATRONES A EVITAR
// ================================================================================================

/**
 * ❌ NO hagas esto:
 * 
 * 1. Duplicar tipos primitivos
 *    MALO:  export type UserId = string;
 *    BUENO: Use EntityId from base.type.ts
 * 
 * 2. Crear patrones de respuesta personalizados
 *    MALO:  type MyResponse = { ok: boolean; data?: T; error?: string };
 *    BUENO: Use ApiResponse<T> from base.type.ts
 * 
 * 3. Usar 'any' en ningún caso
 *    MALO:  function process(data: any) {}
 *    BUENO: function process(data: ProcessData) {}
 * 
 * 4. Definir timestamps como string plano
 *    MALO:  created_at: string;
 *    BUENO: created_at: EntityTimestamp;
 * 
 * 5. Crear interfaces en lugar de types
 *    MALO:  interface User { ... }
 *    BUENO: type User = { ... }
 * 
 * 6. No reutilizar DatabaseRow para tablas BD
 *    MALO:  type UserRow = { id: string; created_at: string; ... }
 *    BUENO: type UserRow = DatabaseRow & { ... }
 */

// ================================================================================================
// MIGRANDO CÓDIGO EXISTENTE
// ================================================================================================

/**
 * Si encuentras código antiguo que no sigue estos patrones:
 * 
 * PLAN DE MIGRACIÓN:
 * 1. Identifica el tipo primitivo duplicado
 * 2. Verifica que existe en base.type.ts
 * 3. Reemplaza el tipo antiguo con el de base.type.ts
 * 4. Actualiza todos los imports
 * 5. Ejecuta npm run build para verificar
 * 6. Commit: "refactor: deduplicate types, use base.type.ts"
 * 
 * EJEMPLO:
 * 
 * ANTES (en module.type.ts):
 *   export type UserId = string;
 *   export type Timestamp = string;
 * 
 * DESPUÉS (en module.type.ts):
 *   import type { EntityId, EntityTimestamp } from '../base.type.ts';
 *   // UserId y Timestamp se reemplazan con imports
 */

// ================================================================================================
// PREGUNTAS FRECUENTES
// ================================================================================================

/**
 * P: ¿Dónde va un tipo que es usado por 2 módulos?
 * R: Si es genérico (p.ej., PaginationParams) → base.type.ts
 *    Si es específico del dominio → types.ts
 * 
 * P: ¿Puedo extender ApiResponse con más campos?
 * R: Sí, usa & para extender:
 *    type MyResponse = ApiResponse<Data> & { meta: object };
 * 
 * P: ¿Necesito un .type.ts si mi módulo es pequeño?
 * R: Sí, mantenlo consistente. Un .type.ts vacío es mejor que
 *    tipos inline. Deja el .type.ts como futuro hogar para tipos.
 * 
 * P: ¿Qué pasa si necesito un tipo muy específico?
 * R: Puede existir solo en module.type.ts. No todo debe ser genérico.
 *    Solo asegúrate que no sea una versión ligeramente diferente
 *    de un tipo que ya existe.
 * 
 * P: ¿Cómo organizo tipos internos vs exportados?
 * R: Exporta los públicos, mantén privados los internos (sin export)
 *    Todos en el mismo .type.ts
 */

export {};
