# Decisiones Arquitectónicas Transversales (Cross-Cutting Concerns)

## 1. Patrón de Manejo de Excepciones
Toda excepción no controlada en el núcleo de procesamiento será encapsulada antes de enviarse al usuario para no exponer información interna (Stracktraces, SQL syntax).
Todas las validaciones del "Motor de Reglas de Horarios" devolverán una respuesta semántica estandarizada en formato JSON, independientemente de si la API que lo emite es REST o GraphQL.

## 2. Trazabilidad Distribuida (Logs)
1. **Formato:** JSON estructurado en todos los logs de aplicación.
2. **Identificador:** Todo request HTTP que entre al orquestador para guardar un Horario deberá tener inyectado un `Correlation-ID` en el header, permitiendo rastrear el viaje de esa transacción en los registros.
3. **Eventos Críticos (Auditoría):** Cualquier persistencia física en la tabla fundamental `bloques_horarios` desencadenará asíncronamente el guardado de un log a largo plazo.

## 3. Caché de catálogos
Para mejorar los tiempos de carga en los calendarios (Listas desplegables de Ambientes e Instructores), se aplicará caché in-memory o vía Redis, con un TTL largo de 12 horas, ya que los recintos y plantas dadas no cambian frecuentemente durante el día operativo normal de un Centro SENA a menos que haya carga masiva.
