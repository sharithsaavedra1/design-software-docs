# Contrato — reference-data-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Autenticación

Bearer JWT emitido por `iam-service`. Operaciones de escritura requieren rol `admin`.

## Base URL

`/api/v1`

## Endpoints principales

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/institucional/macroregiones` | Listar macroregiones | `*` |
| `GET` | `/institucional/centros` | Listar centros de formación | `*` |
| `GET` | `/institucional/centros/{id}/unidades` | Unidades de un centro | `*` |
| `GET` | `/catalogos/{codigo}` | Valores de un catálogo | `*` |
| `GET` | `/catalogos/{codigo}/{valor}` | Detalle de un valor de catálogo | `*` |
| `GET` | `/parametros/{clave}` | Valor de un parámetro del sistema | `admin`, `sistema` |
| `PUT` | `/parametros/{clave}` | Actualizar parámetro | `admin` |
| `POST` | `/catalogos` | Crear catálogo | `admin` |
| `POST` | `/catalogos/{codigo}/detalles` | Agregar valor a catálogo | `admin` |
