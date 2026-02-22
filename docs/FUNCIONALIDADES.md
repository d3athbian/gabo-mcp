# Funcionalidades de Gabo MCP

## 6 Herramientas Disponibles

### 1. save

Guarda conocimiento directamente en la base de datos. El sistema analiza el contenido y devuelve advertencias si detecta datos sensibles o entradas similares, pero el usuario decide si guardar.

**Input:**

```typescript
{
  type: "PATTERN" | "PITFALL" | "TECHNICAL_INSIGHT" | ...,
  title: string,
  content: string,
  tags?: string[],
  source?: string,
  embedding?: number[],
  metadata?: Record<string, unknown>,
  skip_sanitization?: boolean
}
```

**Ejemplo de uso:**

> "Gabo, guarda este patrón como PATTERN. Título: 'Auth Flow'. Contenido: '...'"

**Respuesta:**

```json
{
  "success": true,
  "id": "507f1f77bcf86cd799439011",
  "type": "PATTERN",
  "title": "Auth Flow",
  "created_at": "2024-01-15T10:00:00Z",
  "warnings": ["CREDENTIALS: Possible API key detected"],
  "similar_entries": [{ "id": "...", "title": "...", "similarity": 87 }],
  "message": "Saved with 1 warning(s)"
}
```

---

### 2. search

Búsqueda unificada que combina texto, vectores y puede incluir pitfalls/patterns.

**Input:**

```typescript
{
  query: string,
  type?: KnowledgeType,
  mode: "text" | "semantic" | "hybrid",
  query_vector?: number[],
  include_pitfalls?: boolean,
  include_patterns?: boolean,
  limit?: number
}
```

**Modos de búsqueda:**

- `text`: Búsqueda por palabras clave
- `semantic`: Búsqueda por vectores (requiere query_vector)
- `hybrid`: Combina ambos métodos

**Ejemplo de uso:**

```
"Busca en mi base de conocimientos cualquier cosa relacionada con 'docker'"
```

```
"Busca problemas de auth y busca también los pitfalls que tengo registrados"
```

**Respuesta:**

```json
{
  "success": true,
  "query": "docker",
  "mode": "hybrid",
  "results": [...],
  "count": 5,
  "pitfalls": [...],
  "patterns": [...],
  "vector_available": true
}
```

---

### 3. list

Lista las entradas de conocimiento con paginación.

**Input:**

```typescript
{
  type?: KnowledgeType,
  limit?: number,
  offset?: number
}
```

**Ejemplo de uso:**

```
"Muéstrame las últimas 10 entradas"
```

**Respuesta:**

```json
{
  "success": true,
  "entries": [...],
  "total": 42
}
```

---

### 4. get

Obtiene el contenido completo de una entrada por ID. Soporta múltiples formatos de salida.

**Input:**

```typescript
{
  id: string,
  format: "json" | "markdown" | "plain"
}
```

**Ejemplo de uso:**

```
"Dame el detalle completo de la entrada 507f1f77bcf86cd799439011"
```

```
"Dame el detalle en markdown de la entrada 507f1f77bcf86cd799439011"
```

**Respuesta en markdown:**

```markdown
## Mi Patrón de Auth

**Tipo:** PATTERN | **Tags:** #auth #jwt

Contenido del patrón...

---

_Creado: 15/01/2024_
```

---

### 5. delete

Elimina una entrada de conocimiento.

**Input:**

```typescript
{
  id: string;
}
```

**Ejemplo de uso:**

```
"Elimina la entrada 507f1f77bcf86cd799439011"
```

---

### 6. get_audit_logs

Obtiene los logs de auditoría de seguridad.

**Input:**

```typescript
{
  action?: string,
  limit?: number,
  offset?: number
}
```

**Ejemplo de uso:**

```
"Muéstrame los últimos logs de auditoría"
```

```
"Muéstrame solo las acciones de delete"
```

**Respuesta:**

```json
{
  "success": true,
  "logs": [
    {
      "id": "...",
      "action": "delete",
      "timestamp": "2024-01-15T10:00:00Z",
      "details": {...}
    }
  ],
  "total": 42
}
```

---

## Sistema de Sanitización

El sistema detecta contenido sensible y devuelve advertencias:

- **credentials**: Contraseñas, API keys, tokens
- **PII**: Emails, teléfonos, datos personales

El usuario decide qué guardar. Para saltar la verificación:

```typescript
save({
  ...,
  skip_sanitization: true
})
```

---

## Tipos de Conocimiento

```typescript
const KnowledgeTypeSchema = z.enum([
  "UI_UX",
  "ARCH_DECISION",
  "PROMPT",
  "ERROR_CORRECTION",
  "CODE_SNIPPET",
  "DESIGN_DECISION",
  "TECHNICAL_INSIGHT",
  "PATTERN",
  "PITFALL",
  "INFRASTRUCTURE",
  "TESTING",
]);
```

---

## Formato de Respuestas

Todas las herramientas retornan:

```typescript
{
  content: [
    {
      type: "text",
      text: JSON.stringify({
        success: true,
        ...result,
      }),
    },
  ];
}
```

En caso de error:

```typescript
{
  content: [{
    type: "text",
    text: JSON.stringify({
      success: false,
      error: "Mensaje de error"
    })
  }],
  isError: true
}
```

---

## Códigos de Error

| Código             | Descripción                 |
| ------------------ | --------------------------- |
| `AUTH_ERROR`       | API key inválida o faltante |
| `NOT_FOUND`        | ID no encontrado            |
| `VALIDATION_ERROR` | Schema inválido             |
