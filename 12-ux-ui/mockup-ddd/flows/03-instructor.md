<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: DDD de flujo UX (Instructor) + prompts Stitch
fase: diseño (UX/UI)
estado: PRELIMINAR (v0)
dependencias_entrada: 07-api/contracts/openapi/scheduling.yaml, actors.yaml, monitoring.yaml; 09-microservices/services/05-scheduling-service, 06-actors-service, 08-monitoring-service/data-model.md; 12-ux-ui/design-system.md, navigation-map.md; 04-requirements/user-stories.md
consumidores_siguientes: Google Stitch; validación de diseño
tldr: 3 pantallas del rol Instructor (Mi horario, Mi disponibilidad, Seguimiento de ficha), derivadas de tres contratos reales (scheduling/actors/monitoring) y sus data-model, con prompts listos para Stitch.
decisiones_clave: la "ficha" de cada sesión se resuelve cross-service (schedule_id → Schedule.ficha_id, sin FK física); "disponibilidad" en v0 solo modela excepciones/bloqueos puntuales (no hay endpoint de franjas positivas); "Seguimiento" asume que el scope OWN del JWT acota `listFichaTrackings` al instructor
halts_registrados: `listFichaTrackings` exige el feature `MON_DASHBOARD_FULL`; no hay en el contrato un feature explícito "mis fichas" para instructor — queda como gap a confirmar con backend (ver Pantalla 3)
-->

> **ESTADO: PRELIMINAR (v0 · mockup-first · design-driven discovery).** Instrumento de
> descubrimiento para Google Stitch, no un diseño final. Cada pantalla es trazable a
> **HU (si existe) + endpoint(s) + tabla(s)** de los contratos reales; donde no existe
> `HU-##` para Instructor se marca `HU: pendiente`. Ver
> [README.md](../README.md) para el framework completo y el brief global de estilo.

# Flujo — Instructor

