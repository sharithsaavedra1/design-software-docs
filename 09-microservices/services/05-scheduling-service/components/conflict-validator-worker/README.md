# conflict-validator-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-worker` — Consumidor de cola

## Responsabilidad

Valida conflictos de forma asíncrona al publicar un horario masivo. Cuando se publican muchos horarios simultáneamente (inicio de semestre), la validación en tiempo real sería muy costosa; este worker la ejecuta en segundo plano y genera alertas si encuentra conflictos post-publicación.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Cola | (pendiente — ver ADR-001) |
| BD | PostgreSQL — `scheduling_db` |

## Contrato

Ver [contract.md](./contract.md)
