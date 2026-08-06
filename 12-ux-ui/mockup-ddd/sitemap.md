<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: mapa de rutas (sitemap) + matriz de visibilidad RBAC del mockup
fase: diseño (UX/UI)
estado: draft
dependencias_entrada: mockup-ddd/flows/*.md (Ruta/Rol por pantalla); micro-frontends.md; 09-microservices/services/01-iam-service/rbac-design.md
consumidores_siguientes: enrutamiento del frontend (shell-host), guards RBAC, generación del mockup
tldr: Árbol de rutas por rol (ruta → pantalla → MFE → guard) y matriz rol × área de visibilidad. Los modales no tienen ruta propia (estado de UI).
decisiones_clave: rutas públicas vs autenticadas; áreas por rol; modales sin URL; estados globales transversales
halts_registrados: ninguno
-->

# Sitemap (mapa de rutas) + Visibilidad RBAC

> **ESTADO: PRELIMINAR (v0).** Rutas derivadas de los `flows/*.md`. Los **modales** no tienen ruta
> propia (se abren por estado de UI sobre su ruta padre). Guard = rol/feature exigido (RBAC).

## Árbol de rutas

### Público (anónimo) — `iam-mfe`
```
/login                      → Login (01-auth P1)
/forgot-password            → Recuperar contraseña (01-auth P2)
/reset-password?token=…     → Nueva contraseña (01-auth P3)
```

### Autenticado — `shell-host` (marco común, nav por rol desde /auth/me.modules)
```
/                           → landing según rol (redirige)
· overlay notificaciones    → Panel de notificaciones (01-auth P5)  [campana del top bar]
· 403 / 404 / 500 / sesión  → Estados globales (01-auth P6)         [reemplaza el área de contenido]
```

### Coordinador (`COORDINATOR`, scope TRAINING_CENTER)
```
/                           → Dashboard/Inicio (02 P1)      [compone scheduling+academic]
/horarios                   → Horarios lista (02 P2)         · scheduling-mfe
/horarios/nuevo             → Crear horario (02 P4)          · scheduling-mfe
/horarios/:id               → Detalle/editar horario (02 P3/P4) · scheduling-mfe
   ├ modal agregar sesión (02 P5) · modal confirmar publicación (02 P6)
/horarios/:id/conflictos    → Panel de conflictos (02 P7)    · scheduling-mfe
   └ modal resolver conflicto (02 P8)
/disponibilidad             → Disponibilidad (02 P9)         · environment-mfe + actors-mfe
/disponibilidad/ambientes/:id → Detalle de ambiente (02 P10) · environment-mfe
/fichas                     → Fichas (02 P11)                · academic-mfe
/fichas/:id                 → Detalle de ficha (02 P12)      · academic-mfe
```

### Instructor (`INSTRUCTOR`)
```
/instructor/mi-horario      → Mi horario semana (03 P1)      · scheduling-mfe
   └ panel Detalle de sesión (03 P2)
/instructor/mi-disponibilidad → Mi disponibilidad (03 P3)    · actors-mfe
   └ modal Crear excepción (03 P4)
/instructor/seguimiento     → Seguimiento de ficha (03 P5)   · monitoring-mfe
   └ form Registrar seguimiento (03 P6)
```

### Aprendiz (`LEARNER`) — mobile-first
```
/mi-horario                 → Mi horario semana (04 P1)      · scheduling-mfe
/mi-horario/sesiones/:id    → Detalle de clase (04 P3)       · scheduling-mfe
/notificaciones             → Notificaciones (04 P2)         · monitoring-mfe
/notificaciones/:id         → Detalle de notificación (04 P4) · monitoring-mfe
```

### Administrador de Centro / Director (`CENTER_DIRECTOR` / `ADMIN`)
```
/admin/indicadores          → KPIs (05 P1)                   · monitoring-mfe
/admin/indicadores/:ft/:kpi → Drill-down de KPI (05 P2)      · monitoring-mfe
/admin/usuarios             → Usuarios (05 P3)               · iam-mfe
/admin/usuarios/:id         → Detalle de usuario (05 P5)     · iam-mfe
   ├ modal Crear/editar usuario (05 P4) · modal Asignar/revocar rol (05 P6)
/admin/datos-referencia     → Datos de referencia (05 P7, solo-lectura para Director)
   └ modal Editar (05 P8)                                    · reference-mfe
```

### Back-office (`ADMIN_STAFF` / `SYSTEM_ADMIN`)
```
/backoffice/documentos      → Documentos (06 P1)             · document-mfe
   └ modal Generar documento (06 P6)
/backoffice/documentos/:id  → Detalle documento + versiones (06 P5) · document-mfe
/backoffice/documentos/plantillas       → Plantillas (06 P2) · document-mfe
/backoffice/documentos/plantillas/:id/editar → Editor/preview (06 P7) · document-mfe
/backoffice/auditoria       → Auditoría (06 P3)              · audit-mfe
   └ modal Detalle de auditoría (06 P8)
/backoffice/parametrizacion → Parametrización (06 P4)        · reference-mfe
   └ modales CRUD catálogos/parámetros (06 P9)
```

## Matriz de visibilidad RBAC (rol × área)

✅ ve/entra · 👁 solo lectura · — no visible

| Área | Coordinador | Instructor | Aprendiz | Director | ADMIN_STAFF/SYS_ADMIN |
|---|:--:|:--:|:--:|:--:|:--:|
| Horarios (crear/editar/publicar) | ✅ | — | — | 👁 | — |
| Panel de conflictos | ✅ | — | — | 👁 | — |
| Disponibilidad (ambientes/instructores) | ✅ | — | — | 👁 | — |
| Fichas | ✅ | — | — | 👁 | — |
| Mi horario | — | ✅ | ✅ | — | — |
| Mi disponibilidad | — | ✅ | — | — | — |
| Seguimiento de ficha | — | ✅ | — | 👁 | — |
| Notificaciones | ✅ | ✅ | ✅ | ✅ | ✅ |
| Indicadores (KPIs) | 👁 | — | — | ✅ | — |
| Usuarios/roles | — | — | — | ✅ | ✅ |
| Datos de referencia | — | — | — | 👁 | ✅ |
| Documentos/Plantillas | — | — | — | — | ✅ |
| Auditoría | — | — | — | — | ✅ |
| Parametrización | — | — | — | — | ✅ |

> El guard exacto por endpoint usa `x-required-feature` (RBAC feature+scope de iam). La UI **oculta**
> lo no permitido (no "controles deshabilitados escondidos", conforme al design-system §1). El acceso
> directo por URL a un área no permitida → **403** ([Estados globales](flows/01-auth.md)).

## Convención de build (ruta → archivo del prototipo)

> Para que la generación del mockup cablee la navegación sin placeholders. El prototipo estático vive
> en `mockups/app/<carpeta-por-rol-o-MFE>/<archivo>.html`. **Regla:** TODO enlace de navegación
> apunta a un archivo real; **prohibido `href="#"`** para navegación (solo válido en toggles JS).
> Los **modales** no son archivos: se abren en su página padre (`data-toggle="modal"`).

| Ruta | Archivo del prototipo |
|---|---|
| `/login`, `/forgot-password`, `/reset-password` | `iam/login.html`, `iam/forgot-password.html`, `iam/reset-password.html` |
| 403/404/500/sesión | `global/error-states.html` |
| `/` (Coordinador) | `coordinator/dashboard.html` |
| `/horarios` · `/horarios/nuevo`·`:id` · `:id/conflictos` | `coordinator/schedules-list.html` · `schedule-edit.html` / `schedule-detail.html` · `conflicts.html` |
| `/disponibilidad` · `/ambientes/:id` | `coordinator/availability.html` · `environment-detail.html` |
| `/fichas` · `/fichas/:id` | `coordinator/fichas-list.html` · `ficha-detail.html` |
| `/instructor/mi-horario` · `/mi-disponibilidad` · `/seguimiento` | `instructor/my-schedule.html` · `my-availability.html` · `tracking.html` |
| `/mi-horario` · `/sesiones/:id` · `/notificaciones` · `/:id` | `learner/my-schedule.html` · `session-detail.html` · `notifications.html` · `notification-detail.html` |
| `/admin/indicadores` · `/:ft/:kpi` · `/usuarios` · `/:id` · `/datos-referencia` | `admin/kpi-dashboard.html` · `kpi-detail.html` · `users-list.html` · `user-detail.html` · `reference-data.html` |
| `/backoffice/documentos` · `/:id` · `/plantillas` · `/:id/editar` · `/auditoria` · `/parametrizacion` | `backoffice/documents.html` · `document-detail.html` · `templates.html` · `template-editor.html` · `audit.html` · `parametrization.html` |

**Modales (se abren en su página, sin ruta/archivo):** agregar/editar sesión, confirmar publicación,
resolver conflicto (coordinator); crear excepción, registrar seguimiento (instructor); crear/editar
usuario, asignar rol (admin); generar documento, detalle de auditoría, CRUD catálogos (back-office).
