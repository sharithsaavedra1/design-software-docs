# monitoring-service — Seguimiento, KPIs y alertas

> Estado: 🟡 En progreso | Última actualización: 2026-08-26
> Autor: Equipo de Arquitectura | Stack: Python 3.11+ / FastAPI

> **Límite vigente:** desde [ADR-005](../../../05-architecture/decisions/records/ADR-005-microservices-topology-and-transversal-capabilities.md), `monitoring-service` **no entrega notificaciones**. Su responsabilidad termina al detectar/persistir el estado de seguimiento y publicar eventos como `monitoring.alert.triggered`. La entrega pertenece exclusivamente a [`notification-service`](../10-notification-service/).

## Responsabilidad

Consolida el seguimiento del proceso formativo M9:

- registrar y consultar KPIs;
- evaluar umbrales y condiciones de riesgo;
- mantener `ficha_tracking` y sesiones de seguimiento;
- generar y resolver `generated_alert`;
- gestionar planes de mejoramiento de ficha;
- publicar eventos de monitoreo para consumidores desacoplados.

**No** contiene SMTP, canales `EMAIL/IN_APP`, templates de notificación, `sent_notification`, reintentos de entrega ni un `notification-worker`.

## Módulo de origen

M9 — Seguimiento y Analítica.

## Entidades propias

Detalle en [data-model.md](./data-model.md).

| Entidad | Descripción |
|---------|-------------|
| `kpi_type` | Catálogo de tipos de KPI. |
| `alert_type` | Catálogo de alertas y umbrales. |
| `risk_level` | Severidad de riesgo. |
| `kpi_status` | Estado de KPI. |
| `ficha_tracking` | Seguimiento consolidado de ficha. |
| `kpi_tracking` | Serie temporal de mediciones. |
| `tracking_session` | Sesiones de seguimiento. |
| `generated_alert` | Alertas generadas por condiciones/umbrales. |
| `improvement_plan` | Plan de mejoramiento de ficha. |

## Componentes desplegables

| Componente | Tipo | Responsabilidad |
|------------|------|-----------------|
| [monitoring-api](./components/monitoring-api/README.md) | REST / FastAPI | Consulta y casos de uso HTTP del dominio de monitoreo. |
| [alert-worker](./components/alert-worker/README.md) | Worker async | Evalúa eventos/umbrales y publica alertas. |

El antiguo `components/notification-worker/` se elimina de este bounded context. Su reemplazo vive en [`../10-notification-service/components/notification-worker/`](../10-notification-service/components/notification-worker/).

## Implementación actual

El repo `design-software-monitoring-service` contiene una base hexagonal en Python/FastAPI:

```text
apps/api/main.py
apps/alert_worker/main.py
src/monitoring/domain/
src/monitoring/application/
src/monitoring/adapter/
```

La API actual implementa un skeleton (`GET /health`, `POST /kpis`); el contrato completo descrito en `monitoring.yaml` representa el objetivo de producto y debe implementarse incrementalmente.

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| `iam-service` | auth | JWT/RBAC para API. |
| `academic-management-service` | async | Ciclo de vida de fichas. |
| `scheduling-service` | async | Publicación/cancelación de sesiones. |
| `actors-service` | async | Hechos de actores relevantes a KPIs. |
| `notification-service` | **consumidor async**, no dependencia de disponibilidad | Consume `monitoring.alert.triggered`; Monitoring no lo invoca ni conoce su canal de entrega. |
| `audit-service` | consumidor async | Audita eventos publicados. |

## Eventos

Publica en `monitoring-events`:

- `monitoring.alert.triggered`
- `monitoring.kpi.threshold_breached`

Consume eventos de Academic, Scheduling y Actors según [events.md](./events.md).

> `monitoring.notification.sent` está **retirado**. El evento vigente de entrega es `notification.notification.sent`, publicado por `notification-service`.

## Persistencia

- BD lógica: `monitoring_db`.
- Motor: PostgreSQL 16.
- Propiedad exclusiva de las entidades M9 anteriores.
- No contiene tablas de entrega de notificaciones.

## Links

- Repo aplicación: `design-software-monitoring-service`
- [Modelo de datos](./data-model.md)
- [Eventos](./events.md)
- [Runbook](./runbook.md)
- [Decisiones internas](./decisions.md)
- [Contrato OpenAPI](../../../07-api/contracts/openapi/monitoring.yaml)
- [notification-service](../10-notification-service/README.md)
