# training-environment-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-api` — REST API sincrónica

## Responsabilidad

Gestiona ambientes físicos, inventario, mantenimiento y disponibilidad. El endpoint de disponibilidad es el más crítico: `scheduling-service` lo consulta síncronamente al crear cada sesión.

## Tecnologías

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime | (pendiente) | |
| BD | PostgreSQL — `env_db` | |
| Caché | Redis (para disponibilidad) | |

## Contrato

Ver [contract.md](./contract.md)
