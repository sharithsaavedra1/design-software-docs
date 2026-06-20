# Requisitos Funcionales del Sistema (Epicas)

## 01. Gestión de Seguridad y Acceso
- **RF-01-01 (Autenticación):** El sistema debe permitir el inicio de sesión a usuarios, diferenciando roles.
- **RF-01-02 (RBAC):** Debe existir un Control de Acceso basado en Roles (Ej. `Admin`, `Coordinador_Academico`, `Instructor_Solo_Lectura`).

## 02. Gestión de Catálogos (ABM - Altas, Bajas, Modificaciones)
- **RF-02-01:** La plataforma debe permitir el registro (individual y masivo vía archivo CSV/Excel) del portafolio local de Instructores y sus topes por contrato.
- **RF-02-02:** Debe proveerse interfaces para gestionar Ambientes (Nombre, Sede, Capacidad, Estado).

## 03. Motor Transaccional de Programación (Core)
- **RF-03-01:** La interfaz debe renderizar un calendario (tipo semana) filtrable por Ficha o Instructor y mostrar casillas de tiempo disponibles.
- **RF-03-02:** El usuario con rol idóneo arrastrará o creará un "Evento de Clase", relacionando: Ficha + Instructor + Ambiente + Competencia.
- **RF-03-03 (Trigger de Validación):** Al aplicar el evento anterior, el sistema forzará de forma síncrona el cruce de las invariantes. Si hay conflicto, lo rechazará exponiendo de forma explícita el por qué y sugiriendo la corrección si es posible.
