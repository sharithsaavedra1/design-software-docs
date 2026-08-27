<!-- RESUMEN-EJECUTIVO
capacidad: contrato async de alert-worker
fase: implementación incremental
estado: accepted
consumidores_siguientes: notification-service, audit-service
tldr: Evalúa hechos/KPIs, persiste alertas y publica monitoring.alert.triggered. No entrega notificaciones.
-->

# Contrato — alert-worker

> Estado: 🟡 En progreso | Última actualización: 2026-08-26

> Fuente de verdad de nombres: [event-catalog.md](../../../../event-catalog.md).

## Eventos consumidos

| Evento | Origen | Acción |
|--------|--------|--------|
| `academic.ficha.opened` / cambios equivalentes vigentes | Academic | Inicializar/recalcular seguimiento. |
| `scheduling.schedule.published` | Scheduling | Evaluar cobertura/KPIs relacionados. |
| `monitoring.kpi.tick` | Scheduler interno | Recalcular umbrales periódicos. |

## Evento producido

| Evento | Descripción |
|--------|-------------|
| `monitoring.alert.triggered` | Se persistió una nueva `generated_alert` que debe exponerse a consumidores. |

```json
{
  "event_id": "uuid-v4",
  "event_type": "monitoring.alert.triggered",
  "version": "1.0",
  "source_service": "monitoring-service",
  "payload": {
    "alert_id": "uuid",
    "alert_type_code": "LOW_ATTENDANCE",
    "risk_level_code": "HIGH",
    "affected_entity_type": "Learner",
    "affected_entity_id": "uuid"
  }
}
```

## Efectos

- inserta/actualiza estado M9 según el caso de uso;
- crea `generated_alert` de forma idempotente;
- inserta `monitoring.alert.triggered` en `monitoring.outbox` dentro de la misma transacción;
- el relay publica el evento de forma asíncrona y marca la fila tras el `ack` del broker;
- no llama a `notification-service` y no conoce canales de entrega.

## Idempotencia

La redelivery del mismo `event_id` no puede generar una segunda alerta equivalente.

## Reintentos

Fallo persistente al consumir → backoff → DLQ propia de Monitoring. Fallo del broker al
publicar desde `monitoring.outbox` → reintento del relay; la DLQ de Notification es independiente.
