# audit-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-worker` — Consumidor de eventos (append-only)

## Responsabilidad

Consume todos los eventos del bus y los persiste en `audit_db` de forma inmutable. No ejecuta lógica de negocio. El único criterio de éxito es que cada evento quede registrado exactamente una vez.

## Contrato

Ver [contract.md](./contract.md)
