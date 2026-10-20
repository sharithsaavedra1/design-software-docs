# Plan de Mejoramiento Individual — Reto R3: Observabilidad de Training Environment

> **Estado:** Entregado / PASS | **Última actualización:** 2026-10-20  
> **Aprendiz responsable:** Emily Sharith Amézquita Saavedra | CC 1075243904  
> **Programa:** ADSO (Análisis y Desarrollo de Software) — SENA Ficha 3145555  
> **Microservicio:** `training-environment-service` (Dominio de ambientes de formación y reservas)  
> **Rúbrica oficial:** Acta No. 02-2026, Numeral 10  
> **Pull Request Oficial:** [PR #19 en code-sena/design-software-training-environment-service](https://github.com/code-sena/design-software-training-environment-service/pull/19)  
> **Rama técnica en el microservicio:** `feature/r3-observability`  

---

## Contexto y Alcance

Este expediente documental consolida la evidencia formal y técnica de la entrega del **Reto R3 de Observabilidad** para el microservicio `training-environment-service`.

Conforme a la directriz arquitectónica institucional, los repositorios de implementación de los microservicios conservan exclusivamente el código fuente ejecutable, su configuración de despliegue y sus pruebas automatizadas, mientras que la documentación de arquitectura (ADRs) e informes técnicos se centralizan en este repositorio (`design-software-docs`).

## Contenido del Expediente

1. **[Informe Técnico de Observabilidad](./informe-tecnico.md):** Detalle técnico de la arquitectura implementada, componentes OpenTelemetry, métricas RED, logs correlacionados, provisionamiento de Grafana y evidencias gráficas.
2. **[Informe de Cumplimiento de la Rúbrica](./informe-de-cumplimiento.md):** Matriz detallada de cumplimiento punto por punto contra los criterios del Acta No. 02 (Numeral 10) y resolución de observaciones de QA.
3. **[Decisión Arquitectónica Oficial (ADR-011)](../../../05-architecture/decisions/records/ADR-011-training-environment-r3-observability.md):** Adopción del SDK OpenTelemetry, propagación W3C, instrumentación de PostgreSQL con `otelsql` y métricas RED.

## Componentes Técnicos Implementados en el Microservicio

Los cinco componentes técnicos obligatorios de la rúbrica se encuentran desplegados y validados en el PR #19:

| Componente Obligatorio | Implementación en `training-environment-service` | Estado |
|---|---|:---:|
| **1. Traza Distribuida W3C** | Propagador global W3C `traceparent` (`internal/observability/trace.go`), Server Span HTTP (`middleware.go`) y DB Client Spans con `otelsql` (`tracer.go`). | **PASS** |
| **2. Métricas RED en `/metrics`** | Rate (`http_requests_total`), Errors (`http_requests_errors_total`) y Duration (`http_request_duration_seconds`) expuestas en `/metrics` (`metrics.go`). | **PASS** |
| **3. Logs Estructurados JSON** | Logger con `log/slog` inyectando `correlation_id`, `trace_id` y `span_id` en cada registro (`logger.go`). | **PASS** |
| **4. Grafana y Alertas como Código** | Tablero RED provisionado (`deploy/grafana/dashboards/`) y alerta Prometheus para tasa de error $> 5\%$ (`deploy/grafana/alerts/`). | **PASS** |
| **5. Pruebas Automatizadas** | Suite completa en `internal/observability/observability_test.go` validando parsing W3C, métricas concurrentes y traza MFE → HTTP → BD con PostgreSQL real. | **PASS** |

## Evidencias Visuales

Las evidencias visuales oficiales se encuentran archivadas en [`assets/images/r3-observabilidad-training-environment/`](../../../assets/images/r3-observabilidad-training-environment/) y embebidas dentro del [Informe Técnico](./informe-tecnico.md).
