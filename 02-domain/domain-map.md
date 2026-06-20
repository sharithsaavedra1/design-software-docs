# Mapa de Dominios (Bounded Contexts)

Para evitar un sistema monolítico completamente enredado, el sistema Horarios SENA dividirá conceptualmente sus lógicas de negocio en los siguientes contextos:

## 1. Contexto de Gestión de Recursos (Resources Context)
- **Responsabilidad:** Administrar el estado, perfilamiento y la disponibilidad estática.
- **Conceptos:** Instructores (Perfil y Contrato) y Ambientes de Aprendizaje (Capacidad, especialidad, sedes).

## 2. Contexto de Programación Académica (Scheduling Context) [CORE DOMAIN]
- **Responsabilidad:** Ensamblar los recursos en franjas temporales para cumplir requisitos de una Ficha. Ejecutar el "Motor de Reglas".
- **Conceptos:** Asignación Horaria, Fichas en ejecución, Bloques Temporales, Validaciones (Cruce de Instructores o Ambientes).

## 3. Contexto Estructural (Academic Master Data Context)
- **Responsabilidad:** Mantener la jerarquía del diseño curricular.
- **Conceptos:** Programas de Formación, Competencias, Resultados de Aprendizaje. Aquí no opera el horario, solo se provee el mapa de qué debe cursar una Ficha.
