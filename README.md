# Gabo MCP

> Tu memoria técnica personal impulsada por IA.

Servidor MCP (Model Context Protocol) que actúa como **memoria técnica personal**. Cada decisión de diseño, patrón, error corregido y snippet queda registrado y disponible para cualquier agente de IA que trabaje contigo.

---

## ¿Por qué existe?

Si has trabajado con IA sabe que cada nuevo proyecto requiere repetir las mismas explicaciones:

> "Yo siempre prefiero `type` sobre `interface`"  
> "No uses `console.log`, usa mi logger"  
> "Este es el patrón que uso para manejo de errores"

**Gabo MCP resuelve esto.** Tus herramientas de IA recuerdan cómo trabajas, sin que tengas que repetirlo.

---

## Decisiones Técnicas

Decisiones arquitectónicas y técnicos que Tomé constructión Gabo MCP.

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

| Herramienta | Propósito                                          |
| ----------- | -------------------------------------------------- |
| `save`      | Guardar conocimiento con validación + sanitización |
| `search`    | Búsqueda text, semantic o hybrid                   |
| `list`      | Listar entradas con paginación                     |
| `get`       | Obtener detalle por ID                             |
| `delete`    | Eliminar entrada                                   |

---

## Uso

```bash
# Desarrollo con watch
npm run dev

# Desarrollo local
npm run dev:local

# Build
npm run build
```

---

## Tests

```bash
# Unit tests (180+ tests)
npm run test

# Integration tests (CRUD flow)
npx vitest run test/integration/bootstrap.test.ts

# Coverage
npm run test:coverage
```

### Cómo ejecutar tests de integración

Los tests de integración requieren conexión a MongoDB Atlas y una API key válida.

```bash
# 1. Copiar configuración de ejemplo
cp env.example .env

# 2. Editar .env con tus credenciales
#    - MONGODB_URI: Tu connection string de MongoDB Atlas
#    - MCP_API_KEY: Genera una key con npm run generate:key

# 3. Ejecutar tests de integración
npx vitest run test/integration/bootstrap.test.ts
```

Los tests de integración cubren:

- ✅ Bootstrapping de API key
- ✅ Save (crear documentos)
- ✅ List (listar con paginación)
- ✅ Get (obtener por ID)
- ✅ Search (búsqueda por texto)
- ✅ Delete (eliminar documentos)

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

## Documentación

- [DECISIONES.md](docs/DECISIONES.md) - Por qué tomé estas decisiones
- [FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) - Detalle de herramientas
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura técnica
- [SANITIZATION.md](docs/SANITIZATION.md) - Sistema de seguridad
- [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) - Guía de instalación

---

**Gabo MCP** © 2026 @gabo
