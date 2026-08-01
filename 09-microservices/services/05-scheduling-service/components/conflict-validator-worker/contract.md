# Contrato — conflict-validator-worker

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato de mensajería, agnóstico de lenguaje.

## Eventos consumidos
| Evento | Origen | Acción |
|--------|--------|--------|
| `scheduling.class_session.created` | scheduling-engine | Revalidar solapes de la sesión |
| `scheduling.class_session.updated` | scheduling-engine | Revalidar |
| `environment.availability.changed` | training-environment | Recalcular conflictos de ambiente |
| `actors.instructor.availability_changed` | actors | Recalcular conflictos de instructor |

## Eventos producidos
| Evento | Descripción |
|--------|-------------|
| `scheduling.conflict.detected` | Se registró un `scheduling_conflict` (tipo: instructor/ambiente/ficha) |
| `scheduling.conflict.resolved` | Un conflicto previamente detectado ya no aplica |

## Envelope (estándar)
```json
{
  "event_id": "uuid",
  "event_type": "scheduling.conflict.detected",
  "occurred_at": "2026-08-01T14:00:00Z",
  "payload": { "conflict_id": "uuid", "session_a_id": "uuid", "session_b_id": "uuid", "type": "INSTRUCTOR" }
}
```

## Idempotencia
`event_id` único por evento; un evento reprocesado no crea un `scheduling_conflict` duplicado.

## Errores
Fallo de procesamiento → reintento con backoff; agotados los reintentos → **DLQ** `conflict-validator.dlq`.
