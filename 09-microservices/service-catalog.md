# Catálogo de servicios

> Estado: 🟡 En progreso | Última actualización: 2026-08-26

> **Regla de conteo:** el producto conserva **9 módulos funcionales M1–M9**, pero la topología backend vigente tiene **10 microservicios desplegables**. `document-service`, `audit-service` y `notification-service` son capacidades transversales; `notification-service` no crea un M10.

| # | Servicio | Responsabilidad | Módulo(s) | Repo aplicación | Repo datos | Stack |
|---|----------|-----------------|-----------|-----------------|------------|-------|
| 01 | `iam-service` | Identidad, autenticación y autorización | M1 | `design-software-iam-service` | `design-software-iam-db` | Java |
| 02 | `reference-data-service` | Jerarquía institucional y catálogos | M2 + M4 | `design-software-reference-data-service` | `design-software-reference-data-db` | Go |
| 03 | `academic-management-service` | Programas, competencias y fichas | M5 + M6 | `design-software-academic-management-service` | `design-software-academic-management-db` | Java |
| 04 | `training-environment-service` | Ambientes, inventario y disponibilidad | M3 | `design-software-training-environment-service` | `design-software-training-environment-db` | Go |
| 05 | `scheduling-service` | Construcción/publicación de horarios | M8 | `design-software-scheduling-service` | `design-software-scheduling-db` | Java |
| 06 | `actors-service` | Instructores, aprendices y empresas | M7 | `design-software-actors-service` | `design-software-actors-db` | Java |
| 07 | `document-service` | Documentos/PDF y object storage | transversal | `design-software-document-service` | `design-software-document-db` | Python |
| 08 | `monitoring-service` | Seguimiento, KPIs y alertas; **detecta y publica, no entrega notificaciones** | M9 | `design-software-monitoring-service` | `design-software-monitoring-db` | Python |
| 09 | `audit-service` | Auditoría append-only | transversal | `design-software-audit-service` | `design-software-audit-db` | Go |
| 10 | `notification-service` | Entrega y trazabilidad de notificaciones `EMAIL` / `IN_APP` | transversal | `design-software-notification-service` | `design-software-notification-db` | Go |

## Ownership de notificaciones

`notification-service` es el único propietario de la entrega, `sent_notification`, templates y Outbox de notificación. `monitoring-service` conserva `generated_alert` y publica `monitoring.alert.triggered`.

Ver [ADR-005](../05-architecture/decisions/records/ADR-005-microservices-topology-and-transversal-capabilities.md).
