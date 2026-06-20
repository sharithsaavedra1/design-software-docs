# Estrategia de Migración y Carga de Datos

Implementar Horarios SENA requiere un puente entre las plataformas actuales o legadas (SOFIA Plus) y nuestra nueva base relacional optimizada para consultas de validación.

## 1. Carga Inicial (Semilla y Maestros)
La base de datos requiere catálogos fijos para funcionar:
- **Origen:** Vistas materializadas extraídas desde SOFIA Plus.
- **Mecanismo:** El Frontend facilitará una importación por `.CSV` estandarizado como contingencia a la API, donde el área de Sistemas de cada Centro podrá subir:
  - Archivo 1: `Instructores_Centro_202X.csv`
  - Archivo 2: `Ambientes_Centro_202X.csv`
  - Archivo 3: `Fichas_Activas_202X.csv`

## 2. Migración Transaccional
Dado que actualmente gran parte de los horarios residen en hojas cálculo sueltas (Excel):
- **Estrategia:** *Arranque en limpio (Greenfield)*. No intentaremos migrar historiales pasados fallidos o llenos de conflictos desde los Excels a la nueva BD, puesto que romperían dramáticamente las reglas estrictas configuradas en `entities-and-rules.md`.
- El sistema empezará en "Borrador de Inicio de Trimestre" exigiendo que los coordinadores carguen los bloques directamente en la interfaz.
