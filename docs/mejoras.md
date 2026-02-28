# Plan de Mejoras para el Portafolio

## Resumen Ejecutivo

Este documento lista las mejoras priorizadas para fortalecer el portafolio técnico de Gabo MCP. Las prioridades están ordenadas por impacto en la percepción de un reclutador y por esfuerzo de implementación.

---

## Priority 1: Cobertura de Tests (CRÍTICO)

**Por qué importa**: Los reclutadores siempre preguntan sobre testing. Coverage del 45% es bajo.

### 1.1 Aumentar coverage a 60%+

**Estado actual**: 45.47% (justo en el umbral)

**Áreas críticas sin coverage**:

- `src/utils/logger/` - 0%
- `src/utils/tool-factory.ts` - 0%
- `src/embeddings/` - 0%
- `src/init/` - 0%
- `src/tools/` - 34.4%

**Acciones**:

- [ ] Agregar tests para `tool-factory.ts` (patrón factory es ideal para tests unitarios)
- [ ] Agregar tests para `embeddings/ollama-client.ts` (mock de fetch)
- [ ] Agregar tests para `init/bootstrap.ts` (验证 inicialización)
- [ ] Agregar tests para logger (verificar escritura a archivo)

**Esfuerzo**: Bajo | **Impacto**: Alto

---

### 1.2 Tests de Integración Reales

**Estado actual**: Solo mocks, sin tests contra DB real

**Acciones**:

- [ ] Crear `src/__tests__/integration/db.integration.test.ts` usando test DB
- [ ] Crear `src/__tests__/integration/vector-search.integration.test.ts`
- [ ] Configurar test database en CI (MongoDB Atlas free tier o docker)

**Esfuerzo**: Medio | **Impacto**: Alto

---

## Priority 2: Documentación para Contribuidores

**Por qué importa**: Muestra capacidad de trabajo en equipo y DX.

### 2.1 Crear CONTRIBUTING.md

**Contenido sugerido**:

```markdown
# Guía de Contribución

## Setup local

1. Clonar repo
2. npm install
3. Crear .env con MONGODB_URI y MCP_API_KEY

## Desarrollo

npm run dev:local

## Testing

npm run test # Unit tests
npm run test:watch # Watch mode

## Calidad

npm run lint # Auto-fix
npm run type-check # TypeScript
```

**Acciones**:

- [ ] Crear `CONTRIBUTING.md`
- [ ] Agregar sección en README.mdlinkeando a CONTRIBUTING

**Esfuerzo**: Bajo | **Impacto**: Medio

---

### 2.2 README.md Mejorado

**Estado actual**: Básico

**Acciones**:

- [ ] Agregar badges de CI/CD, coverage, npm version
- [ ] Agregar "Quick Start" en 30 segundos
- [ ] Agregar screenshot/demo gif
- [ ] Agregar tabla de contenidos

**Esfuerzo**: Bajo | **Impacto**: Medio

---

## Priority 3: Features que Demuestran Profundidad

### 3.1 Rate Limiting

**Por qué importa**: Muestra conocimiento de seguridad y patrones de API.

**Acciones**:

- [ ] Implementar rate limiting por API key
- [ ] Configurar límites: 100 req/min para read, 20 req/min para write
- [ ] Retornar headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

**Esfuerto**: Medio | **Impacto**: Alto

---

### 3.2 Sistema de Versiones

**Por qué importa**: Muestra conocimiento de data modeling.

**Acciones**:

- [ ] Agregar campo `version` a entradas de conocimiento
- [ ] Crear herramienta `update` que mantenga historial
- [ ] Endpoint para ver historial de cambios

**Esfuerzo**: Alto | **Impacto**: Medio

---

### 3.3 Export/Import

**Por qué importa**: Feature práctico, fácil de implementar.

**Acciones**:

- [ ] Herramienta `export` - exportar todo a JSON/ZIP
- [ ] Herramienta `import` - importar desde JSON
- [ ] Soporte para migrar entre cuentas

**Esfuerzo**: Bajo | **Impacto**: Medio

---

## Priority 4: Observabilidad

### 4.1 Métricas Basic

**Por qué importa**: Muestra DevOps/SRE skills.

**Acciones**:

- [ ] Agregar endpoint `/metrics` con:
  - Total de entradas guardadas
  - Búsquedas realizadas
  - Uptime
  - Errores por tipo
- [ ] Usar formato Prometheus o JSON simple

**Esfuerzo**: Bajo | **Impacto**: Medio

---

### 4.2 Health Check Mejorado

**Estado actual**: Solo verificación de MongoDB

**Acciones**:

- [ ] Verificar conexión a Ollama
- [ ] Verificar índices vectoriales
- [ ] Retornar estado detallado en `/health`

**Esfuerzo**: Bajo | **Impacto**: Bajo

---

## Priority 5: Tests de Comportamiento

### 5.1 Test E2E con MCP Inspector

**Acciones**:

- [ ] Crear script que ejecute MCP Inspector automáticamente
- [ ] Testear todas las herramientas via MCP protocol
- [ ] Generar reporte HTML

**Esfuerzo**: Medio | **Impacto**: Medio

---

## Priority 6: Optimizaciones

### 6.1 Cache de Búsqueda

**Acciones**:

- [ ] Implementar Redis o cache en memoria para búsquedas frecuentes
- [ ] TTL configurable
- [ ] Métricas de cache hit rate

**Esfuerzo**: Alto | **Impacto**: Bajo

---

### 6.2 Batch Operations

**Acciones**:

- [ ] Herramienta `save_batch` - guardar múltiples entradas
- [ ] Herramienta `delete_batch` - eliminar múltiples por filtro

**Esfuerzo**: Medio | **Impacto**: Bajo

---

## Tabla de Prioridades

| #   | Mejora                      | Esfuerzo | Impacto | Urgencia       |
| --- | --------------------------- | -------- | ------- | -------------- |
| 1   | Aumentar coverage a 60%+    | Bajo     | Alto    | Inmediata      |
| 2   | Tests de integración reales | Medio    | Alto    | Esta semana    |
| 3   | CONTRIBUTING.md             | Bajo     | Medio   | Esta semana    |
| 4   | README.md mejorado          | Bajo     | Medio   | Esta semana    |
| 5   | Rate limiting               | Medio    | Alto    | Próxima semana |
| 6   | Sistema de versiones        | Alto     | Medio   | Próxima semana |
| 7   | Export/Import               | Bajo     | Medio   | Esta semana    |
| 8   | Métricas /metrics           | Bajo     | Medio   | Esta semana    |
| 9   | Health check mejorado       | Bajo     | Bajo    | Esta semana    |
| 10  | Test E2E con Inspector      | Medio    | Medio   | Este mes       |
| 11  | Cache de búsquedas          | Alto     | Bajo    | Este mes       |
| 12  | Batch operations            | Medio    | Bajo    | Este mes       |

---

## Recomendación para Portafolio

Para impresionar a reclutadores, enfocate en este orden:

1. **Esta semana**: Coverage 60% + CONTRIBUTING.md + README.md mejorado
2. **Próxima semana**: Rate limiting + Export/Import + Métricas
3. **Este mes**: Tests de integración + Sistema de versiones

Estas mejoras muestran:

- Calidad de código (testing)
- Trabajo en equipo (contributing docs)
- DevOps (métricas, health checks)
- Seguridad (rate limiting)
- Diseño de APIs (export/import, versiones)

---

## Commands de Referencia

```bash
# Ver coverage actual
npm run test:coverage

# Ver tests que fallan
npm run test

# Linting con auto-fix
npm run lint

# Type check
npm run type-check
```
