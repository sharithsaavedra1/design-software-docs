<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: DDD de flujo UX (Aprendiz) + prompts Stitch, mobile-first
fase: diseño (UX/UI)
estado: draft
dependencias_entrada: 07-api/contracts/openapi/scheduling.yaml, monitoring.yaml; 09-microservices/services/05-scheduling-service/data-model.md, 08-monitoring-service/data-model.md; 01-iam-service/rbac-design.md; 12-ux-ui/navigation-map.md, design-system.md; 04-requirements/functional.md, user-stories.md
consumidores_siguientes: Google Stitch; validación de diseño
tldr: 2 pantallas de solo lectura para el Aprendiz (Mi horario semanal, Notificaciones), derivadas de scheduling.yaml/monitoring.yaml, con prompts Stitch mobile-first.
decisiones_clave: nombre de competencia/instructor/ambiente se resuelve por id externo (competency_id→academic-management, instructor_id/environment_id→actors/training-environment; ver RF-SCH-07); "leído/no leído" NO existe en sent_notification (solo send_status de entrega) — no se inventa, se documenta el gap; Notificaciones (LISTA) lleva paginación REAL visible por cursor (Anterior/Página N/Siguiente + selector page_size vía `limit`, "Mostrando X–Y de N aprox." al no haber `total` en CursorPagination), compacta en mobile — misma convención que Auditoría en flows/06-backoffice.md; Mi horario es calendario semanal, sin paginador de lista.
halts_registrados: GAP-1 SCH_VIEW_OWN (scope OWN_FICHA_AS_LEARNER, rbac-design.md) no está cableado a ningún endpoint de scheduling.yaml (todos los GET usan SCH_VIEW_ALL); GAP-2 MON_NOTIFICATION_VIEW no figura en el catálogo/matriz de rbac-design.md (sin asignación explícita a LEARNER)
-->

# Flujo — Aprendiz

> **ESTADO: PRELIMINAR (v0).** Mockup de descubrimiento, no diseño final. Trazabilidad
> completa a **endpoint + tabla**; trazabilidad a **HU** solo donde existe
> (`04-requirements/user-stories.md`) — si no, `HU: pendiente`. Ver
> [README.md](../README.md) para el framework completo y el brief global de estilo.

