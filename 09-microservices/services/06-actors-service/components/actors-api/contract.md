# Contrato — actors-api

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
| `GET` | `/instructors` | Listar instructores (filtros: área, centro) | `ACT_READ` |
| `GET` | `/instructors/{id}` | Detalle + áreas + contrato vigente | `ACT_READ` |
| `POST` | `/instructors` | Crear instructor | `ACT_MANAGE` |
| `GET` | `/instructors/{id}/availability` | Disponibilidad y excepciones | `ACT_READ` |
| `PUT` | `/instructors/{id}/availability` | Actualizar disponibilidad | `ACT_MANAGE` |
| `GET` | `/instructors/{id}/competencies` | Competencias asignadas | `ACT_READ` |
| `GET` | `/learners` | Listar aprendices (filtro: ficha) | `ACT_READ` |
| `POST` | `/companies` | Registrar empresa | `ACT_MANAGE` |
| `POST` | `/productive-stages` | Registrar etapa productiva | `ACT_MANAGE` |

## Ejemplo de respuesta (instructor)
```json
{
  "id": "uuid",
  "full_name": "…",
  "areas": ["uuid"],
  "is_current_contract": true,
  "status_id": "uuid"
}
```

## Formato de error estándar
```json
{ "error_code": "VALIDATION_ERROR", "message": "…", "trace_id": "uuid-v4" }
```

## Eventos publicados
`actors.instructor.availability_changed`, `actors.learner.enrolled`. Ver [event-catalog.md](../../../../event-catalog.md).
