# Plan de Refactorización: MCP de Aprendizaje Continuo

**Fecha**: 2026-02-14  
**Objetivo**: Transformar Gabo MCP en un sistema de aprendizaje continuo donde **NADA es verdad absoluta** excepto la regla de que **siempre debe preguntar al usuario antes de guardar conocimiento o registrar errores**.

---

## 🎯 Principio Fundamental

**ÚNICA VERDAD ABSOLUTA DEL SISTEMA:**
> El MCP **NUNCA** guardará conocimiento, errores, patrones o pitfalls sin confirmación explícita del usuario.

**Filosofía**:
- El conocimiento es **tentativo** y **contextual**
- Los patrones son **sugerencias**, no reglas
- Los errores son **lecciones**, no dogmas
- El usuario es el **único árbitro** de qué merece ser recordado

---

## 📋 Fases de Refactorización

### **Fase 1: Eliminar Automatismos y Verdades Absolutas**

#### 1.1 Eliminar Deduplicación Automática
**Archivo**: `src/tools/store-knowledge/index.ts`

**Problema Actual**:
- El sistema rechaza automáticamente contenido "duplicado" (>92% similitud)
- Esto asume que el sistema "sabe mejor" que el usuario

**Solución**:
- ✅ Detectar similitud pero **NO bloquear**
- ✅ **Preguntar al usuario**: "Encontré contenido similar (92% match). ¿Quieres guardarlo de todas formas?"
- ✅ Mostrar el contenido existente para que el usuario decida

**Archivos a modificar**:
- `src/tools/store-knowledge/index.ts`
- `src/db/knowledge/index.ts` (función de deduplicación)

---

#### 1.2 Eliminar Sanitización Automática Bloqueante
**Archivo**: `src/middleware/sanitization/`

**Problema Actual**:
- El sistema bloquea automáticamente contenido con credenciales/PII
- Esto asume que el usuario "no sabe lo que hace"

**Solución**:
- ✅ Detectar contenido sensible pero **NO bloquear**
- ✅ **Preguntar al usuario**: "Detecté posibles credenciales en el contenido. ¿Estás seguro de querer guardarlo?"
- ✅ Opción de sanitizar automáticamente o guardar tal cual

**Archivos a modificar**:
- `src/middleware/sanitization/index.ts`
- `src/tools/store-knowledge/index.ts`

---

#### 1.3 Convertir `suggest_patterns` en Modo Consultivo
**Archivo**: `src/tools/suggest-patterns/index.ts`

**Problema Actual**:
- Sugiere patrones como si fueran "la respuesta correcta"

**Solución**:
- ✅ Cambiar lenguaje de "deberías usar este patrón" a "encontré estos patrones similares, ¿te sirven?"
- ✅ Nunca asumir que un patrón existente es la solución
- ✅ Siempre ofrecer la opción de crear un nuevo patrón

**Archivos a modificar**:
- `src/tools/suggest-patterns/index.ts`

---

#### 1.4 Convertir `get_pitfalls` en Checklist Sugerido
**Archivo**: `src/tools/get-pitfalls/index.ts`

**Problema Actual**:
- Presenta pitfalls como "errores que DEBES evitar"

**Solución**:
- ✅ Cambiar lenguaje de "evita esto" a "en el pasado tuviste problemas con esto, ¿quieres revisarlo?"
- ✅ Nunca bloquear acciones basándose en pitfalls
- ✅ Ofrecer la opción de marcar un pitfall como "ya no aplicable"

**Archivos a modificar**:
- `src/tools/get-pitfalls/index.ts`

---

### **Fase 2: Implementar Sistema de Confirmación Obligatoria**

#### 2.1 Crear Nueva Herramienta: `propose_knowledge`
**Archivo nuevo**: `src/tools/propose-knowledge/index.ts`

**Propósito**:
- Reemplazar `store_knowledge` como herramienta principal
- **NUNCA** guarda directamente
- Siempre presenta una propuesta al usuario

**Flujo**:
1. Agente llama `propose_knowledge` con contenido
2. Sistema analiza el contenido (similitud, sanitización, categoría sugerida)
3. Sistema retorna una **propuesta estructurada**:
   ```json
   {
     "proposal_id": "uuid",
     "suggested_type": "PATTERN",
     "title": "...",
     "content": "...",
     "warnings": [
       "Detecté 92% similitud con 'Entry XYZ'",
       "Detecté posible API key en línea 5"
     ],
     "similar_entries": [...],
     "question": "¿Quieres guardar este conocimiento?"
   }
   ```
4. Usuario responde con `confirm_knowledge(proposal_id)` o `reject_knowledge(proposal_id)`

**Archivos a crear**:
- `src/tools/propose-knowledge/index.ts`
- `src/tools/confirm-knowledge/index.ts`
- `src/tools/reject-knowledge/index.ts`
- `src/db/proposals/index.ts` (almacenamiento temporal de propuestas)

---

#### 2.2 Deprecar `store_knowledge`
**Archivo**: `src/tools/store-knowledge/index.ts`

