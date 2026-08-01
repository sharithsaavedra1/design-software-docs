# Contrato — monitoring-api

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato a nivel de protocolo. Endpoints REST
> sobre las entidades reales de [data-model.md](../../data-model.md); sin código ni framework.

## Tipo de componente

`-api` — REST API sincrónica.

## Autenticación

Bearer JWT emitido por `iam-service`. Todos los endpoints requieren el header:

```
Authorization: Bearer <token>
```

Los roles se resuelven del JWT (RBAC de `iam-service`). Un token inválido o expirado
retorna `401`; un rol sin permiso retorna `403`.

## Base URL

`/api/v1/monitoring`

## Endpoints

### KPIs — `kpi_tracking` / `kpi_type` / `kpi_status`

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/kpis` | Última medición de KPI por ficha; filtros: `ficha_tracking_id`, `kpi_type_code`, `kpi_status_code` (paginado) | `coordinador`, `admin` |
| `GET` | `/kpis/{kpi_tracking_id}` | Detalle de una medición puntual | `coordinador`, `admin`, `instructor` |
| `GET` | `/kpis/trend` | Serie temporal de un KPI; filtros: `ficha_tracking_id`, `kpi_type_code`, `period_start`, `period_end` | `coordinador`, `admin` |

### Alertas — `generated_alert` / `alert_type` / `risk_level`

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/alerts` | Alertas activas; filtros: `ficha_tracking_id`, `alert_type_code`, `risk_level_code`, `is_resolved` (paginado) | `coordinador`, `admin`, `instructor` |
| `GET` | `/alerts/{alert_id}` | Detalle de una alerta | `coordinador`, `admin`, `instructor` |
| `PUT` | `/alerts/{alert_id}/resolve` | Marca la alerta como resuelta (`is_resolved`, `resolved_by`, `resolution_notes`, `resolved_at`) | `coordinador`, `admin` |

### Seguimiento de ficha — `ficha_tracking` / `tracking_session`

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/fichas/{ficha_tracking_id}` | Seguimiento consolidado de una ficha (estado global, conteo de alertas activas, próximas fechas) | `coordinador`, `admin`, `instructor` |
| `GET` | `/fichas/{ficha_tracking_id}/sessions` | Sesiones de seguimiento de la ficha (cronológico) | `coordinador`, `instructor` |
| `POST` | `/fichas/{ficha_tracking_id}/sessions` | Registra una `tracking_session` (append-only) | `coordinador`, `instructor` |

### Planes de mejoramiento — `improvement_plan`

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/improvement-plans` | Planes de mejora; filtros: `ficha_tracking_id`, `status` (paginado) | `coordinador`, `admin`, `instructor` |
| `GET` | `/improvement-plans/{id}` | Detalle de un plan | `coordinador`, `admin`, `instructor` |
| `POST` | `/improvement-plans` | Crea un plan de mejora (opcionalmente ligado a un `generated_alert`) | `coordinador` |
| `PUT` | `/improvement-plans/{id}/status` | Actualiza el estado del plan (`PENDING` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`) | `coordinador` |

> **Nota:** la creación de KPIs y de alertas **no** se expone por REST. `kpi_tracking` y
> `generated_alert` se producen a partir de eventos de dominio en el [`alert-worker`](../alert-worker/README.md).
> Esta API es de consulta sobre esos registros más la gestión de sesiones y planes.

## Paginación

Consultas de listado: `?page=<n>&size=<m>` (defaults `page=0`, `size=20`). La respuesta
incluye metadatos `{ page, size, total_elements, total_pages }`.

## Formato de error estándar

```json
{
  "error_code": "RESOURCE_NOT_FOUND",
  "message": "El recurso solicitado no existe",
  "trace_id": "uuid-v4"
}
```

| Código HTTP | `error_code` | Cuándo |
|-------------|--------------|--------|
| `400` | `VALIDATION_ERROR` | Parámetros o cuerpo inválidos |
| `401` | `UNAUTHENTICATED` | Token ausente, inválido o expirado |
| `403` | `FORBIDDEN` | Rol sin permiso para la operación |
| `404` | `RESOURCE_NOT_FOUND` | Recurso inexistente |
| `409` | `INVALID_STATE_TRANSITION` | Transición de estado no permitida (ej. plan ya `COMPLETED`) |

## Referencias

- Modelo de datos: [data-model.md](../../data-model.md)
- Eventos del servicio: [events.md](../../events.md)
- ADR-001 (broker): [ADR-001](../../../../../05-architecture/decisions/records/ADR-001-message-broker.md)
- ADR-004 (estados y auditoría): [ADR-004](../../../../../05-architecture/decisions/records/ADR-004-status-parametrization-and-audit-standard.md)
