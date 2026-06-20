# Historias de Usuario Principales

## US-05: Validación de Cruce de Instructor

**Como** Coordinador Académico,
**Quiero** que el sistema impida asignar a un Instructor si ya está ocupado en ese horario,
**Para** evitar la doble programación que genera conflictos en la operación real del Centro de Formación.

### Criterios de Aceptación:
1. **Dado** que el Instructor "A" tiene asignado el bloque `Lunes de 8:00 AM a 10:00 AM` en el "Ambiente 101".
2. **Cuando** el Coordinador intente arrastrar el nombre del Instructor "A" sobre la franja `Lunes de 9:00 AM a 11:00 AM` para otra Ficha.
3. **Entonces** la plataforma cancelará el arrastre (snap-back).
4. **Y** mostrará un modal rojo indicando: *"Conflicto: El instructor ya se encuentra asignado a la Ficha XYZ durante este lapso temporal"*.

## US-06: Visor Personal de Horario Instructor

**Como** Instructor del SENA,
**Quiero** acceder a un módulo de lectura de mi parrilla semanal,
**Para** saber exactamente en qué sedes, ambientes y a qué fichas debo impartir formación, sin depender de un archivo Excel desactualizado.

### Criterios de Aceptación:
1. El usuario debe tener rol `Instructor`.
2. La parrilla visual no puede ser modificable por este rol.
3. El horario debe reflejar unicamente las franjas que se encuentren en estado `PUBLICADO` por parte coordinación.
