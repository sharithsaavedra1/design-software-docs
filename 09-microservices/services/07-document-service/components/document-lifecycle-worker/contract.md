# Contrato — document-lifecycle-worker

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-worker` (tarea periódica, no consumidor de cola)

## Frecuencia de ejecución

Diaria — en horario de baja carga (ej: 02:00 a.m.)

## Acciones que ejecuta

| Acción | Condición |
|--------|-----------|
| Marcar como `EXPIRADO` | `documento.created_at < NOW() - política_retención` |
| Mover a cold storage | Documentos `ARCHIVADO` con más de 2 años |
| Limpiar huérfanos | `storage_key` en object storage sin `documento` correspondiente |

## Política de retención

| Tipo de documento | Retención activa | Archivado |
|-------------------|-----------------|-----------|
| Horarios PDF | 2 años | 5 años |
| Constancias | 5 años | 10 años |
| Reportes Excel | 6 meses | 2 años |

> Valores pendientes de confirmar con requisitos legales del SENA.
