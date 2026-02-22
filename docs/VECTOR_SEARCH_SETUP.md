# Búsqueda Semántica

La herramienta `search` soporta búsqueda semántica mediante vectores con fallback automático a text search.

## Índice de Vector Search

**El servidor crea el índice automáticamente** al iniciar. Ya no necesitas configurarlo manualmente desde Atlas UI.

### Configuración Automática

Al iniciar el servidor:

1. Verifica si el índice `vector_index` existe
2. Si no existe, lo crea automáticamente
3. Si falla (ej: tier M0 sin Atlas Search), usa text search como fallback

### Configuración Manual (opcional)

Solo si necesitas personalizar:

1. Ve a tu cluster → pestaña **"Search"**
2. Crea un índice **Vector Search** (JSON Editor)
3. Selecciona db `knowledge_mcp`, colección `knowledge_entries`
4. Configuración:

```json
{
  "fields": [
    {
      "numDimensions": 768,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

5. Nombre del índice: `vector_index`

## Fallback Automático

Si vector search no está disponible (ej: MongoDB M0 Free Tier):

- El servidor detecta el error silenciosamente
- Usa text search como fallback automáticamente
- Funciona sin configuración adicional

**Importante**: No hay cacheo de disponibilidad. Cada búsqueda intenta vector search primero. Esto maneja correctamente el "cold start" de Atlas serverless:

- Al iniciar el IDE → Atlas puede estar dormido
- Primera búsqueda → fallback a text search
- 5 segundos después → Atlas despertó
- Siguiente búsqueda → usa vector search

## Modelos de Embeddings

El cliente es responsable de generar embeddings. Modelos compatibles:

- **Nomic**: `nomic-embed-text` (768 dimensiones)
- **OpenAI**: `text-embedding-3-small` (1536 dimensiones) - configurar `EMBED_DIMENSIONS=1536`
- **Ollama**: `nomic-embed-text` (768 dimensiones)

## Variables de Entorno

```bash
EMBED_DIMENSIONS=768        # Dimensiones del modelo (768 o 1536)
EMBED_CACHE_ENABLED=true    # Cachear embeddings en memoria
EMBED_CACHE_TTL=3600        # TTL del cache en segundos
```

## Uso

```typescript
search({
  query: "cómo manejar errores en python",
  mode: "semantic",
  query_vector: [0.1, 0.2, -0.5, ...],
  limit: 5
});
```
