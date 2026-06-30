# Checklist de madurez de servicio

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

Criterios que un microservicio debe cumplir antes de pasar de documentación a implementación,
y luego antes de pasar a cada ambiente. Aplica a todos los servicios del catálogo.

## Nivel 0 — Documentación aprobada (antes de escribir código)

- [ ] Bounded context documentado en `README.md` del servicio
- [ ] Entidades propias registradas en [data-ownership-matrix.md](./data-ownership-matrix.md)
- [ ] Dependencias (sync/async) registradas en [dependency-map.md](./dependency-map.md)
- [ ] Al menos un componente con `contract.md` completado
- [ ] Eventos publicados y consumidos en `events.md`
- [ ] ADR aprobada si el servicio introduce un patrón arquitectónico nuevo
- [ ] Servicio registrado en [service-catalog.md](./service-catalog.md) con owner definido

## Nivel 1 — Listo para DEV

- [ ] `data-model.md` con entidades y campos completos
- [ ] Variables de entorno documentadas en el `README.md` del componente
- [ ] Healthcheck implementado (`GET /health`)
- [ ] Logs estructurados (JSON) con `trace_id` en cada línea
- [ ] Tests de contrato básicos pasando

## Nivel 2 — Listo para QA

- [ ] `runbook.md` completado con alertas y procedimientos de reinicio
- [ ] `decisions.md` con al menos las 3 decisiones de diseño más importantes
- [ ] Cobertura de tests >= 70 %
- [ ] Errores retornan formato estándar `{ error_code, message, trace_id }`
- [ ] Rate limiting configurado en el componente `-api`
- [ ] Dead letter queue configurada para workers
- [ ] Métricas RED expuestas (Rate, Errors, Duration)

## Nivel 3 — Listo para producción

- [ ] SLO definido en [13-operations/_template-sla-slo-sli.md](../13-operations/_template-sla-slo-sli.md)
- [ ] Alertas configuradas en plataforma de observabilidad
- [ ] Backup configurado con RPO/RTO documentado
- [ ] Rollback plan documentado
- [ ] Revisión de seguridad completada (ver [STRIDE](../05-architecture/_template-security-threat-model.md))
- [ ] Postmortem template listo para el equipo
- [ ] Review de Definition of Done superado

## Estado actual por servicio

| Servicio | Nivel 0 | Nivel 1 | Nivel 2 | Nivel 3 |
|----------|---------|---------|---------|---------|
| `iam-service` | 🔴 | — | — | — |
| `reference-data-service` | 🔴 | — | — | — |
| `academic-management-service` | 🔴 | — | — | — |
| `training-environment-service` | 🔴 | — | — | — |
| `scheduling-service` | 🔴 | — | — | — |
| `actors-service` | 🔴 | — | — | — |
| `document-service` | 🔴 | — | — | — |
| `monitoring-service` | 🔴 | — | — | — |
| `audit-service` | 🔴 | — | — | — |
