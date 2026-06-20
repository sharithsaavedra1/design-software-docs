# Inventario de Servicios (Service Catalog)

En el caso de estructurarse como componentes distribuidos, Horarios SENA expone las siguientes barreras:

## 1. `horarios-master-api` 
- **Responsabilidad:** Gestionar CRUD avanzado sobre `Instructores`, `Ambientes` y `Programas Curriculares`.
- **Naturaleza:** Sistema de baja variabilidad y alto caché de lectura. Expone endpoints `/api/v1/instructores/*`.

## 2. `horarios-engine-api` 
- **Responsabilidad:** El corazón matemático. Es la API que recibe la petición REST de `Crear Bloque`. Contacta a la BD para efectuar comprobaciones estrictas de reglas temporales.
- **Naturaleza:** Alta intensidad transaccional; requiere optimización estricta por índice. Expone `POST /api/v1/programacion/validar-y-guardar`.

## 3. `horarios-reporting-service` (Opcional Futuro)
- **Responsabilidad:** Extracción consolidada asíncrona de reportes trimestrales y auditorías en XLSX/PDF.
