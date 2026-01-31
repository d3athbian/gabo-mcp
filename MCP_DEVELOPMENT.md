# MCP Development Guide

## 🚀 Running the MCP Server Locally

### Quick Start - MCP Inspector (Recommended) ⭐

The easiest way to test locally with a web UI interface:

```bash
# Terminal 1: Run the MCP Inspector
npx @modelcontextprotocol/inspector npm run dev:local

# You'll see something like:
# ✓ Server started
# → Inspect in browser: http://localhost:5173
```

Then open **http://localhost:5173** in your browser for the web interface.

### Alternative: Direct Local Run

```bash
# Install dependencies
npm install

# Run the server locally (stdio mode)
npm run dev:local

# You should see:
# ═══════════════════════════════════════════════════════════════
# 🚀 Knowledge MCP Server (Local)
# ═══════════════════════════════════════════════════════════════
# 
# Server Configuration:
#   • Name: gabo-mcp-local
#   • Version: 0.1.0
#   • Transport: stdio
#   • Mode: In-memory (no external dependencies)
#
# Available Tools:
#   1. store_knowledge - Store a new knowledge entry
#   2. search_knowledge - Search knowledge entries
#   3. list_knowledge - List all knowledge entries
#   4. get_knowledge - Get a specific knowledge entry
#
# ✅ Seeded 3 sample entries
#
# ═══════════════════════════════════════════════════════════════
# Waiting for MCP protocol messages...
# ═══════════════════════════════════════════════════════════════
```

## 🔌 Integration with Clients

### Option 1: VS Code + MCP Debugger

1. **Install MCP Debugger Extension**
   - Go to Extensions (Cmd+Shift+X)
   - Search for "MCP Debugger"
   - Install the official Anthropic extension

2. **Create MCP Server Configuration**
   
   File: `~/.mcp/servers.json`

   ```json
   {
     "mcpServers": {
       "gabo-mcp-local": {
         "command": "node",
         "args": ["--loader", "tsx", "src/index.ts"],
         "cwd": "/Users/gabo/Documents/GitHub/gabo-mcp",
         "env": {
           "NODE_ENV": "development"
         }
       }
     }
   }
   ```

3. **Open MCP Debugger**
   - Press `Cmd+Shift+P`
   - Type "MCP Debugger"
   - Select your `gabo-mcp-local` server

### Option 2: Continue.dev

1. **Update Continue Configuration**
   
   File: `~/.continue/config.json`

   ```json
   {
     "models": [...],
     "mcpServers": {
       "gabo-mcp-local": {
         "command": "node",
         "args": ["--loader", "tsx", "src/index.ts"],
         "cwd": "/Users/gabo/Documents/GitHub/gabo-mcp",
         "env": {
           "NODE_ENV": "development"
         }
       }
     }
   }
   ```

   Or in YAML format (`~/.continue/config.yml`):

   ```yaml
   mcpServers:
     gabo-mcp-local:
       command: node
       args:
         - --loader
         - tsx
         - src/index.ts
       cwd: /Users/gabo/Documents/GitHub/gabo-mcp
       env:
         NODE_ENV: development
   ```

## 🔧 Testing with MCP Inspector (Web UI)

### Example 1: Store Knowledge Entry

In MCP Debugger, select `store_knowledge` and enter:

```json
{
  "type": "REACT_PATTERN",
  "title": "Custom hook pattern",
  "content": "Always start with 'use' prefix and follow React hooks rules",
  "tags": ["react", "hooks"],
  "source": "mcp-debugger"
}
```

**Console Output:**
```
[2025-01-29T22:35:15.123Z] 🔧 Tool called: store_knowledge
{type:"REACT_PATTERN",title:"Custom hook pattern",...}
[2025-01-29T22:35:15.125Z] ✅ Knowledge stored with ID: abc123def456
```

