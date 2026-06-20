# Vista Arquitectónica General (Overview)

Horarios SENA es una plataforma C/S (Client-Server) transaccional. Su arquitectura prioriza la **Consistencia Fuerte** por encima de la disponibilidad extrema, dado que no podemos bajo ninguna circunstancia emitir un solapamiento en el contrato de un instructor.

## 1. Topología Core
- **Frontend:** SPA (Single Page Application) basada en componentes Web para la renderización optimizada de la "Grilla de Calendario", con manipulación del DOM virtual pesado para arrastrar franjas (HTML5 Drag & Drop).
- **Backend:** Capa de APIs stateless que validan de forma síncrona los eventos contra el motor de base de datos antes de confirmar la escritura.
- **Base de Datos:** RDBMS (PostgreSQL) para beneficiarse de sus transacciones ACID y control concurrente Multiversión (MVCC). 

*(Nota: En versiones futuras, la capa monolítica lógica puede transicionar a microservicios según lo dicta el directorio `09-microservices`, dependiendo del volumen transaccional de los Centros).*
