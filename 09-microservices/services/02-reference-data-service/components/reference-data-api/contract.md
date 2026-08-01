# Contrato — reference-data-api

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato a nivel de protocolo (REST/JSON), agnóstico de lenguaje.

## Autenticación
Todos los endpoints requieren `Authorization: Bearer <JWT>` emitido por `iam-service`. La autorización se resuelve por **feature + scope** (RBAC).

## Base URL
`/api/v1`

## Endpoints (derivados del modelo real)

### Jerarquía geográfica e institucional
| Método | Path | Descripción | Feature |
|--------|------|-------------|---------|
| `GET` | `/macroregions` | Listar macrorregiones (paginado) | `REF_READ` |
| `GET` | `/municipalities?department_id=` | Municipios por departamento | `REF_READ` |
| `GET` | `/training-centers` | Centros de formación | `REF_READ` |
| `GET` | `/training-centers/{id}` | Detalle de centro | `REF_READ` |
| `GET` | `/institutional-units?training_center_id=` | Unidades de un centro | `REF_READ` |
| `POST` | `/training-centers` | Crear centro | `REF_MANAGE` |
| `PUT` | `/training-centers/{id}` | Actualizar | `REF_MANAGE` |

### Catálogos parametrizables
| Método | Path | Descripción | Feature |
|--------|------|-------------|---------|
| `GET` | `/catalogs/{code}/details` | Valores de un catálogo (`catalog_detail`) | `REF_READ` |
| `GET` | `/parameters/{key}` | Valor de un parámetro del sistema | `REF_READ` |
| `POST` | `/catalogs/{code}/details` | Agregar valor a un catálogo | `REF_MANAGE` |

## Paginación
Listados: `?page=&size=` (offset) → respuesta `{ "items": [...], "page", "size", "total" }`.

## Ejemplo de respuesta
```json
{
  "id": "uuid",
  "center_code": "9201",
  "name": "Centro de Comercio y Servicios",
  "municipality_id": "uuid",
  "created_at": "2026-08-01T14:00:00Z"
}
```

## Formato de error estándar
```json
{ "error_code": "RESOURCE_NOT_FOUND", "message": "El recurso solicitado no existe", "trace_id": "uuid-v4" }
```

## Eventos publicados
Al cambiar datos maestros se publica `reference_data.<entity>.<action>` (ver [event-catalog.md](../../../../event-catalog.md)) para que los consumidores refresquen sus referencias.
