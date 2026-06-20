# Plan de Manejo de Incidentes Operativos

Escenarios proyectados de desastre natural para el sistema de asignación de Horarios SENA.

### Incidente 01: El Motor Transaccional Lanza `500 Internal Error` masivos al iniciar Trimestre.
- **Síntoma:** Los coordinadores no pueden arrastrar horarios. Se caen las validaciones matemáticas.
- **Acción Inmediata (Mitigación):** Desacoplar la petición y habilitar el caché si es una carga de solo lectura. Si es falla in-memory de base de datos (`Deadlocks` por peticiones paralelas masivas de varios centros a la vez), frenar las peticiones masivas mediante throttling / debouncing en la API.

### Incidente 02: Corrupción de Cruces (El sistema permitió cruzar horas).
- **Síntoma:** El reporte de un instructor muestra que debe impartir en Aula A y Auditorio B simultáneamente a las 08:00 AM del martes.
- **Gravedad:** Crítica (Afecta contratos e integridad del modelo fundamental).
- **Acción:** Retirar inmediatamente (despublicar) el Trimestre del área afectada. Recuperar auditoría transaccional e inyectar hotfix al motor lógico antes de permitir reanudación de trabajos.
