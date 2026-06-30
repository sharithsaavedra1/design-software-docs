# Contrato — monitoring-api

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Base URL

`/api/v1/monitoring`

## Endpoints principales

| Método | Path | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/kpis` | KPIs actuales (filtrable por ficha, tipo) | `coordinador`, `admin` |
| `GET` | `/kpis/{id}/historial` | Historial de un KPI | `coordinador` |
| `GET` | `/alertas` | Alertas activas (filtrable por nivel_riesgo) | `coordinador`, `admin` |
| `PUT` | `/alertas/{id}/resolver` | Marcar alerta como resuelta | `coordinador` |
| `GET` | `/fichas/{id}/seguimiento` | Seguimiento global de una ficha | `coordinador`, `instructor` |
| `GET` | `/sesiones-seguimiento` | Sesiones de seguimiento (filtrable por ficha) | `coordinador`, `instructor` |
| `POST` | `/sesiones-seguimiento` | Registrar sesión de seguimiento | `coordinador`, `instructor` |
| `GET` | `/planes-mejoramiento` | Planes de mejora activos | `coordinador`, `instructor` |
| `POST` | `/planes-mejoramiento` | Crear plan de mejora | `coordinador` |
| `PUT` | `/planes-mejoramiento/{id}/estado` | Actualizar estado del plan | `coordinador` |
