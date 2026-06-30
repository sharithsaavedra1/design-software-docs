# Contrato — conflict-validator-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-worker`

## Topic / Queue consumido

`scheduling-conflict-validation-queue`

## Payload de entrada

```json
{
  "event_type": "scheduling.horario.published",
  "payload": {
    "horario_id": "uuid",
    "ficha_id": "uuid",
    "periodo": "2026-1"
  }
}
```

## Acción que ejecuta

1. Carga todas las sesiones del horario publicado
2. Verifica conflictos contra todos los horarios publicados del mismo periodo
3. Registra conflictos encontrados en `conflicto_detectado`
4. Si hay conflictos: publica `scheduling.conflict.detected` por cada uno

## Dead letter queue

`scheduling-conflict-validation-queue.dlq` — mensajes fallidos después de 3 reintentos.
