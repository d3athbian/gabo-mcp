# Manifesto Gabo MCP

> Tu memoria personal de inteligencia artificial.

## Filosofía

Gabo MCP es el puente entre tus pensamientos técnicos y tus herramientas de IA. En lugar de explicar tus patrones de diseño o decisiones de arquitectura una y otra vez, Gabo MCP permite que tus agentes (Cursor, Claude, Continue, OpenCode) **recuerden** cómo trabajas.

## Principios Fundamentales

### 1. Captura Continua

Cada solución que descubres, cada error que corriges, cada patrón que refinas merece ser guardado. No relies en tu memoria.

### 2. Reutilización Inteligente

El conocimiento sin acceso es conocimiento perdido. Búsqueda semántica y por keywords garantizan que encuentras lo que necesitas.

### 3. Seguridad por Diseño

Tu conocimiento es privado. Sanitización automática previene accidentes. Autenticación protege el acceso.

### 4. Aprendizaje Automático

Los agentes no solo consultan, también destilan. Después de cada tarea, pueden capturar lecciones aprendidas.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      Cliente IA                          │
│         (Cursor, Claude, Continue, OpenCode)             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    MCP Protocol                          │
│              (Model Context Protocol)                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Gabo MCP Server                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Tools      │  │  Middleware  │  │  Sanitization   │ │
│  │ 7 funciones │  │  Auth + Auth │  │  Content Guard  │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 MongoDB Atlas                            │
│           (Persistencia + Vector Search)                 │
└─────────────────────────────────────────────────────────┘
```

## Componentes

### Herramientas (Tools)

1. **store_knowledge** - Guardar conocimiento
2. **search_knowledge** - Búsqueda por keywords
3. **semantic_search** - Búsqueda por vectores
4. **list_knowledge** - Listar entradas
5. **get_knowledge** - Obtener por ID
6. **suggest_patterns** - Sugerir patrones similares
7. **get_pitfalls** - Checklist preventivo

### Middleware

- **Auth**: Validación de API keys contra MongoDB
- **Sanitization**: Detección de datos sensibles

### Base de Datos

- MongoDB Atlas (M0 Free Tier compatible)
- Vector Search para búsqueda semántica

## Tipos de Conocimiento

| Tipo                | Propósito                                       |
| ------------------- | ----------------------------------------------- |
| `UI_UX`             | Decisiones de interfaz y experiencia de usuario |
| `ARCH_DECISION`     | Decisiones de arquitectura de alto nivel        |
| `PROMPT`            | Prompts refinados que funcionan                 |
| `ERROR_CORRECTION`  | Lecciones de bugs corregidos                    |
| `CODE_SNIPPET`      | Fragmentos de código reutilizables              |
| `DESIGN_DECISION`   | Principios y estándares de diseño               |
| `TECHNICAL_INSIGHT` | Descubrimientos técnicos                        |
| `PATTERN`           | Patrones reutilizables                          |
| `PITFALL`           | Errores conocidos a evitar                      |
| `INFRASTRUCTURE`    | Docker, Cloud, CI/CD                            |
| `TESTING`           | Estrategias y patrones de testing               |

## Perfiles de Seguridad

### `work` (Máxima seguridad)

Bloquea: credenciales, PII, datos corporativos, variables de entorno.

### `personal` (Seguridad estándar)

Bloquea: credenciales, PII crítico.

## Contribución

1. Fork del repositorio
2. Crear branch feature
3. Agregar tests
4. Asegurar coverage > 80%
5. Submit PR

## Licencia

MIT - Feel free to use, modify, distribute.

---

**Desarrollado por @gabo** | Inspirado en Advanced Agentic Coding de DeepMind
