# ADR-006: Estrategia polyglot (Go / Java / Python) y estructura hexagonal por stack

**Estado:** PROPOSED
**Fecha:** 2026-08-14
**Autores:** Jesús Ariel González Bonilla (PM + Arquitecto)
**Equipos involucrados:** Arquitectura, Backend, Formación (aprendices SENA)

---

## Contexto

El proyecto es formativo (aprendices SENA). Se decide construir el backend en **tres stacks**
(**Go**, **Java/Spring Boot**, **Python/FastAPI**) para exposición pedagógica y empleabilidad.
La arquitectura de microservicios ([ADR-005](./ADR-005-microservices-topology-and-transversal-capabilities.md))
lo habilita: repos independientes, contract-first, **cero código compartido entre servicios**.

**Principio rector:** **DDD + Hexagonal + TDD + SDD (spec-driven) aplican por igual en los 3 stacks.**
El **dominio es puro y portable**; el lenguaje vive solo en los *adapters*. Por lo tanto la elección
de stack **no** afecta la calidad arquitectónica — solo optimiza *fit* + aprendizaje, y reasignar un
servicio de stack luego es barato (se reescriben adapters, no el dominio).

## Decisión

### 1. Asignación de stacks por fit y balance de dificultad (13 componentes runtime)

| Stack | Servicios | Racional |
|-------|-----------|----------|
| **Java · Spring Boot** | `iam`, `scheduling`, `academic-management`, `actors` | Núcleo transaccional + dominio rico. iam=Spring Security; scheduling=invariante `EXCLUDE`+workflow; academic/actors = muchos agregados. |
| **Go** | `gateway`, `audit`, `notification`, `reference-data`, `training-environment` | Edge + workers de alto throughput + CRUD liviano con caché (rampa de entrada). |
| **Python · FastAPI** | `monitoring`, `document`, `web-bff`, `mobile-bff` | Datos/analítica, templating+PDF, agregación de BFF. Stack de on-ramp. |

`shared-contracts` no lleva stack (son solo specs). Reasignaciones futuras son de bajo riesgo.

### 2. Capas hexagonales canónicas (idénticas en los 3 stacks)

```
domain/       model (agregados, entidades, value objects) · event (domain events) · service
              → PURO: sin framework, ORM, driver ni transporte
application/  usecase (uno por HU) · port/in (entrada) · port/out (repos, broker, clients)
adapter/      in/  (http, amqp, cli)      → implementan port/in
              out/ (persistence, messaging, client) → implementan port/out
<entrypoints> uno por componente desplegable (-api/-worker/-workflow): solo bootstrap + wiring
```

Regla de dependencia (verificable con Grep, cualquier stack):
`entrypoint → adapter → application → domain`. El dominio no conoce infraestructura.

### 3. SDD (spec-driven) y TDD por stack

- **SDD:** el servicio se genera/valida contra `shared-contracts` (OpenAPI → server stubs + DTOs; envelope de eventos). El spec es la fuente, no el código.
- **TDD:** unit del dominio + integración de adapters, con el runner del stack (Go `testing`, JUnit, pytest).

### 4. Golden template por stack

Cada stack tiene un **esqueleto de servicio** que ya encarna las capas, la regla de dependencia, JWT
middleware, patrón Outbox, health-checks, Dockerfile y CI. El aprendiz **clona la plantilla**, no la
reinventa. Se materializan en la fase piloto (1 servicio por stack) antes de escalar.

## Estructura de carpetas por stack (idiomática)

### Java · Spring Boot (Maven multi-módulo — los límites de módulo ENFORZAN el hexágono)

```
design-software-scheduling-service/
├── pom.xml                              (parent)
├── scheduling-core/                     (domain + application · SIN Spring web / SIN JPA)
│   └── src/main/java/co/sena/scheduling/
│       ├── domain/{model,event,service}/
│       └── application/{usecase,port/in,port/out}/
│   └── src/test/java/...                (JUnit · TDD del dominio)
├── scheduling-adapters/                 (depende de core)
│   └── src/main/java/co/sena/scheduling/adapter/
│       ├── in/rest/                     (controllers, DTOs, mappers)
│       ├── out/persistence/             (JPA entities + repos → scheduling_db)
│       ├── out/messaging/               (publisher outbox + consumers)
│       └── out/client/                  (REST client a academic-management)
├── scheduling-api/                      (deployable · Spring Boot app + Dockerfile)
├── scheduling-engine/                   (deployable · workflow + Dockerfile)
├── conflict-validator/                  (deployable · worker + Dockerfile)
└── contracts/                           (OpenAPI desde shared-contracts · openapi-generator)
```

