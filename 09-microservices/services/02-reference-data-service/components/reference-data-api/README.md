# reference-data-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-api` — REST API sincrónica (principalmente lectura)

## Responsabilidad

Expone la jerarquía institucional y los catálogos maestros del sistema. Alta relación lectura/escritura: los catálogos se crean una vez y se consultan constantemente.

## Tecnologías

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime | (pendiente) | |
| BD | PostgreSQL — `ref_db` | |
| Caché | Redis (opcional) | |

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto de escucha |
| `DB_URL` | Cadena de conexión a `ref_db` |
| `REDIS_URL` | URL de Redis (opcional — caché) |

## Contrato

Ver [contract.md](./contract.md)
