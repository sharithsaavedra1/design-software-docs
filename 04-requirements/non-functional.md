# Requisitos No Funcionales (RNF)

## 1. Rendimiento y Escalabilidad
- **RNF-01 (Latencia de Validación):** La comprobación de reglas de negocio en la asignación guiada (drag&drop) no debe tardar más de `1.5 segundos` bajo concurrencia normal, para no interrumpir el flujo visual del Coordinador.
- **RNF-02 (Concurrencia):** El sistema debe soportar un pico de al menos 500 coordinadores académicos a nivel nacional validando y guardando franjas horarias en la primera semana del trimestre.

## 2. Continuidad y Disponibilidad
- **RNF-03 (Uptime):** El sistema transaccional debe garantizar un `99.5%` de disponibilidad durante las franjas operativas de lunes a sábado (6:00 AM - 10:00 PM).

## 3. Seguridad y Auditoría
- **RNF-04 (Trazabilidad):** Cualquier modificación, creación o eliminación en la tabla transaccional de cruces horarios DEBE dejar un log inmutable de auditoría (quién lo hizo, a qué hora, qué recurso se vio afectado).
- **RNF-05 (Integridad):** Los accesos deben ser obligatoriamente sancionados mediante tokens válidos. Ningún endpoint encargado de consultar la base de datos de aprendices y fichas puede ser público.