**Rol:** `LEARNER` (Aprendiz) · **Navegación:** [navigation-map.md](../../navigation-map.md#aprendiz)
— *Mi horario*, *Notificaciones*.
**Servicios origen:** `scheduling-service` (horario) · `monitoring-service` (notificaciones).
**Uso previsto:** consulta desde **móvil**, con conectividad variable (design-system §1.4)
— toda pantalla es tolerante a conexión intermitente.

**Gaps de RBAC detectados (documentados, no resueltos aquí):**
- **GAP-1:** `rbac-design.md` define `SCH_VIEW_OWN` (scope `OWN_FICHA_AS_LEARNER`, "Agrega
  `WHERE ficha_id = <jwt.ficha_id>`") como el feature previsto para que el Aprendiz consulte
  su horario, pero **ningún endpoint de `scheduling.yaml` lo declara** — los `GET` de
  `/schedules` y `/sessions` exigen `SCH_VIEW_ALL`. Se documentan los endpoints reales del
  contrato; se asume que el scope `OWN_FICHA_AS_LEARNER` se aplicará sobre `SCH_VIEW_ALL` (o
  que `scheduling.yaml` se corregirá para exponer `SCH_VIEW_OWN`) antes de construir la app.
- **GAP-2:** `MON_NOTIFICATION_VIEW` (usado por `GET /sent-notifications` en `monitoring.yaml`)
  no aparece en el catálogo de features ni en la matriz de roles de `rbac-design.md` (solo
  `MON_NOTIFICATION_SEND` está catalogado). No hay confirmación formal de que `LEARNER` tenga
  este feature; se asume acceso de solo lectura a sus propias notificaciones
  (`recipient_id = jwt.sub`), consistente con que `navigation-map.md` lista "Notificaciones"
  en el área Aprendiz.

---

## Pantalla 1 — Mi horario (semana)

- **Ruta:** `/mi-horario` · **Rol:** Aprendiz · **HU:** HU-12 — *Consultar el horario de mi
  ficha* (`04-requirements/user-stories.md`, RF-SCH-06: "consultar el horario vigente ...
  por aprendiz (ficha)").
- **Endpoints (scheduling.yaml):**
  1. `GET /api/v1/schedules?ficha_id={jwt.ficha_id}&period={periodo_actual}&status=PUBLISHED`
     → localiza el horario **vigente** (`Schedule`, único `PUBLISHED` por `ficha_id`+`period`
     por el índice único parcial). `x-required-feature: SCH_VIEW_ALL` (ver GAP-1).
  2. `GET /api/v1/sessions?schedule_id={schedule.id}&from={lunes_semana}&to={domingo_semana}&status=ACTIVE,CANCELLED`
     → sesiones (`class_session`) de la semana visible. `x-required-feature: SCH_VIEW_ALL`
     (ver GAP-1).
- **Campos reales (`Session`, scheduling-service data-model.md):** `id`, `schedule_id`,
  `competency_id` (ref. externa `competency.id` → academic-management-service), `environment_id`
  (ref. externa `environment.id` → training-environment-service), `instructor_id` (ref. externa
  `instructor.id` → actors-service), `time_slot_id`, `session_date`, `day_of_week` (1=lunes…
  7=domingo, copia inmutable de `time_slot`), `start_time`/`end_time` (copia inmutable de
  `time_slot`), `status` (`ACTIVE`/`CANCELLED`), `notes`, `updated_at`.
- **Resolución de nombre (no inventada, cross-service real):** `competency.name`
  (`academic-management.yaml#Competency`), `environment.name`
  (`training-environment.yaml#Environment`), `instructor.full_name` (`actors.yaml`) son campos
  reales en sus propios contratos; `Session` solo trae los `*_id`. RF-SCH-07 prevé **read
  models locales** poblados por eventos para resolver estas referencias sin llamadas síncronas.
  La tarjeta muestra el nombre resuelto junto al dato — si el read model aún no está disponible,
  se muestra el id de referencia como *fallback*.

**Propósito:** que el aprendiz vea, de solo lectura, las clases de su ficha en la semana
actual — competencia, instructor, ambiente y franja — incluyendo sesiones canceladas
(cambios) sobre el horario publicado.

**Layout (mobile-first, columna única):**
- **Header de página:** nombre de la ficha/programa (dato de contexto, no editable aquí) +
  selector de semana: flecha ◀ / etiqueta "17–22 feb 2026" / flecha ▶ (semana actual por
  defecto).
- **Lista por día** (Lunes a Sábado — `RF-SCH-04` no permite sesiones domingo): cada día es
  una sección con fecha corta y sus tarjetas de sesión debajo; día sin sesiones muestra
  "Sin clases" en texto secundario (no se oculta el día).
- **Tarjeta de sesión:** franja horaria (`start_time`–`end_time`, con `TimeSlot.name` si está
  disponible), nombre de competencia (`competency_id`), instructor (`instructor_id`), ambiente
  (`environment_id`); badge de estado a la derecha: `ACTIVE` (neutro, "Programada") o
  `CANCELLED` (crítico, icono + texto "Cancelada", tarjeta con tachado/opacidad reducida —
  nunca solo color). Si `notes` no es null, se muestra como línea secundaria (p. ej. motivo de
  cambio).
- **Área táctil ≥44×44px** en selector de semana y en cada tarjeta (tap → no navega, es solo
  lectura; se reserva para un futuro detalle).

**Datos mostrados (campo → origen real):**

| En pantalla | Campo | Origen |
|---|---|---|
| Fecha del día | `session_date` | `Session` |
| Franja | `start_time`, `end_time` (+ `TimeSlot.name` si resuelto) | `Session` (copia de `time_slot`) / `TimeSlot` |
| Competencia | `competency_id` → `Competency.name` | `Session` → academic-management-service |
| Instructor | `instructor_id` → `Instructor.full_name` | `Session` → actors-service |
| Ambiente | `environment_id` → `Environment.name` | `Session` → training-environment-service |
| Estado de la sesión | `status` (`ACTIVE`/`CANCELLED`) | `Session` |
| Nota del cambio (si existe) | `notes` | `Session` |
| Semana mostrada | `from`/`to` (parámetros de consulta) | Selector de semana (UI) |

**Acciones:**

| Control | Endpoint | Resultado |
|---|---|---|
| ◀ / ▶ semana | `GET /sessions?schedule_id=…&from=…&to=…` | recarga la lista con el nuevo rango de fechas |
| Pull-to-refresh | Repite paso 1 y 2 | refresca horario vigente y sesiones de la semana |

**Estados:** *loading* (skeleton de tarjetas por día) · *empty* (semana sin `schedule`
`PUBLISHED` para la ficha → "Aún no hay horario publicado para tu ficha") · *empty por
día* ("Sin clases" en un día sin sesiones) · *error* (banner con icono + "No pudimos cargar tu
horario" y botón "Reintentar") · *offline* (banner "Sin conexión — mostrando el último horario
guardado", tolerante a conectividad móvil variable) · *conflicto*: no aplica (el aprendiz solo
ve horarios `PUBLISHED`, ya validados y sin conflictos pendientes).

```text
PROMPT STITCH
Pantalla móvil "Mi horario" para un Aprendiz del SENA, app "SENA — Gestión de Horarios", en
español, diseño MOBILE-FIRST (viewport ~375px de ancho, un solo dedo pulgar alcanza todo).
Arriba, un encabezado con el nombre de la ficha/programa en texto pequeño y, debajo, un
selector de semana centrado: flecha "◀", etiqueta "17–22 feb 2026", flecha "▶" (objetivos
táctiles de al menos 44×44 px). Debajo, una lista vertical agrupada por día (Lunes a Sábado):
cada día es un encabezado de sección con la fecha ("Lunes 17 feb") y, debajo, tarjetas de
sesión apiladas. Cada tarjeta de sesión muestra: la franja horaria arriba a la izquierda
("07:00 – 10:00"), el nombre de la competencia en texto principal ("Instalaciones Eléctricas
Residenciales"), el nombre del instructor y el nombre del ambiente en texto secundario
("Instructor: Ana Ruiz · Ambiente: Aula 201"), y a la derecha un badge de estado: uno en verde
con icono de check "Programada" y otro de ejemplo en rojo/crítico con icono de alerta y texto
"Cancelada" (la tarjeta cancelada se muestra con tachado sutil y opacidad reducida — el estado
nunca depende solo del color). Un día sin clases muestra el texto secundario "Sin clases".
Incluir el estado vacío completo: ilustración simple + texto "Aún no hay horario publicado
para tu ficha". Incluir un banner delgado en la parte superior para el estado sin conexión:
"Sin conexión — mostrando el último horario guardado" con icono de nube tachada. Estilo
institucional SENA, verde institucional (placeholder), alto contraste WCAG AA, tipografía
sans-serif, esquinas suaves, tarjetas con sombra sutil. Mostrar también la variante de carga
(skeletons de tarjetas). Todo pensado para pantalla de celular, con la navegación inferior o
top bar simplificada de la app (icono de horario activo, icono de notificaciones con badge).

Reglas de calidad: no dupliques ningún dato ni acción (cada CTA una sola vez; no repitas botones que
ya están en la nav lateral o en las tarjetas; no agregues fila extra de accesos directos). Nombre y
rol del usuario solo en el menú superior. Máximo 3–4 tarjetas KPI y una sección principal; densidad
moderada, sin sobrecargar. Si es una PANTALLA DE LISTA, incluye paginación REAL visible (barra ‹
anterior · 1 2 3 · siguiente ›, selector de tamaño de página, y "Mostrando X–Y de N"); si es un WIDGET
de dashboard, usa "top N · Ver todos" sin paginador. Los números deben calzar con lo listado. Datos
de ejemplo realistas y proporcionados (muy cercano a la realidad, sin lorem ipsum).
ENTREGA SIEMPRE: un ZIP con las imágenes PNG (una desktop ~1440px y una móvil ~390px por pantalla) +
el HTML/CSS/JS iterativo y funcional (autocontenido o con assets locales) que abra en el navegador.
```

> **Sin paginador de tabla:** esta pantalla es un **calendario semanal** (no una lista paginada);
> la navegación es por semana (◀/▶), no aplica el anti-patrón #3 de paginación de listas.

---

## Pantalla 2 — Notificaciones

- **Ruta:** `/notificaciones` · **Rol:** Aprendiz · **HU:** pendiente (no existe HU-## de
  Aprendiz para notificaciones en `04-requirements/user-stories.md`; la pantalla deriva de
  `navigation-map.md` §Aprendiz — "Notificaciones — avisos de cambios de horario" — y del
  contrato real de `monitoring.yaml`).
- **Endpoint:** `GET /api/v1/sent-notifications?recipient_id={jwt.sub}&channel=IN_APP&cursor={cursor}&limit={limit}`
  → paginación por **cursor** (colección append-only, retención 1 año, particionada por
  `created_at`); respuesta trae `pagination: { next_cursor, limit, has_more }`
  (`_shared.yaml#/components/schemas/CursorPagination` — **sin** `total` ni `prev_cursor`).
  `x-required-feature: MON_NOTIFICATION_VIEW` (ver GAP-2). Filtro adicional
  disponible: `status` (`send_status`: `PENDING`/`SENT`/`FAILED`), `from`/`to` (rango de
  `created_at`), `generated_alert_id`. El parámetro `limit` es también el **`page_size`**
  visible en la UI (10/20/50).
- **Detalle (si se abre una notificación):** `GET /api/v1/sent-notifications/{id}`.
- **Campos reales (`SentNotification`, monitoring-service data-model.md):** `id`,
  `generated_alert_id` (nullable — null si la notificación es manual), `recipient_id`,
  `recipient_email`, `channel` (`EMAIL`/`IN_APP`), `subject`, `body_summary` (nullable —
  resumen; el cuerpo completo no se persiste en el log), `send_status`
  (`PENDING`/`SENT`/`FAILED`), `failure_reason` (nullable, solo si `FAILED`), `sent_at`
  (nullable), `created_at`.
- **Nota de precisión (no se inventa):** `sent_notification` **no tiene** un campo
  leído/no leído — solo `send_status`, que describe la **entrega del sistema**
  (`PENDING`→`SENT`/`FAILED`), no la lectura del aprendiz. Esta pantalla usa `send_status`
  como único estado visible; no se agrega un estado "leído" inexistente en el data-model.

**Propósito:** que el aprendiz vea, de solo lectura, los avisos que le han enviado (típicamente
cambios de horario originados por `generated_alert`), en una bandeja cronológica tolerante a
conectividad móvil.

**Layout (mobile-first, columna única):**
- **Header de página:** título "Notificaciones".
- **Lista cronológica** (más reciente primero, orden por `created_at` desc): tarjeta por
  notificación con `subject` (texto principal), `body_summary` (texto secundario, 1–2 líneas,
  truncado), marca de tiempo relativa (`sent_at` si existe, si no `created_at`), y badge de
  `send_status` con icono + texto (`SENT` = éxito discreto — es el caso normal y no debe
  destacar en exceso; `PENDING` = neutro "Enviando…"; `FAILED` = crítico "No se pudo entregar",
  con `failure_reason` visible al expandir).
- **Paginación REAL y visible, por CURSOR** (README anti-patrón #3 — excepción `cursor`/`limit`,
  misma convención que "Auditoría" en `flows/06-backoffice.md`): barra al pie de la lista con
  botón **"‹ Anterior"** (deshabilitado en la primera página; retrocede al cursor previo,
  guardado en el cliente — el contrato **no** expone `prev_cursor`), indicador **"Página N"**,
  botón **"Siguiente ›"** (avanza con `next_cursor`; deshabilitado si `has_more = false`), y
  **selector de tamaño de página** (`limit`: 10/20/50). Encima de la barra, el texto
  **"Mostrando X–Y de N aprox."** (`N` es aproximado: el contrato no expone un total exacto,
  solo `has_more`). **Adaptación mobile (compacta):** en viewport ~375px la barra se reduce a
  una sola fila "‹ · Página N · ›" con el selector de tamaño colapsado en un menú desplegable
  pequeño junto al texto "Mostrando X–Y", para no competir con las tarjetas.
- **Objetivos táctiles ≥44×44px** en cada tarjeta y en cada control de la barra de paginación.

**Datos mostrados (campo → origen real):**

| En pantalla | Campo | Origen |
|---|---|---|
| Asunto | `subject` | `SentNotification` |
| Resumen | `body_summary` | `SentNotification` |
| Canal (si se distingue) | `channel` | `SentNotification` |
| Estado de entrega | `send_status` (+ `failure_reason` si `FAILED`) | `SentNotification` |
| Fecha/hora | `sent_at` (fallback `created_at`) | `SentNotification` |
| Origen del aviso (si aplica) | `generated_alert_id` (nullable) | `SentNotification` |

**Acciones:**

| Control | Endpoint | Resultado |
|---|---|---|
| Siguiente › | `GET /sent-notifications?...&cursor={next_cursor}&limit={limit}` | reemplaza la lista por la siguiente página; guarda el cursor actual en el historial local |
| ‹ Anterior | — (cliente: cursor previo del historial local; el contrato no expone `prev_cursor`) | reemplaza la lista por la página anterior ya cargada |
| Selector de tamaño de página (10/20/50) | `GET /sent-notifications?...&limit={limit}` (reinicia `cursor`) | recarga desde la primera página con el nuevo `limit` |
| Pull-to-refresh | `GET /sent-notifications?...&cursor=` (primera página) | refresca la bandeja desde el inicio |
| Tap en tarjeta | `GET /sent-notifications/{id}` | muestra detalle (asunto, resumen, estado, motivo de falla si aplica) |

**Estados:** *loading* (skeleton de tarjetas) · *empty* ("No tienes notificaciones" con
ilustración simple) · *error* (banner con icono + "No pudimos cargar tus notificaciones" y
botón "Reintentar") · *offline* (banner "Sin conexión — mostrando las últimas notificaciones
guardadas") · *cambiando de página* (skeleton reemplaza la lista mientras carga Anterior/
Siguiente; los controles de la barra de paginación se deshabilitan durante la carga).

```text
PROMPT STITCH
Pantalla móvil "Notificaciones" para un Aprendiz del SENA, app "SENA — Gestión de Horarios", en
español, diseño MOBILE-FIRST (viewport ~375px de ancho). Encabezado simple con el título
"Notificaciones". Debajo, una lista vertical de tarjetas de notificación, ordenadas de más
reciente a más antigua. Cada tarjeta muestra: un asunto en texto principal en negrita (ej.
"Cambio en tu horario: sesión del jueves cancelada"), un resumen en texto secundario de una o
dos líneas ("La sesión de Instalaciones Eléctricas Residenciales del jueves 20 feb fue
cancelada por el instructor"), una marca de tiempo relativa a la derecha arriba ("hace 2 h") y,
abajo a la derecha, un badge de estado de entrega con icono + texto: la mayoría en un tono
discreto de éxito "Enviado", una tarjeta de ejemplo en gris neutro con icono de reloj
"Enviando…", y una tarjeta de ejemplo en rojo/crítico con icono de alerta "No se pudo entregar"
(nunca solo color). Al final de la lista, una barra de paginación REAL y visible: encima el
texto "Mostrando 1–10 de 34 aprox.", y debajo una fila compacta con botón "‹ Anterior"
(atenuado/deshabilitado de ejemplo por estar en la primera página), indicador "Página 1",
botón "Siguiente ›", y junto a ellos un selector pequeño de tamaño de página con las opciones
"10 / 20 / 50". En el viewport móvil de ~375px esta barra se ve compacta, en una sola fila,
con el selector de tamaño colapsado en un menú desplegable pequeño para no competir con las
tarjetas. Incluir el estado vacío completo: ilustración simple + texto "No tienes
notificaciones". Incluir un banner delgado superior para el estado sin conexión: "Sin conexión
— mostrando las últimas notificaciones guardadas". Estilo institucional SENA, verde
institucional (placeholder), alto contraste WCAG AA, tipografía sans-serif, esquinas suaves,
tarjetas con sombra sutil, objetivos táctiles ≥44px. Mostrar también la variante de carga
(skeletons de tarjetas) y la variante de cambio de página (skeleton reemplazando la lista,
controles de paginación deshabilitados). Pensado para pantalla de celular con top bar
simplificada de la app (icono de horario, icono de notificaciones con badge activo en esta
pantalla).

Reglas de calidad: no dupliques ningún dato ni acción (cada CTA una sola vez; no repitas botones que
ya están en la nav lateral o en las tarjetas; no agregues fila extra de accesos directos). Nombre y
rol del usuario solo en el menú superior. Máximo 3–4 tarjetas KPI y una sección principal; densidad
moderada, sin sobrecargar. Si es una PANTALLA DE LISTA, incluye paginación REAL visible (barra ‹
anterior · 1 2 3 · siguiente ›, selector de tamaño de página, y "Mostrando X–Y de N"); si es un WIDGET
de dashboard, usa "top N · Ver todos" sin paginador. Los números deben calzar con lo listado. Datos
de ejemplo realistas y proporcionados (muy cercano a la realidad, sin lorem ipsum).
ENTREGA SIEMPRE: un ZIP con las imágenes PNG (una desktop ~1440px y una móvil ~390px por pantalla) +
el HTML/CSS/JS iterativo y funcional (autocontenido o con assets locales) que abra en el navegador.
```

---

## Mockups generados
_(pendiente — guardar en `../mockups/04-aprendiz/` y enlazar aquí: mi-horario.png,
notificaciones.png)_
