<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: inventario maestro de pantallas del mockup (2 lentes: experiencia y build/MFE)
fase: diseño (UX/UI)
estado: draft
dependencias_entrada: mockup-ddd/flows/*.md; micro-frontends.md
consumidores_siguientes: generación del mockup (por pantalla), construcción del frontend (por MFE)
tldr: Índice único de las ~45 pantallas/modales, mapeadas a su MFE dueño, rol y estado de generación. Doble lente: por flujo (experiencia) y por micro-frontend (build).
decisiones_clave: la unidad de experiencia es el flujo; la unidad de build es el MFE; el detalle por pantalla (endpoint/HU/tabla) vive en flows/*.md
halts_registrados: ninguno
-->

# Inventario maestro de pantallas del mockup

> **ESTADO: PRELIMINAR (v0).** 45 pantallas/modales. El detalle de cada una (endpoints, campos,
> layout, PROMPT STITCH, HU) está en su archivo de `flows/`. Aquí: el índice + MFE dueño + estado.

**Leyenda estado:** ✅ generado (mockup hecho) · ⬜ pendiente de generar.

## Lente 1 — por FLUJO (experiencia)

### 01-auth (transversal)
| # | Pantalla | Rol | MFE | Estado |
|---|---|---|---|:--:|
| 1 | Login | anónimo | iam-mfe | ✅ |
| 2 | Recuperar contraseña | anónimo | iam-mfe | ⬜ |
| 3 | Nueva contraseña (reset) | anónimo | iam-mfe | ⬜ |
| 4 | App Shell (marco por rol) | todos | shell-host | ✅ |
| 5 | Panel de notificaciones (campana) | todos | shell-host + monitoring-mfe | ⬜ |
| 6 | Estados globales (403/404/500/sesión) | todos | shell-host | ⬜ |

### 02-coordinador (núcleo)
| # | Pantalla | Tipo | MFE | Estado |
|---|---|---|---|:--:|
| 1 | Dashboard / Inicio | pantalla | shell-host + scheduling + academic | ✅ |
| 2 | Horarios (lista) | lista | scheduling-mfe | ✅ |
| 3 | Detalle de horario | detalle | scheduling-mfe | ⬜ |
| 4 | Crear / editar horario | form | scheduling-mfe | ⬜ |
| 5 | Modal: Agregar/editar sesión | modal | scheduling-mfe | ⬜ |
| 6 | Modal: Confirmar publicación | modal | scheduling-mfe | ⬜ |
| 7 | Panel de conflictos | lista | scheduling-mfe | ⬜ |
| 8 | Modal: Resolver conflicto | modal | scheduling-mfe | ⬜ |
| 9 | Disponibilidad | consulta | environment-mfe + actors-mfe | ⬜ |
| 10 | Detalle de ambiente / disponibilidad | detalle | environment-mfe | ⬜ |
| 11 | Fichas | lista | academic-mfe | ⬜ |
| 12 | Detalle de ficha | detalle | academic-mfe | ⬜ |

### 03-instructor
| # | Pantalla | Tipo | MFE | Estado |
|---|---|---|---|:--:|
| 1 | Mi horario (semana) | calendario | scheduling-mfe | ⬜ |
| 2 | Detalle de sesión | detalle | scheduling-mfe | ⬜ |
| 3 | Mi disponibilidad | lista | actors-mfe | ⬜ |
| 4 | Modal: Crear excepción de disponibilidad | modal/form | actors-mfe | ⬜ |
| 5 | Seguimiento de ficha | lista | monitoring-mfe | ⬜ |
| 6 | Form: Registrar seguimiento | form | monitoring-mfe | ⬜ |

### 04-aprendiz (mobile-first)
| # | Pantalla | Tipo | MFE | Estado |
|---|---|---|---|:--:|
| 1 | Mi horario (semana) | calendario | scheduling-mfe | ⬜ |
| 2 | Notificaciones | lista | monitoring-mfe | ⬜ |
| 3 | Detalle de clase/sesión | detalle | scheduling-mfe | ⬜ |
| 4 | Detalle de notificación | detalle | monitoring-mfe | ⬜ |

### 05-administrador
| # | Pantalla | Tipo | MFE | Estado |
|---|---|---|---|:--:|
| 1 | Panel de indicadores (KPIs) | dashboard | monitoring-mfe | ⬜ |
| 2 | Drill-down de KPI | detalle | monitoring-mfe | ⬜ |
| 3 | Administración — Usuarios | lista | iam-mfe | ⬜ |
| 4 | Form: Crear/editar usuario | form | iam-mfe | ⬜ |
| 5 | Detalle de usuario | detalle | iam-mfe | ⬜ |
| 6 | Modal: Asignar/revocar rol | modal | iam-mfe | ⬜ |
| 7 | Administración — Datos de referencia | lista | reference-mfe | ⬜ |
| 8 | Form: Editar catálogo/valor/parámetro | form | reference-mfe | ⬜ |

### 06-backoffice
| # | Pantalla | Tipo | MFE | Estado |
|---|---|---|---|:--:|
| 1 | Documentos | lista | document-mfe | ⬜ |
| 2 | Plantillas de documento | lista | document-mfe | ⬜ |
| 3 | Auditoría | lista | audit-mfe | ⬜ |
| 4 | Parametrización / catálogos | lista | reference-mfe | ⬜ |
| 5 | Detalle de documento + versiones | detalle | document-mfe | ⬜ |
| 6 | Modal: Generar documento | modal/form | document-mfe | ⬜ |
| 7 | Editor / Preview de plantilla | editor | document-mfe | ⬜ |
| 8 | Modal: Detalle de auditoría | modal | audit-mfe | ⬜ |
| 9 | Formularios CRUD catálogos/parámetros | form | reference-mfe | ⬜ |

## Lente 2 — por MICRO-FRONTEND (build)

| MFE | # pantallas (dueño/compone) | Pantallas |
|---|:--:|---|
| **shell-host** | 4 | App Shell, Panel de notificaciones, Estados globales, Dashboard (compone) |
| **iam-mfe** | 7 | Login, Recuperar, Nueva contraseña, Usuarios, Crear/editar usuario, Detalle usuario, Asignar rol |
| **scheduling-mfe** | ~11 | Horarios, Detalle horario, Crear/editar, Modal sesión, Confirmar publicación, Panel conflictos, Resolver conflicto, Mi horario (instr/aprendiz), Detalle sesión/clase |
| **academic-mfe** | 2 | Fichas, Detalle de ficha |
| **environment-mfe** | 2 | Disponibilidad (ambientes), Detalle de ambiente |
| **actors-mfe** | 3 | Disponibilidad (instructores), Mi disponibilidad, Crear excepción |
| **document-mfe** | 5 | Documentos, Plantillas, Detalle+versiones, Generar, Editor plantilla |
| **monitoring-mfe** | 6 | KPIs, Drill-down, Seguimiento, Registrar seguimiento, Notificaciones, Detalle notificación |
| **audit-mfe** | 2 | Auditoría, Detalle de auditoría |
| **reference-mfe** | 4 | Datos de referencia, Editar catálogo, Parametrización, CRUD catálogos |

> Totales: **45 pantallas/modales**, **10 unidades de build** (9 MFE de dominio + shell-host).
> Generadas hasta ahora: **4** (Login, App Shell, Dashboard v2, Horarios lista). Pendientes: **41**.

## Prioridad de generación (MVP primero)
1. Completar **Coordinador** (núcleo): Crear/editar horario → Panel de conflictos → Resolver conflicto → Disponibilidad → Fichas.
2. **Instructor** y **Aprendiz** (consumo del horario).
3. **Administrador** y **back-office**.
