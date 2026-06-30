# document-service — Gestión documental

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17
> Autor: Por definir | Equipo: Por definir

## Responsabilidad

Gestiona el ciclo de vida de documentos: creación, versionado, almacenamiento y exportación. Recibe solicitudes de generación de documentos (horarios en PDF, reportes en Excel, constancias) de otros servicios. Es agnóstico al dominio de negocio.

## Bounded context

| Entidad | Descripción |
|---------|-------------|
| `documento` | Archivo generado o cargado con metadatos |
| `version_documento` | Versión inmutable de un documento |
| `plantilla_documento` | Plantilla reutilizable para generar documentos |
| `firma_digital` | Firma o sello aplicado al documento |

## Módulo de origen

Transversal — sin módulo de dominio directo

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| `iam-service` | auth | Validación de JWT |

## Componentes desplegables

| Componente | Sufijo | Descripción |
|------------|--------|-------------|
| `document-api` | `-api` | REST API: carga, descarga, consulta y versionado de documentos |
| `template-api` | `-api` | REST API: CRUD de plantillas de documentos |
| `pdf-renderer-worker` | `-worker` | Genera PDFs a partir de plantillas + datos recibidos por evento/cola |
| `document-lifecycle-worker` | `-worker` | Gestiona archivado, retención y limpieza de documentos expirados |

## Base de datos y almacenamiento

- Nombre lógico: `document_db` — metadatos de documentos
- Motor: PostgreSQL
- Binarios: Object Storage (S3 / MinIO) — los archivos nunca se guardan en BD
- Ver detalle en [storage-and-documents.md](../../storage-and-documents.md)

## Links

- Repo: (pendiente)
- Data model: [data-model.md](./data-model.md)
- Eventos: [events.md](./events.md)
- Runbook: [runbook.md](./runbook.md)
- Decisiones internas: [decisions.md](./decisions.md)
- Storage strategy: [storage-adapters.md](./storage-adapters.md)
