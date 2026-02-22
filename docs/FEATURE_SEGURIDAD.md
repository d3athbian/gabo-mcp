# Feature: Seguridad

## Estado Actual

### Autenticación Implementada

- **API Key**: Sistema basado en claves con prefijo `gabo_`
- **Generación**: Automática en primer inicio via `ensureApiKeyExists()`
- **Rotación**: Script `npm run generate:key` para revocar y generar nuevas keys
- **Validación**: Middleware `withAuth` en cada request
- **Almacenamiento**: MongoDB (bcrypt hash + pepper - nunca texto plano)

### Auditoría (Audit Log)

- Colección `audit_logs` con TTL de 90 días
- Eventos auditados:
  - `auth_success` / `auth_failed` - Validación de API keys
  - `key_created` / `key_rotated` / `key_revoked` - Ciclo de vida de keys
  - Acciones de herramientas
- Herramienta MCP: `get_audit_logs` para consultar logs

### Infraestructura de Seguridad

- Sanitización de datos (PII, credenciales, variables de entorno)
- Health monitor para conexión a DB
- Logger estructurado
- Índice vectorial automático (con fallback a text search)
- Cache de embeddings con TTL (1 hora por defecto)

---

## Pendientes

### High Priority

- [ ] Rate limiting

### Medium Priority

- [ ] Rotación automática de keys (actualmente manual con `npm run generate:key`)
- [ ] Notificaciones antes de expiración
- [ ] MFA para operaciones sensibles
- [ ] Encriptación field-level en MongoDB (datos sensibles)

### Low Priority

- [ ] Dashboard de seguridad
- [ ] Integración con SIEM
- [ ] Compliance reports automáticos

---

## Variables de Entorno

```bash
MCP_API_KEY=                    # Tu API key (auto-generada)
MCP_KEY_PEPPER=                # Pepper para hashing (auto-generado)
MCP_AUDIT_RETENTION_DAYS=90    # Retención de logs
```

---

## Referencias

- [MongoDB Field Level Encryption](https://www.mongodb.com/docs/manual/core/security-field-level-encryption/)
- [OWASP API Security](https://owasp.org/API-Security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