### Go (module con `internal/` + `cmd/`)

```
design-software-notification-service/
├── go.mod / go.sum
├── internal/
│   ├── domain/{model,event,service}/    (structs puros · sin tags de DB)
│   ├── application/{usecase,port/in,port/out}/
│   └── adapter/
│       ├── in/http/                     (handlers, router, DTOs)
│       ├── in/amqp/                     (consumers idempotentes)
│       ├── out/persistence/             (repos → notification_db · pgx/sqlc)
│       ├── out/messaging/               (publisher outbox)
│       └── out/client/
├── cmd/                                 (cada carpeta = 1 contenedor)
│   ├── notification-api/main.go
│   └── notification-worker/main.go
├── deploy/Dockerfile.api · Dockerfile.worker
├── api/                                 (OpenAPI desde shared-contracts · oapi-codegen)
└── (tests *_test.go junto a cada paquete · TDD)
```

### Python · FastAPI (paquete `src/` + `apps/`)

```
design-software-monitoring-service/
├── pyproject.toml / poetry.lock
├── src/monitoring/
│   ├── domain/{model,event,service}/    (dataclasses puras · sin ORM)
│   ├── application/{usecase,port/in,port/out}/   (port = Protocols)
│   └── adapter/
│       ├── in/http/                     (routers FastAPI · DTOs Pydantic)
│       ├── in/amqp/                     (consumers)
│       ├── out/persistence/             (SQLAlchemy models + repos → monitoring_db)
│       ├── out/messaging/               (publisher outbox)
│       └── out/client/                  (httpx clients)
├── apps/                                (entrypoints = contenedores)
│   ├── api/main.py                      (FastAPI app + wiring)
│   └── alert_worker/main.py
├── deploy/Dockerfile.api · Dockerfile.worker
├── contracts/                           (OpenAPI desde shared-contracts · datamodel-code-generator)
└── tests/                              (pytest · TDD)
```

> **Lo mismo, tres empaquetados:** las capas (`domain` / `application[port in/out]` / `adapter[in/out]`)
> y la regla de dependencia son idénticas; solo cambia el idioma (módulos Maven vs `internal/`+`cmd/`
> vs `src/`+`apps/`). Un aprendiz que entiende el hexágono lo reconoce en los 3.

## Consecuencias

### Positivas
- Exposición formativa a 3 ecosistemas; las fronteras duras entre lenguajes **fuerzan** la disciplina de contratos.
- Dominio portable → reasignar stack es barato; el conocimiento hexagonal se transfiere entre stacks.
- Cada clúster mezcla dificultad (un servicio fácil + uno complejo) → progresión de aprendizaje.

### Negativas / Trade-offs
- **Cross-cutting × 3**: JWT, error-envelope, Outbox, logging, tracing se implementan una vez por lenguaje. Mitigación: golden templates + specs compartidos.
- Menor velocidad que single-stack; un aprendiz de un stack no salta fácil a otro.
- Mantener el estándar exige mentoría/revisión por stack.

### Riesgos
- **"Cada quien su lenguaje"** → zoológico inmantenible. Mitigación: stacks asignados por fit en clústers (esta ADR), no ad-hoc.
- **Deriva entre implementaciones** del mismo patrón. Mitigación: golden template + verificación de contrato (Pact) en infra.

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|-------------|---------------------|
| Single-stack (solo uno) | Máxima velocidad/calidad, pero pierde el objetivo formativo multi-stack del SENA. |
| Polyglot ad-hoc (cada quien elige) | Sin fit ni clústers → duplicación caótica del cross-cutting; inmantenible. |
| Node/TS para BFF | Idiomático, pero fuera del set Go/Java/Python elegido; se usa Python/FastAPI para BFF. |

## Referencias

- [ADR-005](./ADR-005-microservices-topology-and-transversal-capabilities.md) — topología de microservicios
- [pattern-guide.md](../../pattern-guide.md) · [service-boundary-rules.md](../../../09-microservices/service-boundary-rules.md)
- `TOPOLOGIA-REPOS.md` (workspace) — árbol de los 40 repos
