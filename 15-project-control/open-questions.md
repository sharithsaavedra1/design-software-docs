# Preguntas Centrales Abiertas / Temas de Discusión en el Proyecto

A documentar y resolver en las siguientes ceremonias:

### 1. Históricos Sucios vs Lógica Transaccional Limpia Greenfield
- **Pregunta:** ¿Si existen horarios trimestrales armados con Excel con fallos evidentes de horas (Instructores sobrepasados), se va permitir de alguna forma su ingreso de "solo lectura" al archivo histórico del sistema, o el histórico en BD empezará totalmente desde cero (Tabula rasa)?
- **Estado Técnico:** No resuelta (Impacta en gran medida si desarrollamos un bulk load especial para "by-pasar" reglas en data vieja).

### 2. Flexibilidad Contractual
- **Pregunta:** ¿Un Coordinador debe tener alguna facultad secreta (Botón de override tipo "Override Warning") para violar la regla `R-04 Límite de Horas` (ej, dar horas extras a un profesor temporalmente) o la estructura bloqueante expuesta en el `02-domain` del modelo es terminante?
- **Estado Político:** Consultable ante Lideres Académicos. Si existe un Override, debe modelarse como bandera en BD.
