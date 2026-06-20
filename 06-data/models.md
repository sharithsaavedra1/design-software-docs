# Modelo Conceptual de Datos (Information Architecture)

## Estrategias Principales
- **Base de Datos Operativa (OLTP):** Altamente normalizada. Optimizada para las escrituras y las comprobaciones lógicas (evitar los cruces de `instructor_id` y `tiempo`). PostgreSQL es el motor que mejor se adapta gracias a sus extensiones nativas de Rangos de Tiempo (`tsrange`) y operadores de exclusión (`EXCLUDE USING GIST`).
- **Soft Deletes (Borrado Lógico):** Absolutamente ningún registro transaccional en `bloques_programacion` es destruido vía `DELETE FROM` SQL. Todo es cambiado de estado a `CANCELADO` o un flag `is_deleted = true`. Motivo: Retención de registro público disciplinario.
- **Relaciones Débiles Integradas:** Puesto que las Competencias nacen en un currículo central y la tabla del horario las necesita, guardaremos únicamente el ID universal traído del sistema central para evitar la duplicación de extensas mallas curriculares.
