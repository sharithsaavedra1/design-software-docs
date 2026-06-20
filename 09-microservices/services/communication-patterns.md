# Patrones de Comunicación Interna

En un ambiente donde Horarios SENA funciona modularmente, la comunicación de red tiene las siguientes reglas estrictas:

## 1. REST Sincrónico (Flujos Críticos Reversibles)
La creación de un bloque horario es **Síncrona**. El Frontend manda la petición y la API principal interroga (mediante RPC o conexión BD interna) si el instructor está disponible.
- *Justificación:* No podemos usar mensajería asíncrona aquí, porque si permitimos la creación y luego "eventualmente descubrimos" que había un cruce, causamos caos administrativo. El operador requiere la confirmación Inmediata de éxito y el bloqueo frontal `409` si falla.

## 2. Eventos Asíncronos (Flujos Finales / Notificaciones)
Una vez que el Coordinador da clic en el botón "Publicar Trimestre a Centro", la API dispara un evento asíncrono (RabbitMQ o Kafka).
- **Evento emitido:** `HorarioTrimestre.Publicado { ficha_id, periodo_id }`
- **Suscriptor 1:** Microservicio de Notificaciones.
- **Acción:** Encontrar todos los instructores asociados y disparar un correo pasivo "Su horario para el siguiente periodo ya está vigente".
