# Knowledge MCP - Atlas Vector Search Setup

Este servidor utiliza **MongoDB Atlas Vector Search** para realizar búsquedas semánticas. A diferencia de las versiones anteriores, este enfoque es "Pure Vector": el servidor no genera embeddings, sino que espera recibir el vector listo desde el cliente o guardarlo directamente.

## Requisitos de Atlas

Debes configurar un índice de búsqueda vectorial en tu cluster de MongoDB Atlas para que la herramienta `semantic_search` funcione.

### Configuración del Índice

1. Ve a tu cluster en [MongoDB Atlas](https://cloud.mongodb.com).
2. Haz clic en la pestaña **"Search"**.
3. Haz clic en **"Create Index"**.
4. Selecciona **"Vector Search"** (JSON Editor).
5. Selecciona la base de datos `knowledge_mcp` y la colección `knowledge_entries`.
6. Pega la siguiente configuración (ajusta `dimensions` según el modelo que uses, ej. 1536 para OpenAI o 768 para Nomic):

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

7. Haz clic en **"Next"** y luego en **"Create Search Index"**.
8. **Nombre del Índice**: Debe llamarse exactamente `vector_index`.

## Herramientas Vectoriales

### 1. store_knowledge
Permite guardar una entrada con un vector pre-calculado.

**Argumentos:**
- `type`: Categoría
- `title`: Título
- `content`: Contenido
- `embedding`: (Opcional) Array de números `[0.1, 0.2, ...]`

### 2. semantic_search
Busca conocimiento comparando vectores.

**Argumentos:**
- `query_vector`: Array de números que representa la consulta.
- `limit`: Cantidad de resultados.

## Notas de Seguridad
Todas las llamadas requieren el parámetro `api_key` que se genera al iniciar el servidor por primera vez.
