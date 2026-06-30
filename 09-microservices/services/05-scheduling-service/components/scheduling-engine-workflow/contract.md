# Contrato — scheduling-engine-workflow

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

## Tipo de componente

`-workflow`

## Input

Disparado por `schedules-api` al crear o asistir un horario:

```json
{
  "workflow_id": "uuid-v4",
  "horario_id": "uuid",
  "ficha_id": "uuid",
  "periodo": "2026-1",
  "opciones": {
    "preferir_instructor_titular": true,
    "respetar_disponibilidad_existente": true
  }
}
```

## Output

```json
{
  "workflow_id": "uuid-v4",
  "estado": "COMPLETADO | FALLIDO | PARCIAL",
  "sesiones_creadas": 18,
  "conflictos_detectados": 2,
  "sesiones": [
    {
      "sesion_id": "uuid",
      "competencia_id": "uuid",
      "instructor_id": "uuid",
      "ambiente_id": "uuid",
      "dia_semana": 1,
      "hora_inicio": "07:00",
      "hora_fin": "10:00"
    }
  ],
  "conflictos": [
    {
      "tipo": "INSTRUCTOR_DOBLE",
      "descripcion": "Instructor asignado en otra ficha en el mismo bloque"
    }
  ]
}
```

## Timeouts

| Step | Timeout |
|------|---------|
| Consulta de disponibilidad (actors) | 5 s |
| Consulta de disponibilidad (environments) | 5 s |
| Total del workflow | 30 s |
