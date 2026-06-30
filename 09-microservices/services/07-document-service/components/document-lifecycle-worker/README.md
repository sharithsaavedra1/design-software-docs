# document-lifecycle-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-worker` — Tarea periódica (scheduler interno)

## Responsabilidad

Gestiona el ciclo de vida de documentos: marca como expirados los que superan la política de retención, archiva documentos en cold storage y limpia object storage de archivos huérfanos.

## Contrato

Ver [contract.md](./contract.md)
