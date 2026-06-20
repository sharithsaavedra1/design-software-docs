# Observabilidad y Monitoreo del Motor

Debido al peso computacional que genera "recalcular horarios en masa" al inicio de los Trimestres del SENA, el performance debe ser medido de cerca (APM).

## 1. Métricas Clave a Vigilar:
- **Latencia del Endpoint `/validar-y-guardar`:** Si las respuestas de la base de datos empiezan a degradar pasando por arriba de `2s`, es una alerta naranja.
- **Conteo de Errores `409 Conflict`:** No indica un ataque, sino la "eficiencia" operativa de los centros. Si ocurren masivamente todos los días, podría referenciar que el sistema no avisa "disponibilidad visual" rápido y la gente cae en error, o hay un bug en el motor matemático.
- **Memoria RAM del Scheduler Engine:** Especialmente si usamos lógica in-memory.
