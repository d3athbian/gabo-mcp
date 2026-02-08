# Autenticación mediante API Key

Gabo MCP utiliza un sistema de autenticación simple pero robusto basado en una llave secreta global para proteger tu base de conocimientos.

## 🔑 Concepto de Llave Global

A diferencia de los sistemas multi-usuario tradicionales, Gabo MCP está optimizado para uso personal o de equipo pequeño. Utiliza una única "Master Key" que debe incluirse en cada solicitud enviada al servidor.

## 🚀 Bootstrap inicial

La primera vez que ejecutas el servidor (`npm run dev` o `npm start`), este verificará si existe alguna llave en la base de datos MongoDB:

1.  Si no hay llaves, el servidor generará automáticamente una llave nueva con el prefijo `gabo_`.
2.  La llave se mostrará **una sola vez** en la consola.
3.  Deberás copiar esta llave y añadirla a la configuración de tu cliente MCP.

## ⚙️ Configuración del Cliente

Para usar el servidor, debes pasar la llave en el campo `api_key` de los argumentos de cada herramienta. La mayoría de los clientes MCP (como Continue o Cursor) permiten configurar variables de entorno o parámetros por defecto.

### Ejemplo en Continue.dev (`config.json`):

```json
{
  "mcpServers": [
    {
      "name": "gabo-mcp-local",
      "command": "node",
      "args": ["/ruta/a/gabo-mcp/dist/index.js"],
      "env": {
        "MCP_API_KEY": "gabo_tu_llave_secreta"
      }
    }
  ]
}
```

## 🛡️ Seguridad

- **Prefijo**: Todas las llaves válidas deben comenzar con `gabo_`.
- **Almacenamiento**: Las llaves se almacenan en la colección `api_keys` de tu base de datos MongoDB.
- **Revocación**: Para revocar una llave, simplemente cambia el campo `is_active` a `false` o elimina el documento directamente en MongoDB Atlas. Hay un campo `last_used` que se actualiza automáticamente para auditoría.

## ⚠️ Consideraciones Importantes

- **No compartas tu llave**: Cualquiera con esta llave puede leer, modificar y borrar tu base de conocimientos.
- **Tratamiento de Errores**: Si olvidas incluir la llave o usas una incorrecta, el servidor devolverá un error de tipo `AUTH_ERROR` con una guía de ayuda en el JSON de respuesta.
