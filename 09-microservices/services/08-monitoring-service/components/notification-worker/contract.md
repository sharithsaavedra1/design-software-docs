# Contrato — notification-worker

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato de mensajería, agnóstico de lenguaje.

## Evento consumido
| Evento | Origen | Acción |
|--------|--------|--------|
| `monitoring.alert.generated` | alert-worker | Enviar notificación al destinatario |

## Evento producido (opcional)
| Evento | Descripción |
|--------|-------------|
| `monitoring.notification.sent` | Notificación entregada (para trazabilidad/auditoría) |

## Efecto
1. Resuelve destinatario y canal.
2. Crea `sent_notification` en estado `PENDING`.
3. Invoca el proveedor saliente; actualiza a `SENT` o `FAILED`.

## Idempotencia y reintentos
`event_id` único; un envío ya `SENT` no se repite. Fallos → reintento con backoff; agotado → `FAILED` + DLQ `notification-worker.dlq`.

## Privacidad
No se registran datos personales en logs, solo identificadores; el contenido va al canal, no al log (ver [13-operations/observability.md](../../../../../13-operations/observability.md)).
