# Configuración de Entorno Local

Para evitar la clásica frase de "en mi máquina sí funciona", Horarios SENA se apoya en contenedores para su ecosistema de datos.

## Prerrequisitos
- Docker Engine & Docker Compose
- NodeJS v20+ o Java JDK 17+ (Dependiendo del stack seleccionado).
- Variables de Entorno `.env` clonadas desde `.env.example`.

## Pasos de Inicialización
1. **Levantar base de datos:**
   Abre una terminal en la raíz y ejecuta:
   `docker-compose up -d`
   *(Esto levantará un PostgreSQL con la zona horaria `America/Bogota` preconfigurada y una instancia de Redis).*
2. **Semillas (Seeds):**
   Ejecutar el script de inicialización para inyectar los catálogos en blanco de 10 Instructores y 5 Ambientes de Aprendizaje falsos.
3. **Levantar el Engine:** Ejecutar y apuntar el Backend a puerto `8080` local.
