# Backlog Técnico (Deuda Técnica y Mejoras Cimientos)

*(Tareas que los arquitectos y seniors resolverán para mejorar operabilidad del modelo y que a simple vista no importan al stakeholder final).*

- [ ] **TBACK-01:** Migrar el algoritmo actual de "Triple For-Loop" para Validación de Cruce de Tiempo (si estuviese en memoria) usando extensiones GiST/SP-GiST con el operador temporal `&&` a nivel directo de PostgreSQL. (Vitalísimo para escalabilidad masiva).
- [ ] **TBACK-02:** Desacoplar el servicio de Autenticación de un Login Estándar JWT simple y engancharlo contra la federación de identidades OAUTH institucional futura del SENA para hacer Single Sign-On (Evitando contraseñas en plano en el sistema).
- [ ] **TBACK-03:** Refinamiento visual para que los componentes UI del grid sean ligeros al scroll infinito en la carga del Coordinador mensual.
