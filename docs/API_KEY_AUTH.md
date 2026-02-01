# API Key Authentication

Sistema de autenticación basado en API Keys para el Knowledge MCP Server.

## Overview

Este sistema permite:

- **Autenticación real** sin exponer user_ids hardcoded
- **Revocación remota** desde cualquier máquina autorizada
- **Múltiples dispositivos** con keys independientes
- **Auditoría** de todas las operaciones

## Arquitectura

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Continue.dev   │────▶│   MCP Server     │────▶│   MongoDB Atlas  │
│                  │     │                  │     │                  │
│ MCP_API_KEY env  │     │ 1. Recibe call   │     │ api_keys         │
│ (automático)     │     │ 2. Valida key    │     │ knowledge_entries│
└──────────────────┘     │ 3. Ejecuta       │     └──────────────────┘
                         │ 4. Responde      │
                         └──────────────────┘
```

## Flujos de Uso

### 1. Setup Inicial (Bootstrap)

**Primera vez - No hay API keys en la BD:**

```bash
# Tool especial que NO requiere autenticación
# Solo funciona si la colección api_keys está VACÍA

@gabo-mcp-local using create_first_api_key, name: "setup-inicial"
```

**Respuesta:**

```json
{
  "success": true,
  "api_key": "gmcp_live_abc123xyz789...",
  "name": "setup-inicial",
  "warning": "⚠️  SAVE THIS KEY NOW - It won't be shown again!",
  "next_steps": [
    "1. Copy this key to your .env file:",
    "   MCP_API_KEY=gmcp_live_abc123xyz789...",
    "2. Update Continue.dev config to use the key",
    "3. Restart the MCP server"
  ]
}
```

**Importante:**

- ⚠️ Este key **NO se muestra nunca más**
- Si lo pierdes, debes usar otro dispositivo autorizado para crear uno nuevo
- O borrar la colección `api_keys` y volver a hacer bootstrap (riesgoso)

### 2. Configurar Continue.dev

**Agregar a tu config:**

```yaml
# ~/.continue/config.yaml
mcpServers:
  gabo-mcp-local:
    command: npx
    args: ["tsx", "/path/to/gabo-mcp/src/index.ts"]
    env:
      MONGODB_URI: "${MONGODB_URI}"
      OLLAMA_API_URL: "${OLLAMA_API_URL}"
      MCP_API_KEY: "gmcp_live_abc123xyz789..." # ← Tu API Key aquí
```

**El key se envía automáticamente** en todas las tool calls.

### 3. Uso Normal

**Todas las tools ahora requieren `api_key`:**

```bash
# El Continue.dev envía automáticamente el MCP_API_KEY
@gabo-mcp-local using store_knowledge,
  type: "REACT_PATTERN",
  title: "React Hooks",
  content: "useEffect best practices..."

# El servidor valida el key antes de ejecutar
```

### 4. Múltiples Dispositivos

**Crear key para otra máquina:**

```bash
# Desde tu máquina principal (ya autenticada)
@gabo-mcp-local using create_api_key, name: "laptop-trabajo"

# Devuelve nuevo key:
{
  "api_key": "gmcp_live_def456uvw012...",
  "name": "laptop-trabajo",
  "created_by": "setup-inicial"
}
```

**Configurar en la nueva máquina:**

```yaml
# ~/.continue/config.yaml (laptop trabajo)
MCP_API_KEY: "gmcp_live_def456uvw012..."
```

### 5. Revocar Acceso

**Si pierdes una máquina o ya no la usas:**

```bash
# Desde cualquier máquina autorizada
@gabo-mcp-local using revoke_api_key,
  key_id: "laptop-trabajo",
  reason: "Laptop robada"

# o listar primero:
@gabo-mcp-local using list_api_keys
# {
#   "keys": [
#     { "id": "setup-inicial", "is_active": true, "last_used": "2026-02-01..." },
#     { "id": "laptop-trabajo", "is_active": true, "last_used": "2026-02-01..." }
#   ]
# }
```

**Efecto inmediato:** La laptop de trabajo ya no puede acceder.

## Estructura de API Key

### Formato

```
gmcp_live_<random_string>
└─┬─┘ └─┬─┘ └──────┬──────┘
  │     │          └── Identificador único (32 chars)
  │     └────────────── Entorno (live, test)
  └──────────────────── Prefijo (gabo-mcp)
