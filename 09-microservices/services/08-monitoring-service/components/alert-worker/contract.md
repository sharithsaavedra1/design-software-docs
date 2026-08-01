# Contrato — alert-worker

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato de mensajería, agnóstico de lenguaje.

## Eventos consumidos
| Evento | Origen | Acción |
|--------|--------|--------|
| `academic.enrollment_ficha.status_changed` | academic | Recalcular seguimiento de ficha |
| `scheduling.schedule.published` | scheduling | Evaluar cobertura/KPIs de horario |
| `monitoring.kpi.tick` | scheduler | Evaluación periódica de umbrales |

## Evento producido
| Evento | Descripción |
|--------|-------------|
| `monitoring.alert.generated` | Se creó un `generated_alert` (nivel de riesgo, KPI, ficha) |

## Efecto
Inserta `generated_alert` y actualiza `ficha_tracking`; el conteo de alertas activas se mantiene de forma consistente (derivado/trigger, no columna redundante — ver [normalization-assessment.md](../../../../../06-data/normalization-assessment.md)).

## Idempotencia
`event_id` único; misma condición evaluada no crea alertas duplicadas.

## Errores
Fallo persistente → DLQ `alert-worker.dlq`.