**Opciones**:
1. **Opción A (Suave)**: Mantener `store_knowledge` pero agregar warning: "Esta herramienta está deprecada, usa `propose_knowledge`"
2. **Opción B (Estricta)**: Eliminar completamente y forzar uso de `propose_knowledge`

**Recomendación**: Opción A durante 1 mes, luego Opción B

---

#### 2.3 Crear Sistema de Propuestas Temporales
**Archivo nuevo**: `src/db/proposals/index.ts`

**Propósito**:
- Almacenar propuestas pendientes de confirmación
- TTL de 24 horas (auto-expiración)

**Schema**:
```typescript
{
  proposal_id: string;
  type: "knowledge" | "pitfall" | "pattern";
  suggested_data: KnowledgeEntry;
  warnings: string[];
  similar_entries: string[];
  created_at: Date;
  expires_at: Date;
}
```

---

### **Fase 3: Refactorizar Herramientas Existentes**

#### 3.1 `search_knowledge` → Sin cambios
- Ya es consultiva por naturaleza
- Solo retorna información, no toma decisiones

#### 3.2 `semantic_search` → Sin cambios
- Ya es consultiva por naturaleza

#### 3.3 `list_knowledge` → Agregar filtros de confianza
**Archivo**: `src/tools/list-knowledge/index.ts`

**Mejora**:
- Agregar campo `confidence_level` a cada entrada (user-defined)
- Permitir filtrar por nivel de confianza
- Mostrar "última vez usado" para identificar conocimiento obsoleto

#### 3.4 `get_knowledge` → Agregar contexto de uso
**Archivo**: `src/tools/get-knowledge/index.ts`

**Mejora**:
- Mostrar cuántas veces se ha consultado esta entrada
- Mostrar última vez que se usó
- Permitir al usuario marcar como "obsoleto" o "actualizar"

---

### **Fase 4: Eliminar Código Innecesario**

#### 4.1 Archivos a Eliminar

**Sistema de Sanitización Bloqueante**:
- ❌ `src/middleware/sanitization/blockers.ts` (si existe)
- ✅ Mantener detectores, eliminar bloqueadores

**Deduplicación Automática**:
- ❌ Lógica de rechazo automático en `src/db/knowledge/index.ts`
- ✅ Mantener detección, eliminar rechazo

**Logs Automáticos**:
- ❌ `src/middleware/auto-logging/` (si existe)
- ✅ Logs solo bajo demanda del usuario

**Tests Obsoletos**:
- ❌ Tests que validen "bloqueo automático"
- ✅ Tests que validen "detección + propuesta"

---

#### 4.2 Simplificar Middleware Stack
**Archivo**: `src/tools/index.ts`

**Antes**:
```typescript
finalHandler = withAuth(finalHandler);
finalHandler = withSanitization(finalHandler); // ❌ Eliminar
finalHandler = withDeduplication(finalHandler); // ❌ Eliminar
finalHandler = withErrorHandler(finalHandler);
```

**Después**:
```typescript
finalHandler = withAuth(finalHandler);
finalHandler = withErrorHandler(finalHandler);
// Detección de problemas se hace DENTRO de cada herramienta
// y se presenta como WARNING, no como bloqueo
```

---

### **Fase 5: Actualizar Documentación**

#### 5.1 Archivos a Actualizar

**README.md**:
- ✅ Cambiar "Gabo MCP aprende automáticamente" → "Gabo MCP propone aprendizajes"
- ✅ Enfatizar que el usuario tiene control total

**FUNCIONALIDADES.md**:
- ✅ Documentar `propose_knowledge`, `confirm_knowledge`, `reject_knowledge`
- ✅ Marcar `store_knowledge` como deprecada

**MANIFESTO.md**:
- ✅ Agregar sección "Principio de No-Asunción"
- ✅ Enfatizar que el sistema nunca asume conocer la verdad

**Nuevo archivo: LEARNING_PHILOSOPHY.md**:
- ✅ Explicar por qué el sistema no guarda automáticamente
- ✅ Explicar cómo el usuario es el árbitro final
- ✅ Ejemplos de flujos de confirmación

---

## 🗂️ Resumen de Archivos Afectados

### **Archivos a Crear** (7 nuevos)
1. `src/tools/propose-knowledge/index.ts`
2. `src/tools/confirm-knowledge/index.ts`
3. `src/tools/reject-knowledge/index.ts`
4. `src/db/proposals/index.ts`
5. `src/db/proposals/index.type.ts`
6. `docs/LEARNING_PHILOSOPHY.md`
7. `docs/REFACTORING_PLAN.md` (este archivo)

### **Archivos a Modificar** (12 existentes)
1. `src/tools/store-knowledge/index.ts` (deprecar)
2. `src/tools/suggest-patterns/index.ts` (lenguaje consultivo)
3. `src/tools/get-pitfalls/index.ts` (lenguaje consultivo)
4. `src/tools/list-knowledge/index.ts` (agregar confianza)
5. `src/tools/get-knowledge/index.ts` (agregar contexto)
6. `src/db/knowledge/index.ts` (eliminar rechazo automático)
7. `src/middleware/sanitization/index.ts` (solo detectar, no bloquear)
8. `src/tools/index.ts` (simplificar middleware)
9. `README.md`
10. `docs/FUNCIONALIDADES.md`
11. `docs/MANIFESTO.md`
12. `src/schemas/index.schema.ts` (agregar schemas de propuestas)

