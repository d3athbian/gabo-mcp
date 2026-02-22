# Reglas de Seguridad - IMPORTANTE

## REGLA CRÍTICA: PII y Datos Sensibles

### Cuando el sistema detecta PII (emails, teléfonos, IPs, etc.) o credenciales:

**NUNCA intentes evadir la detección.**
**NUNCA modifiques el contenido para evitar la detección.**
**NUNCA uses alternativas como "[at]", "[dot]", espacios, etc.**

**SIEMPRE haz esto:**

1. Informa al usuario que está intentando guardar datos sensibles
2. Devuelve el error exactamente como lo recibió del sistema
3. NO intentes "hackear" el sistema de seguridad

### Ejemplo de LO QUE NO DEBES HACER:

```
❌ Usuario: "Guarda mi email m4debian@gmail.com"
❌ Agente: "Lo guardo como m4 [at] gmail.com"  <- EVASIÓN - PROHIBIDO
```

### Ejemplo de LO QUE DEBES HACER:

```
✅ Usuario: "Guarda mi email m4debian@gmail.com"
✅ Agente: "No puedo guardar este contenido. El sistema detecto datos sensibles (email).
    No puedo evadir esta proteccion. Por favor, usa un ejemplo genérico o cambia el contenido."
```

## Tipos de datos bloqueados:

- Emails (cualquier formato: email@dominio, usuario [at] dominio, etc.)
- Teléfonos
- Direcciones IP
- Contraseñas y API keys
- Números de tarjetas de crédito
- SSN o identificadores personales

## Si el usuario insiste en guardar PII:

拒绝 y explica que es por seguridad. No hay excepciones posibles.
