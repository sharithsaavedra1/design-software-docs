# Contrato — alert-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Topics consumidos

- `academic-events` (ficha.opened, ficha.closed)
- `scheduling-events` (sesion_clase.created, sesion_clase.cancelled, conflict.detected, horario.published)
- `actors-events` (instructor.assigned, aprendiz.status_changed, etapa_productiva.started)

## Acción que ejecuta

Por cada evento recibido:
1. Carga las reglas de alerta aplicables al tipo de evento
2. Evalúa las reglas contra el payload del evento y el estado actual en `monitoring_db`
3. Si se supera un umbral: crea `alerta_generada` y actualiza KPI correspondiente
4. Publica tarea a `notification-dispatch-queue` para `notification-worker`
5. Publica `monitoring.alerta.triggered` al bus de eventos

## Dead letter queue

`monitoring-alert-processing.dlq` — 3 reintentos antes de DLQ.
