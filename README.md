# Gabo MCP

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-132-6c9fcc?style=flat)](https://vitest.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1+-6c9fcc?style=flat&logo=vitest)](https://vitest.dev/)
[![Biome](https://img.shields.io/badge/Biome-2.4.4-60a5fa?style=flat)](https://biomejs.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-94.36%25-22c55e?style=flat)](https://vitest.dev/guide/coverage)
[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

> Tu memoria técnica personal impulsada por IA.

Servidor MCP (Model Context Protocol) que actúa como **memoria técnica personal**. Cada decisión de diseño, patrón, error corregido y snippet queda registrado y disponible para cualquier agente de IA que trabaje contigo.

---

## Tabla de Contenidos

- [¿Por qué existe?](#por-qué-existe)
- [Quick Start](#quick-start)
- [Tecnologías](#tecnologías)
- [Herramientas Disponibles](#herramientas-disponibles)
- [Uso](#uso)
- [Tests](#tests)
- [Variables requeridas](#variables-requeridas)
- [Configuración MCP](#configuración-mcp)
- [Logs](#logs)
- [Documentación](#documentación)
- [Estructura](#estructura)

---

## Quick Start (30 segundos)

```bash
# 1. Clonar y entrar
git clone https://github.com/gabo-mcp/gabo-mcp.git
cd gabo-mcp

# 2. Instalar dependencias
npm install

# 3. Configurar MongoDB (requerido)
# Crea una cuenta gratuita en MongoDB Atlas y obten tu URI
export MONGODB_URI="mongodb+srv://tu-uri"

# 4. Ejecutar (la API key se genera automáticamente)
npm run dev:local
```

¡Listo! El servidor está corriendo en `mcp://localhost:3000`. La primera ejecución genera tu `MCP_API_KEY` automáticamente.

---

## ¿Por qué existe?

Si has trabajado con IA sabe que cada nuevo proyecto requiere repetir las mismas explicaciones:

> "Yo siempre prefiero `type` sobre `interface`"  
> "No uses `console.log`, usa mi logger"  
> "Este es el patrón que uso para manejo de errores"

**Gabo MCP resuelve esto.** Tus herramientas de IA recuerdan cómo trabajas, sin que tengas que repetirlo.

---

## Decisiones Técnicas

Decisiones arquitectónicas y técnicas que Tomé al construir Gabo MCP.

→ Ver [docs/DECISIONES.md](docs/DECISIONES.md)

---

## Tecnologías

| Categoría     | Tecnología    | Versión mínima |
| ------------- | ------------- | -------------- |
| Runtime       | Node.js       | 24.0.0         |
| Lenguaje      | TypeScript    | 5.6.0          |
| Protocolo     | MCP SDK       | 1.25.3         |
| Base de datos | MongoDB Atlas | -              |
| Embeddings    | Ollama        | -              |
| Validación    | Zod           | 3.22.0         |
| Testing       | Vitest        | 2.1.0          |
| Linting       | Biome         | 2.4.4          |

---

## Herramientas Disponibles

| Herramienta      | Propósito                                          |
| ---------------- | -------------------------------------------------- |
| `save`           | Guardar conocimiento con validación + sanitización |
| `search`         | Búsqueda text, semantic o hybrid                   |
| `list`           | Listar entradas con paginación                     |
| `get`            | Obtener detalle por ID                             |
| `delete`         | Eliminar entrada                                   |
| `get_audit_logs` | Ver logs de auditoría                              |

---

## Uso

```bash
# Desarrollo con watch
npm run dev

# Desarrollo local
npm run dev:local

# Inspector MCP (interfaz visual)
npm run dev:inspector

# Build
npm run build
```

---

## Tests

```bash
# Unit tests (132 tests)
npm run test

# Coverage
npm run test:coverage
```

---

## Variables requeridas

```bash
MONGODB_URI=mongodb+srv://...
MCP_API_KEY=gabo_xxx  # Genera con: npm run generate:key
```

---

## Configuración MCP

```json
{
  "mcpServers": {
    "gabo-mcp": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/gabo-mcp/src/index.ts"]
    }
  }
}
```

### VS Code

```bash
npm run dev:local
```

Presiona `Cmd+Shift+P` → "MCP Debugger" → Select `gabo-mcp-local`

### Continue.dev

Configuración en `~/.continue/config.yml`. Auto-detecta `gabo-mcp-local`.

---

## Logs

Los logs se escriben en `/tmp/gabo-mcp.log`.

- **Rotación**: Se rotan al superar 5MB
- **Limpieza**: Se eliminan logs con más de 3 días

---

## Documentación (minimal)

- Public overview: [docs/PUBLIC_OVERVIEW.md](docs/PUBLIC_OVERVIEW.md)
- [AGENTS.md](AGENTS.md) - Guías para agentes de IA

---

## Estructura

```
src/
├── config/          # Configuración centralizada (constants.ts)
├── db/              # MongoDB client, queries, vector search
├── middleware/      # Auth, sanitization
├── tools/           # MCP tools (save, search, list, get, delete)
├── embeddings/      # Ollama/OpenAI integration
├── schemas/         # Zod schemas (fuente de verdad)
├── utils/           # Logger, API, tool-handler keys
└── types.ts        # Tipos centralizados
```

---

**Gabo MCP** © 2026 @gabo
