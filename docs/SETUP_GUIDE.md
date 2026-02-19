# Configuración y Ejecución

## Ejecución del Servidor

### Desarrollo (VS Code)

```bash
npm run dev:local
```

En VS Code:

- Press `Cmd+Shift+P`
- Type "MCP Debugger"
- Select `gabo-mcp-local`

### Desarrollo (Continue.dev)

Configuración ya está en: `~/.continue/config.yml`

Automatically detecta `gabo-mcp-local` server.

---

## Configuración de Variables

### Variables Requeridas

| Variable      | Descripción                              | Ejemplo                                       |
| ------------- | ---------------------------------------- | --------------------------------------------- |
| `MONGODB_URI` | Connection string de MongoDB Atlas       | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `MCP_API_KEY` | Clave de API (se genera automáticamente) | `gabo_xxx`                                    |

### Generar API Key

La primera vez que inicias el servidor, se genera una API key automáticamente:

```bash
npm run dev:local
```

En los logs verás:

```
First-time API key generated: ...0532aaa0
SAVE THIS KEY - Add to your MCP config env!
```

---

## Configuración en Cliente MCP

### antigravity (u otro cliente)

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

---

## Construcción y Producción

```bash
# Compilar
npm run build

# Ejecutar
npm start
```

---

## Logs

Los logs se escriben en `/tmp/gabo-mcp.log`.

- **Rotación**: Se rotan al superar 5MB
- **Limpieza**: Se eliminan logs con más de 3 días
