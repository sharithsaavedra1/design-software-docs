# Contrato — schedules-api

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato a nivel de protocolo REST/JSON. No hay código de ningún lenguaje: los ejemplos son JSON genérico. Recursos y campos derivados de las entidades reales del [modelo de datos](../../data-model.md): `schedule`, `time_slot`, `class_session`, `scheduling_conflict`.

---

## Autenticación y autorización

Bearer JWT emitido por `iam-service`. Todos los endpoints requieren:

```
Authorization: Bearer <token>
```

La autorización es por **feature + scope** (RBAC de tres dimensiones: módulo → feature → scope). El JWT lleva pre-calculada la lista `features` con el formato `FEATURE_CODE:SCOPE_TYPE` (ver [rbac-design.md](../../../01-iam-service/rbac-design.md)). Cada endpoint exige un feature del módulo `MOD_SCHEDULING`; el `scope_type` acompañante determina el filtro de datos que el servicio aplica:

| scope_type | Filtro que aplica `schedules-api` |
|-----------|-----------------------------------|
| `GLOBAL` | Sin filtro adicional |
| `TRAINING_CENTER` | Solo horarios cuya ficha pertenece a `jwt.training_center_id` |
| `OWN_SCHEDULE` | Solo `class_session` con `instructor_id = jwt.actor_id` |
| `OWN_FICHA_AS_LEARNER` | Solo el `schedule` de la ficha activa del aprendiz (`jwt.ficha_id`) |

Si falta el feature requerido → `403 FORBIDDEN`. Si el token es inválido o expiró → `401 UNAUTHORIZED`.

## Base URL

`/api/v1`

## Convenciones

- Formato de intercambio: JSON (`Content-Type: application/json`).
- Identificadores: UUID v4.
- Fechas y horas: `session_date` en `YYYY-MM-DD`; horas (`start_time`, `end_time`) en `HH:mm` (24 h); timestamps en ISO-8601 UTC.
- Concurrencia: el agregado `schedule` usa bloqueo optimista con `row_version`; las mutaciones envían el `row_version` esperado y reciben `409 CONFLICT` si no coincide.

---

## Endpoints — Horarios (`schedule`)

| Método | Path | Descripción | Feature requerido |
|--------|------|-------------|-------------------|
| `GET` | `/schedules` | Listar horarios (paginado, filtros) | `SCH_VIEW_ALL` / `SCH_VIEW_OWN` |
| `POST` | `/schedules` | Crear borrador (`DRAFT`) para una ficha y período | `SCH_CREATE` |
| `GET` | `/schedules/{id}` | Obtener un horario con sus sesiones | `SCH_VIEW_ALL` / `SCH_VIEW_OWN` / `SCH_VIEW_FICHA` |
| `PUT` | `/schedules/{id}` | Editar metadatos del borrador (`name`) | `SCH_EDIT` |
| `DELETE` | `/schedules/{id}` | Eliminar borrador (solo `DRAFT`) | `SCH_DELETE_DRAFT` |
| `POST` | `/schedules/{id}/validate` | Validar (verificación síncrona final) y pasar a `UNDER_REVIEW` | `SCH_EDIT` |
| `POST` | `/schedules/{id}/publish` | Publicar (`UNDER_REVIEW → PUBLISHED`); emite `scheduling.schedule.published` vía Outbox | `SCH_PUBLISH` |
| `POST` | `/schedules/{id}/archive` | Archivar (`PUBLISHED → ARCHIVED`) | `SCH_ARCHIVE` |

Filtros de `GET /schedules`: `ficha_id`, `period`, `status` (`DRAFT|UNDER_REVIEW|PUBLISHED|ARCHIVED`).

**Ejemplo — `POST /schedules`**

Request:
```json
{
  "ficha_id": "b7c1e2a0-0000-4000-8000-000000000001",
  "period": "2026-1",
  "name": "Horario ADSO 2026-1 jornada mañana"
}
```

Response `201`:
```json
{
  "id": "f0a1b2c3-0000-4000-8000-0000000000aa",
  "ficha_id": "b7c1e2a0-0000-4000-8000-000000000001",
  "period": "2026-1",
  "name": "Horario ADSO 2026-1 jornada mañana",
  "status": "DRAFT",
  "published_at": null,
  "published_by": null,
  "row_version": 0,
  "created_by": "a1a1a1a1-0000-4000-8000-000000000000",
  "created_at": "2026-08-01T14:00:00Z",
  "updated_at": "2026-08-01T14:00:00Z"
}
```

> **Invariante de inmutabilidad:** un `schedule` en `PUBLISHED` no admite `PUT`/`DELETE` (solo la transición a `ARCHIVED`). La API responde `409 CONFLICT` con `error_code: SCHEDULE_IMMUTABLE`; todo cambio debe hacerse creando un nuevo borrador.

---

## Endpoints — Sesiones de clase (`class_session`)

| Método | Path | Descripción | Feature requerido |
|--------|------|-------------|-------------------|
| `GET` | `/schedules/{id}/sessions` | Listar sesiones del horario (paginado) | `SCH_VIEW_ALL` / `SCH_VIEW_OWN` |
| `POST` | `/schedules/{id}/sessions` | Agregar una sesión al borrador | `SCH_EDIT` |
| `GET` | `/sessions/{sessionId}` | Obtener una sesión | `SCH_VIEW_ALL` / `SCH_VIEW_OWN` |
| `PUT` | `/sessions/{sessionId}` | Editar una sesión del borrador (`notes`, reasignaciones) | `SCH_EDIT` |
| `POST` | `/sessions/{sessionId}/cancel` | Cancelar sesión (`ACTIVE → CANCELLED`); emite `scheduling.class_session.cancelled` | `SCH_EDIT` |

