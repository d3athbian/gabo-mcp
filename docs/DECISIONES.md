# Decisiones Técnicas

Decisiones arquitectónicas y de diseño tomadas constructión Gabo MCP.

---

## Elegir Zod como fuente de verdad

Al principio tenía mis esquemas de validación en un lado y mis tipos de TypeScript en otro. Funcionaba, pero cada vez que cambiaba algo tenía que actualizar ambos lugares. Era molesto y propenso a errores.

Zod me resolvió eso: defino el schema una sola vez y de ahí sacos los tipos automáticamente con `z.infer`. Si mañana cambio el schema, TypeScript me avisa en todo el proyecto donde hay inconsistencias. Me ahorro tiempo de debugging.

---

## MongoDB Atlas para todo

Originally iba a usar PostgreSQL con pgvector, pero me di cuenta que MongoDB Atlas ya tiene vector search built-in. Una sola base de datos, un solo dashboard, una sola factura.

Para un proyecto personal como este, simplificar la infraestructura vale más que tener la "mejor" herramienta para cada cosa.

---

## Ollama con auto-start

Instalar Ollama y acordarse de levantarlo cada vez que quiero usar el servidor era un friction innecesario. Sobre todo cuando trabajo con la laptop en otro lado y vuelvo.

Por eso implementé un launcher que intenta levantar Ollama automáticamente. Si ya está corriendo, lo usa. Si no, lo inicia. Si falla, te avisa y podés levantarlo manualmente. La idea es que funcione con el menor esfuerzo posible.

---

## Sanitización bloqueante

Al principio iba a hacer un sistema que solo advierta ("ey, esto tiene una API key"). Pero me di cuenta de que en la práctica, si te aviso y guardás igual, el daño ya está hecho.

Prefiero bloquear y que el usuario decida si quiere usar placeholders o ejemplos genéricos. Es menos conveniente, pero más seguro. Además, te obliga a pensar dos veces antes de guardar algo sensible.

---

## Logs fuera de STDOUT

MCP comunica todo por STDIO. Si yo mandaba logs por console.log, rompía el protocolo y el servidor no funcionaba.

La solución fue simple: escribir a un archivo en `/tmp/gabo-mcp.log`. De paso, agregué rotación automática y limpieza de logs viejos para que no me llene el disco. Pero la razón principal fue poder seguir usando la consola para debuggear sin romper nada.

---

## Deduplicación semántica

Guardé el mismo patrón de autenticación tres veces en distintas semanas. No me acuerdo de que ya lo había guardado, y terminé con entradas duplicadas que me confundían después.

Por eso ahora, antes de guardar algo, el sistema busca si ya existe algo muy similar (>92% de similitud vectorial). Si existe, te avisa y no guarda. Así evito poluir mi propia base de conocimiento.

---

## Middleware de auth componible

No quería repetir código de autenticación en cada herramienta. Además, quería que sea fácil agregar o quitar validación sin tocar la lógica de negocio.

Por eso implementé un `withAuth()` que envuelve cualquier función. Así, si mañana quiero agregar un nuevo endpoint, solo le paso el wrapper y ya tiene autenticación. La clave se valida contra MongoDB, no está hardcodeada en ningún lado.

---

## Tests con mocks de base de datos

Al principio intenté hacer tests de integración conectando a una MongoDB real. Era lento, flaky, y requería infraestructura.

La solución fue usar mocks con estado compartido. Las funciones mockeadas se definen fuera del describe, y se pasan a los módulos mockeados. Así cada test puede configurar su comportamiento específico sin crear mocks nuevos.

El error común es definir mocks dentro del describe - se ejecutan una sola vez y no mantienen estado. La clave es usar `vi.fn()` externas y pasarlas como callback a vi.mock().
