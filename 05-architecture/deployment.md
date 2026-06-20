# Estrategia de Despliegue (Deployment)

El sistema Horarios SENA se empaqueta mediante contenedores Docker para ser orquestado en los servicios Cloud de la institución.

## 1. Contenedores y Red
- **API Engine (Backend):** Imágenes inmutables desplegadas en clúster (Ej: Kubernetes / ECS), con escalado automático (Auto Scaling Group) basado en el consumo de CPU, esperando un pico masivo durante la "Semana 1" de programación trimestral.
- **Frontend App:** Balanceada y distribuida mediante un CDN (Content Delivery Network). Los assets estáticos compendiados viven en un Bucket (S3/Blob).
- **Capa de Datos:** PostgreSQL administrado (Paas) para garantizar failovers (réplicas pasivas) de rescate de bases transaccionales, evitando administrar instancias directamente.
