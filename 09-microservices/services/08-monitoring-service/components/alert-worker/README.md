# alert-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-worker` — Consumidor de eventos

## Responsabilidad

Evalúa reglas de alerta configurables sobre los eventos recibidos de otros servicios. Si un evento supera un umbral (ej: tasa de retiro de aprendices > 20 %), genera una `alerta_generada` y la encola para `notification-worker`.

## Contrato

Ver [contract.md](./contract.md)
