<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: DDD de flujo UX (Coordinador Académico, rol CORE del MVP) + prompts Stitch
fase: diseño (UX/UI)
estado: draft
dependencias_entrada: 07-api/contracts/openapi/{scheduling,training-environment,academic-management,actors}.yaml; data-model.md de scheduling/training-environment/academic-management-service; 12-ux-ui/{design-system,navigation-map}.md; 04-requirements/{functional,user-stories}.md
consumidores_siguientes: Google Stitch (generación de mockup); validación de diseño con coordinadores reales
tldr: 6 pantallas del Coordinador Académico (Dashboard, Horarios, Crear/editar horario, Panel de conflictos, Disponibilidad, Fichas) derivadas de los contratos y data-models reales de scheduling (CORE), training-environment, academic-management y actors; el conflicto es ciudadano de primera clase en Dashboard y en pantalla propia.
decisiones_clave: `GET /schedules` no filtra por instructor/ambiente (limitación real del contrato — esos atributos viven en `class_session`, no en `schedule`); no existe `GET /instructors/available` en el contrato — Disponibilidad de instructores se compone cruzando `GET /instructors` con `GET /instructors/{id}/availability-exceptions`; `scheduling_conflict.conflict_type` real solo tiene 3 valores (el contrato no incluye `ENVIRONMENT_MAINTENANCE`/`INSTRUCTOR_UNAVAILABLE` que sí menciona functional.md)
halts_registrados: ninguno
-->

# Flujo — Coordinador Académico (núcleo MVP)

> **ESTADO: PRELIMINAR (v0)** — instrumento de descubrimiento y feedback, no diseño final. Cada
> pantalla está trazada a `endpoint + tabla` real (100%); la trazabilidad a `HU` se cita donde
> existe y se marca `HU: pendiente` donde no.

**Servicio origen (CORE):** `scheduling-service` · **Contrato:** `../../../07-api/contracts/openapi/scheduling.yaml`
**Modelo:** `../../../09-microservices/services/05-scheduling-service/data-model.md`

**Servicios de apoyo** (consultados por el Coordinador, no editados desde este flujo salvo donde se indique):
- `academic-management-service` — fichas y programa. Contrato: `../../../07-api/contracts/openapi/academic-management.yaml` · Modelo: `../../../09-microservices/services/03-academic-management-service/data-model.md`
- `training-environment-service` — ambientes. Contrato: `../../../07-api/contracts/openapi/training-environment.yaml` · Modelo: `../../../09-microservices/services/04-training-environment-service/data-model.md`
- `actors-service` — instructores. Contrato: `../../../07-api/contracts/openapi/actors.yaml` (schema `actors_parameterization`)

---

## Pantalla 1 — Dashboard / Inicio

- **Ruta:** `/` (Inicio del Coordinador) · **Rol:** Coordinador Académico (`COORDINATOR`, scope `TRAINING_CENTER`) · **HU:** pendiente (agrega datos de HU-01, HU-07, HU-09; el dashboard como tal no tiene HU dedicada)
- **Endpoints:**
  - `GET /fichas` (`listFichas`, academic-management.yaml) — filtros `training_center_id`, `status=EXECUTION`
  - `GET /schedules` (`listSchedules`, scheduling.yaml) — filtro `status=DRAFT`
  - `GET /reports/schedule-conflicts` (`reportScheduleConflicts`, scheduling.yaml) — filtro `is_resolved=false`, paginación por cursor (`cursor`/`limit`)
- **Tablas/campos reales:** `enrollment_ficha.status`; `schedule.{ficha_id, period, name, status, updated_at}`; `scheduling_conflict.{schedule_id, conflict_type, description, detected_at, is_resolved}`

**Propósito:** vista de aterrizaje que resume el estado operativo del centro y prioriza los
conflictos sin resolver, para que el coordinador actúe primero sobre lo crítico.

