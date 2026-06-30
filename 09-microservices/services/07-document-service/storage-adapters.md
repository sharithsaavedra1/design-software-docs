# Adaptadores de almacenamiento — document-service

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Estrategia

`document-service` abstrae el almacenamiento físico de archivos detrás de un adaptador. En desarrollo se usa MinIO; en producción se puede sustituir por S3 u otro provider sin cambiar el código de negocio.

## Adaptadores disponibles

| Adaptador | Entorno | Configuración |
|-----------|---------|--------------|
| `MinioStorageAdapter` | Local / DEV | `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET` |
| `S3StorageAdapter` | QA / PROD | `AWS_REGION`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |

## Operaciones expuestas

| Operación | Descripción |
|-----------|-------------|
| `upload(key, content, content_type)` | Subir archivo y retornar `storage_key` |
| `download(key)` | Descargar archivo como stream |
| `presigned_url(key, expires_in)` | Generar URL temporal de descarga |
| `delete(key)` | Eliminar archivo (solo para archivado/limpieza) |

## Naming de claves

```
<dominio>/<año>/<mes>/<entity_id>/<uuid>.<ext>

Ejemplo: horario/2026/06/ficha-abc123/horario-v1.pdf
```

## Notas de seguridad

- Los buckets deben ser privados (no público)
- Acceso a archivos siempre vía pre-signed URL con TTL máximo de 1 hora
- Nunca exponer `storage_key` directamente al frontend — usar el `documento_id` y que el backend genere la URL
