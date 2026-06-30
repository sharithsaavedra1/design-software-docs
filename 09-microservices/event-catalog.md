# Catálogo de eventos

> Estado: 🟡 Revisión | Última actualización: 2026-06-17
> Naming: nombres de eventos en inglés (HALT-DB-NAMING — los eventos son contratos de integración)

Inventario centralizado de todos los eventos que circulan entre microservicios.
Los eventos siguen el envelope estándar definido en [`_template/service/events.md`](./_template/service/events.md).

## Convención de naming

`<service>.<entity>.<action>` — todo en minúsculas con puntos, en inglés. El verbo en pasado.

Ejemplo: `scheduling.class_session.created`

## Eventos por publicador

### iam-service

| Evento | Descripción | Consumidores |
|--------|-------------|-------------|
| `iam.user.created` | Usuario nuevo creado | `actors-service`, `audit-service` |
| `iam.user.deactivated` | Usuario desactivado | `audit-service`, `actors-service` |
| `iam.role.assigned` | Rol asignado a usuario | `audit-service` |
| `iam.session.started` | Sesión iniciada | `audit-service` |

### reference-data-service

| Evento | Descripción | Consumidores |
|--------|-------------|-------------|
| `reference.catalog.updated` | Catálogo modificado | `audit-service`, (consumidores invalidan caché) |
| `reference.training_center.created` | Centro nuevo registrado | `audit-service` |

### academic-management-service

| Evento | Descripción | Consumidores |
|--------|-------------|-------------|
| `academic.program.created` | Programa de formación creado | `audit-service` |
| `academic.ficha.opened` | Ficha de caracterización en ejecución | `audit-service`, `monitoring-service` |
| `academic.ficha.closed` | Ficha cerrada | `audit-service`, `monitoring-service` |
| `academic.competency.updated` | Competencia modificada | `audit-service`, `actors-service` |

### training-environment-service

| Evento | Descripción | Consumidores |
|--------|-------------|-------------|
| `environment.environment.created` | Ambiente nuevo registrado | `audit-service`, `scheduling-service` |
| `environment.availability.changed` | Disponibilidad de ambiente modificada | `audit-service`, `scheduling-service` |
| `environment.maintenance.started` | Mantenimiento iniciado | `audit-service`, `scheduling-service` |
| `environment.reservation.created` | Reserva confirmada | `audit-service` |

### scheduling-service

| Evento | Descripción | Consumidores |
|--------|-------------|-------------|
| `scheduling.class_session.created` | Sesión de clase programada | `audit-service`, `monitoring-service` |
| `scheduling.class_session.cancelled` | Sesión cancelada | `audit-service`, `monitoring-service` |
| `scheduling.conflict.detected` | Conflicto de horario detectado | `audit-service`, `monitoring-service` |
| `scheduling.schedule.published` | Horario publicado a los actores | `audit-service`, `monitoring-service`, `actors-service`, `document-service` |

### actors-service

| Evento | Descripción | Consumidores |
|--------|-------------|-------------|
| `actors.instructor.assigned` | Instructor habilitado para ficha/competencia | `audit-service`, `monitoring-service`, `scheduling-service` |
| `actors.learner.enrolled` | Aprendiz matriculado en ficha | `audit-service`, `monitoring-service` |
| `actors.productive_stage.started` | Etapa productiva iniciada | `audit-service`, `monitoring-service` |
| `actors.company_visit.completed` | Visita a empresa completada | `audit-service`, `monitoring-service` |

### document-service

| Evento | Descripción | Consumidores |
|--------|-------------|-------------|
| `document.document.generated` | Documento generado | `audit-service` |
| `document.version.created` | Nueva versión de documento | `audit-service` |

### monitoring-service

| Evento | Descripción | Consumidores |
|--------|-------------|-------------|
| `monitoring.alert.triggered` | Alerta de KPI disparada | `audit-service` |
| `monitoring.kpi.threshold_breached` | KPI superó umbral crítico | `audit-service` |
| `monitoring.notification.sent` | Notificación enviada al usuario | `audit-service` |

### audit-service

> El audit-service no publica eventos. Solo consume y persiste.

## Nota de migración

Los nombres de evento se actualizaron de español a inglés para cumplir HALT-DB-NAMING
(los eventos son contratos de integración entre servicios). El `audit-worker` suscribe por
wildcard, por lo que el cambio de naming no afecta su lógica de consumo. Los contratos de
componentes que referencian topics específicos se actualizan en paralelo.
