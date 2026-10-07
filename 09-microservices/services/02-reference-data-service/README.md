# reference-data-service

| Campo | Valor |
|---|---|
| Modulo | M2 + M4 |
| App repo | `design-software-reference-data-service` |
| DB repo | `design-software-reference-data-db` |
| Stack | Go |
| Deployables | reference-data-api |
| Estado observado | Implementado con API HTTP, seguridad JWT/JWKS y publicacion AMQP opcional. |

## Responsabilidad

Jerarquia institucional, centros de formacion, unidades institucionales, catalogos y parametros.

## Persistencia

- Esquemas: institutional_structure, parameterization
- Tablas: institutional_structure.department, institutional_structure.institutional_unit, institutional_structure.macroregion, institutional_structure.microregion, institutional_structure.municipality, institutional_structure.training_center, parameterization.catalog, parameterization.catalog_detail, parameterization.parameter

## API detectada

| Metodo | Ruta | Fuente |
|---|---|---|
| GET | `/health` | `.\design-software-reference-data-service\cmd\reference-data-api\main.go` |
| GET | `/health/live` | `.\design-software-reference-data-service\cmd\reference-data-api\main.go` |
| GET | `/health/ready` | `.\design-software-reference-data-service\cmd\reference-data-api\main.go` |

## Configuracion

- `HU_REF_018_ADMIN_EMAIL`
- `HU_REF_018_ADMIN_PASSWORD`
- `HU_REF_018_IAM_BASE_URL`
- `HU_REF_018_LEARNER_EMAIL`
- `HU_REF_018_LEARNER_PASSWORD`
- `IAM_JWKS_URL`
- `IAM_JWT_ISSUER`
- `MESSAGE_BROKER_URL`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_INSECURE`
- `PORT`
- `REFERENCE_DATA_AMQP_URL`
- `REFERENCE_DATA_DATABASE_URL`
- `REFERENCE_DATA_TEST_DSN`

## Notas

Servicio base para catalogos consumidos por otros dominios.
