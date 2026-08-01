# Contrato — document-lifecycle-worker

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato de mensajería, agnóstico de lenguaje.

## Eventos consumidos
| Evento | Origen | Acción |
|--------|--------|--------|
| `document.render.completed` | pdf-renderer-worker | Marcar documento como `EMITIDO` |
| `document.lifecycle.tick` | scheduler | Evaluar retención/expiración periódica |

## Eventos producidos
| Evento | Descripción |
|--------|-------------|
| `document.status.changed` | El documento cambió de estado |
| `document.archived` | Documento archivado por política de retención |

## Transiciones de estado (documento)
`DRAFT → EMITIDO → ARCHIVADO`. El borrado es lógico (soft delete); el binario en object storage se marca para expiración según `RETENTION_POLICY`.

## Idempotencia
`event_id` único; una transición hacia un estado ya alcanzado es no-op.

## Errores
Fallo persistente → DLQ `document-lifecycle.dlq`.
