# Gabo MCP (MongoDB Atlas Edition) 🚀

Tu memoria personal de inteligencia artificial. **Gabo MCP** es un servidor de Model Context Protocol diseñado para capturar, estructurar y reutilizar conocimiento técnico de forma persistente.

---

## 🧠 ¿Qué es Gabo MCP?

Es el puente entre tus pensamientos técnicos y tus herramientas de IA. En lugar de explicar tus patrones de diseño o decisiones de arquitectura una y otra vez, Gabo MCP permite que tus agentes (como Cursor, Claude o Continue) **recuerden** cómo trabajas.

- 📝 **Captura**: Guarda razonamientos, decisiones y snippets refinados en el momento.
- 🔍 **Recupera**: Encuentra información por palabras clave o por **significado semántico**.
- 🔐 **Controla**: Tú decides qué se guarda y quién accede mediante una clave secreta.
- 🔄 **Aprendizaje Automático**: Ayuda a los agentes a destilar lecciones y patrones automáticamente tras cada tarea.
- ⚠️ **Prevención de Errores**: Sistema de "Checklist Preventivos" basado en errores pasados para evitar regresiones.
- 🔄 **Bucle de Feedback Negativo**: Detección automática de fallos y proyecciones para atajar errores antes de que se repitan.

---

## 🛠️ Herramientas y Ejemplos de Uso

Aquí tienes cómo puedes interactuar con el servidor a través de prompts en tu entorno favorito:

### 1. Guardar Conocimiento (`store_knowledge`)
Guarda fragmentos de código, decisiones de diseño o prompts que funcionan bien. También puedes guardar **Errores/Peligros**.

**Ejemplo de Prompt:**
> "Gabo, guarda esta lógica de validación como `PATTERN`. Título: 'Validación de tipos en Python'. Contenido: 'Usar Pydantic para...' con etiquetas `#python, #validation`."

### 2. Buscar por Texto (`search_knowledge`)
Búsqueda tradicional por palabras clave en tus títulos y descripciones.

**Ejemplo de Prompt:**
> "Busca en mi base de conocimientos cualquier cosa relacionada con 'docker' en la categoría `INFRASTRUCTURE`."

### 3. Búsqueda Semántica (`semantic_search`)
Encuentra conceptos similares aunque no compartan exactamente las mismas palabras.
*Nota: Esta herramienta suele ser invocada automáticamente por agentes inteligentes cuando necesitan contexto profundo.*

**Ejemplo de Prompt:**
> "Encuentra soluciones que he usado antes para problemas de concurrencia en bases de datos."

### 4. Listar Entradas (`list_knowledge`)
Revisa qué tienes guardado en tu base de datos.

**Ejemplo de Prompt:**
> "Muéstrame las últimas 5 entradas de conocimiento que he guardado."

### 5. Obtener Detalle (`get_knowledge`)
Recuperar el contenido completo de una entrada específica.

**Ejemplo de Prompt:**
> "Dame el detalle completo de la entrada con ID `65c2f...` para revisar el código que guardé ayer."

### 6. Sugerir Patrones (`suggest_patterns`)
Analiza la tarea actual para sugerir categorías o detectar si algo similar ya existe.

**Ejemplo de Prompt:**
> "Analiza estos cambios y dime si encajan con algún patrón que ya tengamos en mi base de conocimientos."

### 7. Prevenir Errores (`get_pitfalls`)
Genera un checklist preventivo basado en errores pasados para no repetirlos.

**Ejemplo de Prompt:**
> "Antes de empezar esta refactorización, dime si hay algún `PITFALL` conocido que deba evitar."

---

## 🏗️ Categorías de Conocimiento

El sistema organiza tu cerebro digital en estos tipos universales:

| Tipo | Propósito |
| :--- | :--- |
| `UI_UX` | Decisiones de interfaz, experiencia de usuario y componentes visuales. |
| `ARCH_DECISION` | Decisiones de arquitectura de alto nivel y sus trade-offs. |
| `PROMPT` | Prompts refinados que dan resultados excelentes. |
| `ERROR_CORRECTION` | Lecciones aprendidas tras corregir bugs complejos. |
| `CODE_SNIPPET` | Fragmentos de código reutilizables (Cualquier lenguaje). |
| `DESIGN_DECISION` | Principios y estándares de diseño de software. |
| `TECHNICAL_INSIGHT` | Descubrimientos técnicos o "Aha!" moments. |
| `PATTERN` | **Patrones Reutilizables**: Soluciones comunes a problemas (React, Python, Go, etc.). |
| `PITFALL` | **"Qué NO hacer"**: Errores conocidos y checklists preventivos. |
| `INFRASTRUCTURE` | Conocimiento sobre Docker, Cloud, CI/CD y bases de datos. |
| `TESTING` | Estrategias de testing (Unit, E2E, QA) y patrones de prueba. |

---

## ⚙️ Configuración Rápida

1.  **Requisitos**: Node.js 20+ y una instancia de MongoDB Atlas.
2.  **Instalación**: `npm install && npm run build`.
3.  **Variables de Entorno**: Configura tu `MONGODB_URI` en el archivo `.env`.
4.  **Autenticación**: En el primer arranque, el servidor generará una **Master Key**. Cópiala y añádela a la configuración de tu cliente MCP (ej. `MCP_API_KEY=gabo_...`).

---

## 📖 Documentación Adicional

- [Arquitectura Técnica](docs/ARCHITECTURE.md): Detalles sobre Zod SSOT, Middlewares y el diseño del sistema.
- [Guía de Instalación](docs/SETUP_GUIDE.md): 3 formas de correr y probar el servidor.
- [Vector Search](docs/VECTOR_SEARCH_SETUP.md): Cómo configurar los índices en MongoDB Atlas.
- [Autenticación](docs/API_KEY_AUTH.md): Detalles sobre el sistema de seguridad basado en llaves.

---

**Desarrollado por @gabo** | Inspirado en el Advanced Agentic Coding de DeepMind.
