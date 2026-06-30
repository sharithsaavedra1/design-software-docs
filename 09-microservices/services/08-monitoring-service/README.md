# monitoring-service — Seguimiento, KPIs y alertas

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17
> Autor: Por definir | Equipo: Por definir

## Responsabilidad

Consolida el seguimiento integral del proceso formativo: registra KPIs, genera alertas automáticas cuando se superan umbrales, gestiona sesiones de seguimiento de fichas y proyectos, y envía notificaciones a los actores correspondientes. Consume eventos de otros servicios; no llama síncronamente.

## Bounded context

| Entidad | Descripción |
|---------|-------------|
| `estado_kpi` | Estado actual de un indicador (en umbral, en riesgo, crítico) |
| `tipo_evidencia` | Categoría de evidencia de aprendizaje |
| `tipo_alerta` | Categoría de alerta del sistema |
| `nivel_riesgo` | Nivel de riesgo asignado a un seguimiento |
| `seguimiento_kpi` | Registro de seguimiento de un KPI en el tiempo |
| `historial_estado_kpi` | Histórico de cambios de estado del KPI |
| `alerta_generada` | Alerta disparada por un umbral o regla de negocio |
| `notificacion_enviada` | Registro de notificación despachada a un usuario |
| `seguimiento_ficha` | Seguimiento global de una ficha de caracterización |
| `sesion_seguimiento` | Sesión de seguimiento de un proyecto o ficha |
| `detalle_sesion_seguimiento` | Detalle de temas tratados en la sesión |
| `plan_mejoramiento` | Plan de mejora generado a partir de un seguimiento |

## Módulo de origen

M9 — Seguimiento Integral y Notificaciones

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| `iam-service` | auth | Validación de JWT en la API |
| Múltiples servicios | async | Consume eventos de scheduling, actors, academic |

## Componentes desplegables

| Componente | Sufijo | Descripción |
|------------|--------|-------------|
| `monitoring-api` | `-api` | REST API: consulta de KPIs, alertas, sesiones y planes de mejora |
| `alert-worker` | `-worker` | Evalúa reglas de negocio sobre eventos recibidos y genera alertas |
| `notification-worker` | `-worker` | Despacha notificaciones (email / push / SMS) a partir de alertas |

## Base de datos

- Nombre lógico: `monitoring_db`
- Motor: PostgreSQL
- Nota: el historial de KPIs es una serie temporal — evaluar TimescaleDB para el módulo `historial_estado_kpi`

## Links

- Repo: (pendiente)
- Data model: [data-model.md](./data-model.md)
- Eventos: [events.md](./events.md)
- Runbook: [runbook.md](./runbook.md)
- Decisiones internas: [decisions.md](./decisions.md)
