# Contrato — actors-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Autenticación

Bearer JWT emitido por `iam-service`.

## Base URL

`/api/v1`

## Endpoints principales

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/instructores` | Listar instructores | `coordinador`, `admin` |
| `GET` | `/instructores/{id}` | Detalle de instructor | `*` |
| `GET` | `/instructores/{id}/competencias` | Competencias habilitadas del instructor | `coordinador`, `sistema` |
| `GET` | `/instructores/disponibles` | Instructores disponibles para una competencia y franja | `sistema` |
| `POST` | `/instructores` | Registrar instructor | `admin` |
| `PUT` | `/instructores/{id}` | Actualizar datos del instructor | `admin` |
| `POST` | `/instructores/{id}/competencias` | Asignar competencia | `coordinador`, `admin` |
| `GET` | `/aprendices` | Listar aprendices (filtrable por ficha) | `coordinador`, `admin`, `instructor` |
| `GET` | `/aprendices/{id}` | Detalle de aprendiz | `*` |
| `POST` | `/aprendices` | Registrar aprendiz | `admin` |
| `GET` | `/empresas` | Listar empresas | `coordinador`, `admin` |
| `POST` | `/empresas` | Registrar empresa | `admin` |

## Endpoint crítico para scheduling

```
GET /instructores/disponibles?competencia_id=uuid&dia_semana=1&hora_inicio=07:00&hora_fin=10:00
```

Retorna instructores habilitados para la competencia y sin conflicto en esa franja.
