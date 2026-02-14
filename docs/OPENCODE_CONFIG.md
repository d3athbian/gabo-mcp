# Configuración para OpenCode

## Requisitos Previos

OpenCode ejecuta **binarios directamente**. Tu MCP debe estar compilado:

```bash
npm run build
chmod +x dist/index.js
```

## Estructura de opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "gabo-mcp-local": {
      "type": "local",
      "command": ["/path/to/gabo-mcp/dist/index.js"],
      "enabled": true,
      "environment": {
        "NODE_ENV": "production",
        "MCP_API_KEY": "gabo_XXXX_XXXX",
        "MCP_HOST": "opencode"
      },
      "timeout": 15000
    }
  }
}
```

## Variables de Entorno

| Variable      | Valor        | Descripción               |
| ------------- | ------------ | ------------------------- |
| `NODE_ENV`    | `production` | Optimiza performance      |
| `MCP_API_KEY` | Tu clave     | Generada en primer inicio |
| `MCP_HOST`    | `opencode`   | Activa compatibilidad     |

## Generación de API Key

1. Inicia el servidor por primera vez:

```bash
node dist/index.js
```

2. Copia la API key del output:

```
🔑 First-time API key generated: gabo_abc123...def456
⚠️  SAVE THIS KEY - Add to your MCP config!
```

3. Agrega la clave a `opencode.json`

## Notas Importantes

- La API key se inyecta por `environment`, no se expone en prompts
- `MCP_HOST=opencode` desactiva `api_key` como argumento obligatorio
- El timeout de 15 segundos es recomendado para operaciones de DB

## Verificación

Para verificar que OpenCode conecta correctamente:

1. Reinicia OpenCode
2. Busca en la lista de tools disponibles
3. Deberías ver las 7 herramientas de Gabo MCP

## Solución de Problemas

### "Command not found"

```bash
chmod +x dist/index.js
```

### "API key invalid"

- Verifica que la clave esté en `opencode.json`
- Asegúrate de que el servidor tenga acceso a MongoDB

### "Timeout"

Aumenta el timeout en la configuración:

```json
"timeout": 30000
```