**Layout:** header de página "Inicio" con saludo (`user.full_name`); fila de 3 tarjetas KPI —
**Fichas activas** (conteo `enrollment_ficha` con `status=EXECUTION`), **Horarios en borrador**
(conteo `schedule` con `status=DRAFT`) y **Conflictos pendientes** (conteo `scheduling_conflict`
con `is_resolved=false`) — esta última es el **widget destacado**: mayor tamaño, primer lugar
cuando su conteo es `> 0`, color crítico + icono de alerta + texto (nunca solo color). Debajo, dos
listas: "Horarios recientes en borrador" (columnas `ficha_id` [referencia], `period`, `name`,
`updated_at`, botón "Continuar edición") y "Conflictos pendientes" (columnas `conflict_type`,
`schedule_id` [referencia], `detected_at`, botón "Ver panel"). Accesos directos a Horarios,
Disponibilidad y Fichas.

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Tarjeta / fila "Conflictos pendientes" | `GET /reports/schedule-conflicts?is_resolved=false` | navega al Panel de conflictos (Pantalla 4) |
| Tarjeta / fila "Horarios en borrador" | `GET /schedules?status=DRAFT` | navega a Crear/editar horario (Pantalla 3) con el `id` seleccionado |
| Tarjeta "Fichas activas" | `GET /fichas?status=EXECUTION` | navega a Fichas (Pantalla 6) |

