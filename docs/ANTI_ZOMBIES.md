# 🧟 Guía Anti-Zombies - gabo-mcp

## Problema: Continue.dev no responde

Si Continue.dev no está usando las tools o aparece desconectado, **hay procesos zombies** bloqueando el servidor.

## Solución Rápida (30 segundos)

### Paso 1: Limpiar zombies (Terminal)

```bash
cd /Users/gabo/Documents/GitHub/gabo-mcp
npm run clean
```

Verás algo así:

```
🧹 EMERGENCY CLEANUP - gabo-mcp
================================
🔍 BEFORE cleanup:
📊 Current MCP processes:
  gabo-mcp-server (PID: 12345)
  ...

🔪 Killing processes...
✅ SUCCESS: All zombies eliminated!
================================
```

### Paso 2: Cerrar VS Code completamente

```bash
# En terminal:
pkill -f "Visual Studio Code"

# O usa Cmd+Q en Mac
```

### Paso 3: Reabrir VS Code y probar

```
@gabo-mcp-local using list_knowledge,
  api_key: "gmcp_live_TU_KEY_AQUI",
  limit: 5
```

---

## Comandos Útiles

| Comando                   | Cuándo usar                  | Qué hace                   |
| ------------------------- | ---------------------------- | -------------------------- |
| `npm run clean`           | **Siempre** antes de iniciar | Mata zombies + limpia temp |
| `npm run dev:local`       | Desarrollo local             | Limpia + inicia servidor   |
| `npm run kill:all`        | Emergencia                   | Mata todos los procesos    |
| `ps aux \| grep gabo-mcp` | Verificar                    | Muestra procesos activos   |

---

## Configuración Continue.dev (CORRECTA)

**IMPORTANTE:** No uses `npm run` en Continue.dev, usa `tsx` directamente:

```yaml
# ~/.continue/config.yaml
mcpServers:
  gabo-mcp-local:
    command: npx
    args: ["tsx", "/Users/gabo/Documents/GitHub/gabo-mcp/src/index.ts"]
    env:
      MONGODB_URI: "${MONGODB_URI}"
      MCP_API_KEY: "${MCP_API_KEY}"
```

⚠️ **NO hagas esto:**

```yaml
# MAL - Causa procesos anidados
args: ["npm", "run", "dev:local"] # ❌ No usar
```

---

## Prevención de Zombies

### Flujo de trabajo recomendado:

1. **Antes de abrir VS Code:**

   ```bash
   npm run clean
   ```

2. **Abrir VS Code**

3. **Usar normalmente**

4. **Al cerrar VS Code:**
   - Usa Cmd+Q (Mac) o cierra la ventana
   - Los procesos se cerrarán automáticamente

5. **Si hay problemas:**
   ```bash
   npm run clean
   ```

---

## Diagnóstico

### Verificar si hay zombies:

```bash
ps aux | grep gabo-mcp | grep -v grep
```

**Si hay resultados:** Hay zombies → Ejecuta `npm run clean`

**Si está vacío:** Está limpio → Puedes iniciar VS Code

### Ver logs del servidor:

```bash
tail -f /tmp/gabo-mcp-traffic.log
```

---

## ¿Por qué pasan los zombies?

### Causas comunes:

1. **Cerrar VS Code con Cmd+W** (cierra ventana, no la app)
2. **Cerrar terminal sin matar el proceso**
3. **Crash del servidor sin limpieza**
4. **Múltiples instancias de VS Code**

### Solución permanente:

El script `npm run clean` ahora:

- Usa `pkill -9` (fuerza el cierre)
- Limpia archivos temporales
- Muestra antes/después
- Funciona siempre

---

## Troubleshooting

### "npm run clean no funciona"

Prueba manual:

```bash
pkill -9 -f "gabo-mcp"
pkill -9 -f "tsx.*index"
sleep 2
ps aux | grep gabo-mcp  # Debe estar vacío
```

### "Sigue sin funcionar en Continue.dev"

1. Cierra VS Code completamente (Cmd+Q)
2. Ejecuta `npm run clean`
3. Abre VS Code
4. Espera 5 segundos después de abrir
5. Prueba el comando

### "Error: Address already in use"

Hay un proceso zombie ocupando el puerto:

```bash
npm run clean
# o
lsof -i :3000 | awk '{print $2}' | tail -1 | xargs kill -9
```

---

## Resumen

✅ **Antes de cada sesión:** `npm run clean`
✅ **Config Continue.dev:** Usa `tsx`, no `npm run`
✅ **Cierre correcto:** Cmd+Q (no Cmd+W)
✅ **Si falla:** Limpiar + reiniciar VS Code

**Ahora sí está funcionando el sistema de limpieza automática!** 🎉
