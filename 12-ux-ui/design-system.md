# Design System: UI/UX Horarios SENA

La interfaz del sistema de programación debe ceñirse tanto a la marca institucional (SENA) como a las necesidades ergonómicas del usuario que usa mouse de computadora por 8 horas.

## 1. Color Palette Institucional
- **Verde Institucional:** `#39A900` (Usado para bloques satisfactoriamente asignados o botones primarios).
- **Oscuro Texto:** `#333333` (Para legibilidad extrema en fuentes).
- **Rojo Peligro:** `#DC3545` (Crucial para delimitar bloques en conflicto horario o Modales 409).

## 2. Componentes Críticos del Dominio
- **Grilla Calendario Interactivo:** Debe usar líneas claras. Los lapsos no mapeados (Ej: hora de almuerzo general) deben mostrarse en estado deshabilitado (grisado).
- **Card (Tarjeta) de Ficha:** La tarjeta "Suelen ser Pequeñas" por cuestiones de espacio. Debe portar solo lo fundamental para el drag-drop: Código, Competencia asocida y Color del Programa.
- **Tipografía:** Accesible y estricta (no decorativa) como `Inter`, `Roboto` o similar acordado por el área UI SENA.