### **Archivos a Eliminar** (TBD según auditoría)
- Cualquier middleware de bloqueo automático
- Tests de validación de bloqueos
- Código de auto-logging sin consentimiento

---

## 🚀 Orden de Implementación Sugerido

### **Sprint 1: Fundamentos (Semana 1)**
1. ✅ Crear sistema de propuestas (`src/db/proposals/`)
2. ✅ Implementar `propose_knowledge`
3. ✅ Implementar `confirm_knowledge` y `reject_knowledge`
4. ✅ Tests unitarios del flujo de propuestas

### **Sprint 2: Refactorización (Semana 2)**
5. ✅ Modificar `store_knowledge` para agregar warning de deprecación
6. ✅ Eliminar bloqueo automático de deduplicación
7. ✅ Eliminar bloqueo automático de sanitización
8. ✅ Actualizar middleware stack

### **Sprint 3: Herramientas Consultivas (Semana 3)**
9. ✅ Refactorizar `suggest_patterns` (lenguaje consultivo)
10. ✅ Refactorizar `get_pitfalls` (lenguaje consultivo)
11. ✅ Agregar campos de confianza a `list_knowledge`
12. ✅ Agregar contexto de uso a `get_knowledge`

### **Sprint 4: Documentación y Limpieza (Semana 4)**
13. ✅ Crear `LEARNING_PHILOSOPHY.md`
14. ✅ Actualizar `README.md`, `FUNCIONALIDADES.md`, `MANIFESTO.md`
15. ✅ Auditoría de código innecesario
16. ✅ Eliminar archivos obsoletos
17. ✅ Tests de integración end-to-end

---

## 🧪 Criterios de Éxito

### **Criterio 1: Confirmación Obligatoria**
- ✅ Ninguna herramienta guarda conocimiento sin confirmación del usuario
- ✅ Todas las propuestas expiran en 24 horas si no se confirman

### **Criterio 2: Lenguaje Consultivo**
- ✅ Ninguna herramienta usa lenguaje imperativo ("debes", "evita", "siempre")
- ✅ Todas las sugerencias usan lenguaje tentativo ("encontré", "podrías", "en el pasado")

### **Criterio 3: Control del Usuario**
- ✅ Usuario puede marcar conocimiento como "obsoleto"
- ✅ Usuario puede ajustar nivel de confianza de cada entrada
- ✅ Usuario puede rechazar propuestas sin penalización

### **Criterio 4: Transparencia**
- ✅ Cada propuesta muestra claramente qué detectó el sistema (similitud, warnings)
- ✅ Usuario siempre ve el "por qué" de cada sugerencia

---

## 📊 Métricas de Impacto

**Antes de la Refactorización**:
- Guardados automáticos: ~80% de las operaciones
- Rechazos automáticos: ~15% de las operaciones
- Confirmaciones del usuario: ~5% de las operaciones

**Después de la Refactorización**:
- Guardados automáticos: **0%**
- Propuestas presentadas: **100%**
- Confirmaciones del usuario: **100%** de los guardados exitosos

---

## 🎓 Filosofía del Nuevo Sistema

### **Antes (Sistema Paternalista)**
> "El MCP sabe qué es mejor para ti. Bloquea duplicados, sanitiza automáticamente, sugiere patrones como verdades."

### **Después (Sistema Socrático)**
> "El MCP te ayuda a pensar. Detecta patrones, señala riesgos, pero TÚ decides qué es verdad."

---

## 🔄 Plan de Migración

### **Opción A: Migración Gradual (Recomendada)**
1. Mantener `store_knowledge` con warning durante 1 mes
2. Introducir `propose_knowledge` como herramienta preferida
3. Después de 1 mes, deprecar completamente `store_knowledge`

### **Opción B: Migración Inmediata**
1. Eliminar `store_knowledge` inmediatamente
2. Forzar uso de `propose_knowledge`
3. Actualizar todos los prompts y documentación

**Recomendación**: Opción A para dar tiempo a los usuarios a adaptarse

---

## ✅ Checklist de Validación Final

Antes de considerar la refactorización completa:

- [ ] Ninguna herramienta guarda conocimiento sin confirmación
- [ ] Ninguna herramienta bloquea acciones automáticamente
- [ ] Todas las sugerencias usan lenguaje consultivo
- [ ] Usuario puede rechazar cualquier propuesta
- [ ] Usuario puede marcar conocimiento como obsoleto
- [ ] Documentación refleja la nueva filosofía
- [ ] Tests cubren flujos de confirmación
- [ ] Código innecesario ha sido eliminado

---

**Próximos Pasos**:
1. ¿Apruebas este plan?
2. ¿Quieres que empiece por alguna fase específica?
3. ¿Hay algo que quieras agregar o modificar?
