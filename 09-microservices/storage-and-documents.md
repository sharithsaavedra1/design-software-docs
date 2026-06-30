# Almacenamiento y documentos

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

Define la estrategia de almacenamiento de datos estructurados, archivos binarios y documentos generados.

## Regla fundamental

Cada microservicio tiene su **propia base de datos**. Ningún servicio lee ni escribe directamente en la BD de otro.

## Bases de datos por servicio

| Servicio | BD lógica | Motor | Notas |
|----------|-----------|-------|-------|
| `iam-service` | `iam_db` | PostgreSQL | Credenciales y tokens; encriptación en reposo |
| `reference-data-service` | `ref_db` | PostgreSQL | Alta lectura, baja escritura; candidato a Redis como capa de caché |
| `academic-management-service` | `academic_db` | PostgreSQL | Malla curricular + fichas |
| `training-environment-service` | `env_db` | PostgreSQL | Inventario y reservas |
| `scheduling-service` | `scheduling_db` | PostgreSQL | Core del sistema; requiere consistencia fuerte |
| `actors-service` | `actors_db` | PostgreSQL | Instructores, aprendices, empresas |
| `document-service` | `document_db` | PostgreSQL | Solo metadatos; binarios en object storage |
| `monitoring-service` | `monitoring_db` | PostgreSQL | Series temporales de KPIs; considerar TimescaleDB |
| `audit-service` | `audit_db` | PostgreSQL | Append-only; nunca UPDATE ni DELETE |

## Almacenamiento de archivos binarios

Los archivos binarios (PDFs, evidencias, plantillas) son responsabilidad de `document-service`.

| Tipo | Donde vive | Servicio responsable |
|------|-----------|----------------------|
| PDFs generados (horarios, reportes) | Object storage (S3 / MinIO) | `document-service` |
| Plantillas de documentos | Object storage | `document-service` |
| Evidencias de seguimiento | Object storage | `document-service` (vía API) |
| Logos e imágenes institucionales | Object storage | `document-service` |

> Ningún servicio guarda archivos binarios en su propia BD. Se llama a la API de `document-service`
> y se guarda el `document_id` como referencia.

## Estrategia de caché

| Candidato | Tipo de caché | TTL sugerido | Motivo |
|-----------|--------------|-------------|--------|
| Catálogos y parámetros (ref_db) | Redis / in-memory | 10 min | Alta frecuencia de lectura, baja volatilidad |
| Disponibilidad de ambientes | Redis | 30 s | Consultado en cada creación de horario |
| Token de sesión | Redis | = duración del token | Revocación rápida |

## Backups

Ver [backup-and-recovery.md](../13-operations/backup-and-recovery.md) para RPO/RTO por base de datos.
