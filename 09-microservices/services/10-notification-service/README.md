# notification-service — Entrega transversal de notificaciones

> Estado: 🟡 En progreso | Última actualización: 2026-08-26
> Autor: Equipo de Arquitectura | Stack: Go

> **Decisión vigente:** [ADR-005](../../../05-architecture/decisions/records/ADR-005-microservices-topology-and-transversal-capabilities.md) extrae la capacidad de notificaciones de `monitoring-service` y la convierte en un microservicio independiente. `monitoring-service` detecta KPIs/alertas y publica eventos; `notification-service` resuelve el destinatario, entrega por canal y registra el resultado.

## Responsabilidad

`notification-service` es una **capacidad transversal** responsable exclusivamente de la entrega y trazabilidad de notificaciones del sistema.

Sus responsabilidades son:

- aceptar solicitudes síncronas de notificación mediante su API pública;
- consumir eventos de dominio que requieren informar a un actor;
- resolver el destinatario y sus datos de contacto mediante contratos públicos;
- renderizar plantillas reutilizables;
- entregar por los canales habilitados (`EMAIL`, `IN_APP` en v1);
- persistir estado, intento y resultado de cada entrega;
- aplicar idempotencia, reintentos y DLQ ante fallos transitorios;
- publicar `notification.notification.sent` mediante patrón Outbox cuando la entrega finaliza correctamente;
- emitir telemetría propia sin depender del estado interno de otros servicios.

## Fuera de alcance

Este servicio **no**:

- calcula KPIs;
- genera `generated_alert`;
- decide si una ficha está en riesgo;
- contiene reglas de seguimiento académico;
- modifica datos de `monitoring-service`;
- expone ni invoca workers internos de otros dominios;
- crea un módulo funcional `M10` ni un micro-frontend propio.

La bandeja/campana de notificaciones es parte del **chrome global de `shell-host`**, según ADR-005.

## Módulo de origen

Transversal — sin módulo funcional M1–M9 propio.

El proyecto conserva **9 módulos funcionales** y actualmente reconoce **10 microservicios backend desplegables**; `notification-service` es el servicio transversal #10.

## Componentes desplegables

| Componente | Sufijo | Tipo | Responsabilidad |
|------------|--------|------|-----------------|
| [notification-api](./components/notification-api/README.md) | `-api` | HTTP/REST | Solicitud manual/síncrona y consulta puntual de notificaciones. |
| [notification-worker](./components/notification-worker/README.md) | `-worker` | AMQP + Outbox relay | Consume eventos, entrega por canal, aplica reintentos/DLQ y publica el evento de salida. |

## Modelo de datos

Detalle en [data-model.md](./data-model.md).

| Entidad | Descripción |
|---------|-------------|
| `sent_notification` | Registro de entrega: destinatario, canal, estado, origen, plantilla, error y timestamps. |
| `notification_template` | Plantilla reutilizable por código y canal. |
| `outbox` | Eventos de integración pendientes/publicados por el relay del servicio. |

**Base de datos lógica:** `notification_db` · **schema:** `notification` · **motor:** PostgreSQL 16.

Ningún otro microservicio escribe estas tablas.

## API pública

Contrato narrativo: [components/notification-api/contract.md](./components/notification-api/contract.md).
Contrato máquina: [`07-api/contracts/openapi/notification.yaml`](../../../07-api/contracts/openapi/notification.yaml).

| Método | Ruta | Estado | Uso |
|--------|------|--------|-----|
| `POST` | `/notifications` | ✅ Implementado | Solicitar una entrega manual/síncrona. |
| `GET` | `/notifications/{id}` | ✅ Implementado | Consultar una notificación por UUID. |
| `GET` | `/health` | ✅ Implementado | Liveness del contenedor API. |
| `GET` | `/ready` | ✅ Implementado | Readiness de dependencias del API. |
| `GET` | `/notifications` | 🟡 Pendiente de contrato/implementación | Listado para inbox/campana global; no debe resolverse desde Monitoring. |

> Mientras `GET /notifications` no forme parte de `shared-contracts`, cualquier pantalla que requiera bandeja debe mantenerlo como dependencia pendiente y **no reutilizar** endpoints históricos `/sent-notifications` de Monitoring.

## Eventos

Detalle en [events.md](./events.md) y catálogo global en [event-catalog.md](../../event-catalog.md).

