# Contrato — document-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Base URL

`/api/v1/documents`

## Endpoints

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/documents` | Listar documentos por `owner_entity_id` | `*` |
| `GET` | `/documents/{id}` | Metadatos del documento | `*` |
| `GET` | `/documents/{id}/download-url` | URL pre-firmada para descarga | `*` |
| `POST` | `/documents/generate` | Solicitar generación asíncrona de un documento | `coordinador`, `sistema` |
| `GET` | `/documents/{id}/versions` | Versiones de un documento | `*` |
| `POST` | `/documents/upload` | Cargar documento manualmente | `coordinador`, `admin` |
| `DELETE` | `/documents/{id}` | Archivar documento | `admin` |

## Solicitud de generación

```json
{
  "tipo": "HORARIO_PDF",
  "dominio": "horario",
  "owner_entity_id": "uuid-del-horario",
  "plantilla_id": "uuid-de-la-plantilla",
  "datos": {}
}
```

Respuesta inmediata: `202 Accepted` con `{ documento_id, estado: "GENERANDO" }`. Consultar `GET /documents/{id}` para verificar cuando el estado cambia a `DISPONIBLE`.
