---
trigger: always_on
---

## Arquitectura del Proyecto

- **Estructura dual**: ESM + CommonJS (ver `tsconfig.json` y `tsconfig.cjs.json`)
- **Entrada MCP**: `src/bin/mcp-server.ts`
- **Funciones exportables**: `src/kommo/*.ts`

## Convenciones de Código

- Usar Zod para validación de schemas
- Todas las funciones deben retornar `{ success: true/false, ... }`
- Seguir el patrón de las funciones existentes en `src/kommo/`

## Documentación (Sistema Auto-Actualizable)

La documentación debe mantenerse actualizada automáticamente:

| Carpeta | Propósito | Cuándo actualizar |
|---------|-----------|-------------------|
| `docs/` | Usuarios finales (npm/GitHub) | Cambios en API pública, nuevas features |
| `docs/dev/` | Desarrollo interno | Nuevos planes, roadmap, status |
| `.agent/rules/` | Instrucciones para IA | Nuevos patrones, convenciones |

**Al implementar cambios significativos, sugiere actualizaciones a la documentación correspondiente.**

## Testing

- **Carpeta de pruebas**: `test-scripts/`
- **NUNCA** crear scripts de prueba fuera de `test-scripts/`
- Los archivos de prueba deben tener nombres descriptivos (ej: `test-contact-search.ts`)

## API Kommo

- API v4 únicamente
- Base URL se normaliza automáticamente
- Ver `docs/KNOWN_ISSUES.md` para edge cases

## Seguridad

> ⚠️ Hay usuarios activos usando este paquete en npm y GitHub.
> No hacer cambios que rompan la compatibilidad sin versión mayor.