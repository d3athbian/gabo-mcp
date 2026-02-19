# Mejoras y Simplificación de Gabo MCP

## Propuesta de Evolución del Producto

Este documento analiza las posibles mejoras de usabilidad y las funcionalidades que podrían eliminarse o simplificarse, manteniendo el foco en el objetivo principal: **guardar y consultar conocimientos técnicos de forma simple y efectiva**.

---

## 1. Análisis del Estado Actual

### 1.1 Lo que Funciona Bien

El núcleo del producto está bien definido: una base de conocimientos personal conectada a agentes de IA. Las funcionalidades core son sólidas:

- La captura de conocimiento mediante propuestas (con confirmación del usuario)
- La búsqueda por palabras clave
- La búsqueda semántica mediante vectores
- La organización por categorías (11 tipos de conocimiento)
- La protección básica mediante sanitización de datos sensibles

### 1.2 Lo que Genera Complejidad Excesiva

Tras analizar el código y la documentación, identificamos varias áreas que añaden complejidad sin aportar valor proporcional al objetivo principal:

1. **Sistema de propuestas en tres pasos** (propose → confirm → reject)
2. **Múltiples perfiles de seguridad** con detectores avanzados
3. **Logging detallado de tráfico** entre cliente y servidor (solo debug)
4. **Herramientas auxiliares** que podrían integrarse en las principales

---

## 2. Mejoras Sugeridas para Usabilidad

### 2.1 Simplificar el Flujo de Guardado (Propuesta #1)

**Situación actual:**
El usuario debe ejecutar tres pasos para guardar algo:

1. `propose_knowledge` → obtiene un proposal_id
2. `confirm_knowledge` → confirma con el ID
3. Opcionalmente `reject_knowledge` → si se arrepiente

**Propuesta simplificada:**
Crear una herramienta única `save_knowledge` que directamente guarde y devuelva el resultado, manteniendo la sanitización como advertencia (no bloqueo).

```
Flujo actual:     propose → confirm → reject (3 pasos)
Flujo propuesto:  save_knowledge (1 paso directo)
```

**Ventajas:**

- Reducción de fricción para el usuario
- Menor cantidad de llamadas API
- Experiencia más intuitiva
- El sistema sigue advertiendo sobre contenido sensible, pero el usuario decide

---

### 2.2 Unificar Búsquedas (Propuesta #2)

**Situación actual:**
Existen tres herramientas de búsqueda distintas:

- `search_knowledge` → búsqueda por palabras clave
- `semantic_search` → búsqueda por vectores
- `suggest_patterns` → búsqueda con sugerencia de categorías

**Propuesta simplificada:**
Crear una herramienta única `search` con parámetros opcionales:

```typescript
search({
  query: "docker",
  type: "optional", // filtrar por tipo
  mode: "hybrid" | "text" | "semantic", // modo de búsqueda
  include_pitfalls: true, // buscar también en PITFALLs
  include_patterns: true, // buscar también en PATTERNs
  limit: 10,
});
```

**Ventajas:**

- Un solo punto de entrada para buscar
- El modo "hybrid" combina ambas tecnologías automáticamente
- El usuario no necesita entender la diferencia entre búsqueda textual y semántica
- `suggest_patterns` y `get_pitfalls` integrados como parámetros

---

### 2.3 Mejora de la Experiencia de Lectura (Propuesta #3)

**Situación actual:**
Al obtener una entrada, se devuelve JSON plano.

**Propuesta:**
Añadir formato legible humano como opción:

```typescript
get_knowledge({
  id: "...",
  format: "json" | "markdown" | "plain",
});
```

Ejemplo de salida en markdown:

```markdown
## Patrón: Validación de Typescript

**Tipo:** PATTERN | **Tags:** #typescript #validation

### Problema

Cómo validar tipos en funciones sin perder información en runtime.

### Solución

Usar tipos condicionales con inferencia...

---

_Guardado: 15/01/2024 | Última referencia: hace 3 días_
```

---

## 3. Elementos a Eliminar o Simplificar Drásticamente

### 3.1 Eliminar: Sistema de Propuestas (Confirm/Reject)

**Argumento en contra de mantenerlo:**

- Añade 2 herramientas adicionales que complican el flujo
- El objetivo es guardar y consultar, no un sistema de aprobación
- La sanitización ya advierte, no necesita doble confirmación

**Qué eliminar:**

- `confirm_knowledge`
- `reject_knowledge`
- El sistema de proposals en memoria

**Qué mantener:**

- La sanitización como advertencia (no como bloqueo)
- El análisis de duplicados como advertencia

---

### 3.2 Eliminar: Perfiles de Seguridad Avanzados

**Argumento:**
El sistema actual tiene perfiles "work" y "personal" con múltiples detectores (corporate, env-vars, credentials, pii).

**Propuesta simplificada:**
Un solo detector simple:

```typescript
sanitize(content) → {
  allowed: boolean,
  warnings: ["Se detectó posible API key", "Se detectó email"]
}
```

**Por qué:**

- El usuario decide qué guardar, no el sistema
- Mantener la advertencia es suficiente
- Simplifica la configuración

---

### 3.3 Eliminar: Logging de Tráfico

**Argumento:**
El sistema actual registra todo el tráfico entre cliente y servidor en `/tmp/gabo-mcp-traffic.log`.

**Por qué eliminarlo:**

- Solo era para debugging
- Genera archivos grandes rápidamente
- Sin valor para el usuario final

---

## 4. Propuesta de Arquitectura Simplificada

### 4.1 Herramientas Core

| Herramienta | Función                                                          |
| ----------- | ---------------------------------------------------------------- |
| `save`      | Guardar conocimiento directamente                                |
| `search`    | Buscar (texto, semántica o híbrido, incluye pitfalls y patterns) |
| `get`       | Obtener detalle de una entrada                                   |
| `list`      | Listar entradas con filtros                                      |
| `delete`    | Eliminar una entrada                                             |

### 4.2 Flujo Simplificado

```
Usuario: "Guarda esto como patrón de auth"
   ↓
Agente: save({
  type: "PATTERN",
  title: "JWT Auth Pattern",
  content: "...",
  tags: ["auth", "jwt"]
})
   ↓
Sistema: Verifica sanitización → Advertir si encuentra algo
   ↓
Sistema: Busca duplicados → Advertir si hay similares
   ↓
Sistema: Guarda y retorna { id: "...", success: true }
   ↓
Usuario recibe confirmación inmediata
```

---

## 5. Roadmap Sugerido

### Fase 1: Simplificación Inmediata

1. Crear herramienta `save` que reemplace el flujo propose/confirm/reject
2. Unificar búsquedas en herramienta única `search` (integrar suggest_patterns y get_pitfalls)
3. Eliminar logging de tráfico

### Fase 2: Mejoras de Usabilidad

1. Mejorar formato de salida (markdown) en `get`

---

## 6. Conclusión

El objetivo de Gabo MCP debería ser **lo más simple posible**: guardar conocimiento y consultarlo.

**Principios rectores propuestos:**

1. **Una herramienta por acción**: Una forma de guardar, una forma de buscar, una forma de listar
2. **Advertencias, no bloqueos**: El usuario decide qué guardar
3. **Valores por defecto sensatos**: El usuario solo configura lo necesario
4. **Para modelos remotos**: El MCP será consumido por modelos como MiniMax, Gemini, Codex, etc. - no es para uso local directo

La propuesta sugiere mantener 5 herramientas core, eliminando la complejidad del sistema de propuestas, perfiles de seguridad avanzados y logging de debug.

---

_Documento de mejoras - Gabo MCP_
