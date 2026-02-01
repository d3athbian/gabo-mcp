# Vector Search Setup Guide

This guide helps you set up Atlas Vector Search for semantic search capabilities.

## Quick Check

First, run the `check_vector_search` tool to see if your vector index is already configured:

```
@gabo-mcp-local using check_vector_search
```

If it returns `available: false`, follow the steps below.

## Manual Setup (MongoDB Atlas UI)

### Step 1: Access MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign in to your account
3. Select your cluster (e.g., "Cluster0")

### Step 2: Create Vector Search Index

1. Click on the **"Search"** tab in the left sidebar
2. Click **"Create Index"**
3. Choose **"Vector Search"** (NOT "Search Indexes")

### Step 3: Configure the Index

Use these exact settings:

- **Database**: `knowledge_mcp`
- **Collection**: `knowledge_entries`
- **Index Name**: `vector_index` (⚠️ must be exactly this)
- **Path**: `embedding`
- **Dimensions**: `768`
- **Similarity**: `cosine`

### Step 4: Save and Wait

1. Click **"Create Index"**
2. Wait 1-2 minutes for the index to build
3. The status should change from "Building" to "Active"

## Verification

After creating the index, run the check tool again:

```
@gabo-mcp-local using check_vector_search
```

You should see:

```json
{
  "success": true,
  "available": true,
  "message": "Atlas Vector Search index is properly configured",
  "index_name": "vector_index",
  "dimensions": 768,
  "similarity": "cosine"
}
```

## Testing Semantic Search

Once the index is ready, test semantic search:

```
@gabo-mcp-local using semantic_search, query: "react hooks patterns", limit: 5
```

The search will:

1. Generate an embedding for your query using Ollama
2. Find similar entries using vector similarity
3. Return the most relevant results

## Troubleshooting

### "Vector search not available" error

- The index is still building (wait 1-2 minutes)
- The index name is not exactly `vector_index`
- The path is not `embedding`

### "Failed to generate embedding" error

- Ollama is not running: `ollama serve`
- Model not downloaded: `ollama pull nomic-embed-text`
- Wrong Ollama URL in `.env`

### No results returned

- No entries with embeddings in the database yet
- Use `store_knowledge` first to create entries with embeddings

## How It Works

1. **store_knowledge**: Automatically generates 768-dimensional embeddings using Ollama's nomic-embed-text model
2. **semantic_search**: Converts your query to an embedding and finds similar vectors in MongoDB
3. **Hybrid Search**: When available, combines vector similarity with text search for best results

## Performance

- Vector search: ~100-500ms (depends on index and data size)
- Embedding generation: ~100-300ms (depends on text length)
- Total: Usually <1 second for typical queries

## Next Steps

Once vector search is working:

- Store more knowledge entries (they auto-generate embeddings)
- Try different query types
- Use hybrid search for best accuracy
- Monitor performance in MongoDB Atlas dashboard
