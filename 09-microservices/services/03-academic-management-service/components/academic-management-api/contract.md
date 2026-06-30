# Contrato — academic-management-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Autenticación

Bearer JWT emitido por `iam-service`.

## Base URL

`/api/v1`

## Endpoints principales

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/programas` | Listar programas de formación | `*` |
| `GET` | `/programas/{id}` | Detalle de programa | `*` |
| `GET` | `/programas/{id}/competencias` | Competencias de un programa | `*` |
| `GET` | `/competencias/{id}/raps` | RAPs de una competencia | `*` |
| `GET` | `/fichas` | Listar fichas (paginado, filtrable por estado) | `coordinador`, `admin` |
| `GET` | `/fichas/{id}` | Detalle de ficha | `*` |
| `POST` | `/fichas` | Crear ficha | `coordinador`, `admin` |
| `PUT` | `/fichas/{id}/estado` | Cambiar estado de ficha | `coordinador`, `admin` |
| `GET` | `/ofertas` | Listar ofertas de formación | `*` |
