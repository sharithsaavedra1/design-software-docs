# actors-service — Instructores, aprendices y empresas

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17
> Autor: Por definir | Equipo: Por definir

## Responsabilidad

Gestiona los actores del proceso formativo: instructores (con sus contratos, competencias y disponibilidad), aprendices (con su matrícula y seguimiento) y empresas (para etapa productiva). Es la fuente de verdad sobre quién es quién en el sistema.

## Bounded context

| Entidad | Descripción |
|---------|-------------|
| `instructor` | Docente del SENA con perfil técnico y pedagógico |
| `aprendiz` | Estudiante matriculado en un programa de formación |
| `empresa` | Empresa patrocinadora o receptora de aprendices en etapa productiva |
| `vinculacion_instructor` | Tipo y vigencia de contrato del instructor |
| `asignacion_competencia` | Competencias que el instructor está habilitado para dictar |
| `bitacora` | Registro de actividades pedagógicas del instructor |
| `etapa_productiva` | Periodo de práctica del aprendiz en empresa |
| `visita_empresa` | Visita de seguimiento del instructor a la empresa |
| `plan_mejoramiento_actor` | Plan de mejora asignado a un instructor o aprendiz |

## Módulo de origen

M7 — Actores (Instructores y Aprendices)

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| `iam-service` | auth | Validación de JWT |
| `academic-management-service` | sync | Consultar competencias válidas al asignar instructor |
| `reference-data-service` | sync | Tipos de contrato, categorías de actor, sede |

## Componentes desplegables

| Componente | Sufijo | Descripción |
|------------|--------|-------------|
| `actors-api` | `-api` | REST API: CRUD de instructores, aprendices, empresas, asignaciones y bitácoras |

## Base de datos

- Nombre lógico: `actors_db`
- Motor: PostgreSQL

## Links

- Repo: (pendiente)
- Data model: [data-model.md](./data-model.md)
- Eventos: [events.md](./events.md)
- Runbook: [runbook.md](./runbook.md)
- Decisiones internas: [decisions.md](./decisions.md)
