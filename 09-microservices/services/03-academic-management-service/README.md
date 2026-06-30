# academic-management-service — Programas de formación y fichas

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17
> Autor: Por definir | Equipo: Por definir

## Responsabilidad

Gestiona la estructura curricular del SENA (líneas, redes, programas, competencias, RAPs) y los grupos de formación (fichas de caracterización y ofertas). Es la fuente de verdad sobre qué se enseña; el servicio de horarios consulta esta información para construir asignaciones válidas.

## Bounded context

| Entidad | Descripción |
|---------|-------------|
| `linea_tecnologica` | Agrupación sectorial de mayor nivel |
| `red_tecnologica` | Red de conocimiento sectorial |
| `red_conocimiento` | Red de conocimiento específica |
| `programa_formacion` | Programa (técnico, tecnólogo, complementario) |
| `competencia` | Competencia laboral del programa |
| `resultado_aprendizaje` | RAP: resultado de aprendizaje de una competencia |
| `ficha_caracterizacion` | Grupo de aprendices asignados a un programa y jornada |
| `oferta_formacion` | Oferta de un programa en un centro para un periodo |

## Módulo de origen

M5 — Programas de Formación + M6 — Oferta y Fichas

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| `iam-service` | auth | Validación de JWT |
| `reference-data-service` | sync | Catálogos de modalidad, jornada, nivel de formación, sede |

## Componentes desplegables

| Componente | Sufijo | Descripción |
|------------|--------|-------------|
| `academic-management-api` | `-api` | REST API: CRUD de programas, competencias, RAPs, fichas y ofertas |

## Base de datos

- Nombre lógico: `academic_db`
- Motor: PostgreSQL

## Links

- Repo: (pendiente)
- Data model: [data-model.md](./data-model.md)
- Eventos: [events.md](./events.md)
- Runbook: [runbook.md](./runbook.md)
- Decisiones internas: [decisions.md](./decisions.md)
