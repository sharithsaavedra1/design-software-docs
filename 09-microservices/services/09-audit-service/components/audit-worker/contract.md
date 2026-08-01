# Contrato — audit-worker

> Estado: 🟡 En progreso | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Arquitectura

> **Diseño previsto — no implementado.** Contrato de mensajería, agnóstico de lenguaje.

## Suscripción
Fan-out a **todos** los topics del broker (`#` / wildcard). El worker no filtra por origen: audita todo.

## Envelope de evento consumido (estándar)
```json
{
  "event_id": "uuid",
  "event_type": "<service>.<entity>.<action>",
  "source_service": "scheduling-service",
  "occurred_at": "2026-08-01T14:00:00Z",
  "actor_id": "uuid",
  "entity_type": "class_session",
  "entity_id": "uuid",
  "payload": { }
}
```

## Efecto (persistencia)
Inserta un `audit_record` extrayendo `event_type`, `source_service`, `actor_id`, `entity_type`, `entity_id` y `occurred_at` para indexar, y conserva el `payload` completo como `JSONB` (schema-on-read).

## Reglas
- **Append-only:** solo `INSERT`. Sin `UPDATE`/`DELETE` ni endpoint de escritura externo.
- **Idempotencia:** `event_id` UNIQUE; conflicto → se ignora (no error).
- **Sin FKs:** el registro es autónomo (sink desacoplado entre servicios).

## Errores
Fallo de persistencia → reintento; agotado → DLQ `audit.dlq` (no se pierde el evento).
