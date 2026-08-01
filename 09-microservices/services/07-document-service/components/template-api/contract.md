# Contrato — template-api

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato a nivel de protocolo (REST/JSON). Sin
> código de ningún lenguaje. La entidad y sus campos son los reales de [data-model.md](../../data-model.md).

## Autenticación

Bearer JWT emitido por `iam-service`. Todos los endpoints requieren el header:

```
Authorization: Bearer <token>
```

## Base URL

`/api/v1/templates`

## Endpoints

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/templates` | Listar plantillas (paginado), filtrable por `output_type` e `is_active` | `coordinador`, `admin` |
| `GET` | `/templates/{id}` | Detalle de una plantilla, incluye `template_body` | `coordinador`, `admin` |
| `GET` | `/templates/by-code/{code}` | Resolver plantilla por `code` (usado por los workers) | `coordinador`, `admin`, `sistema` |
| `POST` | `/templates` | Crear una nueva plantilla | `admin` |
| `PUT` | `/templates/{id}` | Actualizar plantilla (incrementa `version`) | `admin` |
| `DELETE` | `/templates/{id}` | Desactivar (`is_active = false`) | `admin` |

## Entidad del contrato

Campos reales de `document_template` (ver [data-model.md](../../data-model.md)):

`id`, `code`, `name`, `template_body` (HTML), `output_type`, `version`, `is_active`.

- `code` es único (ej: `SCHEDULE_CERTIFICATE`, `ENROLLMENT_RECORD`).
- **Valores permitidos (`output_type`):** `PDF`, `EXCEL`, `WORD`.

## Crear plantilla — `POST /templates`

**Request:**

```json
{
  "code": "ENROLLMENT_RECORD",
  "name": "Comprobante de matrícula",
  "template_body": "<html>...{{ variables }}...</html>",
  "output_type": "PDF"
}
```

**Response — `201 Created`:** el recurso creado con `version = 1` e `is_active = true`.

## Versionado

`PUT /templates/{id}` incrementa `document_template.version`. El versionado de plantilla es
independiente del versionado de documentos generados (`document_version`). Los documentos ya
generados conservan su binario; solo las generaciones posteriores usan la nueva versión de la
plantilla.

## Formato de error estándar

```json
{
  "error_code": "TEMPLATE_NOT_FOUND",
  "message": "La plantilla solicitada no existe",
  "trace_id": "uuid-v4"
}
```

| `error_code` | HTTP | Caso |
|--------------|------|------|
| `TEMPLATE_NOT_FOUND` | 404 | `id` o `code` inexistente |
| `TEMPLATE_CODE_CONFLICT` | 409 | `code` ya existe al crear |
| `INVALID_OUTPUT_TYPE` | 422 | `output_type` fuera de `PDF`/`EXCEL`/`WORD` |
| `FORBIDDEN` | 403 | Rol insuficiente |
| `UNAUTHORIZED` | 401 | JWT ausente o inválido |
