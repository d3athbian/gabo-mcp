# Decisiones Técnicas

Decisiones arquitectónicas y de diseño tomadas en la construcción de Gabo MCP.

---

## Zod como fuente de verdad

Los esquemas de validación y los tipos de TypeScript deben definirse una sola vez. Usar `z.infer` garantiza que cualquier cambio en el schema se refleje automáticamente en todo el proyecto, eliminando inconsistencias y reduciendo el tiempo de debugging.

---

## MongoDB Atlas para todo

MongoDB Atlas incluye vector search built-in. Para un proyecto personal, simplificar la infraestructura (una sola base de datos, un solo dashboard) tiene más valor que usar la "mejor" herramienta para cada componente.

---

## Ollama con auto-start

El servidor debe funcionar sin fricción adicional. Un launcher que detecta si Ollama ya está corriendo y lo inicia si es necesario elimina el paso manual de levantar el servicio cada vez que se usa el servidor.

---

## Sanitización bloqueante

Advertir sobre datos sensibles no es suficiente; si el usuario guarda igual, el daño ya está hecho. Bloquear el guardado y forzar el uso de placeholders o ejemplos genéricos es más seguro y obliga a pensar dos veces antes de guardar contenido sensible.

---

## Logs fuera de STDOUT

El protocolo MCP comunica por STDIO. Escribir logs a `/tmp/gabo-mcp.log` permite mantener la consola libre para debugging sin romper el protocolo. La rotación automática previene acumulación de archivos viejos.

---

## Deduplicación semántica

Antes de guardar, el sistema verifica si existe contenido similar (>92% de similitud vectorial). Esto evita poluir la base de conocimiento con entradas duplicadas que confunden después.

---

## Middleware de auth componible

La autenticación debe ser ortogonal a la lógica de negocio. Un `withAuth()` que envuelve cualquier función permite agregar validación sin tocar el handler. La clave se valida contra MongoDB, no está hardcodeada.

---

## Tests con mocks de base de datos

Los tests de integración con MongoDB real son lentos, flaky, y requieren infraestructura. Usar mocks con estado compartido (funciones `vi.fn()` definidas fuera del describe y pasadas como callback a `vi.mock()`) permite configurar el comportamiento específico por test sin crear mocks nuevos.

---

## AppError: Errores estructurados

Los errores necesitan estructura consistente: mensaje, código de error, y status HTTP. Esto habilita manejo centralizado, logs más útiles, y respuestas consistentes al cliente.

---

## Tool Factory

Cada tool MCP comparte el mismo boilerplate: schema, wrapper de auth, logging de auditoría. Un `createTool()` que recibe configuración y handler aplica error handling, auditoría, y validaciones automáticamente, reduciendo código repetido y aumentando consistencia.

---

## Bootstrap centralizado

Conectar DB, validar API key, levantar Ollama, y configurar health checks deben estar orquestados en un solo lugar (`init/bootstrap()`). Esto facilita testing, permite graceful shutdown, y clarifica el flujo de startup.

---

## Backup automático de MongoDB

Sin backups, un error catastrófico significa pérdida total de conocimiento. Backups diarios automáticos con rotación (últimos 7) y trigger manual protegen contra pérdida de datos.

---

## Sanitización única sin profiles

Múltiples profiles de sanitización añaden complejidad sin beneficio real; en producción siempre se usa el mismo comportamiento. Un único comportamiento que bloquea PII y credenciales es más simple, más seguro, y requiere menos configuración.
