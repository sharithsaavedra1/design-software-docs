# Matriz de Riesgos (Risk Management)

| ID | Riesgo Descrito | Probabilidad | Impacto | Estrategia Mitigación |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Dependencia de Integración externa.** Que la API puente desde SOFIA cambie el ID canónico o se caiga durante un periodo fuerte, dejando el Front vacío. | Media | Alto | Tener vía alterna estandarizada de importación de Maestros por Archivo CSV, operable localmente por Administradores. |
| **R-02** | **Degradación Performance Motor D&D.** Hacer un drag & drop puede ser infernalmente lento si las latencias de lectura e interfaz bloquean el main thread mientras espera el `409` del server. | Alta | Medio | Aplicaciones React/Angular robustas aplicando optimistic UI suave, pero revirtiendo limpiamente sin redibujar toda la app y solo el componente involucrado. |
| **R-03** | **Rechazo al Cambio Operativo.** Coordinadores muy encarecidos a sus hojas tradicionales de Excel y que eviten poblar el módulo argumentando falta de versatilidad. | Media | Alto | Demostración visual de la enorme ventaja en evitar citaciones por cruces contractuales laborales. |
