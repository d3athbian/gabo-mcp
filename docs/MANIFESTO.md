# Manifesto Gabo MCP

> Memoria técnica personal impulsada por IA.

## Filosofía

Gabo MCP es el puente entre tus pensamientos técnicos y tus herramientas de IA. En lugar de explicar tus patrones de diseño o decisiones de arquitectura una y otra vez, Gabo MCP permite que tus agentes (MiniMax, Gemini, Codex, Claude, Cursor, Continue, OpenCode) **recuerden** cómo trabajas.

## Principios Fundamentales

### 1. Captura Continua

Cada solución que descubres, cada error que corriges, cada patrón que refinas merece ser guardado.

### 2. Reutilización Inteligente

El conocimiento sin acceso es conocimiento perdido. Búsqueda semántica y por keywords garantizan que encuentras lo que necesitas.

### 3. Seguridad por Diseño

Tu conocimiento es privado. Sanitización automática previene accidentes. Autenticación protege el acceso.

### 4. Simplicidad

Una forma de guardar, una forma de buscar, una forma de listar. El usuario decide qué guardar.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      Cliente IA                          │
│         (MiniMax, Gemini, Codex, Claude, etc.)          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    MCP Protocol                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Gabo MCP Server                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Tools      │  │  Middleware │  │  Sanitization   │ │
│  │ 6 funciones │  │  Auth       │  │  Blocking       │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 MongoDB Atlas                            │
│           (Persistencia + Vector Search)                 │
└─────────────────────────────────────────────────────────┘
```

## Herramientas (6)

1. **save** - Guardar conocimiento
2. **search** - Buscar (texto, semántica o híbrido)
3. **list** - Listar entradas
4. **get** - Obtener por ID
5. **delete** - Eliminar entrada
6. **get_audit_logs** - Ver logs de auditoría

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

## Contribución

1. Fork del repositorio
2. Crear branch feature
3. Agregar tests
4. Asegurar coverage > 80%
5. Submit PR

## Licencia

MIT - Feel free to use, modify, distribute.

---

**Desarrollado por @gabo**
