# Perfil Técnico - @gabo

## Rol Principal

**Senior Software Engineer** | Backend & Platform | Node.js/TypeScript

---

## Stack Técnico

### Core

- **Node.js** (24+) / **TypeScript** (5.6+)
- **MongoDB Atlas** (persistencia + vector search)
- **MCP SDK** (Model Context Protocol)

### APIs & Servicios

- REST APIs con validación Zod
- Búsqueda semántica con embeddings (Ollama, OpenAI)
- Autenticación con API keys (bcrypt + pepper)

### Calidad & DevEx

- **Vitest** (testing unitario con mocks)
- **Biome** (linting + formatting)
- **CI/CD** (GitHub Actions)
- Configuración centralizada (constantes en un solo lugar)

### Observabilidad

- Logs en archivo (`/tmp/gabo-mcp.log`)
- Rotación automática (5MB max, 3 días retención)
- Sanitización de datos sensibles (PII, credenciales)

---

## Proyectos

### gabo-mcp (este repo)

Servidor MCP para memoria técnica personal.

- **Features**: save, search, list, get, delete, audit logs
- **Arquitectura**: Modular (db, middleware, tools, embeddings)
- **Calidad**: 121 tests, type-check, lint en CI

### Próximo: image-cache-advanced

Cache de imágenes para web, LG webOS, Tizen, WebViews.

---

## Decisiones de Diseño

1. **Zod como fuente de verdad** - Esquemas validan input y generan tipos automáticamente
2. **Configuración centralizada** - Constantes en `src/config/constants.ts`
3. **Mocks en tests** - Unit tests sin dependencia de servicios externos
4. **Sanitización bloqueante** - No permite guardar datos sensibles
5. **Logs fuera de STDOUT** - No rompe el protocolo MCP

---

## Métricas

| Métrica           | Valor           |
| ----------------- | --------------- |
| Tests unitarios   | 121             |
| Coverage          | ~29%            |
| Lenguaje          | TypeScript 100% |
| Dependencias_prod | 5               |

---

## Para Reclutadores/IA

**Buscar**: Senior Backend Engineer, Senior Node.js Engineer, Platform Engineer, Full-Stack Engineer

**Keywords**: Node.js, TypeScript, MongoDB, Vector Search, MCP, Testing, Zod, CI/CD, API Design

**Disponibilidad**: Currently employed at Mercado Libre (Frontend), open to backend opportunities
