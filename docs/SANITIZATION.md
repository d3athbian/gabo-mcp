# Content Sanitization System

## Overview

Gabo MCP incluye un sistema de sanitización que **bloquea** cualquier intento de guardar contenido sensible (PII o credenciales). No hay forma de evadir esta protección.

## Detectores Activos

El sistema detecta:

- **Credentials**: Contraseñas, API keys, tokens, connection strings
- **PII**: Emails, teléfonos, números de identificación, IPs, tarjetas de crédito, SSN

---

## Cómo Funciona

### Proceso de Detección

Cuando llamas a `save`, el sistema:

1. **Analiza** todos los campos: title, content, tags, source, metadata
2. **Ejecuta** los detectores de credentials y PII
3. **Bloquea** si encuentra algo sensible
4. **Devuelve** un error claro indicando qué campo tiene datos sensibles

### Ejemplo de Respuesta con Bloqueo

```json
{
  "success": false,
  "error": "Blocked: Sensitive data detected in the following fields:\n- title: PII (Detected 1 PII item(s): emails, phone numbers, or sensitive identifiers)\n- content: PII (Detected 1 PII item(s): emails, phone numbers, or sensitive identifiers)\n\nRemove sensitive data and try again.",
  "code": "SANITIZATION_ERROR"
}
```

### Política de Seguridad

- **Firewall por negación**: Todo lo sensible se bloquea, sin excepciones
- **No hay skip_sanitization**: Eliminado permanentemente
- **Evaluación completa**: Todos los campos son revisados

---

## ¿Qué Detecta?

### Credentials

- Contraseñas: `password=`, `pwd=`
- API Keys: `api_key=`, `apiKey=`
- Tokens: `token=`, `Bearer `, JWT tokens
- Service-specific: GitHub tokens (`ghp_`), OpenAI keys (`sk-`), AWS keys (`AKIA`)
- Connection strings: MongoDB, PostgreSQL, MySQL URIs

### PII

- Email addresses (incluyendo formatos obfuscados)
- Emails con [at], [dot], espacios
- Keywords: "mi email es", "mi cuenta", "mi DNI", "contacto", "telefono", "cuenta bancaria"
- Dominios comunes: @gmail.com, @yahoo.com, @hotmail.com, @outlook.com, @icloud.com
- Phone numbers
- Credit card numbers
- Social Security Numbers (SSN)
- IP addresses
- Bank account numbers (10-20 dígitos)
- IBAN
- DNI / CUIL / CUIT / RUT
- Pasaporte
- Licencia de conducir
- Números de seguro social
- Billeteras crypto (ETH, BTC addresses)
- API Keys y Tokens (sk-, ghp\_, AKIA)

---

## Mejores Prácticas

### ✅ SIEMPRE

- No guardes datos personales reales
- Usa ejemplos genéricos: `user@example.com` → `usuario@ejemplo.com`
- Si necesitas guardar un patrón técnico, usa placeholders: `password=***`

### ❌ EVITA

- Guardar emails, teléfonos o IPs reales
- Incluir credenciales de producción
- Pegar contenido que pueda contener datos sensibles

---

## Notas

- **Evaluación obligatoria**: No se puede evadir la sanitización
- **Feedback claro**: El error indica exactamente qué campo y qué tipo de dato sensibles se detectó
- **Aplicable a nuevas entradas**: Solo afecta nuevas escrituras
