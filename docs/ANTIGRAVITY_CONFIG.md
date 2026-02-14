# Configuración para Antigravity

## Requisitos Previos

Antigravity puede ejecutar MCP servers de dos maneras:

1. Via CLI con argumentos
2. Via configuración JSON

## Método 1: CLI Directo

```bash
# Compilar primero
npm run build

# Ejecutar con variables de entorno
MCP_API_KEY=gabo_XXXX_XXXX NODE_ENV=production node dist/index.js
```

## Método 2: Configuración JSON

Antigravity usa un archivo de configuración similar a:

```json
{
  "mcpServers": {
    "gabo-mcp-local": {
      "command": "node",
      "args": ["/path/to/gabo-mcp/dist/index.js"],
      "env": {
        "MCP_API_KEY": "gabo_XXXX_XXXX",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Variables de Entorno Requeridas

| Variable      | Valor             | Requerido     |
| ------------- | ----------------- | ------------- |
| `MCP_API_KEY` | Tu clave          | Sí            |
| `NODE_ENV`    | `production`      | Recomendado   |
| `MONGODB_URI` | Connection string | Sí (del .env) |

## Configuración Completa .env

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gabo_mcp
MCP_API_KEY=gabo_XXXX_XXXX
SECURITY_PROFILE=personal
```

## Generación de API Key

```bash
# Opción 1: Via bootstrap del servidor
node dist/index.js
# Copia la key del output

# Opción 2: Crear directamente en MongoDB
db.api_keys.insertOne({
  key: "gabo_tu_timestamp_tu_random",
  created_at: new Date().toISOString(),
  is_active: true
})
```

## Verificación

1. Inicia Antigravity con el MCP configurado
2. Verifica que las tools aparecen:
   - `store_knowledge`
   - `search_knowledge`
   - `semantic_search`
   - `list_knowledge`
   - `get_knowledge`
   - `suggest_patterns`
   - `get_pitfalls`

## Solución de Problemas

### El servidor no conecta a MongoDB

- Verifica `MONGODB_URI` en variables de entorno
- Revisa que el cluster esté activo

### API key rechazada

- Verifica formato: `gabo_<timestamp>_<random>`
- Asegúrate que la key existe en `api_keys` collection

### Permisos denegados

```bash
chmod +x dist/index.js
```
