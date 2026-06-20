# Estrategia de Testing (Pruebas Automatizadas)

Dada la naturaleza crítica ("dinero y contratos") de Horarios SENA, no se dependerá unicamente de tests manuales Q/A.

## 1. Pruebas Unitarias Estrictas (Motor de Horarios)
El archivo/servicio abstracto encargado de validar `(fechaInicio, fechaFin, instructorId, ambienteId)` se testeará vía TDD:
- **Test Invariante A:** Proveer 2 fechas solapadas para el mismo Instructor -> `Assert Expect(ConflictError)`.
- **Test Invariante B:** Proveer un arrastre de franja válida (ej. Bloque de 2h en una tarde libre) -> `Assert Expect(Success)`.
- Cobertura deseada de esta lógica: **95%+**.

## 2. Pruebas End-to-End (E2E Front)
Se utilizará Cypress o Playwright específicamente en la "Bandeja de Programación".
- Simular el inicio de sesión como Coordinador.
- Simular un arrastre (Drag) del bloque desde el listado izquierdo y soltarlo (Drop) el jueves a las 10:00 AM.
- Validar aserción del color HTML (ej. Verde si asignó, Modal Rojo si falló).