**Rol:** `INSTRUCTOR` · **Navegación:** [navigation-map.md § Instructor](../../navigation-map.md#instructor)

Este flujo consume **tres servicios** distintos (uno por pantalla), cada uno con su propio
contrato y modelo de datos:

| Pantalla | Servicio | Contrato | Modelo |
|---|---|---|---|
| Mi horario (semana) | scheduling-service | [`../../../07-api/contracts/openapi/scheduling.yaml`](../../../07-api/contracts/openapi/scheduling.yaml) | [`../../../09-microservices/services/05-scheduling-service/data-model.md`](../../../09-microservices/services/05-scheduling-service/data-model.md) |
| Mi disponibilidad | actors-service | [`../../../07-api/contracts/openapi/actors.yaml`](../../../07-api/contracts/openapi/actors.yaml) | [`../../../09-microservices/services/06-actors-service/data-model.md`](../../../09-microservices/services/06-actors-service/data-model.md) |
| Seguimiento de ficha | monitoring-service | [`../../../07-api/contracts/openapi/monitoring.yaml`](../../../07-api/contracts/openapi/monitoring.yaml) | [`../../../09-microservices/services/08-monitoring-service/data-model.md`](../../../09-microservices/services/08-monitoring-service/data-model.md) |

---

## Pantalla 1 — Mi horario (semana)

- **Ruta:** `/instructor/mi-horario` · **Rol:** Instructor · **HU:** HU-15 (*"Como instructor
  quiero consultar mi horario vigente por semana para conocer mi carga con anticipación"*)
- **Servicio:** scheduling-service
- **Endpoint:** `GET /sessions` (`operationId: listSessions`) — filtros `instructor_id` (el
  propio), `from`/`to` (rango `session_date` de la semana visible), `status` (`ACTIVE` por
  defecto). Detalle de una sesión: `GET /sessions/{id}` (`operationId: getSession`).
- **Alcance (scope del JWT):** el `scope_type = OWN_SCHEDULE` asociado al rol Instructor
  acota el resultado a sesiones cuyo `schedule` padre está `PUBLISHED` (RN-SCH-01, HU-15:
  *"veo solo sesiones de horarios PUBLISHED"*) — el filtro lo aplica el servicio, no la UI.
- **Campos reales (`Session`, scheduling.yaml):** `id`, `schedule_id`, `competency_id`,
  `environment_id`, `instructor_id`, `time_slot_id`, `session_date`, `day_of_week`
  (1=lunes…7=domingo), `start_time`, `end_time`, `status` (`ACTIVE`/`CANCELLED`), `notes`,
  `updated_at`.
- **Resolución cross-service (sin FK física, por diseño):** `Session` no trae `ficha_id`
  directo — se resuelve vía `schedule_id → GET /schedules/{id}` (`Schedule.ficha_id`, mismo
  contrato). El nombre de la competencia (`competency_id`) y el nombre/ubicación del
  ambiente (`environment_id`) se resuelven contra academic-management-service y
  training-environment-service respectivamente. **Supuesto v0:** una capa de agregación
  (BFF) entrega estos nombres ya resueltos a la tarjeta; el endpoint `listSessions` por sí
  solo solo expone los UUID.

**Propósito:** que el instructor conozca su carga semanal de sesiones publicadas con
anticipación (meta ≥ 48 h), sin poder editarla.

**Layout:** selector de semana (flechas anterior/siguiente + rango de fechas visible);
rejilla semanal (7 columnas día × filas de franja horaria); tarjeta de sesión dentro de la
celda correspondiente con: franja (`start_time`–`end_time`), **ficha** (resuelta),
**competencia**, **ambiente**, badge de **estado** (`ACTIVE` normal, `CANCELLED` tachado +
icono, nunca solo color). Clic en una tarjeta abre panel lateral de detalle (`notes`,
ambiente completo, competencia completa).

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| ◀ Semana anterior / Semana siguiente ▶ | `GET /sessions?instructor_id=&from=&to=` | recarga la rejilla con la semana elegida |
| Clic en tarjeta de sesión | `GET /sessions/{id}` | abre panel de detalle |

**Estados:** *loading* (skeleton de rejilla) · *empty* ("No tienes sesiones publicadas esta
semana") · *error* (banner + reintentar) · sesión `CANCELLED` con tratamiento visual
distinto (tachado + icono, no solo opacidad/color).

```text
PROMPT STITCH
Pantalla "Mi horario" para el rol Instructor de la plataforma SENA — Gestión de Horarios, en
español, responsive. Barra superior con selector de semana: flechas "◀" y "▶" alrededor de un
texto "10 – 16 de agosto de 2026". Debajo, una rejilla semanal (calendario) con 7 columnas
(lunes a domingo) y filas por franja horaria. Dentro de las celdas, tarjetas de sesión de
clase mostrando: horario ("07:00 – 09:00"), ficha ("Ficha 2758543"), competencia
("Programación de software"), ambiente ("Ambiente 204 - Sistemas") y una insignia de estado;
una tarjeta de ejemplo con estado "Cancelada" debe verse tachada y con un icono de alerta
(no solo un color distinto). Al hacer clic en una tarjeta se abre un panel lateral derecho
con el detalle completo de la sesión y sus notas. Incluir el estado vacío: mensaje centrado
"No tienes sesiones publicadas esta semana" con un icono de calendario. Estilo institucional
sobrio, verde SENA (placeholder), alto contraste WCAG AA, objetivos táctiles ≥44px. Mostrar
también skeleton de carga de la rejilla. Variante móvil: la rejilla colapsa a una lista de
tarjetas agrupadas por día.
```

---

## Pantalla 2 — Mi disponibilidad

- **Ruta:** `/instructor/mi-disponibilidad` · **Rol:** Instructor · **HU:** HU-14 (*"Como
  instructor quiero declarar mis franjas disponibles y mis excepciones para que no me
  asignen clases cuando no puedo"*)
- **Servicio:** actors-service
- **Endpoints:**
  - `GET /instructors/{id}/availability-exceptions` (`operationId:
    listInstructorAvailabilityExceptions`) — parámetros `from`/`to` (rango sobre
    `start_datetime`/`end_datetime`).
  - `POST /instructors/{id}/availability-exceptions` (`operationId:
    createInstructorAvailabilityException`) — crea el bloqueo; emite
    `actors.instructor.availability_changed`.
  - `DELETE /instructors/{id}/availability-exceptions/{exception_id}` (`operationId:
    removeInstructorAvailabilityException`) — elimina un bloqueo registrado por error;
    emite el mismo evento.
  - `{id}` = el `instructor_id` propio del usuario autenticado. **Supuesto:** se resuelve
    desde el contexto de sesión (mapeo `user_id` de iam-service → `instructor.id` de
    actors-service); el contrato de auth (`GET /auth/me`) no expone `instructor_id`
    directamente — es un dato a confirmar con backend antes de construir.
- **Campos reales (`InstructorAvailabilityException`, actors.yaml):** `id`, `instructor_id`,
  `exception_type` (enum `SICK_LEAVE` / `VACATION` / `COMMISSION` / `PERSONAL_LEAVE` /
  `TRAINING` / `OTHER`), `start_datetime`, `end_datetime`, `description` (opcional),
  `approved_by` (uuid de usuario iam, nullable — quién aprobó), `created_at`.
- **Nota de alcance v0 (hallazgo del contrato):** el modelo solo cubre **excepciones**
  (bloqueos puntuales); no existe en el contrato actual un endpoint para declarar **franjas
  recurrentes disponibles de forma positiva**. El instructor se asume disponible por
  defecto en toda franja salvo que registre una excepción — distinto de lo que sugiere el
  texto de HU-14 ("declarar mis franjas disponibles"), que queda parcialmente cubierto.

**Propósito:** que el instructor declare bloqueos de disponibilidad para que el motor de
conflictos detecte `INSTRUCTOR_UNAVAILABLE` (RN-SCH-03) y el coordinador no lo asigne en
esas franjas al construir un horario.

**Layout:** lista cronológica de excepciones (vigentes y futuras primero), cada fila con
tipo (icono + texto), rango de fechas/horas, descripción y quién la aprobó (si aplica);
botón primario **+ Nueva excepción** abre formulario (modal o panel): selector de **tipo**
(las 6 opciones), **fecha/hora inicio**, **fecha/hora fin**, **descripción** (opcional);
cada fila tiene acción **Eliminar**.

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| + Nueva excepción → Guardar | `POST /instructors/{id}/availability-exceptions` | crea el bloqueo; refresca la lista |
| Eliminar (por fila) | `DELETE /instructors/{id}/availability-exceptions/{exception_id}` | quita el bloqueo; refresca la lista |

**Estados:** *loading* (skeleton de lista) · *empty* ("Sin excepciones registradas — estás
disponible en tu franja estándar") · *error* (banner + reintentar) · validación en línea
(fecha/hora fin posterior a inicio) · *success* (toast "Excepción registrada" /
"Excepción eliminada").

```text
PROMPT STITCH
Pantalla "Mi disponibilidad" para el rol Instructor de la plataforma SENA — Gestión de
Horarios, en español, responsive. Encabezado con título "Mi disponibilidad" y botón primario
"+ Nueva excepción" a la derecha. Debajo, una lista de tarjetas/filas cronológicas, cada una
mostrando: icono según tipo, etiqueta de tipo ("Incapacidad médica", "Vacaciones",
"Comisión", "Permiso personal", "Capacitación", "Otro"), rango de fecha y hora
("12 – 14 de agosto, 2026, 08:00 – 17:00"), una descripción breve y un botón "Eliminar" con
icono de papelera. Al hacer clic en "+ Nueva excepción" se abre un modal con: un selector
desplegable "Tipo de excepción", dos campos de fecha/hora ("Inicio" y "Fin"), un campo de
texto "Descripción (opcional)" y un botón primario "Guardar". Mostrar el estado vacío:
mensaje centrado "Sin excepciones registradas — estás disponible en tu franja estándar" con
icono de calendario con check. Estilo institucional sobrio, alto contraste WCAG AA,
objetivos táctiles ≥44px, navegable por teclado. Incluir un toast de confirmación
"Excepción registrada".
```

---

## Pantalla 3 — Seguimiento de ficha

- **Ruta:** `/instructor/seguimiento` · **Rol:** Instructor · **HU:** pendiente (relacionado
  con RF-MON-02: *"calcular KPIs por ficha... registrando cada medición como un nuevo
  registro append-only"*; no hay una `HU-##` de Instructor dedicada a este registro en
  `user-stories.md`)
- **Servicio:** monitoring-service
- **Endpoints:**
  - Selector de ficha: `GET /ficha-trackings` (`operationId: listFichaTrackings`), filtro
    `assigned_instructor_id`. **⚠ Hallazgo de contrato (halt registrado):** este endpoint
    exige el feature `MON_DASHBOARD_FULL`, que por nombre sugiere tablero **completo**
    (coordinación), sin un feature explícito "mis fichas" para Instructor. **Supuesto v0:**
    se asume que el `scope_type` `OWN` del JWT del instructor acota igual el resultado a sus
    fichas asignadas (mismo patrón que `OWN_SCHEDULE` en scheduling.yaml); si el backend no
    implementa esa acotación, este selector queda bloqueado y debe resolverse antes de
    construir.
  - Resumen de la ficha: `GET /ficha-trackings/{id}` (`operationId: getFichaTracking`) —
    requiere `MON_DASHBOARD_OWN` (coherente con acceso de Instructor a su propia ficha).
  - Histórico: `GET /ficha-trackings/{id}/tracking-sessions` (`operationId:
    listTrackingSessions`), filtros `session_type`, `from`/`to`.
  - Registrar: `POST /ficha-trackings/{id}/tracking-sessions` (`operationId:
    createTrackingSession`) — *"Normativa SENA: seguimiento mínimo mensual para fichas en
    Ejecución (Acuerdo 00003/2012). `attendance_percentage` es calculada por el servidor."*
  - Detalle de fila: `GET /ficha-trackings/{id}/tracking-sessions/{session_id}`
    (`operationId: getTrackingSession`).
- **Campos reales (`FichaTracking`):** `ficha_id`, `assigned_instructor_id`,
  `overall_status_id` (→ `kpi_status`/`risk_level`), `active_alert_count`,
  `last_tracking_date`, `next_tracking_date`.
- **Campos reales (`TrackingSession` / `TrackingSessionCreate`):** `id`,
  `ficha_tracking_id`, `instructor_id`, `session_date`, `session_type` (enum `ACADEMIC` /
  `WELLNESS` / `PROJECT` / `PRODUCTIVE_STAGE`), `attendance_count`, `total_learners`,
  `attendance_percentage` (**readOnly**, columna generada = `attendance_count /
  total_learners * 100`), `curriculum_progress_percentage`, `observations`,
  `requires_follow_up` (boolean — *"si true, debe generarse una alerta asociada"*),
  `created_at`.

**Propósito:** que el instructor registre sesiones periódicas de seguimiento (asistencia,
avance curricular) de su ficha, insumo append-only del cálculo de KPIs y alertas de riesgo.

**Layout:** selector de ficha (dropdown, fichas asignadas al instructor); encabezado-resumen
con `overall_status` (badge de riesgo), `last_tracking_date` / `next_tracking_date` y
`active_alert_count`; tabla histórica de `tracking_session` (más reciente primero) con
columnas: fecha, tipo, asistencia (`attendance_count`/`total_learners` → `%`), avance
curricular (%), "requiere seguimiento" (badge); botón primario **+ Registrar seguimiento**
abre formulario: tipo de sesión (select), fecha, asistentes / total de aprendices, avance
curricular (%), observaciones (textarea), checkbox "Requiere seguimiento adicional".

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Seleccionar ficha | `GET /ficha-trackings?assigned_instructor_id=` → `GET /ficha-trackings/{id}` | carga resumen |
| Cargar histórico | `GET /ficha-trackings/{id}/tracking-sessions` | llena la tabla |
| + Registrar seguimiento → Guardar | `POST /ficha-trackings/{id}/tracking-sessions` | crea registro append-only (no editable/eliminable); si `requires_follow_up = true`, el `alert-worker` puede generar una alerta |
| Clic en fila | `GET /ficha-trackings/{id}/tracking-sessions/{session_id}` | abre panel de detalle |

**Estados:** *loading* (skeleton de resumen + tabla) · *empty* (ficha sin seguimientos aún;
si `next_tracking_date` está vencida, aviso de seguimiento pendiente > 35 días, RF-MON-01) ·
*error* (banner + reintentar) · validación en línea (`attendance_count ≤ total_learners`,
`curriculum_progress_percentage` entre 0–100) · *success* (toast "Seguimiento registrado").

```text
PROMPT STITCH
Pantalla "Seguimiento de ficha" para el rol Instructor de la plataforma SENA — Gestión de
Horarios, en español, responsive. Encabezado con un selector desplegable "Ficha: 2758543 -
Análisis y Desarrollo de Software" y, al lado, un resumen con una insignia de estado de
riesgo ("En riesgo", color ámbar + icono, nunca solo color), texto "Último seguimiento:
10 jul 2026" y "Próximo: 10 ago 2026". Botón primario "+ Registrar seguimiento" a la derecha.
Debajo, una tabla histórica con columnas "Fecha", "Tipo" (Académico/Bienestar/
Proyecto/Etapa productiva), "Asistencia" (ej. "18/20 - 90%"), "Avance curricular" (barra de
progreso, ej. 65%) y "Requiere seguimiento" (badge sí/no). Al hacer clic en "+ Registrar
seguimiento" se abre un formulario modal con: selector "Tipo de sesión", campo "Fecha",
dos campos numéricos "Asistentes" y "Total de aprendices", un campo numérico "Avance
curricular (%)", un textarea "Observaciones" y un checkbox "Requiere seguimiento adicional",
con botón primario "Guardar". Mostrar el estado vacío: "Esta ficha aún no tiene registros de
seguimiento" con un aviso de alerta si el seguimiento está vencido (más de 35 días sin
registrar). Estilo institucional sobrio, alto contraste WCAG AA, objetivos táctiles ≥44px,
navegable por teclado.
```

---

## Mockups generados
_(pendiente — guardar en `../mockups/03-instructor/` y enlazar aquí: mi-horario.png,
mi-disponibilidad.png, seguimiento.png)_