**Estados:** *loading* (skeleton en las 3 tarjetas KPI y en ambas listas, independientes entre sí)
· *empty* (sin conflictos: mensaje positivo "Sin conflictos pendientes" con icono de éxito; sin
borradores: "No hay horarios en borrador") · *error* (banner de reintento por widget, no bloquea
los demás) · *conflicto* (la tarjeta de conflictos siempre usa icono + texto + color crítico, y se
adelanta en el orden visual cuando `count > 0`, conforme al principio "el conflicto es ciudadano
de primera clase").

```text
PROMPT STITCH
Pantalla "Inicio" del Coordinador Académico en la plataforma SENA — Gestión de Horarios, en
español, dentro del app shell (barra superior + nav lateral: Inicio, Horarios, Disponibilidad,
Fichas). Encabezado "Inicio" con saludo "Hola, María García". Debajo, tres tarjetas KPI en fila:
"Fichas activas" (número grande + icono de carpeta), "Horarios en borrador" (número + icono de
documento), y una tercera tarjeta más grande y destacada "Conflictos pendientes" en color crítico
(rojo/naranja institucional) con icono de alerta triangular y el número de conflictos sin
resolver — esta tarjeta va primero si tiene conflictos. Debajo, dos columnas: a la izquierda una
lista "Horarios recientes en borrador" con filas (ficha, período, nombre, última edición, botón
"Continuar edición"); a la derecha una lista "Conflictos pendientes" con filas (tipo de conflicto
con icono distintivo — instructor doble-asignado / ambiente doble-asignado / sesiones solapadas —,
horario afectado, fecha detectada, botón "Ver panel"). Mostrar el estado vacío de conflictos como
un mensaje positivo con icono de check verde: "Sin conflictos pendientes". Estilo institucional
sobrio, WCAG AA, tarjetas con sombra sutil y esquinas suaves. Responsive: en móvil las tarjetas KPI
se apilan verticalmente y la de conflictos queda arriba.
```

**Mockup:** _(pendiente — se guardará en `../mockups/02-coordinador/dashboard.png` y se enlazará aquí)_

---

## Pantalla 2 — Horarios (lista)

- **Ruta:** `/horarios` · **Rol:** Coordinador Académico · **HU:** pendiente (soporta HU-07 a HU-10 como punto de entrada)
- **Endpoint:** `GET /schedules` (`listSchedules`, scheduling.yaml)
- **Filtros reales del contrato:** `ficha_id` (uuid, referencia externa a `enrollment_ficha.id`), `period` (string ≤10, ej. `2026-1`), `status` (enum `DRAFT`/`UNDER_REVIEW`/`PUBLISHED`/`ARCHIVED`), `from`/`to` (rango de `created_at`) — más `page`/`page_size`/`sort` estándar.
- **Tabla/campos reales:** `schedule.{id, ficha_id, period, name, status, published_at, row_version, created_by, created_at, updated_at}`

> **Nota de congruencia (no se inventa):** el contrato de `GET /schedules` **no expone** filtro por
> `instructor_id` ni `environment_id` — esos son atributos de `class_session` (nivel sesión), no de
> `schedule` (nivel agregado). El filtro por instructor/ambiente existe en `GET /sessions` (ver
> Pantalla 3). Esta pantalla implementa los filtros reales: ficha, período, estado y rango de
> fecha; el filtro "por instructor/ambiente" pedido en la navegación se resuelve navegando a la
> sesión concreta desde el Panel de conflictos o desde Disponibilidad, no desde esta lista.

**Propósito:** punto de entrada para ubicar, continuar o revisar cualquier horario del centro por
ficha, período o estado.

**Layout:** header "Horarios" + botón primario "Nuevo horario"; barra de filtros (selector de
ficha con búsqueda, campo período, selector de estado, rango de fechas); tabla densa con columnas
**Ficha** (referencia `ficha_id`, muestra número si el cliente lo resuelve contra
academic-management-service), **Período**, **Nombre**, **Estado** (badge icono+texto: BORRADOR
neutro / EN_REVISIÓN advertencia / PUBLICADO éxito / ARCHIVADO neutro atenuado), **Publicado el**
(`published_at`, si aplica), **Última actualización** (`updated_at`); paginación estándar
(`page`/`page_size`) y orden (`sort`).

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Fila → "Ver/editar" | `GET /schedules/{id}` | abre Crear/editar horario (Pantalla 3) |
| Botón "Nuevo horario" | — (la creación real dispara `POST /schedules` en Pantalla 3) | abre Pantalla 3 en modo alta |
| Filtros (ficha/período/estado/fecha) | `GET /schedules?ficha_id=&period=&status=&from=&to=` | refresca la tabla |
| Paginación / orden | `GET /schedules?page=&page_size=&sort=` | cambia de página |

**Estados:** *loading* (skeleton de filas) · *empty* ("No hay horarios que coincidan con los
filtros" + botón "Nuevo horario") · *error* (banner + reintentar) · el badge de estado siempre usa
icono + texto (no solo color), incluyendo un indicador adicional si el horario `UNDER_REVIEW` tiene
conflictos activos (icono de alerta junto al badge).

```text
PROMPT STITCH
Pantalla "Horarios" del Coordinador Académico, plataforma SENA — Gestión de Horarios, en español,
dentro del app shell. Encabezado "Horarios" con botón primario "Nuevo horario" a la derecha. Barra
de filtros con: selector "Ficha" (buscable), campo "Período" (ej. 2026-1), selector "Estado"
(Borrador / En revisión / Publicado / Archivado), y un rango de fechas. Tabla densa con columnas:
Ficha, Período, Nombre, Estado (badge con icono + texto — círculo gris "Borrador", triángulo
ámbar "En revisión", check verde "Publicado", candado gris "Archivado"), Publicado el, Última
actualización. Paginación en el pie de la tabla. Mostrar el estado vacío con un icono de calendario
y el texto "No hay horarios que coincidan con los filtros". Estilo institucional, alto contraste
WCAG AA, filas con hover sutil, objetivos táctiles ≥44px. Responsive: en móvil la tabla colapsa a
tarjetas apiladas por horario.
```

**Mockup:** _(pendiente — `../mockups/02-coordinador/horarios-lista.png`)_

---

## Pantalla 3 — Crear / editar horario

- **Ruta:** `/horarios/nuevo` (alta) y `/horarios/:id` (edición) · **Rol:** Coordinador Académico · **HU:** HU-07 (crear borrador), HU-08 (agregar sesiones), HU-10 (publicar)
- **Endpoints:**
  - `POST /schedules` (`createSchedule`) — body `ScheduleCreate{ficha_id, period, name?}` → `201` `DRAFT`
  - `GET /schedules/{id}` (`getSchedule`) / `PUT /schedules/{id}` (`updateSchedule`) — body `{name?, row_version}`
  - `GET /schedules/{id}/sessions` (`listScheduleSessions`) — filtro `status` (`ACTIVE`/`CANCELLED`)
  - `POST /schedules/{id}/sessions` (`addScheduleSession`) — body `SessionCreate{competency_id, environment_id, instructor_id, time_slot_id, session_date, notes?}`
  - `PUT /sessions/{id}` (`updateSession`) — body `{instructor_id?, environment_id?, time_slot_id?, notes?}` · `DELETE /sessions/{id}` (`deleteSession`) · `POST /sessions/{id}/cancel` (`cancelSession`)
  - `POST /schedules/{id}/validate` (`validateSchedule`) — body `{row_version}` → `DRAFT → UNDER_REVIEW`
  - `POST /schedules/{id}/publish` (`publishSchedule`) — body `{row_version}` → `UNDER_REVIEW → PUBLISHED`
- **Tabla/campos reales:** `schedule.{ficha_id, period, name, status, row_version}`; `class_session.{id, competency_id, environment_id, instructor_id, time_slot_id, session_date, day_of_week, start_time, end_time, status, notes}` (`day_of_week`/`start_time`/`end_time` son copia desnormalizada e inmutable de `time_slot`)

**Propósito:** construir el horario de una ficha agregando sesiones y llevarlo, sin conflictos,
hasta la publicación.

**Layout:** header con `ficha_id` (referencia), `period`, `name` (editable) y badge de `status`;
tabla de sesiones (columnas: **Día** [`day_of_week`, 1=lunes…7=domingo], **Franja**
[`time_slot`/`start_time`–`end_time`], **Fecha** [`session_date`], **Competencia**
[`competency_id`, ref. academic-management-service], **Instructor** [`instructor_id`, ref.
actors-service], **Ambiente** [`environment_id`, ref. training-environment-service], **Estado**
[`ACTIVE`/`CANCELLED`]) con acciones editar/cancelar/eliminar por fila; panel lateral "Agregar
sesión" con selectores Competencia, Instructor, Ambiente, Franja horaria (`time_slot`) y Fecha, más
campo Notas; barra de acciones inferior fija: "Guardar", "Validar", "Publicar".

> **Flujo real derivado del contrato (no inventado):** agregar/editar/eliminar sesiones solo se
> permite mientras `schedule.status = DRAFT` (`409 SCHEDULE_IMMUTABLE` en otro caso). `Validar`
> transiciona `DRAFT → UNDER_REVIEW` de forma síncrona y puede dejar conflictos activos. Una vez en
> `UNDER_REVIEW` las sesiones ya no se editan desde aquí — los conflictos se resuelven en el Panel
> de conflictos (Pantalla 4) vía `POST /conflicts/{id}/resolve`. `Publicar` solo tiene éxito si no
> quedan conflictos sin resolver (`409 UNRESOLVED_CONFLICTS` en otro caso).

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Crear horario (alta) | `POST /schedules` | `201` → `status=DRAFT`, navega a edición |
| Agregar sesión | `POST /schedules/{id}/sessions` | `201` añade fila; `409 INSTRUCTOR_DOUBLE_BOOKED` / `ENVIRONMENT_DOUBLE_BOOKED` → error inline sobre Instructor/Ambiente |
| Editar sesión (reasignar instructor/ambiente/franja o notas) | `PUT /sessions/{id}` | `200` actualiza fila; `409` doble-booking o `SCHEDULE_IMMUTABLE` |
| Cancelar sesión | `POST /sessions/{id}/cancel` | `200` → `status=CANCELLED` |
| Eliminar sesión | `DELETE /sessions/{id}` | `204` quita fila; `409 SCHEDULE_IMMUTABLE` si no está en `DRAFT` |
| Guardar nombre del horario | `PUT /schedules/{id}` | `200`; `409 SCHEDULE_IMMUTABLE` / `ROW_VERSION_MISMATCH` |
| Validar | `POST /schedules/{id}/validate` | `200` → `status=UNDER_REVIEW` (puede incluir conflictos) |
| Publicar | `POST /schedules/{id}/publish` | `200` → `status=PUBLISHED`, inmutable; `409 UNRESOLVED_CONFLICTS` bloquea |

**Estados:** *loading* (skeleton en tabla de sesiones) · *empty* ("Aún no hay sesiones — agrega la
primera") · *error* (`409` de doble-booking mostrado inline, icono + texto sobre los campos
Instructor/Ambiente/Franja del formulario, nunca solo un borde rojo) · *conflicto* (banner
persistente "Este horario tiene N conflictos sin resolver" con acceso directo al Panel de
conflictos, visible mientras `status=UNDER_REVIEW` y existan conflictos activos; el botón
"Publicar" queda deshabilitado con tooltip explicando el motivo) · *success* (confirmación modal al
publicar; el horario pasa a solo lectura).

```text
PROMPT STITCH
Pantalla "Editar horario" del Coordinador Académico, plataforma SENA — Gestión de Horarios, en
español. Encabezado con "Ficha 2589341 — Período 2026-1" y un badge de estado "Borrador" (icono
círculo gris). Debajo, una tabla de sesiones con columnas: Día, Franja horaria, Fecha, Competencia,
Instructor, Ambiente, Estado, y acciones (editar/cancelar/eliminar) por fila. A la derecha (o como
panel deslizable), un formulario "Agregar sesión" con selectores con búsqueda: Competencia,
Instructor, Ambiente, Franja horaria, y un campo de fecha, con un botón primario "Agregar sesión".
Mostrar un ejemplo de error de doble-asignación: bajo el selector "Instructor" un texto en rojo con
icono de alerta "Este instructor ya tiene una sesión en este horario". En la parte inferior, una
barra de acciones fija con tres botones: "Guardar", "Validar" (secundario) y "Publicar" (primario,
deshabilitado con un candado + tooltip "Resuelve los conflictos pendientes" cuando aplica). Mostrar
también un banner superior de advertencia "Este horario tiene 2 conflictos sin resolver" con un
enlace "Ver panel de conflictos". Estilo institucional, WCAG AA, formularios con validación en
línea. Responsive: en móvil el panel "Agregar sesión" se abre como hoja inferior (bottom sheet).
```

**Mockup:** _(pendiente — `../mockups/02-coordinador/horario-editar.png`)_

---

## Pantalla 4 — Panel de conflictos

> **Ciudadano de primera clase.** Esta pantalla existe porque detectar y comunicar un conflicto es
> la razón de ser del sistema (design-system §1.2); su representación visual es prioritaria sobre
> cualquier otro contenido.

- **Ruta:** `/horarios/:id/conflictos` (por horario) con pestaña adicional "Todo mi centro" (reporte) · **Rol:** Coordinador Académico · **HU:** HU-09 (ver y resolver conflictos)
- **Endpoints:**
  - `GET /schedules/{id}/conflicts` (`listScheduleConflicts`, scheduling.yaml) — filtros `is_resolved`, `conflict_type`; `page`/`page_size`/`sort`
  - `GET /reports/schedule-conflicts` (`reportScheduleConflicts`) — filtros `schedule_id`, `conflict_type`, `is_resolved`, `from`/`to`; paginación por cursor (colección grande/continua)
  - `POST /conflicts/{id}/resolve` (`resolveConflict`)
- **Tabla/campos reales:** `scheduling_conflict.{id, schedule_id, session_a_id, session_b_id, conflict_type, description, is_resolved, detected_at}`

> **Nota de congruencia (no se inventa):** `functional.md` (RF-SCH-03) y `HU-09` describen 5 tipos
> de conflicto (incluyendo `ENVIRONMENT_MAINTENANCE` e `INSTRUCTOR_UNAVAILABLE`), pero el `enum`
> real de `conflict_type` en `scheduling.yaml`/`data-model.md` solo define 3:
> `INSTRUCTOR_DOUBLE_BOOKED`, `ENVIRONMENT_DOUBLE_BOOKED`, `SESSIONS_OVERLAP`. Esta pantalla usa el
> enum real del contrato; el gap queda documentado en el reporte final de esta tarea.

**Propósito:** listar, clasificar y permitir resolver cada conflicto detectado antes de publicar.

**Layout:** tabs "Este horario" / "Todo mi centro"; filtros por tipo de conflicto y estado
(pendiente/resuelto); lista de **tarjetas** (no solo tabla) — cada tarjeta: icono grande distintivo
por `conflict_type` (dos personas cruzadas = instructor doble-asignado; puerta cruzada = ambiente
doble-asignado; flechas superpuestas = sesiones solapadas), texto `description`, referencia corta a
`session_a_id`/`session_b_id`, fecha `detected_at`, badge "Pendiente" (crítico) / "Resuelto"
(éxito) con icono + texto, botón "Marcar como resuelto" (solo si `is_resolved=false`).

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Filtrar por tipo/estado | `GET /schedules/{id}/conflicts?conflict_type=&is_resolved=` | refresca la lista |
| Marcar como resuelto | `POST /conflicts/{id}/resolve` | `200` → `is_resolved=true`; `409` si ya estaba resuelto |
| Ver sesión en conflicto | navega a Pantalla 3 y resalta `session_a_id`/`session_b_id` | — |
| Pestaña "Todo mi centro" | `GET /reports/schedule-conflicts?is_resolved=&conflict_type=&cursor=` | lista paginada por cursor de todos los horarios del centro (scope `TRAINING_CENTER` del JWT) |

**Estados:** *loading* (skeleton de tarjetas) · *empty* ("Sin conflictos — este horario puede
publicarse", icono de check, color éxito) · *error* (banner + reintentar) · *conflicto* (estado por
defecto de esta pantalla: cada tarjeta pendiente usa color crítico + icono + texto explícito del
tipo, nunca solo color).

```text
PROMPT STITCH
Pantalla "Panel de conflictos" del Coordinador Académico, plataforma SENA — Gestión de Horarios,
en español. Encabezado "Conflictos — Horario Ficha 2589341, Período 2026-1" con dos pestañas: "Este
horario" (activa) y "Todo mi centro". Fila de filtros: tipo de conflicto (Instructor doble-asignado
/ Ambiente doble-asignado / Sesiones solapadas) y estado (Pendiente / Resuelto). Debajo, una lista
de tarjetas de conflicto en color crítico (rojo/naranja) para los pendientes: cada tarjeta muestra
un icono grande distintivo del tipo, el texto de descripción ("El instructor Juan Pérez tiene dos
sesiones que se solapan el 2026-02-10 de 07:00 a 10:00"), la fecha de detección, y un botón
"Marcar como resuelto". Las tarjetas resueltas se muestran atenuadas con un icono de check verde y
badge "Resuelto". Mostrar también el estado vacío como una tarjeta central con icono de check verde
grande y el texto "Sin conflictos — este horario puede publicarse". Estilo institucional, alto
contraste WCAG AA, el color nunca es la única señal (siempre icono + texto). Responsive: tarjetas
en columna única en móvil.
```

**Mockup:** _(pendiente — `../mockups/02-coordinador/panel-conflictos.png`)_

---

## Pantalla 5 — Disponibilidad

- **Ruta:** `/disponibilidad` · **Rol:** Coordinador Académico · **HU:** HU-05 (ambientes disponibles), HU-06 (instructores disponibles)
- **Endpoints:**
  - `GET /training-environments` (`listTrainingEnvironments`, training-environment.yaml) — filtros `environment_type_id`, `training_center_id`, `is_active`, `available_date`, `available_start_time`, `available_end_time`
  - `GET /environment-types` (`listEnvironmentTypes`) — para poblar el filtro de tipo
  - `GET /instructors` (`listInstructors`, actors.yaml) — filtros `document_number`, `area`, `training_center_id`, `is_active`
  - `GET /instructors/{id}/availability-exceptions` (`listInstructorAvailabilityExceptions`) — filtros `from`/`to`
  - `GET /reports/environment-utilization` (`reportEnvironmentUtilization`) — `from`/`to` obligatorios; reporte de ocupación por ambiente
  - `GET /reports/instructor-load` (`reportInstructorLoad`) — reporte de carga/disponibilidad por instructor
- **Tabla/campos reales:** `environment.{id, name, environment_type_id, training_center_id, capacity, location, is_active}`; `instructor.{id, full_name, document_number, default_max_hours_per_week, is_active}`; `instructor_availability_exception.{exception_type, start_datetime, end_datetime}`

> **Nota de congruencia (no se inventa):** `RF-ACT-03`/`HU-06` mencionan `GET
> /instructors/available` y `RF-ENV-04` menciona `GET /environments/available`, pero ninguno de los
> dos existe como `operationId` en los contratos reales. Para **ambientes** sí hay equivalente
> funcional: los parámetros `available_date`/`available_start_time`/`available_end_time` de `GET
> /training-environments` calculan la disponibilidad efectiva (descuenta mantenimiento y reservas)
> en el propio servicio. Para **instructores no hay endpoint agregado**: esta pantalla compone la
> disponibilidad en el cliente cruzando `GET /instructors` (candidatos) con `GET
> /instructors/{id}/availability-exceptions?from=&to=` (excepciones en la franja consultada) —
> documentado aquí como supuesto de v0, a validar con backend antes de construir.

**Layout:** selector de fecha + franja horaria (hora inicio/fin) arriba, compartido por ambos
paneles; dos paneles/tabs — **Ambientes**: tarjetas/tabla con `name`, `environment_type`,
`capacity`, `location`, badge "Disponible"/"No disponible" (icono+texto) según los parámetros
`available_*`, enlace a reporte de utilización; **Instructores**: tabla con `full_name`,
`document_number`, área(s) (`instructor_area.area_name`), `default_max_hours_per_week`, badge
"Disponible"/"Con excepción" (derivado de cruzar `availability-exceptions` en la franja), enlace al
reporte de carga.

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Consultar ambientes por fecha/franja | `GET /training-environments?available_date=&available_start_time=&available_end_time=` | refresca lista de ambientes con disponibilidad calculada |
| Filtrar ambientes por tipo/centro | `GET /training-environments?environment_type_id=&training_center_id=` | refresca |
| Ver ocupación del ambiente | `GET /reports/environment-utilization?environment_id=&from=&to=` | abre detalle de reporte |
| Consultar instructores | `GET /instructors?area=&training_center_id=` + `GET /instructors/{id}/availability-exceptions?from=&to=` por candidato | marca disponible/con excepción en la franja |
| Ver carga del instructor | `GET /reports/instructor-load?training_center_id=&area=` | abre reporte |

**Estados:** *loading* (skeleton en ambos paneles) · *empty* ("No hay ambientes/instructores que
cumplan el filtro") · *error* (banner + reintentar por panel) · el badge "No disponible"/"Con
excepción" siempre usa icono + texto, coherente con el tratamiento de conflicto del resto del
sistema.

```text
PROMPT STITCH
Pantalla "Disponibilidad" del Coordinador Académico, plataforma SENA — Gestión de Horarios, en
español. Encabezado "Disponibilidad" con un selector de fecha y un rango de hora (inicio/fin)
compartido arriba. Debajo, dos pestañas: "Ambientes" (activa) e "Instructores". En "Ambientes": una
cuadrícula de tarjetas, cada una con nombre del ambiente ("Aula 201"), tipo (Laboratorio/Aula/
Taller), capacidad ("30 personas"), ubicación, y un badge "Disponible" (verde, icono de check) o
"No disponible" (gris/rojo, icono de candado) según la franja seleccionada. En "Instructores": una
tabla con columnas Nombre, Documento, Área, Horas máx./semana, y un badge "Disponible" o "Con
excepción" (icono de calendario tachado) si tiene una licencia/incapacidad registrada en esa
franja. Incluir un botón secundario "Ver reporte de ocupación" sobre el panel de Ambientes y "Ver
reporte de carga" sobre el de Instructores. Estilo institucional, alto contraste WCAG AA,
objetivos táctiles ≥44px pensando en uso en tablet dentro de los ambientes. Responsive.
```

**Mockup:** _(pendiente — `../mockups/02-coordinador/disponibilidad.png`)_

---

## Pantalla 6 — Fichas

- **Ruta:** `/fichas` · **Rol:** Coordinador Académico · **HU:** HU-01 (parcial — el alta detallada de ficha queda fuera de esta pantalla de consulta, ver nota)
- **Endpoint principal:** `GET /reports/enrollment-by-ficha` (`reportEnrollmentByFicha`, academic-management.yaml) — reporte propio que cruza `enrollment_ficha` + `training_program` y ya resuelve `program_code`/`program_name` (evita un join manual contra `GET /training-programs/{id}`)
- **Filtros reales:** `training_center_id`, `program_id`, `status` (enum `INDUCTION`/`EXECUTION`/`PRODUCTIVE_STAGE`/`COMPLETED`/`CANCELLED`), `from`/`to` (rango de `start_date`)
- **Endpoint de detalle:** `GET /fichas/{id}` (`getFicha`) — trae el registro completo (`program_version`, `expected_end_date`, `actual_end_date`, `training_shift`, `training_modality`, `max_capacity`, `created_at`, `updated_at`)
- **Tabla/campos reales:** `EnrollmentByFichaReportItem.{ficha_id, ficha_number, program_id, program_code, program_name, training_center_id, status, max_capacity, training_shift, training_modality, start_date}`; detalle en `enrollment_ficha`

**Propósito:** consultar rápidamente las fichas del centro con su programa y estado, y abrir el
detalle completo de cada una.

**Layout:** header "Fichas"; filtros por programa, estado y rango de fecha de inicio; tabla densa
con columnas **Ficha** (`ficha_number`), **Programa** (`program_code` — `program_name`), **Estado**
(badge icono+texto: Inducción / Ejecución / Etapa productiva / Finalizada / Cancelada),
**Jornada** (`training_shift`), **Modalidad** (`training_modality`), **Cupo máximo**
(`max_capacity`), **Fecha de inicio** (`start_date`); al hacer clic en una fila se abre un panel
lateral de detalle con `GET /fichas/{id}` (incluye `program_version`, fechas de cierre esperada y
real).

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Filtrar por programa/estado/fecha | `GET /reports/enrollment-by-ficha?program_id=&status=&from=&to=` | refresca la tabla |
| Ver detalle de ficha | `GET /fichas/{id}` | abre panel lateral con todos los campos |
| (Fuera de v0) Crear ficha | `POST /fichas` (`createFicha`) — HU-01 | no se detalla en esta pantalla de consulta; queda como pantalla de alta pendiente para una iteración posterior |

**Estados:** *loading* (skeleton de filas) · *empty* ("No hay fichas que coincidan con los
filtros") · *error* (banner + reintentar).

```text
PROMPT STITCH
Pantalla "Fichas" del Coordinador Académico, plataforma SENA — Gestión de Horarios, en español,
dentro del app shell. Encabezado "Fichas". Barra de filtros: selector "Programa" (buscable),
selector "Estado" (Inducción / Ejecución / Etapa productiva / Finalizada / Cancelada), rango de
fechas "Inicio". Tabla densa con columnas: Ficha (número), Programa (código — nombre), Estado
(badge con icono + texto), Jornada (Diurna/Nocturna/Mixta), Modalidad (Presencial/Virtual/Híbrida),
Cupo máximo, Fecha de inicio. Al hacer clic en una fila se abre un panel de detalle deslizante
desde la derecha con los datos completos: versión del programa, fecha de inicio, fecha esperada de
cierre, fecha real de cierre (si aplica). Mostrar el estado vacío con icono de carpeta y el texto
"No hay fichas que coincidan con los filtros". Estilo institucional, alto contraste WCAG AA, filas
con hover sutil. Responsive: en móvil la tabla colapsa a tarjetas apiladas por ficha.
```

**Mockup:** _(pendiente — `../mockups/02-coordinador/fichas.png`)_

---

## Mockups generados
_(pendiente — guardar en `../mockups/02-coordinador/` y enlazar aquí: dashboard.png, horarios-lista.png, horario-editar.png, panel-conflictos.png, disponibilidad.png, fichas.png)_
