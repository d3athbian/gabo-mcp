# Project Checklist - Personal Knowledge MCP

**Last Updated:** February 1, 2026  
**Status:** Phase 1 (MongoDB Atlas Setup) - In Progress  
**Database:** MongoDB Atlas M0 (Free Tier)  
**Architecture:** Zod schemas → MongoDB + Vector Search

---

## Resumen de Progreso

| Phase | Nombre            | Estado            | Notas                                                |
| ----- | ----------------- | ----------------- | ---------------------------------------------------- |
| 0     | Foundations       | ✅ Completado     | Documentación, tipos Zod, estructura                 |
| 1     | **MongoDB Atlas** | ✅ **Completado** | Cluster, índices, conexión, seguridad                |
| 2     | Schema Design     | ✅ Completado     | Esquemas definidos en código                         |
| 3     | MCP Server Core   | ✅ **Completado** | 5 tools modulares con arquitectura limpia            |
| 4     | Vector Search     | 🔄 En Progreso    | Auto-embeddings en store, semantic_search tool listo |
| 5     | Human Interaction | ⏳ Pendiente      | CLI tool, preview mode                               |
| 6     | IDE Integration   | ⏳ Pendiente      | Continue.dev                                         |
| 7     | Agent Evolution   | ⏳ Pendiente      | Dynamic prompts                                      |

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
- [x] Definir estrategia de seguridad (app-level con user_id)
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
- [x] Actualizar manifesto para MongoDB Atlas

---

## Phase 1: MongoDB Atlas Infrastructure 🔄

### 1.1 Cluster Setup

- [x] Crear cuenta en MongoDB Atlas
- [x] Crear cluster M0 (Free Forever)
- [x] Seleccionar región (AWS/GCP/Azure)
- [x] Configurar IP Whitelist (0.0.0.0/0 para desarrollo)
- [x] Crear usuario de base de datos
- [x] Guardar `MONGODB_URI` en `.env`
- [ ] Probar conexión con aplicación

### 1.2 Atlas Vector Search Configuration

- [x] Crear colección `knowledge_entries`
- [x] Crear índice vectorial
- [x] Configurar: path="embedding", numDimensions=768, similarity="cosine"
- [x] Verificar índice creado en Atlas UI

### 1.3 Security Setup

- [x] Implementar filtrado por `user_id` en todas las queries
- [x] Validar ownership en operaciones de escritura
- [x] Documentar patrón de seguridad

### 1.4 Validation

- [x] Conexión exitosa a MongoDB Atlas
- [x] Índice vectorial configurado
- [x] Seguridad implementada

---

## Phase 2: MongoDB Schema Design ✅

### 2.1 Core Collections

- [x] Definir esquema `knowledge_entries` (documentos con embedding)
- [x] Definir esquema `knowledge_tags` (tags normalizados)
- [x] Definir esquema `knowledge_audit_log` (auditoría)

### 2.2 Indexes

- [x] Índice en `user_id` (todas las colecciones)
- [x] Índice en `type` (knowledge_entries)
- [x] Índice en `created_at` descendente
- [x] Índice en `tags` (array)
- [x] Índice de texto en `title` + `content`
- [x] Índice vectorial (Atlas Vector Search)

### 2.3 Validation

- [x] Esquemas Zod definidos
- [x] Tipos TypeScript inferidos
- [x] Queries implementadas

---

## Phase 3: MCP Server Core 🔄

### 3.1 Server Setup ✅

- [x] Instalar dependencias (`@modelcontextprotocol/sdk`, `zod`)
- [x] Configurar TypeScript
- [x] Crear entry point `src/index.ts`
- [x] Configurar logger en `src/utils/logger.ts`

### 3.2 Database Integration ✅

- [x] Instalar driver MongoDB
- [x] Implementar `src/db/client.ts`
- [x] Implementar `src/db/queries.ts`
- [x] Implementar `src/db/vector-search.ts`
- [x] Cargar variables de entorno con dotenv

### 3.3 Core Tools ✅

- [x] `store_knowledge` - Guardar entries en MongoDB
- [x] `search_knowledge` - Buscar por keywords
- [x] `list_knowledge` - Listar con paginación
- [x] `get_knowledge` - Obtener entry específico
- [x] `semantic_search` - Búsqueda semántica con embeddings

### 3.4 Tool Architecture ✅

