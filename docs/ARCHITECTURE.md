# Arquitectura Técnica - Gabo MCP

Este documento detalla la infraestructura, el sistema de tipos y los patrones de diseño utilizados en **Gabo MCP**.

## 🏗️ Estructura del Proyecto

El proyecto sigue un patrón modular orientado a funcionalidades/dominios:

```
src/
├── db/                 # Capa de datos (MongoDB Atlas)
├── middleware/         # Lógica de interceptación (Auth)
├── schemas/            # Definiciones Zod (Fuente de Verdad)
├── tools/              # Implementación de herramientas MCP
│   ├── get-knowledge/
│   ├── list-knowledge/
│   ├── search-knowledge/
│   ├── semantic-search/
│   └── store-knowledge/
├── utils/              # Utilidades transversales
│   ├── logger/
│   ├── api-key/
│   └── tool-handler/
├── base.type.ts        # Tipos base derivados de schemas
├── index.ts            # Punto de entrada del servidor
└── types.ts            # Tipos de dominio re-exportados
```

## 🛡️ Sistema de Tipos (Single Source of Truth)

Utilizamos **Zod** como la única fuente de verdad para el tipado y la validación:
- **Validación en Runtime**: Los esquemas de Zod validan todas las entradas del servidor MCP.
- **Tipado Estático**: Los tipos de TypeScript se derivan automáticamente usando `z.infer<typeof Schema>`.
- **Sincronización Total**: Si un esquema cambia, el compilador de TS detecta inconsistencias en todo el proyecto instantáneamente.

## 🔐 Seguridad y Autenticación

- **Global Secret Key**: El servidor requiere una clave secreta (`gabo_...`) para todas las operaciones.
- **Middleware Componible**: La autenticación se maneja mediante un middleware `withAuth` que extrae y valida la clave antes de permitir la ejecución de cualquier herramienta.
- **Bootstrap Automático**: En la primera ejecución, si no hay claves registradas en MongoDB, el servidor genera una clave maestra inicial.
- **Content Sanitization**: Sistema de protección que previene el almacenamiento de información sensible (credenciales, PII, datos corporativos). Configurable mediante perfiles de seguridad (`work` | `personal`). Ver [SANITIZATION.md](SANITIZATION.md) para detalles completos.

## 🛠️ Gestión de Errores y Middlewares

Utilizamos un sistema de registro centralizado que envuelve cada herramienta en múltiples capas:
1.  **Capa de Error Global**: Captura excepciones, las registra en el log persistente y devuelve una respuesta JSON estandarizada.
2.  **Capa de Autenticación**: Valida la identidad y limpia los argumentos de metadatos sensibles.
3.  **Capa de Ejecución**: Ejecuta la lógica "pura" de la herramienta.

## 📊 Estrategia de Persistencia y Búsqueda

- **MongoDB Atlas**: Repositorio central de conocimientos.
- **Índices de Búsqueda**:
    - **Texto**: Búsqueda regular mediante `$regex` sobre títulos y contenidos.
    - **Vectorial**: Uso de `$vectorSearch` de Atlas para búsqueda semántica por similitud de coseno.
- **Embeddings**: El servidor adopta un enfoque de "Vector Puro". El cliente es responsable de generar los vectores (embeddings) para mantener la ligereza y flexibilidad del servidor.

## 📝 Registro y Trazabilidad

- **`logger`**: Sistema de logs asíncrono que escribe exclusivamente en archivos (`/tmp/gabo-mcp.log`) para no interferir con el protocolo STDIO del MCP.
- **Traffic Log**: Registro detallado de la entrada y salida de mensajes del protocolo en `/tmp/gabo-mcp-traffic.log`.
- **Rotación Automática**: Los logs se rotan cuando superan 5MB, manteniendo una copia `.old` como respaldo.
- **Limpieza Automática**: En cada inicio del servidor, se eliminan logs con más de 3 días de antigüedad para evitar acumulación de espacio.

## 🔄 Deduplicación Semántica

El servidor implementa un sistema de prevención de duplicados basado en similitud vectorial:
- Antes de insertar una nueva entrada, se ejecuta una búsqueda vectorial para detectar contenido similar.
- Si se encuentra una entrada con > 92% de similitud semántica, se rechaza la inserción con un error `KNOWLEDGE_DUPLICATE`.
- Este sistema funciona **cross-language**: detecta duplicados aunque estén en diferentes idiomas (español, inglés, etc.).
