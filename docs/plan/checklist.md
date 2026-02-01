# Project Checklist - Personal Knowledge MCP

**Last Updated:** February 1, 2026  
**Status:** Phase 3 (MCP Core) - In Progress

---

## Resumen de Progreso

| Phase | Nombre                  | Estado         |
| ----- | ----------------------- | -------------- |
| 0     | Foundations             | ✅ Completado  |
| 1     | Supabase Infrastructure | ⏳ Pendiente   |
| 2     | Schema Design           | ⏳ Pendiente   |
| 3     | MCP Server Core         | 🔄 En Progreso |
| 4     | Vector Search           | ⏳ Pendiente   |
| 5     | Human Interaction       | ⏳ Pendiente   |
| 6     | IDE Integration         | ⏳ Pendiente   |
| 7     | Agent Evolution         | ⏳ Pendiente   |

---

## Phase 0: Foundations ✅

### 0.1 Knowledge Definition ✅

- [x] Documentar qué constituye "knowledge"
- [x] Definir política de almacenamiento con 8 tipos de captura
- [x] Crear `docs/plan/knowledge-guidelines.md`
- [x] Definir estructura de metadatos

### 0.2 Privacy & Security Policy ✅

- [x] Crear `docs/plan/privacy-policy.md`
- [x] Documentar datos permitidos (9 categorías)
- [x] Documentar datos prohibidos (8 categorías)
- [x] Definir estrategia RLS para Supabase
- [x] Definir requisitos de encriptación
- [x] Establecer políticas de retención
- [x] Definir derechos del usuario

### 0.3 Project Structure ✅

- [x] Crear `tsconfig.json`
- [x] Crear `package.json` con scripts
- [x] Crear `.env.example`
- [x] Crear `README.md`
- [x] Crear estructura `src/`
- [x] Configurar arquitectura de tipos con Zod
- [x] Documentar arquitectura en `docs/plan/typing/architecture.md`

---

## Phase 1: Supabase Infrastructure ⏳

### 1.1 Project Creation

- [ ] Crear Supabase project en cloud console
- [ ] Seleccionar región
- [ ] Guardar `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `.env`
- [ ] Generar y guardar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Probar conexión: `npx supabase status`

### 1.2 Extensions

- [ ] Habilitar extensión `pgvector`
- [ ] Habilitar extensión `uuid-ossp`
- [ ] Verificar extensiones: `SELECT * FROM pg_extension;`

### 1.3 Authentication Setup

- [ ] Habilitar email/password auth
- [ ] Configurar redirect URLs
- [ ] Crear cuenta de test
- [ ] Probar login flow

### 1.4 Validation

- [ ] Extensiones activas
- [ ] Autenticación funciona
- [ ] Conexión a DB funciona

---

## Phase 2: Schema Design ⏳

### 2.1 Core Tables

- [ ] Crear tabla `knowledge_entries`
- [ ] Crear tabla `knowledge_tags`
- [ ] Crear tabla `knowledge_audit_log`

### 2.2 Row Level Security

- [ ] Habilitar RLS en todas las tablas
- [ ] Crear policies para aislar datos por usuario
- [ ] Probar que usuario A no ve datos de usuario B

### 2.3 Indexes

- [ ] Crear índices para búsquedas eficientes
- [ ] Configurar índice vectorial para pgvector

### 2.4 Validation

- [ ] Todos los schemas creados sin errores
- [ ] RLS enforced
- [ ] Tests de aislamiento de datos

---

## Phase 3: MCP Server Core 🔄

### 3.1 Server Setup ✅

- [x] Instalar dependencias (`@modelcontextprotocol/sdk`, `zod`)
- [x] Configurar TypeScript
- [x] Crear entry point `src/index.ts`
- [x] Configurar logger en `src/utils/logger.ts`

### 3.2 Core Tools (In-Memory) ✅

- [x] `store_knowledge` - Guardar entries
- [x] `search_knowledge` - Buscar por keywords
- [x] `list_knowledge` - Listar con paginación
- [x] `get_knowledge` - Obtener entry específico

### 3.3 Zod Schema Architecture ✅

- [x] `src/schemas/index.schema.ts` como fuente de verdad
- [x] Tipos inferidos con `z.infer`
- [x] Eliminar tipos duplicados en `.type.ts`
- [x] Documentar arquitectura de tipos

### 3.4 Conectar a Supabase (Pendiente)

- [ ] Implementar `src/db/client.ts` con Supabase
- [ ] Implementar `src/db/queries.ts` para operaciones CRUD
- [ ] Reemplazar storage in-memory por Supabase
- [ ] Configurar variables de entorno

### 3.5 Validation

- [x] Server compila sin errores
- [x] Tools funcionan (con storage in-memory)
- [ ] Server conecta a Supabase (pendiente)
- [ ] Response time <200ms (pendiente)

---

## Phase 4: Vector Search ⏳

### 4.1 Embedding Model Setup

- [ ] Instalar Ollama: `brew install ollama`
- [ ] Descargar modelo: `ollama pull nomic-embed-text`
- [ ] Verificar: `curl http://localhost:11434/api/tags`
- [ ] Configurar `OLLAMA_API_URL` en `.env`

### 4.2 Vector Storage