- [x] Modularizar tools en carpeta `tools/`
- [x] Crear `tools/index.ts` para registro centralizado
- [x] Crear `tools/index.type.ts` para tipos de tools
- [x] Implementar patrón `ToolDefinition<T>`
- [x] Delegar `registerAllTools()` desde `index.ts`
- [x] Simplificar `index.ts` (de ~440 a ~120 líneas)

### 3.5 Error Handling ✅

- [x] Crear `utils/tool-handler.ts` con patrones base.type.ts
- [x] Implementar `handleToolError()` para catch blocks
- [x] Implementar `successResponse()` para respuestas exitosas
- [x] Implementar `validationError()` para validaciones
- [x] Usar tipos de base.type.ts (`ContentBlock`, `ErrorResponse`, `LogLevel`)
- [x] Eliminar código repetitivo en handlers

### 3.4 Validation

- [x] Server compila sin errores
- [x] Server conecta a MongoDB Atlas
- [ ] Response time <200ms

---

## Phase 4: Vector Search ⏳

### 4.1 Embedding Model Setup ✅

- [x] Instalar Ollama: `brew install ollama`
- [x] Descargar modelo: `ollama pull nomic-embed-text`
- [x] Verificar: `curl http://localhost:11434/api/tags`
- [x] Configurar `OLLAMA_API_URL` en `.env`
- [x] Probar generación de embeddings (768 dims verificado)

### 4.2 Vector Storage ✅

- [x] Crear módulo `src/embeddings/index.ts`
- [x] Implementar `generateEmbedding(text)`
- [x] Implementar `batchEmbeddings(texts)`
- [x] Guardar embeddings en MongoDB (campo `embedding`)
- [x] Manejo de errores (fallback si Ollama no disponible)
- [x] Auto-generar embeddings al usar `store_knowledge`

### 4.3 Semantic Search ✅

- [x] Implementar `searchKnowledgeVector` con Atlas Vector Search
- [x] Usar `$vectorSearch` aggregation pipeline
- [x] Calcular cosine similarity en MongoDB
- [x] Configurar límite de resultados (top 10)
- [x] Exponer tool `semantic_search` en MCP
- [ ] Implementar hybrid search (vector + keyword) - Opcional
- [ ] Configurar threshold (0.7 cosine similarity) - Opcional

### 4.4 Validation ✅

- [x] Embeddings se generan correctamente con Ollama
- [x] Embeddings se guardan en MongoDB automáticamente
- [x] Búsqueda semántica tool expuesta y funcionando
- [ ] Performance <1s para búsqueda (requiere índice vectorial en Atlas)
- [ ] Hybrid search combina resultados (opcional)

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
| ✅ Privacy-first       | ✅ Embeddings locales con Ollama |

---

## Success Metrics

### Phase 0 ✅

- [x] Privacy policy documentada
- [x] Project plan detallado
- [x] TypeScript configurado
- [x] Arquitectura de tipos definida

### Phase 1 🔄 (MongoDB Atlas)

- [x] MongoDB Atlas cluster creado
- [x] Atlas Vector Search configurado
- [x] Conexión establecida
- [x] Seguridad implementada

### Phase 2 ✅

- [x] Esquemas definidos
- [x] Tipos inferidos
- [x] Queries implementadas

### Phase 3 🔄

- [x] Server inicia sin errores
- [x] 4 tools funcionando con MongoDB
- [X] Response time <200ms

### Phase 4 ⏳

- [x] Ollama + nomic-embed-text configurado
- [ ] Embeddings guardándose en MongoDB
- [ ] Búsqueda semántica funcionando
- [ ] Hybrid search combinando resultados
- [ ] Response time <1s

---

## Tech Stack Actual

- **Backend:** Node.js 20 + TypeScript
- **MCP SDK:** @modelcontextprotocol/sdk 1.25.3
- **Validation:** Zod 3.22
- **Database:** MongoDB Atlas M0 (Free Tier)
- **Vector Search:** Atlas Vector Search (768 dims)
- **Embeddings:** Ollama + nomic-embed-text (local)
- **Storage:** MongoDB persistente

---

## Recursos Útiles

### MongoDB Atlas

- [M0 Free Tier Limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/)
- [Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Vector Search Documentation](https://www.mongodb.com/community/forums/t/is-vector-search-feature-paid-or-free/267191)

### Ollama

- [Ollama Download](https://ollama.com/download)
- [nomic-embed-text model](https://ollama.com/library/nomic-embed-text)

---

_Este checklist se actualiza cuando se completan items._
