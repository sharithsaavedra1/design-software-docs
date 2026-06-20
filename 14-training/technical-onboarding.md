# Guía de Onboarding para Nuevos Desarrolladores

Bienvenido al repositorio de Horarios SENA. Antes de tocar una línea de código, necesitas interiorizar esto:

1. **Las Reglas del Negocio NO se Negocian:** Si no entiendes qué es un Trimestre, una Ficha o por qué un Instructor no puede tener 40 horas en este sistema, detente y lee `/01-context/glossary.md` y `/02-domain/entities-and-rules.md`.
2. **Cómo compilar localmente:** Ve a `/10-devops/local-setup.md` para emular el flujo con contenedores Docker.
3. **El Motor es nuestro Núcleo:** Gran parte de la aplicación sirve simplemente como visor y editor de CRUDs que envían el Request final al servicio de "Validación de Horarios". Aquí reside el valor del código. Todo cruce (overlap) de fecha, hora e id de ambiente debe ser capturado ahí.
