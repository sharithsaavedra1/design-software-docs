# Contrato — notification-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Queue consumida

`notification-dispatch-queue`

## Payload de entrada

```json
{
  "alerta_id": "uuid",
  "destinatario_id": "uuid",
  "canal": "EMAIL | PUSH | SMS",
  "plantilla": "ALERTA_KPI | CONFLICTO_HORARIO | PLAN_MEJORA",
  "datos": {
    "nombre_destinatario": "...",
    "descripcion_alerta": "..."
  }
}
```

## Acción que ejecuta

1. Obtiene datos del destinatario (nombre, email/token) desde `iam-service` o caché local
2. Renderiza el mensaje con la plantilla
3. Envía por el canal indicado (proveedor de email / FCM / SMS gateway)
4. Registra resultado en `notificacion_enviada`
5. Publica `monitoring.notificacion.sent`

## Dead letter queue

`notification-dispatch-queue.dlq` — 3 reintentos antes de DLQ.
