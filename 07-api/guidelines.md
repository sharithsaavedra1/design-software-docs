# API Design Guidelines

## 1. Estándar de Comunicación
Nuestra API se adhiere a un estándar RESTful semántico priorizando el formato JSON `application/json`. Todas las URLs deben de indicar obligatoriamente la versión de operación (Ej: `/api/v1/...`).

## 2. Tipificación de Respuestas de Dominio (Vital)
Para el *Motor de Reglas*, la API no debe tratar una ruptura lógica como una "Excepción Ténica" (500). Es un Flujo de Negocio.

**Caso: Conflicto en Horario `HTTP 409 Conflict`:**
```json
{
  "status": 409,
  "code": "SCHEDULE_CONFLICT_INSTRUCTOR",
  "message": "Operación rechazada. El recurso solicitado presenta un cruce en su franja horaria.",
  "incident_details": {
    "type": "Instructor",
    "reference_id": "9087564",
    "overlap_start_time": "2026-06-25T08:00:00Z",
    "overlap_end_time": "2026-06-25T11:00:00Z"
  }
}
```
*Gracias a este formato único, la aplicación Frontend de Coordinación podrá ubicar el puntero del mouse rojo sobre la franja donde existe el problema en lugar de que el sistema se rompa.*

## 3. Paginación Sistemática
Catálogos de miles de registros como "Fichas a Nivel Nacional" o "Instructores" no se pedirán libremente.
Mandatorio `?page=1&size=50` en todos los métodos de consulta `GET` de listas masivas.
