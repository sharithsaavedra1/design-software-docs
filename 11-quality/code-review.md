# Lineamientos de Revisión de Código (Code Review)

Nadie implementará lógica que apruebe empujar código a `main/master` directamente en Horarios SENA.

## Criterios Clave del Revisor:
1. **Lógica Matemática Temporizada:** Analizar si el Pull Request introduce ciclos anidados `For` sobre miles de bloques horarios en memoria RAM, que podrían tumbar el servidor. Si ocurre, exigir su paso como sentencia SQL optimizada nativa.
2. **Validación de Identidad:** Verificar que cualquier mutación a tabla transaccional traiga asociado el ID válido del Coordinador (evitar huecos de auditoría).
3. **Nombres Declarativos:** Variables como `let b = false` serán rechazados y reemplazados por `let isProfesorOcupado = false`.
