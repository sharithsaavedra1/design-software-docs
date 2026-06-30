# scheduling-service — Motor de horarios

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17
> Autor: Por definir | Equipo: Por definir

## Responsabilidad

Crea, valida y publica los horarios académicos del SENA. Asigna instructor + ambiente + franja horaria a cada sesión de clase de una ficha, detectando conflictos en tiempo real. Es el core del proyecto — el resto de servicios lo alimentan o lo consumen.

## Bounded context

| Entidad | Descripción |
|---------|-------------|
| `horario` | Horario completo de una ficha para un periodo |
| `sesion_clase` | Sesión individual: competencia + instructor + ambiente + franja |
| `franja_horaria` | Bloque de tiempo (ej: Lunes 7:00-10:00) |
| `asignacion_instructor_horario` | Relación instructor ↔ sesión en el horario |
| `conflicto_detectado` | Conflicto registrado durante la creación (instructor doble, ambiente ocupado) |

## Módulo de origen

M8 — Horarios

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| `iam-service` | auth | Validación de JWT |
| `actors-service` | sync | Verificar disponibilidad e idoneidad del instructor |
| `training-environment-service` | sync | Verificar disponibilidad del ambiente en la franja |
| `academic-management-service` | sync | Consultar ficha, competencias y RAPs a programar |

> ⚠️ Este servicio supera el límite de 2 dependencias síncronas. Ver ADR-002 para la estrategia de read models.

## Componentes desplegables

| Componente | Sufijo | Descripción |
|------------|--------|-------------|
| `schedules-api` | `-api` | REST API: CRUD de horarios, consulta de sesiones, publicación |
| `scheduling-engine-workflow` | `-workflow` | Orquestación: recibe solicitud → consulta disponibilidades → crea sesiones → detecta conflictos |
| `conflict-validator-worker` | `-worker` | Valida conflictos de forma asíncrona al publicar un horario masivo |

## Base de datos

- Nombre lógico: `scheduling_db`
- Motor: PostgreSQL
- Nota: requiere consistencia fuerte (no eventual) para la asignación de franjas

## Links

- Repo: (pendiente)
- Data model: [data-model.md](./data-model.md)
- Eventos: [events.md](./events.md)
- Runbook: [runbook.md](./runbook.md)
- Decisiones internas: [decisions.md](./decisions.md)
