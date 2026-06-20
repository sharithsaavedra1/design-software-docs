# Eventos del Dominio (Domain Events)

Lista estandarizada de todos los eventos significativos del pasado (Verbo en participio) donde el dominio transaccional de Horarios notifica a los agregados externos que el estado a cambiado.

## 1. Eventos Críticos Programados

### `BloqueHorarioAsignado`
- **Cuándo:** Cuando el Coordinador suelta un bloque válidamente sobre el frontend y el backend graba el commit en DB.
- **Payload Base:** `fichaId`, `instructorId`, `ambienteId`, `horaInicio`, `horaFin`.
- **Consumidores Locales:** Actualizador del saldo límite de horas semanales para restar el disponible legal del instructor.

### `TrimestreCerrado`
- **Cuándo:** Cuando la semana activa del calendario SENA finaliza de forma administrativa.
- **Payload Base:** `periodoAcademicoId`.
- **Consumidores:** Bloqueador de edición. Las franjas entran en fase de "Solo Lectura Histórica".

### `AlertaCruceConcurrente`
- **Cuándo:** Al recibir un error por conflicto lógico durante un arrastre (Drag&Drop).
- **Consumidores:** Logger de telemetría (Para reportar problemas usabilidad de los coordinadores).
