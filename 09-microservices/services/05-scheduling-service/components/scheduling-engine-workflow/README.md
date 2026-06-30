# scheduling-engine-workflow

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-workflow` — Orquestación de pasos con compensaciones

## Responsabilidad

Orquesta la creación asistida de un horario: consulta disponibilidades, propone asignaciones instructor+ambiente+franja para cada competencia de la ficha, detecta conflictos y permite al coordinador aprobar o ajustar. Es el núcleo lógico del sistema de horarios.

## Pasos del workflow

| # | Step | Tipo | Compensación si falla |
|---|------|------|----------------------|
| 1 | Cargar ficha y competencias | sync | — |
| 2 | Consultar disponibilidad de instructores | sync | Marcar step fallido; retornar error |
| 3 | Consultar disponibilidad de ambientes | sync | Marcar step fallido; retornar error |
| 4 | Proponer asignaciones | in-memory | — |
| 5 | Detectar conflictos en la propuesta | in-memory | — |
| 6 | Persistir sesiones en borrador | transactional | Rollback de todas las sesiones creadas |
| 7 | Publicar evento `scheduling.sesion_clase.created` | async | Log de evento no publicado; reintentar |

## Tecnologías

| Aspecto | Decisión |
|---------|---------|
| Motor de workflow | Por definir — ver ADR-001 |
| Persistencia de estado | Por definir según motor elegido |

## Contrato

Ver [contract.md](./contract.md)
