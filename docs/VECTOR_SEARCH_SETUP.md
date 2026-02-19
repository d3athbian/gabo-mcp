# Búsqueda Semántica

La herramienta `search` soporta búsqueda semántica mediante vectores.

## Índice de Vector Search

Configura en MongoDB Atlas:

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

## Modelos de Embeddings

El cliente es responsable de generar embeddings. Modelos compatibles:

- **Nomic**: `nomic-embed-text` (768 dimensiones)
- **OpenAI**: `text-embedding-3-small` (1536 dimensiones)
- **Ollama**: `nomic-embed-text` (768 dimensiones)

## Uso

```typescript
search({
  query: "cómo manejar errores en python",
  mode: "semantic",
  query_vector: [0.1, 0.2, -0.5, ...],
  limit: 5
});
```
