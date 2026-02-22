# Plan de Respaldo de Base de Datos (Personal y Externo)

Este documento detalla el plan para realizar respaldos automáticos y diarios de la base de datos MongoDB Atlas. Siguiendo tus requerimientos, el respaldo se guardará **fuera del proyecto** para mantenerlo personal y evitar que se suba accidentalmente al repositorio.

## 1. Estrategia de Respaldo

1.  **Ubicación Externa**: Los respaldos se guardarán por defecto en `~/mongodb-backups/gabo-mcp`, fuera de la carpeta del proyecto.
2.  **Todo incluido**: `mongodump` realiza un volcado completo. Esto incluye:
    -   Todas las colecciones de conocimiento.
    -   **Embeddings**: Como los embeddings están guardados dentro de los documentos de la colección, se respaldan automáticamente junto con el texto.
3.  **Portabilidad**: Cualquier persona que clone el repo puede usar el mismo script configurando su propia ruta.

---

## 2. Configuración y Uso

### Requisitos Previos (Solo una vez)
Instala las herramientas de MongoDB:
```bash
brew install mongodb-database-tools
```

### Configuración Personal (`.env`)
Para definir una ruta personalizada, añade esto a tu archivo `.env` (el cual ya está en `.gitignore`):
```env
BACKUP_PATH="/Tu/Ruta/Personal/De/Backups"
```
*Si no lo defines, se guardará en tu carpeta de usuario: `~/mongodb-backups/gabo-mcp`.*

### Ejecución Automática (Al iniciar el MCP)
La aplicación lanza un respaldo en **segundo plano** inteligente:
- **Uno al día**: Por defecto solo hace un respaldo por día (ej: `2026-02-22`).
- **Rotación (2 Versiones)**: El sistema mantiene siempre el respaldo **actual** y el **inmediatamente anterior**. Si hay más de 2 carpetas, borra la más antigua automáticamente.
- **Auto-Wake**: Reintenta la conexión hasta 1 minuto si la DB está dormida.

### Ejecución Manual (Forzada)
Si quieres actualizar el respaldo de hoy:
```bash
npm run db:backup
```
- Al forzarlo, el respaldo anterior del mismo día se renombra a `fecha.old` y se crea uno nuevo.
- El sistema seguirá respetando el límite de **2 carpetas totales** para evitar saturar el disco.

---

## 3. Detalles Técnicos de la Automatización

El sistema utiliza un script dedicado en `scripts/backup-db.ts` que se encarga de:
1.  **Puebas de Vida**: Realiza hasta 5 intentos de "ping" a la base de datos con esperas de 10 segundos entre ellos.
2.  **Aislamiento**: Se ejecuta como un proceso independiente (`detached`), por lo que si el servidor MCP se cierra o reinicia, el respaldo continúa hasta terminar.
3.  **Logs de Respaldo**: Aunque el proceso es silencioso para no ensuciar la consola del MCP, puedes ver el progreso si lo deseas redirigiendo los logs en `src/index.ts`.

---

## 4. Automatización Diaria (Cron Personal)

Para que se haga solo todos los días, configura un cron job en tu sistema.

1.  **Abrir Crontab**:
    ```bash
    crontab -e
    ```

2.  **Añadir Tarea Diaria (Ej: 3:00 AM)**:
    ```cron
    0 3 * * * /bin/zsh -c 'source $HOME/.zshrc && cd /Users/gabo/Documents/GitHub/gabo-mcp && npm run db:backup' >> ~/mongodb-backups/backup.log 2>&1
    ```
    *(Nota: Ajusta la ruta a tu proyecto si es necesario. Se recomienda usar la ruta absoluta de `npm` si el cron no lo encuentra).*

---

## 4. Preguntas Frecuentes

**¿Se respaldan los embeddings?**
Sí. En este proyecto, los embeddings son campos de tipo array dentro de los documentos de MongoDB. `mongodump` guarda el objeto BSON completo, por lo que toda la información vectorial se conserva.

**¿Qué pasa si otra persona clona el repo?**
El código del `package.json` es genérico. Ellos solo necesitarán instalar `mongodb-database-tools` y, opcionalmente, definir su `BACKUP_PATH` para que funcione exactamente igual en sus máquinas sin interferir con el código base.
