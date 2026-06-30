# Contrato — template-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Base URL

`/api/v1/templates`

## Endpoints

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/templates` | Listar plantillas activas | `coordinador`, `admin` |
| `GET` | `/templates/{id}` | Detalle de plantilla | `coordinador`, `admin` |
| `POST` | `/templates` | Cargar nueva plantilla | `admin` |
| `PUT` | `/templates/{id}` | Actualizar plantilla | `admin` |
| `DELETE` | `/templates/{id}` | Desactivar plantilla | `admin` |
