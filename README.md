# Gabo MCP

> Tu memoria técnica personal impulsada por IA.

Gabo MCP es un servidor MCP (Model Context Protocol) que actúa como tu **memoria técnica personal**. Cada decisión de diseño, patrón emergente, error corregido y snippet valioso queda registrado y disponible para cualquier agente de IA que trabaje contigo.

---

## ¿Por qué existe?

Si has trabajado con IA sabe que cada nuevo proyecto requiere repetir las mismas explicaciones:

> "Yo siempre prefiero `type` sobre `interface`"  
> "No uses `console.log`, usa mi logger"  
> "Este es el patrón que uso para manejo de errores"

**Gabo MCP resuelve esto.** Tus herramientas de IA recuerdan cómo trabajas, sin que tengas que repetirlo.

---

## ¿Qué hace por ti?

### 🧠 Memoria eterna

Cada patrón, decisión y corrección se guarda automáticamente. No más pierde-escucha-busca en Slack.

### 🔍 Búsqueda inteligente

Encuentra lo que necesitas por **palabras clave** o por **significado**. "¿Dónde guardé eso de los tipos en TypeScript?" → encuentra exactamente eso.

### 🛡️ Tu conocimiento, seguro

Sistema de sanitización automático. Advierte sobre credenciales pero tú decides qué guardar.

### ⚡ Búsqueda semántica

Vector embeddings con Ollama + MongoDB Atlas. Encuentra conceptos similares, no solo palabras coincidentes.

---

## Uso rápido

```bash
# Ejecutar el servidor
npm run dev:local
```

### Guardar algo nuevo

```json
{
  "name": "save",
  "arguments": {
    "type": "PATTERN",
    "title": "Validación de tipos con Zod",
    "content": "Usar Zod para validación en tiempo de ejecución...",
    "tags": ["typescript", "zod", "validation"]
  }
}
```

O simplemente en texto:

> "Gabo, guarda este patrón de validación con Zod"

### Buscar

```json
{
  "name": "search",
  "arguments": {
    "query": "validación typescript",
    "mode": "hybrid",
    "limit": 5
  }
}
```

---

## Tecnologías

- **Runtime**: Node.js 24+ (ES Modules)
- **Protocolo**: Model Context Protocol (MCP)
- **Base de datos**: MongoDB Atlas (persistencia + vector search)
- **Embeddings**: Ollama (modelo `nomic-embed-text`)
- **Lenguaje**: TypeScript

---

## Categorías de conocimiento

| Tipo                | Para qué                   |
| ------------------- | -------------------------- |
| `PATTERN`           | Patrones reutilizables     |
| `PITFALL`           | Errores a evitar           |
| `ERROR_CORRECTION`  | Lecciones de bugs          |
| `CODE_SNIPPET`      | Snippets valiosos          |
| `PROMPT`            | Prompts que funcionan      |
| `ARCH_DECISION`     | Decisiones de arquitectura |
| `TECHNICAL_INSIGHT` | Descubrimientos técnicos   |

---

## Setup

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Ejecutar
npm run dev:local
```

### Variables requeridas

```bash
MONGODB_URI=mongodb+srv://...
MCP_API_KEY=tu_api_key_aqui
```

### Configuración en Cursor/Claude Desktop

```json
{
  "mcpServers": {
    "gabo-mcp": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/gabo-mcp/src/index.ts"],
      "env": {
        "MONGODB_URI": "mongodb+srv://...",
        "MCP_API_KEY": "gabo_xxx"
      }
    }
  }
}
```

---

## Built with AI

Este proyecto fue diseñado y construido **íntegramente con asistencia de IA**. Cada componente, desde la arquitectura hasta los tests, fue desarrollado usando modelos de lenguaje.

> "La IA no solo escribe código: diseña sistemas, propone arquitecturas y construye aplicaciones completas."

- Integración de APIs de IA
- Patrones de diseño modernos
- Protocolos emergentes (MCP)
- Vector search y embeddings
- Arquitectura cloud-native

---

## Documentación

- [FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) - Herramientas disponibles
- [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) - Guía de instalación
- [VECTOR_SEARCH_SETUP.md](docs/VECTOR_SEARCH_SETUP.md) - Búsqueda semántica

---

**Gabo MCP** © 2026 @gabo
