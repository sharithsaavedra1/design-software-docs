# Topología de Entornos (Environments)

Horarios SENA maneja una propagación clásica de 3 ramas/entornos para prevenir modificaciones accidentales de bases de datos operativas.

## 1. Development (DEV)
- **Destino:** Servidor de baja capacidad en la nube institucional.
- **Data:** Datos anónimos (falsos/mock). Los cruces horarios aquí se fuerzan para probar los logs de error de la API.
- **Acceso:** Solo equipo de Ingeniería.

## 2. Staging / UAT (Pre-Producción)
- **Destino:** Servidor clon casi exacto a Producción.
- **Data:** Un "Snapshot" estático de un Centro de Formación Real (ej. CBA Mosquera) anonimizando cédulas de instructores.
- **Acceso:** Coordinadores Académicos (Piloto) para verificar que las reglas Drag & Drop se sienten naturales y matemáticas reales coinciden.

## 3. Production (PROD)
- **Destino:** Clúster principal de producción.
- **Data:** 100% Viva, sincronizada con SOFIA Plus.
- **Acceso:** Todo SENA (Coordinadores, Instructores y Administradores).
