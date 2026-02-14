# Funcionalidades de Gabo MCP

## 7 Herramientas Disponibles

### 1. store_knowledge

Guarda conocimiento en la base de datos.

**Input:**

```typescript
{
  type: "PATTERN" | "PITFALL" | "TECHNICAL_INSIGHT" | ...,
  title: string,
  content: string,
  tags?: string[],
  source?: string,
  embedding?: number[],
  metadata?: Record<string, unknown>
}
```

**Ejemplo de uso:**

```
"Gabo, guarda este patrón de validación como PATTERN.
Título: 'Validación de tipos en Python'.
Contenido: 'Usar Pydantic para validación de tipos...'.
Tags: #python, #validation"
```

**Respuesta:**

```json
{
  "success": true,
  "id": "507f1f77bcf86cd799439011",
  "message": "Stored"
}
```

**Sanitización:** El contenido se verifica contra el perfil de seguridad activo.

---

### 2. search_knowledge

Búsqueda tradicional por palabras clave.

**Input:**

```typescript
{
  query: string,
  type?: KnowledgeType  // Opcional
}
```

**Ejemplo de uso:**

```
"Busca en mi base de conocimientos cualquier cosa relacionada con 'docker'"
```

**Respuesta:**

```json
{
  "success": true,
  "query": "docker",
  "results": [...],
  "count": 5
}
```

---

### 3. semantic_search

Búsqueda semántica usando vectores.

**Input:**

```typescript
{
  query_vector: number[],  // Array de 768 dimensiones
  type?: KnowledgeType,
  limit?: number  // Default: 10
}
```

**Nota:** Requiere embeddings. El cliente debe generar los vectores.

**Ejemplo de uso:**

```
"Encuentra soluciones similares a problemas de concurrencia en bases de datos"
```

---

### 4. list_knowledge

Lista las entradas de conocimiento.

**Input:**

```typescript
{
  limit?: number  // Default: 10
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

### 5. get_knowledge

Obtiene el contenido completo de una entrada por ID.

**Input:**

```typescript
{
  id: string; // ObjectId de MongoDB
}
```

**Ejemplo de uso:**

```
"Dame el detalle completo de la entrada 507f1f77bcf86cd799439011"
```

---

### 6. suggest_patterns

Analiza el contexto y sugiere patrones similares.

**Input:**

```typescript
{
  query: string,
  context?: string
}
```

**Ejemplo de uso:**

```
"Analiza este código y dime si encaja con algún patrón existente"
```

**Respuesta:**

```json
{
  "success": true,
  "query": "mi código de auth",
  "suggestions": [
    {
      "id": "...",
      "title": "JWT Auth Pattern",
      "type": "PATTERN",
      "matchReason": "Similar keywords"
    }
  ],
  "recommendation": "Review similar items to avoid duplicates"
}
```

---

### 7. get_pitfalls

Genera checklist preventivo basado en errores conocidos.

**Input:**

```typescript
{
  query: string,
  context?: string
}
```

**Ejemplo de uso:**

```
"Antes de hacer esta refactorización, dime qué pitfalls debo evitar"
```

**Respuesta:**

```json
{
  "success": true,
  "query": "refactorización database",
  "pitfalls": [
    {
      "id": "...",
      "title": "Always Search Knowledge Base Before Coding",
      "type": "PITFALL",
      "preventiveCheck": "Check: Always Search Knowledge Base Before Coding"
    }
  ],
  "checklist": "- [ ] Check: Always Search Knowledge Base Before Coding",
  "status": "⚠️ Attention: Known pitfalls detected"
}
```

---

## Sistema de Sanitización

### Perfiles Disponibles

| Perfil     | Detecta                               | Bloquea                     |
| ---------- | ------------------------------------- | --------------------------- |
| `work`     | credentials, pii, corporate, env_vars | Todo + corporate + env vars |
| `personal` | credentials, pii                      | Credenciales + PII crítico  |

### Detectores

| Detector      | Detecta                       | Ejemplos                    |
| ------------- | ----------------------------- | --------------------------- |
| `credentials` | Passwords, API keys, tokens   | `password=secret`, `sk-xxx` |
| `pii`         | Emails, phones, CC, SSN       | `test@example.com`          |
| `corporate`   | Nombres de empresas, keywords | `Google`, `confidential`    |
| `env_vars`    | Referencias a variables       | `process.env.API_KEY`       |

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

## Deduplicación

El sistema detecta contenido semánticamente similar (>92% similitud) antes de guardar.

**Respuesta si es duplicado:**

```json
{
  "error": "KNOWLEDGE_DUPLICATE",
  "existingId": "507f1f77bcf86cd799439011",
  "existingTitle": "Patrón existente"
}
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
      error: "Mensaje de error",
      code: "ERROR_CODE"
    })
  }],
  isError: true
}
```

---

## Códigos de Error

| Código                | Descripción                       |
| --------------------- | --------------------------------- |
| `AUTH_ERROR`          | API key inválida o faltante       |
| `SANITIZATION_ERROR`  | Contenido bloqueado por seguridad |
| `KNOWLEDGE_DUPLICATE` | Entrada muy similar ya existe     |
| `NOT_FOUND`           | ID no encontrado                  |
| `VALIDATION_ERROR`    | Schema inválido                   |