**Ejemplo — `POST /schedules/{id}/sessions`**

Request:
```json
{
  "competency_id": "c0000000-0000-4000-8000-000000000010",
  "environment_id": "e0000000-0000-4000-8000-000000000020",
  "instructor_id": "d0000000-0000-4000-8000-000000000030",
  "time_slot_id": "70000000-0000-4000-8000-000000000040",
  "session_date": "2026-07-07",
  "notes": null
}
```

Response `201` (`start_time`, `end_time` y `day_of_week` se copian de `time_slot` y son inmutables tras la creación):
```json
{
  "id": "51000000-0000-4000-8000-0000000000f1",
  "schedule_id": "f0a1b2c3-0000-4000-8000-0000000000aa",
  "competency_id": "c0000000-0000-4000-8000-000000000010",
  "environment_id": "e0000000-0000-4000-8000-000000000020",
  "instructor_id": "d0000000-0000-4000-8000-000000000030",
  "time_slot_id": "70000000-0000-4000-8000-000000000040",
  "session_date": "2026-07-07",
  "day_of_week": 2,
  "start_time": "07:00",
  "end_time": "10:00",
  "status": "ACTIVE",
  "notes": null,
  "updated_at": "2026-08-01T14:05:00Z"
}
```

---

## Endpoints — Franjas horarias (`time_slot`, catálogo)

| Método | Path | Descripción | Feature requerido |
|--------|------|-------------|-------------------|
| `GET` | `/time-slots` | Listar franjas (paginado) | `SCH_VIEW_ALL` |
| `POST` | `/time-slots` | Crear franja | `SCH_CREATE` |
| `GET` | `/time-slots/{id}` | Obtener franja | `SCH_VIEW_ALL` |
| `PUT` | `/time-slots/{id}` | Editar franja | `SCH_EDIT` |

Campos de `time_slot`: `name`, `day_of_week` (1=lunes … 7=domingo), `start_time`, `end_time`, `shift` (`DAY|NIGHT|MIXED`).

---

## Endpoints — Conflictos (`scheduling_conflict`)

| Método | Path | Descripción | Feature requerido |
|--------|------|-------------|-------------------|
| `GET` | `/schedules/{id}/conflicts` | Listar conflictos detectados en el borrador (paginado) | `SCH_CONFLICT_VIEW` |
| `POST` | `/conflicts/{conflictId}/resolve` | Marcar conflicto como resuelto (`is_resolved = true`) | `SCH_CONFLICT_RESOLVE` |

**Ejemplo — item de conflicto**
```json
{
  "id": "90000000-0000-4000-8000-0000000000c1",
  "schedule_id": "f0a1b2c3-0000-4000-8000-0000000000aa",
  "session_a_id": "51000000-0000-4000-8000-0000000000f1",
  "session_b_id": "51000000-0000-4000-8000-0000000000f2",
  "conflict_type": "INSTRUCTOR_DOUBLE_BOOKED",
  "description": "El instructor ya tiene una sesión el 2026-07-07 de 07:00 a 10:00",
  "is_resolved": false,
  "detected_at": "2026-08-01T14:06:00Z"
}
```

Valores de `conflict_type`: `INSTRUCTOR_DOUBLE_BOOKED`, `ENVIRONMENT_DOUBLE_BOOKED`, `SESSIONS_OVERLAP`.

> No se puede publicar (`POST /schedules/{id}/publish`) un horario con conflictos sin resolver: la API responde `409 CONFLICT` con `error_code: UNRESOLVED_CONFLICTS`.

---

## Paginación

Todos los listados usan paginación por offset con parámetros de query:

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `page` | Número de página (base 1) | `1` |
| `page_size` | Tamaño de página (máx. 100) | `20` |
| `sort` | Campo y dirección, ej. `created_at:desc` | según recurso |

Respuesta paginada:
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_items": 137,
    "total_pages": 7
  }
}
```

---

## Formato de error estándar

```json
{
  "error_code": "SCHEDULE_NOT_FOUND",
  "message": "El horario solicitado no existe",
  "trace_id": "uuid-v4"
}
```

Errores de validación agregan el detalle por campo:
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "La solicitud contiene campos inválidos",
  "trace_id": "uuid-v4",
  "details": [
    { "field": "period", "issue": "formato inválido, se espera YYYY-N" }
  ]
}
```

| HTTP | `error_code` (ejemplos) | Situación |
|------|-------------------------|-----------|
| `400` | `VALIDATION_ERROR` | Payload o parámetros inválidos |
| `401` | `UNAUTHORIZED` | JWT ausente, inválido o expirado |
| `403` | `FORBIDDEN` | Falta el feature o el scope no cubre el recurso |
| `404` | `SCHEDULE_NOT_FOUND`, `SESSION_NOT_FOUND` | Recurso inexistente |
| `409` | `SCHEDULE_IMMUTABLE`, `UNRESOLVED_CONFLICTS`, `ROW_VERSION_MISMATCH` | Conflicto de estado o concurrencia |
