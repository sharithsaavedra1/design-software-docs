# iam-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-api` — REST API sincrónica

## Responsabilidad

Expone los endpoints de autenticación (login, logout, refresh) y administración de usuarios, roles y permisos. Es el punto de entrada al sistema IAM.

## Tecnologías

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime | (pendiente) | |
| Framework | (pendiente) | |
| BD | PostgreSQL — `iam_db` | |

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto de escucha |
| `DB_URL` | Cadena de conexión a `iam_db` |
| `JWT_SECRET` | Secreto para firmar tokens |
| `JWT_EXPIRY` | TTL del access token (ej: `15m`) |
| `REFRESH_EXPIRY` | TTL del refresh token (ej: `7d`) |

## Contrato

Ver [contract.md](./contract.md)
