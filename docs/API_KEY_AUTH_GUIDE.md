# Guía de Autenticación con API Keys

Sistema de autenticación completo para el Knowledge MCP Server con control de acceso por dispositivo y revocación remota.

## 📋 Índice

1. [Conceptos Básicos](#conceptos-básicos)
2. [Flujo de Bootstrap](#flujo-de-bootstrap)
3. [Comandos y Prompts](#comandos-y-prompts)
4. [Escenarios de Uso](#escenarios-de-uso)
5. [Solución de Problemas](#solución-de-problemas)

---

## Conceptos Básicos

### ¿Qué es el sistema de API Keys?

Un sistema donde cada dispositivo tiene su propia clave de acceso. Puedes:

- ✅ Crear múltiples claves (una por dispositivo)
- ✅ Revocar claves específicas sin afectar a otras
- ✅ Auditar qué dispositivo hace qué operación
- ✅ Mantener control total desde tu máquina principal

### Estructura de una API Key

```
gmcp_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p
└─┬─┘ └─┬─┘ └──────────┬──────────────┘
  │     │              └── Identificador único (32 caracteres)
  │     └────────────────── Entorno: "live"
  └────────────────────────── Prefijo: "gmcp" (gabo-mcp)
```

**Ejemplo real:** `gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c`

---

## Flujo de Bootstrap

### Escenario: Primera vez usando el sistema

**Paso 1:** Ejecutar bootstrap (no requiere autenticación)

```
@gabo-mcp-local using create_first_api_key, name: "mi-macbook-pro"
```

**Respuesta del sistema:**

```json
{
  "success": true,
  "api_key": "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  "name": "mi-macbook-pro",
  "warning": "SAVE THIS KEY NOW - It will never be shown again!",
  "next_steps": [
    "1. Add this to your .env file:",
    "   MCP_API_KEY=gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
    "2. Update Continue.dev config",
    "3. Restart the server"
  ]
}
```

**⚠️ IMPORTANTE:** Guarda esta key inmediatamente - ¡no se mostrará nunca más!

**Paso 2:** Configurar Continue.dev

Edita `~/.continue/config.yaml`:

```yaml
mcpServers:
  gabo-mcp-local:
    command: npx
    args: ["tsx", "/path/to/gabo-mcp/src/index.ts"]
    env:
      MONGODB_URI: "${MONGODB_URI}"
      MCP_API_KEY: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c"
```

**Paso 3:** Reiniciar el servidor MCP

El Continue.dev ahora enviará automáticamente el `api_key` en cada tool call.

---

## Comandos y Prompts

### 🔐 Autenticación y Administración

#### 1. Crear primera API Key (Bootstrap)

**Cuándo usar:** La primera vez que configuras el sistema, cuando la base de datos está vacía.

**Prompt:**

```
@gabo-mcp-local using create_first_api_key, name: "nombre-del-dispositivo"
```

**Ejemplos:**

```
@gabo-mcp-local using create_first_api_key, name: "macbook-gabo"
@gabo-mcp-local using create_first_api_key, name: "laptop-trabajo"
@gabo-mcp-local using create_first_api_key, name: "desktop-casa"
```

**Nota:** Este comando solo funciona si NO existen API keys en la base de datos.

---

#### 2. Crear API Key para nuevo dispositivo

**Cuándo usar:** Quieres usar el MCP en otro dispositivo (ej: laptop de trabajo).

**Requiere:** Tener una API key válida ya configurada.

**Prompt:**

```
@gabo-mcp-local using create_api_key,
  api_key: "gmcp_live_TU_KEY_ACTUAL",
  name: "laptop-trabajo"
```

**Ejemplo completo:**

```
@gabo-mcp-local using create_api_key,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  name: "laptop-oficina"
```

**Respuesta:**

```json
{
  "success": true,
  "api_key": "gmcp_live_2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p",
  "name": "laptop-oficina",
  "created_by": "macbook-gabo",
  "warning": "SAVE THIS KEY NOW - It will never be shown again!"
}
```

**Siguiente paso:** Copia la nueva key en la laptop de trabajo.

---

#### 3. Listar todas las API Keys

**Cuándo usar:** Quieres ver qué dispositivos tienen acceso.

**Prompt:**

```
@gabo-mcp-local using list_api_keys,
  api_key: "gmcp_live_TU_KEY"
```

**Ejemplo:**

```
@gabo-mcp-local using list_api_keys,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c"
```

**Respuesta:**

```json
{
  "success": true,
  "total_keys": 3,
  "active_keys": 2,
  "inactive_keys": 1,
  "keys": [
    {
      "id": "65b8c2d1e4f3a2b1c3d4e5f6",
      "name": "macbook-gabo",
      "preview": "...3d4c",
      "is_active": true,
      "created_at": "2026-02-01T10:00:00Z",
      "last_used": "2026-02-01T15:30:00Z"
    },
    {
      "id": "65b8c2d1e4f3a2b1c3d4e5f7",
      "name": "laptop-oficina",
      "preview": "...6o7p",
      "is_active": true,
      "created_at": "2026-02-01T11:00:00Z",
      "last_used": "2026-02-01T14:20:00Z"
    },
    {
      "id": "65b8c2d1e4f3a2b1c3d4e5f8",
      "name": "desktop-antiguo",
      "preview": "...9a0b",
      "is_active": false,
      "created_at": "2026-02-01T09:00:00Z"
    }
  ]
}
```

---

#### 4. Revocar (eliminar) una API Key

**Cuándo usar:** Pierdes un dispositivo, o ya no usas una máquina específica.

**Prompt:**

```
@gabo-mcp-local using revoke_api_key,
  api_key: "gmcp_live_TU_KEY",
  key_id: "ID_DEL_KEY_A_REVOCAR"
```

**Ejemplo:**

```
@gabo-mcp-local using revoke_api_key,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  key_id: "65b8c2d1e4f3a2b1c3d4e5f7"
```

También puedes revocar por nombre:

```
@gabo-mcp-local using revoke_api_key,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  key_id: "laptop-oficina"
```

**Respuesta:**

```json
{
  "success": true,
  "revoked": true,
  "key_id": "65b8c2d1e4f3a2b1c3d4e5f7",
  "message": "API key has been revoked. The device using this key can no longer access the system."
}
```

**⚠️ IMPORTANTE:** No puedes revocar tu propia key. Si necesitas hacerlo, usa otro dispositivo autorizado.

---

### 📚 Operaciones de Conocimiento (todas requieren api_key)

Todas las operaciones de conocimiento ahora requieren el parámetro `api_key`.

#### Almacenar conocimiento

```
@gabo-mcp-local using store_knowledge,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  type: "REACT_PATTERN",
  title: "Custom Hooks Pattern",
  content: "Using useCallback and useMemo effectively...",
  tags: ["react", "hooks", "performance"]
```

#### Buscar conocimiento

```
@gabo-mcp-local using search_knowledge,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  query: "react hooks",
  type: "REACT_PATTERN"
```

#### Búsqueda semántica (AI)

```
@gabo-mcp-local using semantic_search,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  query: "how to optimize react rendering",
  limit: 5
```

#### Listar entradas

```
@gabo-mcp-local using list_knowledge,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  limit: 10
```

#### Obtener entrada específica

```
@gabo-mcp-local using get_knowledge,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  id: "65b8c2d1e4f3a2b1c3d4e5f6"
```

---

## Escenarios de Uso

### Escenario 1: Setup Inicial (Tu Mac)

```
# 1. Bootstrap inicial
@gabo-mcp-local using create_first_api_key, name: "macbook-pro-gabo"

# 2. Guardar key en .env
# MCP_API_KEY=gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c

# 3. Configurar Continue.dev
# (Ya está configurado, usar normalmente)

# 4. Usar normalmente
@gabo-mcp-local using store_knowledge,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  type: "REACT_PATTERN",
  title: "Test Entry",
  content: "Testing the system"
```

---

### Escenario 2: Agregar Laptop de Trabajo

```
# En tu Mac (ya autenticado)
@gabo-mcp-local using create_api_key,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  name: "laptop-trabajo"

# Sistema devuelve nueva key:
# gmcp_live_2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p

# En la laptop de trabajo:
# 1. Configurar .env con la nueva key
# 2. Usar normalmente
```

---

### Escenario 3: Laptop Robada/Perdida

```
# En tu Mac (o cualquier dispositivo autorizado)
@gabo-mcp-local using list_api_keys,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c"

# Encuentras el ID: 65b8c2d1e4f3a2b1c3d4e5f7

@gabo-mcp-local using revoke_api_key,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c",
  key_id: "65b8c2d1e4f3a2b1c3d4e5f7"

# La laptop robada ya no tiene acceso
# Tu Mac sigue funcionando normalmente
```

---

### Escenario 4: Auditar Uso

```
# Ver qué dispositivos están activos
@gabo-mcp-local using list_api_keys,
  api_key: "gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c"

# Revisar logs del servidor para ver:
# - Qué key usó cada operación
# - Cuándo fue la última vez que se usó cada key
# - Desde qué dispositivo
```

---

## Solución de Problemas

### Error: "API key is required"

**Causa:** No se proporcionó api_key en la tool call.

**Solución:** Verifica que Continue.dev está configurado correctamente con `MCP_API_KEY` en el entorno.

---

### Error: "Invalid API key format"

**Causa:** El formato del key es incorrecto.

**Solución:** Verifica que el key:

- Empieza con `gmcp_live_`
- Tiene exactamente 40 caracteres (8 de prefix + 32 random)
- No tiene espacios extras

---

### Error: "API key has been revoked"

**Causa:** El key fue revocado con `revoke_api_key`.

**Solución:**

1. Desde otro dispositivo autorizado, crea un nuevo key
2. Configura el nuevo key en el dispositivo

---

### Error: "Bootstrap not available"

**Causa:** Ya existen API keys en la base de datos.

**Solución:** Si es primera vez y no tienes accesso, necesitas:

1. Borrar manualmente la colección `api_keys` en MongoDB (⚠️ riesgoso)
2. O obtener un key válido de otro dispositivo

---

### Error: "Cannot revoke your own API key"

**Causa:** Intentaste revocar el key que estás usando actualmente.

**Solución:** Usa otro dispositivo autorizado para revocar este key.

---

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca compartas tu API key** - Es como tu contraseña
2. **Usa un key por dispositivo** - Facilita la revocación selectiva
3. **Nombra tus keys descriptivamente** - "macbook-gabo", "laptop-trabajo", etc.
4. **Revisa regularmente** - Usa `list_api_keys` para auditar
5. **Revoca inmediatamente** - Si pierdes un dispositivo, revoca su key
6. **No incluyas keys en repos** - Usa variables de entorno

---

## 📁 Archivos de Configuración

### .env

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/knowledge_mcp

# API Key (generado con create_first_api_key)
MCP_API_KEY=gmcp_live_7f8e9d2c1b4a5f6e3d8c9b0a1f2e3d4c

# Ollama
OLLAMA_API_URL=http://localhost:11434
```

### ~/.continue/config.yaml

```yaml
mcpServers:
  gabo-mcp-local:
    command: npx
    args: ["tsx", "/path/to/gabo-mcp/src/index.ts"]
    env:
      MONGODB_URI: "${MONGODB_URI}"
      MCP_API_KEY: "${MCP_API_KEY}"
```

---

**¿Preguntas?** Revisa los ejemplos prácticos en cada sección o consulta el código fuente en `src/tools/`.