### Consumidos actualmente

| Evento | Productor | Acción |
|--------|-----------|--------|
| `monitoring.alert.triggered` | `monitoring-service` | Notificar al actor afectado por una alerta. |
| `scheduling.schedule.published` | `scheduling-service` | Enviar confirmación de publicación de horario. |

### Publicados

| Evento | Cuándo | Consumidores |
|--------|--------|--------------|
| `notification.notification.sent` | Una entrega finaliza en `SENT` y el Outbox relay la publica. | `audit-service` |

Otros eventos de dominio solo se incorporan mediante actualización explícita del contrato y pruebas de consumidor.

## Dependencias

| Dependencia | Tipo | Motivo |
|-------------|------|--------|
| `iam-service` / Gateway | auth | Validación/autorización de solicitudes HTTP cuando la integración de seguridad esté conectada. |
| `actors-service` | async / contrato, objetivo | No existe dependencia síncrona en el camino de entrega. Si se requiere contacto real, Notification debe recibirlo en un comando autorizado o mantener una proyección local alimentada por eventos. El resolver stub actual es solo de desarrollo. |
| `monitoring-service` | async | Productor de `monitoring.alert.triggered`; **no existe llamada directa al worker**. |
| `scheduling-service` | async | Productor de `scheduling.schedule.published`. |
| `audit-service` | async consumidor | Audita `notification.notification.sent`. |
| RabbitMQ | infraestructura | Consumo/publicación de eventos y DLQ. |
| PostgreSQL | infraestructura | Persistencia de `notification_db`. |
| SMTP | infraestructura | Entrega del canal `EMAIL`. |
| OpenTelemetry Collector | infraestructura | Exportación de trazas, métricas y logs correlacionados. |

## Regla de desacoplamiento runtime

`notification-service` no requiere que `monitoring-service` ni `actors-service` estén disponibles de forma síncrona para procesar un evento ya recibido. No realiza queries a sus bases de datos ni invoca workers internos. Los datos necesarios para una entrega deben llegar por contrato o existir en una proyección local propia. El resolver de email stub observado en la implementación actual es una facilidad temporal de desarrollo y **no** es el diseño objetivo de producción.

## Flujo principal

```text
monitoring-service / scheduling-service
              │
              │ evento de dominio
              ▼
           RabbitMQ
              │
              ▼
     notification-worker
              │
              ├─ valida event_type + event_id
              ├─ deduplica por source_event_id
              ├─ resuelve destinatario
              ├─ carga/renderiza plantilla
              ├─ entrega EMAIL / IN_APP
              └─ persiste resultado
                    │
                    ├─ FAILED → retry/backoff → DLQ al agotar intentos
                    │
                    └─ SENT → sent_notification + outbox (misma transacción)
                                      │
                                      ▼
                                  Outbox relay
                                      │
                                      ▼
                         notification.notification.sent
                                      │
                                      ▼
                                 audit-service
```

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Runtime | Go |
| Arquitectura | DDD + Hexagonal |
| HTTP | `net/http` + contrato generado desde OpenAPI |
| Persistencia | PostgreSQL 16 / pgx |
| Mensajería | RabbitMQ / AMQP 0-9-1 |
| Email v1 | SMTP |
| Observabilidad | OpenTelemetry |
| Contratos | `shared-contracts` (OpenAPI + event envelope) |

## Seguridad y privacidad

- No registrar el cuerpo completo de una notificación en logs.
- `recipient_email` es PII y debe enmascararse en logs/telemetría.
- Las credenciales SMTP, DSN y AMQP se inyectan por secretos/variables de entorno; nunca se documentan valores reales.
- Solo el servicio propietario muta `notification_db`.
- Las solicitudes manuales requieren RBAC cuando la seguridad HTTP esté conectada.

## Links

- Repo aplicación: `design-software-notification-service`
- Repo datos: `design-software-notification-db`
- [Modelo de datos](./data-model.md)
- [Eventos](./events.md)
- [Runbook](./runbook.md)
- [Decisiones](./decisions.md)
- [notification-api](./components/notification-api/README.md)
- [notification-worker](./components/notification-worker/README.md)
- [ADR-005](../../../05-architecture/decisions/records/ADR-005-microservices-topology-and-transversal-capabilities.md)
- [ADR-006](../../../05-architecture/decisions/records/ADR-006-polyglot-stack-strategy.md)
