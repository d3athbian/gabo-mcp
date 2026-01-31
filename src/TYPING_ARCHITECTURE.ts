/**
 * TIPADO DEL PROYECTO - ARQUITECTURA
 * ================================================================================================
 * 
 * Este proyecto utiliza un sistema de tipado jerárquico con un archivo base que actúa
 * como "fuente de verdad" para evitar duplicación y mantener consistencia.
 * 
 * ESTRUCTURA:
 * ================================================================================================
 * 
 * 1. base.type.ts (FUENTE DE VERDAD)
 *    └─ Tipos primitivos, patrones comunes y abstracciones genéricas
 *       ├─ Primitivos: NodeEnvironment, LogLevel, EntityId, EntityTimestamp, etc.
 *       ├─ Patrones: BaseEntity, PaginationParams, FilterParams
 *       ├─ Respuestas: ApiResponse<T>, SuccessResponse<T>, ErrorResponse
 *       ├─ Callbacks: LogFn, LogErrorFn, WriteCallback, ErrorCallback
 *       └─ Estructuras: ContentBlock, LoggerInterface, DatabaseRow
 * 
 * 2. Archivos específicos que EXTIENDEN de base.type.ts
 *    ├─ config.type.ts        → Tipos de configuración (DatabaseConfig, EmbeddingsConfig, etc.)
 *    ├─ index.type.ts         → Tipos del servidor MCP (StoredEntry, Logger, MCPToolResponse)
 *    ├─ handlers/tools.type.ts → Tipos de handlers (ToolResult, SearchKnowledgeInput)
 *    ├─ db/client.type.ts     → Tipos del cliente BD (DatabaseSchema, SupabaseClientType)
 *    ├─ db/queries.type.ts    → Tipos de queries (QueryResult<T>, KnowledgeEntryRow)
 *    └─ embeddings/index.type.ts → Tipos de embeddings (EmbeddingResult, BatchEmbeddingsResult)
 * 
 * 3. types.ts (TIPOS DE DOMINIO)
 *    └─ Tipos específicos del negocio que también extienden de base.type.ts
 *       ├─ KnowledgeType (enums de tipos de conocimiento)
 *       ├─ KnowledgeEntry (entity principal)
 *       ├─ CreateKnowledgeInput, SearchKnowledgeInput
 *       └─ SearchResult, EmbeddingResponse
 * 
 * 
 * PRINCIPIOS DE DISEÑO:
 * ================================================================================================
 * 
 * 1. DRY (Don't Repeat Yourself)
 *    ✓ Tipos comunes se definen UNA SOLA VEZ en base.type.ts
 *    ✓ Los demás archivos los importan y reutilizan
 *    ✗ NO hay duplicación de EntityId, EntityTimestamp, ApiResponse, etc.
 * 
 * 2. Single Source of Truth
 *    ✓ base.type.ts es la autoridad para tipos primitivos y patrones
 *    ✓ Cambios centralizados afectan a todo el proyecto
 *    ✗ No hay conflictos entre versiones diferentes del mismo tipo
 * 
 * 3. Type Safety Total
 *    ✓ Cero uso de "any"
 *    ✓ Cero uso de "interface" (solo type)
 *    ✓ Todo está explícitamente tipado
 * 
 * 4. Organización Modular
 *    ✓ Cada archivo tiene su propio .type.ts
 *    ✓ Los tipos están organizados por dominio/responsabilidad
 *    ✓ Fácil de mantener y expandir
 * 
 * 
 * MAPA DE DEPENDENCIAS DE TIPOS:
 * ================================================================================================
 * 
 *                              base.type.ts
 *                                   ↑
 *            ┌──────────────────────┼──────────────────────┐
 *            │                      │                      │
 *      config.type.ts         index.type.ts          tools.type.ts
 *            ↑                      ↑                      ↑
 *          config.ts             index.ts              handlers/tools.ts
 * 
 *                              base.type.ts
 *                                   ↑
 *            ┌──────────────────────┼──────────────────────┐
 *            │                      │                      │
 *      client.type.ts         queries.type.ts      embeddings/index.type.ts
 *            ↑                      ↑                      ↑
 *          client.ts              queries.ts             embeddings/index.ts
 * 
 *                              base.type.ts
 *                                   ↑
 *                              types.ts
 *                                   ↑
 *          handlers/tools.ts    db/queries.ts    embeddings/index.ts
 * 
 * 
 * EJEMPLOS DE REUTILIZACIÓN:
 * ================================================================================================
 * 
 * Ejemplo 1: EntityId
 *    base.type.ts:
 *      export type EntityId = string;
 *    
 *    db/client.type.ts:
 *      export type DatabaseSchema = {
 *        knowledge_entries: DatabaseRow & {
 *          user_id: EntityId;  ← Reutilizado
 *        };
 *      };
 * 
 * 
 * Ejemplo 2: ApiResponse (patrón genérico)
 *    base.type.ts:
 *      export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
 *    
 *    handlers/tools.type.ts:
 *      export type ToolResult = ApiResponse<ToolResultData>;  ← Reutilizado
 * 
 * 
 * Ejemplo 3: PaginationParams
 *    base.type.ts:
 *      export type PaginationParams = {
 *        limit?: number;
 *        offset?: number;
 *      };
 *    
 *    handlers/tools.type.ts:
 *      export type ListKnowledgeInput = PaginationParams;  ← Reutilizado
 * 
 *    types.ts:
 *      export type SearchKnowledgeInput = PaginationParams & {  ← Reutilizado
 *        query: string;
 *        type?: KnowledgeType;
 *      };
 * 
 * 
 * CÓMO AGREGAR NUEVOS TIPOS:
 * ================================================================================================
 * 
 * PASO 1: ¿El tipo es genérico y reutilizable?
 *    SI  → Agregarlo a base.type.ts
 *    NO  → Agregarlo al archivo .type.ts específico del módulo
 * 
 * PASO 2: ¿Extiendo de un tipo base?
 *    SI  → Importar desde base.type.ts
 *    NO  → Definir directamente
 * 
 * PASO 3: ¿Debo exportarlo en types.ts?
 *    SI  → Asegurate de importarlo de la fuente correcta
 *    NO  → Mantenerlo privado al módulo
 * 
 * 
 * CHECKLIST DE CALIDAD:
 * ================================================================================================
 * 
 * ✓ No hay duplicación de tipos entre archivos
 * ✓ Todos los tipos base están en base.type.ts
 * ✓ Cada módulo tiene su propio archivo .type.ts
 * ✓ Cero uso de "any"
 * ✓ Cero uso de "interface"
 * ✓ Todos los imports apuntan a la fuente correcta
 * ✓ TypeScript compila sin errores
 * ✓ Los tipos son enforzados en tiempo de compilación
 */
