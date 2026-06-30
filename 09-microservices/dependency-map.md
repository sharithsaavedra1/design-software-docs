# Mapa de dependencias

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

Muestra las dependencias entre microservicios. Las dependencias síncronas representan acoplamiento fuerte; las asíncronas (eventos) son débilmente acopladas.

## Leyenda

- `→ sync` Llamada REST síncrona (acoplamiento fuerte)
- `⟶ async` Consumo de eventos (acoplamiento débil)
- `→ auth` Solo valida JWT (sin lógica de negocio)

## Dependencias síncronas

```
scheduling-service     → sync  → actors-service            (validar instructor)
scheduling-service     → sync  → training-environment-service (verificar disponibilidad)
scheduling-service     → sync  → academic-management-service  (consultar ficha/competencias)
actors-service         → sync  → academic-management-service  (asignar competencias al instructor)
academic-management-service → sync → reference-data-service  (catálogos de modalidad, jornada)
training-environment-service → sync → reference-data-service (tipo de ambiente, sede)

-- Todos los servicios --
*.service              → auth  → iam-service               (validar JWT)
```

## Dependencias asíncronas (eventos)

```
scheduling-service     ⟶ async → audit-service             (todas las mutaciones)
scheduling-service     ⟶ async → monitoring-service        (sesion.created, conflict.detected)
actors-service         ⟶ async → audit-service
actors-service         ⟶ async → monitoring-service        (instructor.assigned, apprentice.enrolled)
academic-management-service ⟶ async → audit-service
academic-management-service ⟶ async → monitoring-service   (ficha.opened, ficha.closed)
training-environment-service ⟶ async → audit-service
training-environment-service ⟶ async → scheduling-service  (availability.changed)
iam-service            ⟶ async → audit-service             (user.created, role.assigned)
monitoring-service     ⟶ async → audit-service
```

## Regla de dependencias

> Un servicio no puede depender síncronamente de más de **2 servicios** (excluyendo `iam-service`).
> Si se supera ese umbral, revisar si el bounded context está bien definido o si se necesita un read model.

| Servicio | Dependencias síncronas (excl. IAM) | ¿Cumple? |
|----------|-----------------------------------|---------|
| `iam-service` | 0 | ✅ |
| `reference-data-service` | 0 | ✅ |
| `academic-management-service` | 1 (reference-data) | ✅ |
| `training-environment-service` | 1 (reference-data) | ✅ |
| `actors-service` | 1 (academic-management) | ✅ |
| `scheduling-service` | 3 ⚠️ | Ver ADR-002 |
| `document-service` | 0 | ✅ |
| `monitoring-service` | 0 (solo async) | ✅ |
| `audit-service` | 0 (solo async) | ✅ |

> `scheduling-service` supera el límite de 2. La ADR-002 debe definir la estrategia de read models
> para reducir dependencias síncronas en tiempo de creación de horario.
