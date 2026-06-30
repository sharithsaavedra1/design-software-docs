# Contrato — training-environment-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Autenticación

Bearer JWT emitido por `iam-service`.

## Base URL

`/api/v1`

## Endpoints principales

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/ambientes` | Listar ambientes | `*` |
| `GET` | `/ambientes/{id}` | Detalle de ambiente | `*` |
| `GET` | `/ambientes/{id}/disponibilidad` | Disponibilidad por día y franja | `*` |
| `GET` | `/ambientes/disponibles` | Ambientes disponibles en una franja | `coordinador`, `sistema` |
| `POST` | `/ambientes` | Registrar ambiente | `admin` |
| `PUT` | `/ambientes/{id}` | Actualizar ambiente | `admin` |
| `POST` | `/ambientes/{id}/mantenimiento` | Registrar mantenimiento | `admin`, `coordinador` |
| `POST` | `/ambientes/{id}/reservas` | Crear reserva puntual | `coordinador` |
| `GET` | `/inventario` | Listar elementos de inventario | `admin` |
| `POST` | `/inventario` | Registrar elemento | `admin` |

## Endpoint crítico para scheduling

```
GET /ambientes/disponibles?dia_semana=1&hora_inicio=07:00&hora_fin=10:00&tipo_ambiente=LAB
```

Retorna lista de ambientes disponibles para esa franja. Debe responder en < 300 ms.
