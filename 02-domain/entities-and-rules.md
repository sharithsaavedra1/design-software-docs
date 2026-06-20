# Entidades y Reglas Duras de Negocio (Invariantes)

## Reglas de Validación de Cruces Horarios
El sistema **rechazará la asignación** instantáneamente y sin excepción si ocurre alguna de las siguientes cosas:

- **R-01. Cruce del Instructor:** Un mismo Instructor no puede tener dos asignaciones que coincidan total o parcialmente en la misma fecha y hora, independientemente de la sede.
- **R-02. Cruce de Ambiente:** Un Ambiente físico no puede estar reservado simultáneamente para dos fichas o tareas distintas en un bloque horario coincidente.
- **R-03. Capacidad vs Estudiantes:** (Opcional - Configurable) El sistema alertará si la cantidad de aprendices activos de la Ficha supera la capacidad máxima declarada del Ambiente de Aprendizaje.

## Reglas Contractuales
- **R-04. Límite de Horas Semanales:** La suma del tiempo (en horas) programado para un Instructor asociado a labores directas de formación no puede superar las X horas establecidas en la configuración trimestral de su vinculación. Todas las horas por sobre ese límite, en un periodo, causarán un bloqueo.
