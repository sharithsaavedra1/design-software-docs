# Dependencias del Proyecto

El sistema Horarios SENA no es un castillo en la cima aislado. Requiere para el cumplimiento de sus objetivos (RF y RNF):

1. **API o Dumps Actualizados (SOFIA Plus):** Horarios asume que la oferta educativa, currículos base de Ficha y programas le serán administrados por el ERP central. Si esto falla, Horarios será una carcasa inútil.
2. **Proveedor Institucional de Identidad:** La delegación de Roles (saber si un Juan Pérez verdaderamente es Coordinador habilitado de Sede X).
3. **Plataforma Cloud SENA:** Requisito de infraestructura robusta, bases de datos PostgreSQL provisionadas e instaladas con backup de volumen garantizado.
