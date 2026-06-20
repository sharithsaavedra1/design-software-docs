# Estrategia de Autenticación de APIS

## 1. Patrón JWT (JSON Web Tokens)
Toda solicitud hacia los endpoints protegidos bajo la ruta `/api/v1/horarios/*` deberá portar un Token JWT válido usando la cabecera `Authorization: Bearer [TOKEN]`. Si el token expira o está comprometido, se emitirá una respuesta `401 Unauthorized` de inmediato.

## 2. Estructura de "Claims"
Aprobación del payload interno del JWT generado tras el inicio de sesión. Exige identificar los límites de acciones del portador:

```json
{
  "sub": "2304958", 
  "email": "coordinacion_cba@sena.edu.co",
  "name": "Juan Perez",
  "centro_formacion_id": "CBA-MOSQUERA", 
  "roles": ["COORDINADOR_ACADEMICO"],
  "exp": 1729094042
}
```
> **Decisión Arquitectónica:** Inyectar el id del centro de formación (`centro_formacion_id`) dentro del token ahorra cruces con la base de datos de seguridad en la nube, ya que a los Coordinadores solo se les permite alterar horarios que correspondan exclusivamente a su jurisdicción.
