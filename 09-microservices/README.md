# 09-Microservices / Orientación Modular

Estructura de distribución técnica para los despliegues del sistema y catálogos de componentes.

## Directorios y Estructura

- **`_template/`**: Contiene la plantilla base para homologar la documentación de cualquier microservicio futuro.
  - `README.md`, `api-contract.md`, `data-model.md`, `events.md`, `runbook.md`

- **`services/`**: Directorio donde residen los servicios vivos.
  - [`README.md`](./services/README.md): Index general de los servicios.
  - [`service-catalog.md`](./services/service-catalog.md): Catálogo de MS.
  - [`communication-patterns.md`](./services/communication-patterns.md): Patrones de mensajería síncrona.