```

### Ejemplo

```
gmcp_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p
```

## Seguridad

### Almacenamiento

- **Cliente:** Key en variable de entorno (`.env`, nunca en repo)
- **Servidor:** Solo hash bcrypt se almacena en MongoDB
- **Logs:** Nunca se loggean keys completos (solo últimos 4 chars)

### Rate Limiting

- **5 intentos fallidos** por minuto por IP
- Después de 5 fallos: **bloqueo 15 minutos**
- Keys revocados: **bloqueo inmediato**

### Revocación

- Cambiar `is_active: false` bloquea **inmediatamente**
- **No hay cache** de keys válidos
- Cada operación re-valida el key

## Colección api_keys

### Schema MongoDB

```javascript
{
  _id: ObjectId,
  key_hash: "$2b$10$N9qo8uLOickgx2ZMRZoMy.Mqrq...",  // bcrypt
  key_preview: "...a1b2",                               // últimos 5 chars
  name: "laptop-personal",
  created_at: ISODate("2026-02-01T02:30:00Z"),
  last_used: ISODate("2026-02-01T12:45:00Z"),
  is_active: true,
  created_by: "bootstrap",  // o "api_key_xxx" si fue creado por otro key
  metadata: {
    user_agent: "Continue.dev/1.0",
    ip_address: "192.168.1.x"  // hasheado/anonymized
  }
}
```

### Índices Requeridos

```javascript
// Búsqueda rápida por hash
db.api_keys.createIndex({ key_hash: 1 }, { unique: true });

// Listar activos
db.api_keys.createIndex({ is_active: 1, created_at: -1 });
```

## Tools de Administración

### create_first_api_key

**Descripción:** Crea el primer API key cuando no hay ninguno.

**Requiere auth:** ❌ NO (solo si BD vacía)

**Uso:**

```bash
@gabo-mcp-local using create_first_api_key, name: "setup"
```

### create_api_key

**Descripción:** Crea nuevo API key (requiere autenticación).

**Requiere auth:** ✅ SÍ

**Uso:**

```bash
@gabo-mcp-local using create_api_key, name: "laptop-trabajo"
```

### list_api_keys

**Descripción:** Lista todos los keys activos.

**Requiere auth:** ✅ SÍ

**Uso:**

```bash
@gabo-mcp-local using list_api_keys
```

### revoke_api_key

**Descripción:** Invalida un API key específico.

**Requiere auth:** ✅ SÍ

**Uso:**

```bash
@gabo-mcp-local using revoke_api_key, key_id: "laptop-trabajo"
```

## Migración desde DEV_USER_ID

### Si actualmente usas DEV_USER_ID hardcoded:

1. **Backup:** Exportar datos si es necesario
2. **Limpiar:** (opcional) Borrar colección `knowledge_entries` o mantener
3. **Bootstrap:** Ejecutar `create_first_api_key`
4. **Configurar:** Agregar `MCP_API_KEY` a `.env` y Continue.dev
5. **Probar:** Verificar que tools funcionan
6. **Remover:** Eliminar `DEV_USER_ID` del código

## Troubleshooting

### "Authentication required" error

**Causa:** No se envió `api_key` o es inválido.

**Solución:**

1. Verificar `MCP_API_KEY` en Continue.dev config
2. Verificar que el key no fue revocado: `list_api_keys`
3. Si es primera vez: ejecutar `create_first_api_key`

### "Invalid API key" error

**Causa:** Key existe pero está mal escrito.

**Solución:**

1. Copiar exactamente desde el output de `create_api_key`
2. Verificar no hay espacios extras
3. Verificar prefijo `gmcp_live_`

### "API key revoked" error

**Causa:** Key fue invalidado con `revoke_api_key`.

**Solución:**

1. Crear nuevo key desde otra máquina autorizada
2. Si no tienes otra máquina: contactar admin (o hacer bootstrap de emergencia)

### Bootstrap ya no funciona

**Causa:** Ya existe al menos un key en la BD.

**Solución:**

- Usar `create_api_key` desde máquina autorizada
- O en emergencia: borrar colección `api_keys` (⚠️ riesgoso)

## Referencias

- [bcrypt documentation](https://github.com/kelektiv/node.bcrypt.js)
- [MongoDB Security Best Practices](https://www.mongodb.com/docs/manual/security/)
- [MCP Server Authentication Patterns](https://modelcontextprotocol.io)
