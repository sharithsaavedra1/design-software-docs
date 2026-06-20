# Diccionario de Datos

Este es un extracto estructural de la base de datos principal, documentando el motor transaccional.

## Tabla: `bloques_programacion`
El núcleo del gestor de Horarios.

| Campo | Tipo SQL | Llave | Nulable | Descripción/Regla Negocio |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `UUID` | PK | NO | Identificador único del bloque. |
| `id_ficha` | `UUID` | FK | NO | Agrupación de aprendices. |
| `id_instructor`| `UUID` | FK | NO | Quién imparte. *No puede cursar 2 bloques solapados.* |
| `id_ambiente` | `UUID` | FK | NO | Lugar. *No puede cursar 2 bloques solapados.* |
| `id_competencia`| `UUID` | FK | NO | Qué se va a enseñar (Malla Curricular). |
| `fecha_inicio` | `TIMESTAMP`| IDX | NO | Fecha y hora exacta de inicio. |
| `fecha_fin` | `TIMESTAMP`| IDX | NO | Fecha y hora exacta de términación. |
| `estado` | `VARCHAR(15)`| - | NO | `BORRADOR` | `PUBLICADO` | `CANCELADO` |
| `audit_created_by`| `VARCHAR(20)`| - | NO | Usuario SOFIA del coordinador que originó el registro. |

## Tabla: `maestro_instructores`
| Campo | Tipo SQL | Llave | Nulable | Descripción/Regla Negocio |
| :--- | :--- | :---: | :---: | :--- |
| `nro_documento`| `VARCHAR(20)`| PK | NO | Cédula. |
| `tipo_contrato`| `VARCHAR(20)`| - | NO | `PLANTA`, `CONTRATISTA`. |
| `limite_horas_sem`| `INT` | - | NO | Base matemática que gatillará la regla de superación de tiempos. |
