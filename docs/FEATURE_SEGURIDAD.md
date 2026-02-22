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

- [x] Hashear API keys (no storing plaintext) — bcrypt + pepper implementado
- [ ] Implementar rate limiting
- [x] Crear índice vectorial automáticamente en setup

### High

- [x] Audit logging completo
- [x] Rotación de keys (`npm run generate:key`)
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
