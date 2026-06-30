# Contrato — pdf-renderer-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Topic / Queue consumido

`document-generation-queue`

## Payload de entrada

```json
{
  "documento_id": "uuid",
  "tipo": "HORARIO_PDF | REPORTE_EXCEL | CONSTANCIA",
  "plantilla_id": "uuid",
  "datos": {}
}
```

## Acción que ejecuta

1. Descarga plantilla desde object storage
2. Renderiza con datos recibidos (Jinja2 / XLSX template)
3. Genera PDF / XLSX
4. Sube a object storage con clave `<dominio>/<año>/<mes>/<entity_id>/<uuid>.<ext>`
5. Actualiza `documento.estado = DISPONIBLE` y `documento.storage_key` en `document_db`
6. Publica `document.documento.generated`

## Dead letter queue

`document-generation-queue.dlq` — mensajes fallidos después de 3 reintentos.
