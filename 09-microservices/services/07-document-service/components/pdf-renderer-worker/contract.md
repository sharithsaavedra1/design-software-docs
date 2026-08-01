# Contrato — pdf-renderer-worker

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato de mensajería, agnóstico de lenguaje.

## Evento consumido
| Evento | Origen | Acción |
|--------|--------|--------|
| `document.render.requested` | document-api | Renderizar PDF de un `document_version` |

## Evento producido
| Evento | Descripción |
|--------|-------------|
| `document.render.completed` | PDF generado y almacenado; incluye la ruta en object storage |
| `document.render.failed` | Falló el render (tras reintentos) |

## Envelope
```json
{
  "event_id": "uuid",
  "event_type": "document.render.completed",
  "occurred_at": "2026-08-01T14:00:00Z",
  "payload": { "document_id": "uuid", "version_number": 2, "storage_key": "documents/uuid/v2.pdf" }
}
```

## Salida (efectos)
1. Sube el binario al bucket (`OBJECT_STORAGE_BUCKET`) con una `storage_key` determinista.
2. Actualiza los metadatos del `document_version` (ruta, tamaño, hash).
3. Publica `document.render.completed`.

## Idempotencia y errores
`event_id` único; re-render evitado si ya existe el binario. Fallo persistente → DLQ `pdf-renderer.dlq` + `document.render.failed`.
