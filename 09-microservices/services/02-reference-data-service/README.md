# reference-data-service — Catálogos institucionales y parámetros del sistema

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17
> Autor: Por definir | Equipo: Por definir

## Responsabilidad

Provee la jerarquía institucional del SENA (Macroregión → Centro de Formación → Unidad Institucional) y los catálogos maestros del sistema (modalidades, jornadas, tipos, estados, parámetros). Es el servicio de solo-lectura más consultado; ningún otro servicio escribe en sus tablas.

## Bounded context

| Entidad | Descripción |
|---------|-------------|
| `macroregion` | Agrupación geográfica de mayor nivel |
| `microregion` | División intermedia de la macroregión |
| `departamento` | División político-administrativa |
| `municipio` | Municipio donde opera el SENA |
| `centro_formacion` | Centro de formación SENA |
| `unidad_institucional` | Sede o unidad dentro del centro |
| `catalogo` | Categoría de catálogo (ej: modalidad, jornada, tipo_ambiente) |
| `catalogo_detalle` | Valor concreto del catálogo (ej: Presencial, Nocturna) |
| `estado` | Estados posibles de entidades del sistema |
| `parametro` | Configuración del sistema por clave-valor |
| `error_sistema` | Códigos y mensajes de error estandarizados |

## Módulo de origen

M2 — Estructura Institucional + M4 — Parametrización y Catálogos Base

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| `iam-service` | auth | Validación de JWT en operaciones de escritura |

## Componentes desplegables

| Componente | Sufijo | Descripción |
|------------|--------|-------------|
| `reference-data-api` | `-api` | REST API: consulta y administración de catálogos, jerarquía institucional y parámetros |

## Base de datos

- Nombre lógico: `ref_db`
- Motor: PostgreSQL
- Nota: alta frecuencia de lectura — candidato a Redis como caché con TTL de 10 min

## Links

- Repo: (pendiente)
- Data model: [data-model.md](./data-model.md)
- Eventos: [events.md](./events.md)
- Runbook: [runbook.md](./runbook.md)
- Decisiones internas: [decisions.md](./decisions.md)
