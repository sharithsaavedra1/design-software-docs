# Revision de contratos OpenAPI

> Fecha: 2026-10-07. Resultado preparado en `07-api/contracts/openapi` dentro de esta carpeta, sin tocar `design-software-docs`.

## Acciones realizadas

- Se copiaron los contratos OpenAPI actuales desde `design-software-docs/07-api/contracts/openapi`.
- Se reemplazaron `iam.yaml` y `scheduling.yaml` por los contratos fuente de sus repos de servicio:
  - `design-software-iam-service/contracts/openapi/iam.yaml`
  - `design-software-scheduling-service/contracts/openapi/scheduling.yaml`
- Se agregaron endpoints implementados que no estaban documentados en contratos:
  - `audit.yaml`: `GET /health`
  - `document.yaml`: `GET /health`
  - `iam.yaml`: `GET /health`, `GET /ready`, `GET /auth/.well-known/jwks.json`
  - `monitoring.yaml`: `GET /health`, `POST /kpis`
  - `reference-data.yaml`: `GET /health/live`, `GET /health`, `GET /health/ready`
  - `scheduling.yaml`: `GET /health`, `GET /ready`
  - `training-environment.yaml`: `GET /health`
  - `actors.yaml`: `GET /catalogs`, `GET /catalogs/{catalog_id}/details`, `GET /reports/active-catalog`

## Resultado de cobertura contra codigo

Despues de normalizar prefijos `/api/v1` y nombres de path params, todos los endpoints detectados en codigo quedan representados en los contratos preparados.

| Servicio | Endpoints detectados en codigo | Operaciones en contrato preparado | Faltantes despues de correccion |
|---|---:|---:|---:|
| `academic-management-service` | 32 | 38 | 0 |
| `actors-service` | 50 | 53 | 0 |
| `audit-service` | 1 | 4 | 0 |
| `document-service` | 1 | 12 | 0 |
| `iam-service` | 3 | 25 | 0 |
| `monitoring-service` | 2 | 30 | 0 |
| `notification-service` | 4 | 4 | 0 |
| `reference-data-service` | 3 | 48 | 0 |
| `scheduling-service` | 19 | 29 | 0 |
| `training-environment-service` | 24 | 24 | 0 |

## Contrato por delante de implementacion

Varios contratos documentan endpoints de negocio que todavia no aparecen como rutas implementadas en el codigo actual. Eso no se elimino, porque en el repo de docs parecen funcionar como contrato objetivo/producto, no solo como snapshot de implementacion. Los casos mas claros son:

- `audit-service`: contrato incluye consulta/export de auditoria; codigo actual solo expone health en `audit-query-api`.
- `document-service`: contrato incluye documentos/versiones/reportes; codigo actual tiene APIs FastAPI con health minimo.
- `monitoring-service`: contrato incluye catalogos KPI/alertas/reportes; codigo actual expone health y registro KPI inicial.
- `reference-data-service`: contrato completo de jerarquia/catalogos; detector solo observa health porque las rutas se registran desde estructuras protegidas internas y no con `HandleFunc` directo.
- `iam-service`: contrato fuente OpenAPI define auth/users/roles/modules/reportes; los controladores implementan interfaces generadas, por eso el detector automatico solo ve health/ready/JWKS.

## Nota de uso

Para actualizar `design-software-docs`, crear primero una rama y copiar esta carpeta sobre `07-api/contracts/openapi`. Luego revisar el diff, especialmente los contratos que estan por delante de implementacion.
