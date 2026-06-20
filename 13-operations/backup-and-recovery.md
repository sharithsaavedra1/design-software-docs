# Estrategia de Backup y Recuperación (Disaster Recovery)

Si la base de datos transaccional de Horarios SENA desaparece, el impacto directo se materializaría en las aulas reales.

1. **Snapshots de la BD Transaccional:** Diarios, con retención mínima en caliente de 1 mes e histórico en frio (Storage en la nube) de 1 año.
2. **Inmutabilidad (Event Sourcing Suave):** Debido a que todo cambio lleva la marca de (`is_deleted` vs real delete), las tablas a salvar como crudos no deben ser afectadas en borrado masivo por accidente. 
3. **RTO / RPO Target:** Las tablas maestras (Instructores, Ambientes) vienen de SOFIA, son recuperables sincronizando API. Pero la tabla local `bloques_programacion` creada explícitamente arrastrando a nivel usuario tiene un objetivo de No-Pérdida superior a 12 horas.
