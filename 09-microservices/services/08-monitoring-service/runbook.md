# Runbook — monitoring-service

> Estado: 🟡 En progreso | Última actualización: 2026-08-26

## Componentes operativos

| Componente | Verificación | Objetivo |
|------------|--------------|----------|
| `monitoring-api` | `GET /health` | Liveness HTTP. |
| `alert-worker` | proceso + lag AMQP + métricas | Procesar eventos/KPIs sin backlog sostenido. |

No existe un `notification-worker` dentro de este servicio. Incidentes SMTP, `send_status`, DLQ de entrega y Outbox de notificación se atienden con el [runbook de notification-service](../10-notification-service/runbook.md).

## Configuración

La implementación actual es Python/FastAPI y está en evolución. Variables definitivas deben consolidarse en infraestructura/golden template; como mínimo se requieren las conexiones del servicio a:

- `monitoring_db`;
- broker AMQP para el worker cuando se conecte;
- configuración de JWT/JWKS para API;
- OpenTelemetry Collector.

**No configurar credenciales SMTP en Monitoring.**

## P0 — `monitoring_db` no responde

Impacto: no se registran/consultan KPIs ni alertas.

1. validar conectividad PostgreSQL;
2. revisar pool, locks y capacidad;
3. evitar consumir/acknowledge eventos si no puede persistirse el resultado;
4. recuperar BD y verificar backlog del worker.

## P1 — Lag del `alert-worker`

Impacto: KPIs/alertas se calculan tarde. Notification puede estar sano pero no recibirá nuevos `monitoring.alert.triggered` hasta que Monitoring procese el backlog.

1. revisar estado del proceso;
2. revisar errores de deserialización/contrato;
3. revisar latencia de BD;
4. revisar profundidad de cola y DLQ de Monitoring;
5. escalar consumidores solo si la semántica de orden/idempotencia lo permite.

## P1 — Alertas duplicadas

```sql
SELECT source_event_id, count(*)
FROM monitoring.generated_alert
WHERE source_event_id IS NOT NULL
GROUP BY source_event_id
HAVING count(*) > 1;
```

Corregir deduplicación antes de reprocesar mensajes. No “compensar” eliminando notificaciones: ese dato pertenece a otro servicio.

## Resolver una alerta

Usar el endpoint/caso de uso de `monitoring-api` correspondiente. La resolución cambia el estado de `generated_alert`; no modifica registros de Notification.

## Recalcular KPI

El procedimiento de recalculo debe publicar solo los eventos de monitoreo que correspondan y mantener idempotencia. Una recalculación no debe invocar directamente a Notification.

## Incidente de notificación reportado desde una alerta

Si la alerta existe en Monitoring pero el usuario no recibió aviso:

1. comprobar que `monitoring.alert.triggered` fue publicado con `event_id` válido;
2. capturar `event_id`/`correlation_id`;
3. transferir investigación al runbook de `notification-service`;
4. **no** consultar ni modificar tablas de `notification_db` desde Monitoring.

## Escalamiento

| Nivel | Responsable | Caso |
|-------|-------------|------|
| L1 | Equipo Monitoring | health, BD, lag, errores de API/worker |
| L2 | Líder técnico Monitoring | reglas KPI, duplicidad, contratos de evento |
| L3 | Arquitectura/Infra | broker, base de datos, cambios de frontera |
| Transferencia | Equipo Notification | entrega EMAIL/IN_APP, retries, DLQ, templates |
