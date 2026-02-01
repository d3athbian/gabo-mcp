# Proceso: gabo-mcp-server

## 🔧 Gestión de Procesos

El servidor MCP ahora se ejecuta con el nombre de proceso `gabo-mcp-server`, lo que permite identificarlo y matar procesos zombie fácilmente.

### Comandos Disponibles

#### **Limpiar zombies antes de iniciar** (Recomendado)

```bash
# Usando npm (automático al iniciar)
npm run dev:local

# Manualmente
npm run kill:zombies

# O usando el script directamente
./scripts/cleanup.sh
```

#### **Matar todos los procesos relacionados**

```bash
npm run kill:all
```

#### **Ver procesos activos**

```bash
ps aux | grep gabo-mcp
```

### Flujo de Trabajo Recomendado

**Cada vez que quieras usar el MCP:**

1. **Abre terminal y ejecuta:**

   ```bash
   cd /Users/gabo/Documents/GitHub/gabo-mcp
   npm run dev:local
   ```

   Esto automáticamente:
   - 🧹 Mata procesos zombie
   - 🚀 Inicia el servidor limpio
   - ✅ Conecta a MongoDB

2. **Espera ver:**

   ```
   ✅ Server connected and ready!
   ```

3. **Abre Continue.dev** y prueba:
   ```
   @gabo-mcp-local using create_first_api_key, name: "mi-mac"
   ```

### Solución de Problemas

#### Error: "Address already in use" o procesos bloqueados

```bash
# Paso 1: Matar todos los procesos
npm run kill:all

# Paso 2: Verificar que no queden
ps aux | grep gabo-mcp
# (Debe estar vacío)

# Paso 3: Iniciar limpio
npm run dev:local
```

#### Error: Continue.dev no responde

```bash
# Cierra VS Code completamente
pkill -f "Visual Studio Code"

# Limpia procesos MCP
npm run kill:all

# Abre VS Code y prueba de nuevo
```

### Características del Sistema

- **Nombre del proceso:** `gabo-mcp-server`
- **PID tracking:** Cada instancia muestra su PID al iniciar
- **Auto-cleanup:** `npm run dev:local` limpia automáticamente
- **Scripts disponibles:**
  - `kill:zombies` - Mata procesos con el nombre exacto
  - `kill:all` - Mata todos los procesos relacionados
  - `cleanup.sh` - Script bash completo con verificación

### Logs del Sistema

Cuando inicias verás:

```
🔖 Process started with title: gabo-mcp-server (PID: 12345)
🧹 Cleaning up zombie processes...
🔪 Killing zombies...
✅ All zombies eliminated!
🔗 Connecting to MongoDB Atlas...
✅ MongoDB connection established
✅ Server connected and ready!
```

---

## Configuración Continue.dev

```yaml
mcpServers:
  gabo-mcp-local:
    command: npx
    args: ["tsx", "/Users/gabo/Documents/GitHub/gabo-mcp/src/index.ts"]
    env:
      MONGODB_URI: "${MONGODB_URI}"
      MCP_API_KEY: "${MCP_API_KEY}"
```

⚠️ **Nota:** No uses `npm run dev:local` en Continue.dev, usa `tsx` directamente para evitar anidamiento de procesos.
