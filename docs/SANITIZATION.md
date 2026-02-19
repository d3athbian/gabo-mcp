# Content Sanitization System

## Overview

Gabo MCP incluye un sistema de sanitización que **detecta y advierte** sobre contenido sensible, pero **nunca bloquea**. El usuario decide qué guardar.

## Detectores Activos

El sistema actualmente detecta:

- **Credentials**: Contraseñas, API keys, tokens, connection strings
- **PII**: Emails, teléfonos, números de identificación

---

## Cómo Funciona

### Proceso de Detección

Cuando llamas a `save`, el sistema:

1. **Analiza** el título y contenido
2. **Ejecuta** los detectores de credentials y PII
3. **Retorna** advertencias si encuentra algo sensible
4. **Siempre permite** guardar (el usuario decide)

### Ejemplo de Respuesta con Advertencias

```json
{
  "success": true,
  "id": "507f1f77bcf86cd799439011",
  "warnings": [
    "CREDENTIALS: Possible API key detected (sk-...)",
    "PII: Possible email address detected"
  ],
  "message": "Saved with 2 warning(s)"
}
```

### Forzar Guardado

Si quieres guardar sin sanitización:

```typescript
save({
  type: "PATTERN",
  title: "...",
  content: "...",
  skip_sanitization: true,
});
```

---

## ¿Qué Detecta?

### Credentials

- Contraseñas: `password=`, `pwd=`
- API Keys: `api_key=`, `apiKey=`
- Tokens: `token=`, `Bearer `, JWT tokens
- Service-specific: GitHub tokens (`ghp_`), OpenAI keys (`sk (`AKIA`)
-`), AWS keys- Connection strings: MongoDB, PostgreSQL, MySQL URIs

### PII

- Email addresses
- Phone numbers
- Credit card numbers
- Social Security Numbers (SSN)
- IP addresses

---

## Mejores Prácticas

### ✅ SIEMPRE

- Revisa las advertencias de sanitización
- Redacta datos sensibles: `api_key=***REDACTED***`
- Usa ejemplos genéricos: `user@example.com`

### ❌ EVITA

- Guardar passwords o API keys reales
- Incluir emails o teléfonos reales
- Pegar connection strings con credenciales

---

## Notas

- **Sin perfiles de seguridad**: No hay "work" vs "personal". El sistema solo advierte.
- **No bloquea**: Siempre puedes guardar, incluso con advertencias.
- **Solo entradas nuevas**: La sanitización solo aplica a nuevas entradas, no afecta las existentes.
