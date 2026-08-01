# Contrato — document-api

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato a nivel de protocolo (REST/JSON). Sin
> código de ningún lenguaje. Las entidades y campos son los reales de [data-model.md](../../data-model.md).

## Autenticación

Bearer JWT emitido por `iam-service`. Todos los endpoints requieren el header:

```
Authorization: Bearer <token>
```

La autorización se resuelve por scope/rol del token. Roles referenciados: `coordinador`,
`admin`, `sistema` (servicio a servicio). `*` = cualquier usuario autenticado con acceso a la
entidad propietaria.

## Base URL

`/api/v1/documents`

## Endpoints

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/documents` | Listar documentos (paginado), filtrable por `owner_service`, `owner_entity_id`, `domain`, `status` | `*` |
| `GET` | `/documents/{id}` | Metadatos de un documento | `*` |
| `GET` | `/documents/{id}/versions` | Historial de versiones (`document_version`) | `*` |
| `GET` | `/documents/{id}/download-url` | Genera y retorna una URL firmada de la versión vigente | `*` |
| `POST` | `/documents/generate` | Solicita la generación asíncrona de un documento a partir de una plantilla | `coordinador`, `sistema` |
| `POST` | `/documents` | Registra/carga un documento manualmente (metadatos + binario ya en storage) | `coordinador`, `admin` |
| `DELETE` | `/documents/{id}` | Archiva el documento (`status = ARCHIVED`, soft) | `admin` |

## Entidades del contrato

Campos reales de [data-model.md](../../data-model.md):

- `document`: `id`, `template_id?`, `title`, `domain`, `owner_service`, `owner_entity_id`,
  `storage_key`, `mime_type`, `size_bytes?`, `status`, `created_by`, `created_at`, `updated_at`.
- `document_version`: `id`, `document_id`, `version_number`, `storage_key`, `created_by`,
  `created_at`, `notes?`.

**Valores permitidos:**

- `domain`: `SCHEDULE`, `FICHA`, `CERTIFICATE`, `ACTOR`, `REPORT`.
- `status`: `GENERATING`, `AVAILABLE`, `ARCHIVED`, `EXPIRED`, `GENERATION_FAILED`.

## Solicitud de generación — `POST /documents/generate`

**Request:**

```json
{
  "template_code": "SCHEDULE_CERTIFICATE",
  "domain": "SCHEDULE",
  "owner_service": "scheduling-service",
  "owner_entity_id": "5c1a...-uuid",
  "title": "Horario grupo 2026-1.pdf",
  "data": {}
}
```

- `template_code` referencia `document_template.code`. `data` es el contexto que el
  [pdf-renderer-worker](../pdf-renderer-worker/README.md) combina con la plantilla.

**Response — `202 Accepted`:**

```json
{
  "document_id": "8f3c...-uuid",
  "status": "GENERATING"
}
```

El endpoint crea el registro `document` con `status = GENERATING`, encola la solicitud en
`document-generation-queue` y retorna de inmediato. El cliente consulta `GET /documents/{id}`
hasta que `status = AVAILABLE` (o `GENERATION_FAILED`). La generación es **siempre asíncrona**
(decisión 02 de [decisions.md](../../decisions.md)).

## Descarga — `GET /documents/{id}/download-url`

**Response — `200 OK`:**

```json
{
  "document_id": "8f3c...-uuid",
  "url": "https://<storage>/documents/SCHEDULE/2026/06/.../8f3c.pdf?X-Amz-...",
  "expires_in": 300
}
```

La URL firmada se genera solo tras validar el scope del usuario. TTL por defecto **300 s**
(5 min, [ADR-003](../../../../../05-architecture/decisions/records/ADR-003-object-storage.md)).
Nunca se expone `storage_key` al cliente. Requiere `status = AVAILABLE`; en otro caso se
responde `409 Conflict`.

## Formato de error estándar

```json
{
  "error_code": "DOCUMENT_NOT_FOUND",
  "message": "El documento solicitado no existe",
  "trace_id": "uuid-v4"
}
```

| `error_code` | HTTP | Caso |
|--------------|------|------|
| `DOCUMENT_NOT_FOUND` | 404 | `id` inexistente |
| `DOCUMENT_NOT_AVAILABLE` | 409 | Descarga solicitada con `status` ≠ `AVAILABLE` |
| `TEMPLATE_NOT_FOUND` | 422 | `template_code` inválido en la solicitud de generación |
| `FORBIDDEN` | 403 | El token no tiene scope sobre la entidad propietaria |
| `UNAUTHORIZED` | 401 | JWT ausente o inválido |
