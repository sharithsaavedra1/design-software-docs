# Contrato — academic-management-api

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato REST/JSON, agnóstico de lenguaje.

## Autenticación
`Authorization: Bearer <JWT>` de `iam-service`; autorización por feature + scope (un coordinador solo opera en su centro de formación → `scope = TRAINING_CENTER`).

## Base URL
`/api/v1`

## Endpoints (entidades reales)
| Método | Path | Descripción | Feature |
|--------|------|-------------|---------|
| `GET` | `/training-programs` | Listar programas (paginado) | `ACAD_READ` |
| `GET` | `/training-programs/{id}` | Detalle + versión | `ACAD_READ` |
| `POST` | `/training-programs` | Crear programa | `ACAD_MANAGE` |
| `GET` | `/training-programs/{id}/competencies` | Competencias del programa | `ACAD_READ` |
| `GET` | `/competencies/{id}/learning-outcomes` | Resultados de aprendizaje | `ACAD_READ` |
| `GET` | `/fichas` | Listar fichas (filtros: programa, estado, centro) | `ACAD_READ` |
| `POST` | `/fichas` | Crear ficha de matrícula | `ACAD_MANAGE` |
| `PATCH` | `/fichas/{id}/status` | Cambiar estado de la ficha | `ACAD_MANAGE` |
| `DELETE` | `/fichas/{id}` | Baja lógica (soft delete) | `ACAD_ADMIN` |

## Ejemplo de respuesta (ficha)
```json
{
  "id": "uuid",
  "ficha_number": "2874521",
  "program_id": "uuid",
  "program_version": 3,
  "status": "INDUCTION",
  "training_center_id": "uuid",
  "created_at": "2026-08-01T14:00:00Z"
}
```

## Formato de error estándar
```json
{ "error_code": "VALIDATION_ERROR", "message": "El número de ficha ya existe", "trace_id": "uuid-v4" }
```

## Eventos publicados
`academic.enrollment_ficha.created`, `academic.enrollment_ficha.status_changed`, `academic.training_program.published`. Ver [event-catalog.md](../../../../event-catalog.md).
