# Contrato — scheduling-engine-workflow

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Orquestación (saga) a nivel de protocolo, agnóstica de lenguaje.

## Propósito
Orquestar la generación de un horario para una ficha: recolectar insumos, asignar sesiones a franjas/ambientes/instructores sin solape, y publicar el resultado. Mantiene read models locales (CQRS-lite, [ADR-002](../../../../../05-architecture/decisions/records/ADR-002-scheduling-read-models.md)).

## Disparador
Comando `POST /api/v1/schedules/{ficha_id}/generate` (schedules-api) o evento `academic.enrollment_ficha.created`.

## Pasos de la saga (con compensación)
| # | Paso | Compensación |
|---|------|--------------|
| 1 | Cargar insumos (programa/competencias, disponibilidad de instructores y ambientes desde read models) | — (solo lectura) |
| 2 | Calcular asignación de `class_session` sin solape | — |
| 3 | Persistir `schedule` + `class_session` (estado `DRAFT`) | `DELETE`/marcar `CANCELLED` |
| 4 | Solicitar validación de conflictos (evento a `conflict-validator-worker`) | — |
| 5 | Si no hay conflictos, publicar `scheduling.schedule.published`; si hay, dejar en `DRAFT` con conflictos | revertir a `DRAFT` |

## Read models (ADR-002)
Se sincronizan al recibir `environment.availability.changed`, `environment.maintenance.started`, `actors.instructor.availability_changed`. Reducen las dependencias síncronas a ≤ 2.

## Eventos producidos
`scheduling.schedule.published`, `scheduling.class_session.created/updated`.

## Idempotencia
La generación es idempotente por `(ficha_id, period)`; una re-ejecución no duplica el horario publicado (índice único parcial `uq_schedule_ficha_id_period_published`).
