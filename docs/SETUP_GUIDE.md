# 🚀 Setup Guide - 3 Formas de Correr MCP

## 1. MCP Inspector (Web UI) - ⭐ RECOMENDADO

La forma más fácil con interfaz gráfica en el navegador:

```bash
npm run dev:inspector
```

Luego abre en tu navegador:
```
http://localhost:5173
```

✅ Ventajas:
- Interfaz visual bonita
- Prueba herramientas directamente desde el UI
- Ver logs en tiempo real
- No necesita configuración adicional

---

## 2. VS Code MCP Debugger

Para integrar en VS Code:

```bash
npm run dev:local
```

Configuración ya está en: `~/.mcp/servers.json`

Luego en VS Code:
- Press `Cmd+Shift+P`
- Type "MCP Debugger"
- Select `gabo-mcp-local`

✅ Ventajas:
- Integrado directamente en VS Code
- Acceso a herramientas desde el editor
- Logs en el panel de VS Code

---

## 3. Continue.dev Integration

Configuración ya está en: `~/.continue/config.yml`

Automatically detects `gabo-mcp-local` server from your Continue config.

✅ Ventajas:
- Herramientas disponibles en Continue
- Integración natural con el editor
- Use in your code with AI assistance

---

## 🔄 Puertos Utilizados

| Servicio | Puerto | Comando |
|----------|--------|---------|
| MCP Inspector | `5173` | `npm run dev:inspector` |
| VS Code MCP | stdio | `npm run dev:local` |
| Continue.dev | stdio | configurado en config |

---

## 📝 Rápida Prueba

```bash
# Terminal 1: Inicia el inspector
npm run dev:inspector

# Terminal 2: Abre en navegador
open http://localhost:5173
```

¡Listo! Prueba las 4 herramientas disponibles desde la interfaz web.
