# training-environment-service — Ambientes de formación e inventario

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17
> Autor: Por definir | Equipo: Por definir

## Responsabilidad

Gestiona los ambientes físicos de formación (aulas, laboratorios, talleres), su inventario, mantenimiento y disponibilidad por franja horaria. El servicio de horarios consulta disponibilidad antes de asignar una sesión de clase.

## Bounded context

| Entidad | Descripción |
|---------|-------------|
| `ambiente` | Espacio físico de formación (aula, lab, taller) |
| `tipo_ambiente` | Categoría del ambiente según tipo de formación |
| `elemento_inventario` | Equipo o recurso asociado al ambiente |
| `mantenimiento` | Registro de mantenimiento que bloquea disponibilidad |
| `reserva` | Reserva temporal de un ambiente para un uso específico |
| `disponibilidad_ambiente` | Franjas horarias disponibles por ambiente y día |
| `regla_disponibilidad` | Regla de negocio que define la disponibilidad base |

## Módulo de origen

M3 — Infraestructura, Ambientes e Inventario

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| `iam-service` | auth | Validación de JWT |
| `reference-data-service` | sync | Tipo de ambiente, sede (unidad_institucional) |

## Componentes desplegables

| Componente | Sufijo | Descripción |
|------------|--------|-------------|
| `training-environment-api` | `-api` | REST API: CRUD de ambientes, inventario, mantenimiento, reservas y consulta de disponibilidad |

## Base de datos

- Nombre lógico: `env_db`
- Motor: PostgreSQL
- Nota: la disponibilidad es consultada con alta frecuencia por `scheduling-service` — considerar caché Redis con TTL corto (30 s)

## Links

- Repo: (pendiente)
- Data model: [data-model.md](./data-model.md)
- Eventos: [events.md](./events.md)
- Runbook: [runbook.md](./runbook.md)
- Decisiones internas: [decisions.md](./decisions.md)
