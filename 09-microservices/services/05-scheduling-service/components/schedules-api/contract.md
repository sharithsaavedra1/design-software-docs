# Contrato — schedules-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Autenticación

Bearer JWT emitido por `iam-service`.

## Base URL

`/api/v1`

## Endpoints principales

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/horarios` | Listar horarios (filtrable por ficha, periodo, estado) | `coordinador`, `admin` |
| `GET` | `/horarios/{id}` | Detalle de horario | `*` |
| `POST` | `/horarios` | Crear borrador de horario para una ficha | `coordinador` |
| `GET` | `/horarios/{id}/sesiones` | Sesiones de un horario | `*` |
| `POST` | `/horarios/{id}/sesiones` | Agregar sesión manualmente | `coordinador` |
| `DELETE` | `/horarios/{id}/sesiones/{sesion_id}` | Eliminar sesión | `coordinador` |
| `POST` | `/horarios/{id}/publicar` | Publicar horario (dispara conflict-validator-worker) | `coordinador` |
| `GET` | `/horarios/{id}/conflictos` | Listar conflictos detectados | `coordinador` |
| `GET` | `/franjas` | Listar franjas horarias disponibles | `*` |
