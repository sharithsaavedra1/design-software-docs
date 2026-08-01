# Contrato — training-environment-api

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato REST/JSON, agnóstico de lenguaje.

## Autenticación
`Authorization: Bearer <JWT>` de `iam-service`; feature + scope.

## Base URL
`/api/v1`

## Endpoints (entidades reales)
| Método | Path | Descripción | Feature |
|--------|------|-------------|---------|
| `GET` | `/environments` | Listar ambientes (filtros: tipo, centro) | `ENV_READ` |
| `GET` | `/environments/{id}` | Detalle | `ENV_READ` |
| `POST` | `/environments` | Crear ambiente | `ENV_MANAGE` |
| `GET` | `/environments/{id}/availability` | Reglas de disponibilidad | `ENV_READ` |
| `POST` | `/environments/{id}/availability-rules` | Definir regla recurrente | `ENV_MANAGE` |
| `GET` | `/environments/{id}/reservations?from=&to=` | Reservas en rango | `ENV_READ` |
| `POST` | `/reservations` | Crear reserva (rechaza solapamiento) | `ENV_MANAGE` |
| `POST` | `/environments/{id}/maintenance` | Registrar mantenimiento | `ENV_MANAGE` |
| `GET` | `/environments/{id}/inventory` | Inventario del ambiente | `ENV_READ` |

## Regla de negocio clave
`POST /reservations` puede fallar con `409 CONFLICT` (`error_code: RESERVATION_OVERLAP`) porque la BD impone no-solapamiento por ambiente (`EXCLUDE`). El cliente debe manejar ese caso.

## Formato de error estándar
```json
{ "error_code": "RESERVATION_OVERLAP", "message": "El ambiente ya está reservado en ese rango", "trace_id": "uuid-v4" }
```

## Eventos publicados
`environment.availability.changed`, `environment.maintenance.started` (ver [event-catalog.md](../../../../event-catalog.md)).
