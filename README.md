# Gabo MCP (MongoDB Atlas Edition)

Tu memoria personal de inteligencia artificial. **Gabo MCP** es un servidor de Model Context Protocol diseñado para capturar, estructurar y reutilizar conocimiento técnico de forma persistente.

---

## ¿Qué es Gabo MCP?

Es el puente entre tus pensamientos técnicos y tus herramientas de IA. En lugar de explicar tus patrones de diseño o decisiones de arquitectura una y otra vez, Gabo MCP permite que tus agentes (como MiniMax, Gemini, Codex, Claude, Cursor o Continue) **recuerden** cómo trabajas.

- **Captura**: Guarda razonamientos, decisiones y snippets refinados en el momento.
- **Recupera**: Encuentra información por palabras clave o por **significado semántico**.
- **Controla**: Tú decides qué se guarda y quién accede mediante una clave secreta.
- **Prevención de Errores**: Busca pitfalls y patrones automáticamente.

---

## Herramientas Disponibles

Gabo MCP ofrece 5 herramientas simples:

### 1. save - Guardar Conocimiento

Guarda conocimiento directamente en la base de datos. El sistema advertirá sobre contenido sensible pero tú decides qué guardar.

```typescript
save({
  type: "PATTERN",
  title: "Validación de tipos en Python",
  content: "Usar Pydantic para validación...",
  tags: ["python", "validation"],
  embedding: [
    /* vector opcional */
  ],
});
```

**Ejemplo de prompt:**

> "Gabo, guarda esta lógica de validación como PATTERN. Título: 'Validación de tipos en Python'. Contenido: 'Usar Pydantic para...' con etiquetas #python, #validation"

---

### 2. search - Buscar Conocimiento

Búsqueda unificada que combina texto, vectores y puede incluir pitfalls/patterns.

```typescript
search({
  query: "docker",
  type: "INFRASTRUCTURE",        // opcional
  mode: "hybrid",                // text | semantic | hybrid
  query_vector: [...],           // opcional para semantic/hybrid
  include_pitfalls: true,        // incluir errores conocidos
  include_patterns: true,        // incluir patrones
  limit: 10
})
```

**Ejemplo de prompt:**

> "Busca en mi base de conocimientos cualquier cosa relacionada con 'docker'"

> "Busca en mi base de conocimientos problemas de concurrencia en bases de datos y busca también los pitfalls que he registrado"

---

### 3. list - Listar Entradas

Lista las entradas de conocimiento con paginación.

```typescript
list({
  type: "PATTERN", // opcional
  limit: 10,
  offset: 0,
});
```

**Ejemplo de prompt:**

> "Muéstrame las últimas 5 entradas de conocimiento que he guardado"

---

### 4. get - Obtener Detalle

Recupera el contenido completo de una entrada específica.

```typescript
get({
  id: "65c2f...",
  format: "json" | "markdown" | "plain",
});
```

**Ejemplo de prompt:**

> "Dame el detalle completo de la entrada con ID 65c2f... en formato markdown"

---

### 5. delete - Eliminar Entrada

Elimina una entrada de conocimiento.

```typescript
delete {
  id: "65c2f...",
};
```

---

## Categorías de Conocimiento

El sistema organiza tu conocimiento en estos tipos:

| Tipo                | Propósito                                       |
| ------------------- | ----------------------------------------------- |
| `UI_UX`             | Decisiones de interfaz y experiencia de usuario |
| `ARCH_DECISION`     | Decisiones de arquitectura de alto nivel        |
| `PROMPT`            | Prompts refinados que dan buenos resultados     |
| `ERROR_CORRECTION`  | Lecciones de bugs corregidos                    |
| `CODE_SNIPPET`      | Fragmentos de código reutilizables              |
| `DESIGN_DECISION`   | Principios y estándares de diseño               |
| `TECHNICAL_INSIGHT` | Descubrimientos técnicos                        |
| `PATTERN`           | Patrones reutilizables                          |
| `PITFALL`           | Errores conocidos a evitar                      |
| `INFRASTRUCTURE`    | Docker, Cloud, CI/CD                            |
| `TESTING`           | Estrategias de testing                          |

---

## Sistema de Sanitización

El servidor incluye un sistema de detección de contenido sensible que **advierte pero no bloquea**:

- Contraseñas y credenciales
- API keys y tokens
- Emails y datos personales

El usuario decide qué guardar.

---

## Configuración Rápida

1. **Requisitos**: Node.js 20+ y MongoDB Atlas
2. **Instalación**: `npm install && npm run build`
3. **Variables**: Configura `MONGODB_URI` en `.env`
4. **API Key**: Configura `MCP_API_KEY` en tu cliente MCP

### Configuración en Antigravity

```json
{
  "mcpServers": {
    "gabo-mcp": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/gabo-mcp/src/index.ts"],
      "env": {
        "MONGODB_URI": "mongodb+srv://...",
        "MCP_API_KEY": "gabo_tu_key_aqui"
      }
    }
  }
}
```

La API key se valida en cada llamada contra MongoDB. Ver [docs/API_KEY_AUTH.md](docs/API_KEY_AUTH.md) para más detalles.

---

## Documentación

- [MANIFESTO.md](docs/MANIFESTO.md) - Filosofía del proyecto
- [FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) - Detalle de herramientas
- [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) - Configuración y ejecución
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura técnica
- [SANITIZATION.md](docs/SANITIZATION.md) - Sistema de sanitización
- [VECTOR_SEARCH_SETUP.md](docs/VECTOR_SEARCH_SETUP.md) - Búsqueda semántica
- [MEJORAS_USABILIDAD.md](docs/MEJORAS_USABILIDAD.md) - Propuestas de evolución

---

**Desarrollado por @gabo**