**Response:**
```json
{
  "success": true,
  "id": "abc123def456",
  "message": "Knowledge stored successfully",
  "entry": {
    "id": "abc123def456",
    "type": "REACT_PATTERN",
    "title": "Custom hook pattern",
    "content": "Always start with 'use' prefix and follow React hooks rules",
    "tags": ["react", "hooks"],
    "source": "mcp-debugger",
    "created_at": "2025-01-29T22:35:15.125Z"
  }
}
```

### Example 2: Search Knowledge

Select `search_knowledge`:

```json
{
  "query": "hook",
  "type": "REACT_PATTERN"
}
```

**Console Output:**
```
[2025-01-29T22:35:20.456Z] 🔧 Tool called: search_knowledge
{query:"hook",type:"REACT_PATTERN"}
[2025-01-29T22:35:20.458Z] 🔍 Search for "hook": found 1 results
```

**Response:**
```json
{
  "success": true,
  "query": "hook",
  "results": [
    {
      "id": "abc123def456",
      "type": "REACT_PATTERN",
      "title": "Custom hook pattern",
      "content": "Always start with 'use' prefix and follow React hooks rules",
      "tags": ["react", "hooks"],
      "created_at": "2025-01-29T22:35:15.125Z"
    }
  ],
  "count": 1
}
```

### Example 3: List All Entries

Select `list_knowledge` with no arguments (or `limit: 10`):

**Response:**
```json
{
  "success": true,
  "entries": [
    {
      "id": "xyz...",
      "type": "REACT_PATTERN",
      "title": "useCallback with proper dependencies",
      "created_at": "2025-01-29T22:15:00.000Z"
    },
    {
      "id": "abc...",
      "type": "ERROR_CORRECTION",
      "title": "TypeError: Cannot read property of undefined",
      "created_at": "2025-01-29T22:10:00.000Z"
    }
  ],
  "total": 3
}
```

## 🐛 Debugging Tips

### Add Custom Logging

Edit `src/index.ts` to add more detailed logging:

```typescript
// In the tool handler, add detailed logging:
log.info('Input received', { type, title, content, tags });
// ... process ...
log.info('Processing complete', { id, timestamp });
```

You'll see the output in MCP Debugger's console.

### Monitor Data Flow

The console shows every tool call with:
- Timestamp
- Tool name
- Arguments received
- Processing steps
- Response returned

### Error Handling

Errors are caught and returned with clear messages:

```json
{
  "success": false,
  "error": "title and content are required"
}
```

Check the console for the error log entry as well.

## 📦 Sample Data

The server comes pre-seeded with 3 sample entries:

1. **REACT_PATTERN** - useCallback with dependencies
2. **ERROR_CORRECTION** - TypeError debugging
3. **ARCH_DECISION** - Monolith vs Microservices

Try searching for:
- "hook" → finds REACT_PATTERN
- "error" → finds ERROR_CORRECTION
- "monolith" → finds ARCH_DECISION

## 🔄 Next Steps

Once you're comfortable with the local testing:

1. **Phase 1** - Connect to real Supabase
   - Create Supabase project
   - Update database credentials
   - Replace in-memory storage with DB queries

2. **Phase 2** - Add vector embeddings
   - Connect to Ollama
   - Generate embeddings for each entry
   - Implement semantic search

3. **Phase 3** - IDE integration
   - Add Continue.dev support
   - Create VS Code extension
   - Add keyboard shortcuts

## ⚠️ Troubleshooting

### Server won't start
```bash
# Check Node version (needs 24+)
node --version

# Check tsx is installed
npm install

# Try running directly
npm run dev:local
```

### MCP Debugger won't connect
- Verify the path in `~/.mcp/servers.json` is correct
- Check that the server is running before connecting
- Look for error messages in VS Code's output panel

### No console output in debugger
- Console output goes to stderr
- Check VS Code's "MCP Debugger" output channel
- Verify logging functions use `console.error()`

### Tools not showing up
- Restart the MCP Debugger extension
- Stop and restart the server
- Check that `TOOLS` array is properly defined

## 📚 Learn More

- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [MCP SDK Docs](https://github.com/modelcontextprotocol/typescript-sdk)
- [Continue.dev Integration](https://continue.dev)