- [ ] Crear módulo `src/embeddings/ollama.ts`
- [ ] Implementar `generateEmbedding(text)`
- [ ] Implementar `batchEmbeddings(texts)`
- [ ] Manejo de errores (fallback si Ollama no disponible)
- [ ] Cache de embeddings

### 4.3 Semantic Search

- [ ] Convertir query a embedding
- [ ] Buscar similar embeddings en pgvector
- [ ] Implementar hybrid search (semantic + keyword)
- [ ] Configurar threshold (0.7 cosine similarity)
- [ ] Configurar límite de resultados

### 4.4 Validation

- [ ] Embeddings se generan correctamente
- [ ] Búsqueda semántica retorna resultados relevantes
- [ ] Performance <1s para búsqueda
- [ ] Hybrid search combina resultados

---

## Phase 5: Human Interaction ⏳

### 5.1 Command Format

- [ ] Definir formato estructurado para captura
- [ ] Documentar ejemplo de uso

### 5.2 CLI Tool

- [ ] Crear comando `npm run capture`
- [ ] Validar input antes de guardar
- [ ] Soportar tags como argumentos

### 5.3 Preview Mode

- [ ] Mostrar qué se guardará antes de confirmar
- [ ] Highlight de title, content preview, tags
- [ ] Confirmación antes de guardar
- [ ] Mostrar dónde se almacena

### 5.4 Validation

- [ ] CLI tool funciona
- [ ] Preview muestra datos correctos
- [ ] Tags indexados correctamente
- [ ] Fácil de usar

---

## Phase 6: IDE Integration ⏳

### 6.1 Continue.dev Integration

- [ ] Configurar extensión Continue.dev
- [ ] Exponer tool `store_knowledge`
- [ ] Exponer tool `search_knowledge`
- [ ] Comando `/save_knowledge`
- [ ] Comando `/search`

### 6.2 VS Code Integration

- [ ] Documentar setup de MCP connection
- [ ] Keyboard shortcut: Ctrl+Shift+K
- [ ] Context menu: "Add to knowledge base"

### 6.3 Validation

- [ ] Herramientas accesibles desde IDE
- [ ] Respuesta rápida
- [ ] Intuitivo de usar

---

## Phase 7: Agent Evolution ⏳

### 7.1 Knowledge Loader

- [ ] Tool: `load_knowledge` - obtener entries recientes
- [ ] Resumir learnings por tipo
- [ ] Formatear como enhancement de system prompt
- [ ] Cache para eficiencia

### 7.2 Dynamic Prompt Generation

- [ ] Generar base system prompt desde knowledge
- [ ] Incluir principios técnicos del usuario
- [ ] Incluir preferencias de estilo de código
- [ ] Incluir patrones conocidos

### 7.3 Versioning & Evolution

- [ ] Tag knowledge con versión
- [ ] Rastrear evolución del approach
- [ ] Ability to "rollback to previous you"
- [ ] Comparar diferentes approaches

### 7.4 Continuous Refinement

- [ ] Agente sugiere nuevos aprendizajes
- [ ] Usuario valida/rechaza sugerencias
- [ ] Knowledge se vuelve más preciso
- [ ] Feedback loop

---

## Non-Negociables ✅

| Principio              | Estado                           |
| ---------------------- | -------------------------------- |
| ❌ Nada automático     | ✅ Requiere comando explícito    |
| ❌ Nada sin validación | ✅ Preview y confirmación        |
| ✅ Todo observable     | ✅ Logs de todas las operaciones |
| ✅ Todo versionable    | ✅ Timestamps, audit log         |
| ✅ Todo portable       | ✅ Export como JSON              |

---

## Success Metrics

### Phase 0 ✅

- [x] Privacy policy documentada
- [x] Project plan detallado
- [x] TypeScript configurado
- [x] Arquitectura de tipos definida

### Phase 3 🔄

- [x] Server inicia sin errores
- [x] 4 tools funcionando (in-memory)
- [ ] Tools funcionan con Supabase
- [ ] Response time <200ms

### Phase 4 ⏳

- [ ] Embeddings generando
- [ ] Búsqueda semántica funcionando
- [ ] Hybrid search combinando resultados
- [ ] Response time <1s

---

## Próximo Paso Inmediato

**Conectar MCP Server a Supabase** (Phase 3.4)

1. Crear cuenta en Supabase
2. Habilitar pgvector
3. Configurar tablas y RLS
4. Implementar `src/db/client.ts`
5. Implementar `src/db/queries.ts`
6. Reemplazar storage in-memory

---

## Notas de Progreso (Feb 1, 2026)

### Completado Hoy

- ✅ Eliminado `handlers/tools.type.ts` (redundante)
- ✅ `index.type.ts` ahora solo re-exporta desde schemas
- ✅ Todos los tipos de dominio en `schemas/index.schema.ts`
- ✅ Tipos puros mantienen en `base.type.ts` (EntityId, LogFn, etc.)
- ✅ Documentación de arquitectura actualizada
- ✅ Servidor MCP funciona con Zod schemas

### Tech Stack Actual

- Node.js 20 + TypeScript
- @modelcontextprotocol/sdk 1.25.3
- Zod 3.22 (validación + tipos)
- Storage: In-memory (pendiente: Supabase)
- Embeddings: Pendiente (Ollama)

---

_Este checklist se actualiza automáticamente cuando se completan items._
