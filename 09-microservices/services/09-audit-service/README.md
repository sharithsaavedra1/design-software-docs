# audit-service — Auditoría transversal

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17
> Autor: Por definir | Equipo: Por definir

## Responsabilidad

Persiste inmutablemente todos los eventos de mutación del sistema. No tiene lógica de negocio; es un consumidor pasivo. Nunca se le llama síncronamente. El log de auditoría nunca recibe UPDATE ni DELETE.

## Bounded context

| Entidad | Descripción |
|---------|-------------|
| `registro_auditoria` | Evento de cambio con: quién, qué, cuándo, servicio fuente, payload antes/después |

## Módulo de origen

Transversal — sin módulo de dominio directo

## Dependencias

| Servicio | Tipo | Motivo |
|----------|------|--------|
| Todos los servicios | async | Consume sus eventos de mutación |

> Este servicio no tiene dependencias síncronas. Es activado exclusivamente por eventos.

## Componentes desplegables

| Componente | Sufijo | Descripción |
|------------|--------|-------------|
| `audit-worker` | `-worker` | Consume todos los eventos del bus y escribe en `audit_db` (append-only) |

## Base de datos

- Nombre lógico: `audit_db`
- Motor: PostgreSQL
- Regla de integridad: **solo INSERT**. Cualquier UPDATE o DELETE en esta BD es un error de diseño.
- Retención: mínimo 5 años (a confirmar con requisito legal)

## Links

- Repo: (pendiente)
- Data model: [data-model.md](./data-model.md)
- Eventos: [events.md](./events.md)
- Runbook: [runbook.md](./runbook.md)
- Decisiones internas: [decisions.md](./decisions.md)
