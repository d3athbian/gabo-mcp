# Feature: Seguridad

## Estado Actual

### Autenticación Implementada

- **API Key**: Sistema basado en claves con prefijo `gabo_`
- **Generación**: Automática en primer inicio via `ensureApiKeyExists()`
- **Validación**: Middleware `withAuth` en cada request
- **Almacenamiento**: MongoDB (texto plano)

### Infraestrutura de Seguridad

- Sanitización de datos (PII, credenciales, variables de entorno)
- Health monitor para conexión a DB
- Logger estructurado
- Índice vectorial automático (con fallback a text search)
- Cache de embeddings con TTL (1 hora por defecto)

---

## Recomendaciones de Seguridad

### 1. Generación de API Keys

**Problema actual**: La clave se genera pero no se asegura que el usuario la copie/guarde correctamente.

**Recomendaciones**:

- [ ] Guardar la API key en un secure vault (Keychain/Windows Credential Manager) al generarse
- [ ] Mostrar warning claro si la key no fue guardada antes de cerrar sesión
- [ ] Implementar método de recuperación: generar nueva key y revocar antigua
- [ ] Añadir fecha de expiración opcional a las keys
- [ ] Crear CLI command: `gabo-mcp key rotate`

### 2. Almacenamiento de Credenciales

**Problema actual**: Las API keys se almacenan en texto plano en MongoDB.

**Recomendaciones**:

- [ ] Hashear las API keys usando bcrypt/argon2 antes de guardar
- [ ] Usar campo separado para hash: `key_hash` (no guardar key real)
- [ ] Implementar salting por usuario/instancia
- [ ] NEVER guardar la key original, solo el hash para validación

```typescript
// Mejor práctica
import { hash, verify } from "@node-rs/argon2";

const hash = await hash(apiKey);
// Guardar hash en DB
const valid = await verify(storedHash, providedKey);
```

### 3. Rate Limiting

**Problema actual**: Sin límites de uso.

**Recomendaciones**:

- [ ] Implementar rate limiting por API key
- [ ] Limitar requests por minuto/hora/día
- [ ] Añadir headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- [ ] Bloquear keys que excedan límites temporalmente

```typescript
// Estructura en MongoDB
{
  key_id: "...",
  requests_today: 150,
  last_request: ISODate,
  is_rate_limited: false
}
```

### 4. Auditoría (Audit Log)

**Problema actual**: Solo logging básico.

**Recomendaciones**:

- [ ] Crear colección `audit_logs` con:
  - `key_id`, `action`, `timestamp`, `ip`, `user_agent`, `success`
- [ ] Eventos a auditar:
  - Login/validación de key
  - Creación/rotación/revocación de keys
  - Acceso a herramientas
  - Errores de autenticación
- [ ] Retention policy: 90 días mínimo
- [ ] Exports para compliance

### 5. Seguridad de Datos

**Recomendaciones**:

- [ ] Encriptar datos sensibles en MongoDB (field-level encryption)
- [ ] Validar tamaño máximo de payloads
- [ ] Sanitizar TODAS las inputs del usuario
- [ ] Usar HTTPS para todas las conexiones externas
- [ ] Implementar CSP headers si hay UI

### 6. Rotación de Keys

**Recomendaciones**:

- [ ] Implementar rotación automática cada 90 días
- [ ] Grace period: permitir key vieja 7 días después de rotación
- [ ] Notificar al usuario antes de expiración
- [ ] CLI: `gabo-mcp key list`, `gabo-mcp key revoke <id>`

### 7. Autenticación Multifactor (MFA)

**Recomendaciones**:

- [ ] Para operaciones sensibles (delete, revoke key): requerir MFA
- [ ] Integrar con TOTP (Google Authenticator, etc.)
- [ ] Opcional: hardware keys (YubiKey)

---

## Checklist de Implementación

### Critical (Alta Prioridad)

- [ ] Hashear API keys (no storing plaintext)
- [ ] Implementar rate limiting
- [x] Crear índice vectorial automáticamente en setup

### High

- [ ] Audit logging completo
- [ ] Rotación de keys
- [ ] Alertas de seguridad (key comprometida, rate limit excedido)

### Medium

- [ ] MFA para operaciones sensibles
- [ ] Encriptación field-level en MongoDB
- [ ] Dashboard de seguridad

### Low

- [ ] Integración con SIEM
- [ ] Compliance reports automáticos

---

## Variables de Entorno de Seguridad

```bash
# Seguridad
MCP_API_KEY=                    # Tu API key
MCP_API_KEY_ROTATION_DAYS=90    # Días hasta rotación
MCP_RATE_LIMIT_RPM=60           # Requests por minuto
MCP_AUDIT_LOG_ENABLED=true     # Habilitar audit log
MCP_AUDIT_RETENTION_DAYS=90     # Retención de logs
MCP_ALERT_EMAIL=                # Email para alertas
```

---

## Referencias

- [MongoDB Field Level Encryption](https://www.mongodb.com/docs/manual/core/security-field-level-encryption/)
- [OWASP API Security](https://owasp.org/API-Security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
