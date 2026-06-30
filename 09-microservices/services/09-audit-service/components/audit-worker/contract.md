# Contrato — audit-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Topics consumidos

Todos los topics del sistema (fan-out o wildcard según el bus de mensajes elegido):

- `iam-events`
- `reference-events`
- `academic-events`
- `environment-events`
- `scheduling-events`
- `actors-events`
- `document-events`
- `monitoring-events`

## Acción que ejecuta

Por cada mensaje recibido:
1. Extrae `event_id`, `event_type`, `source_service`, `timestamp`, `payload`
2. Extrae `actor_id` del payload si existe (campo `user_id`, `created_by`, o equivalente)
3. INSERT en `audit_record` (nunca UPDATE ni DELETE)
4. ACK al broker

## Garantía de entrega

At-least-once. La PK `event_id` previene duplicados (el segundo INSERT falla silenciosamente por constraint UNIQUE en `event_id`).

## Dead letter queue

`audit-events.dlq` — mensajes que no pudieron persistirse después de 5 reintentos.
