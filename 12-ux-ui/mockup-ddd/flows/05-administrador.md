<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: DDD de flujo UX (Administrador de Centro / Director) + prompts Stitch
fase: diseño (UX/UI)
estado: draft
dependencias_entrada: 07-api/contracts/openapi/{monitoring,iam,reference-data}.yaml; 09-microservices/services/{08-monitoring,01-iam,02-reference-data}-service/data-model.md; 12-ux-ui/design-system.md, navigation-map.md; 04-requirements/user-stories.md
consumidores_siguientes: Google Stitch; validación de diseño
tldr: Panel de KPIs (solo dominio monitoring), administración de usuarios/roles (iam) y datos de referencia (jerarquía + catálogos + parámetros), con RBAC citado por endpoint.
decisiones_clave: monitoring reporta solo su propio dominio (no utilización de ambientes/carga de instructores: fuera de su contrato); catálogos y parámetros son de solo lectura para este rol (RN-REF-03/RF-REF-03), editables solo por ADMIN_STAFF/SYSTEM_ADMIN; iam.yaml no expone GET de roles por usuario (limitación conocida del contrato)
halts_registrados: ninguno
-->

> **ESTADO: PRELIMINAR (v0)** — instrumento de descubrimiento, no diseño final. Trazabilidad
> completa a **endpoint + tabla**; trazabilidad a HU se cierra después (ver
> [README.md](../README.md)).

# Flujo — Administrador de Centro / Director

**Rol:** Administrador de Centro / Director (rol de negocio `CENTER_DIRECTOR`/`ADMIN_STAFF` en IAM)
**Navegación:** [navigation-map.md](../../navigation-map.md) → Administrador de Centro → Panel de
indicadores · Administración.

**Servicios origen:**
- Pantalla 1 — `monitoring-service` · Contrato: `../../../07-api/contracts/openapi/monitoring.yaml` · Modelo: `../../../09-microservices/services/08-monitoring-service/data-model.md`
- Pantalla 2 — `iam-service` · Contrato: `../../../07-api/contracts/openapi/iam.yaml` · Modelo: `../../../09-microservices/services/01-iam-service/data-model.md`
- Pantalla 3 — `reference-data-service` · Contrato: `../../../07-api/contracts/openapi/reference-data.yaml` · Modelo: `../../../09-microservices/services/02-reference-data-service/data-model.md`

---

## Pantalla 1 — Panel de indicadores (KPIs)

- **Ruta:** `/admin/indicadores` · **Rol:** Administrador de Centro / Director · **HU:** pendiente
  (relacionado a discovery M9 — ver [navigation-map.md](../../navigation-map.md); HU-20 solo cubre
  la consulta de KPIs del coordinador por ficha individual, no este tablero agregado).
- **Endpoints:**
  - `GET /api/v1/reports/indicators` (`x-required-feature: MON_REPORT_VIEW`) — agregado de fichas
    por `kpi_status_code` + `risk_level_code`. Filtros: `status`, `assigned_instructor_id`, `page`,
    `page_size`, `sort`. → `{ data: IndicatorsReportEntry[], pagination }` con
    `{ kpi_status_code, risk_level_code, ficha_count, avg_active_alert_count, as_of }`.
  - `GET /api/v1/reports/kpi-summary` (`x-required-feature: MON_REPORT_VIEW`) — última medición de
    cada KPI por ficha. Filtros: `ficha_tracking_id`, `kpi_type`, `status`, `from`, `to`, `page`,
    `page_size`, `sort`. → `{ data: KpiSummaryReportEntry[], pagination }` con
    `{ ficha_tracking_id, kpi_type_code, kpi_type_name, current_value, unit, threshold_value,
    kpi_status_code, risk_level_code, period_start, period_end, measured_at }`.
- **Catálogos de apoyo (para leyendas/badges):** `GET /api/v1/kpi-statuses` (`MON_KPI_VIEW`) →
  `KpiStatus{code, risk_level_id}`; `GET /api/v1/risk-levels` (`MON_ALERT_VIEW`) →
  `RiskLevel{code, label, color_hex, priority_order}` (INFO→LOW→MEDIUM→HIGH→CRITICAL,
  `priority_order` 1 = mayor urgencia).
- **Errores del contrato:** `401`, `403`, `429` (`TooManyRequests` en ambos reportes).

**Alcance (nota de precisión):** `monitoring-service` **solo publica reportes de su propio
dominio** (seguimiento de fichas: asistencia, avance curricular, riesgo de deserción, avance de
etapa productiva). El navigation-map menciona "utilización de ambientes" y "carga de
instructores", pero esos datos **no existen en el contrato de monitoring** (pertenecen a otros
dominios aún sin reporte contratado); esta pantalla v0 **no los incluye** para no inventar campos.

**Propósito:** dar visibilidad ejecutiva del estado de seguimiento de todas las fichas del centro,
resaltando cuántas están en riesgo o crítico, para decidir dónde intervenir.

**Layout:**
- **Barra de filtros** (arriba): selector de **Tipo de KPI** (`ATTENDANCE`, `CURRICULUM_PROGRESS`,
  `DROPOUT_RISK`, `PRODUCTIVE_STAGE_PROGRESS`), selector de **Estado** (`ON_TRACK`/`AT_RISK`/
  `CRITICAL`, desde `kpi_status`), rango de fechas (`from`/`to` sobre `measured_at`), botón
  **Actualizar**.
- **Fila de tarjetas de KPI** (3, una por `kpi_status_code` agregado de `/reports/indicators`):
  cada tarjeta muestra el número grande de `ficha_count`, subtítulo `avg_active_alert_count`
  ("alertas activas promedio") y color+icono+texto del `risk_level_code` asociado (verde/ON_TRACK,
  ámbar/AT_RISK, rojo-crítico/CRITICAL — nunca solo color). Pie de tarjeta: "Actualizado: `as_of`".
- **Gráfico de distribución:** barras o dona con `ficha_count` por `risk_level_code` (usa
  `color_hex` del catálogo `risk_level` como base, con icono/etiqueta de apoyo).
- **Tabla densa** (de `/reports/kpi-summary`, widget de resumen — **no** es la pantalla de lista):
  columnas Ficha (`ficha_tracking_id`, truncado con tooltip), KPI (`kpi_type_name`), Valor actual
  (`current_value` + `unit`), Umbral (`threshold_value`), Estado (badge `kpi_status_code` coloreado
  por `risk_level_code` + icono), Período (`period_start`–`period_end`), Medido (`measured_at`).
  Muestra **top N** registros (`page_size` reducido, ej. 10, ordenado por urgencia) con texto
  **"Mostrando X de N · Ver todos"**; sin barra de paginación aquí (es widget, RN de calidad #3).
  "Ver todos" navegaría a la futura pantalla de lista completa de KPIs (esa sí pagina).

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Filtro Tipo de KPI / Estado / rango de fechas | `GET /reports/kpi-summary?...` | refresca la tabla |
| Filtro Estado (tarjetas) | `GET /reports/indicators?status=...` | refresca tarjetas y gráfico |
| Actualizar | ambos GET | refresca todo el tablero |

**Estados:** *loading* (skeleton de tarjetas + gráfico + tabla) · *empty* ("No hay fichas en
seguimiento para este filtro") · *error* (banner con reintento; `429` muestra mensaje de límite de
solicitudes) · *success*.

```text
PROMPT STITCH
Pantalla "Panel de indicadores" para el Administrador/Director de un centro SENA, dentro de la
plataforma Horarios SENA, en español, responsive, dentro del app shell (barra superior + nav
lateral "Indicadores" activo). Arriba, una barra de filtros con selectores "Tipo de KPI"
(Asistencia, Avance curricular, Riesgo de deserción, Avance etapa productiva), "Estado" (En
seguimiento, En riesgo, Crítico), un rango de fechas y un botón "Actualizar". Debajo, tres tarjetas
de KPI grandes en fila: "En seguimiento" (verde, número grande de fichas, subtítulo "alertas
activas promedio: 0.4"), "En riesgo" (ámbar, con ícono de advertencia) y "Crítico" (rojo, con
ícono de alerta) — el color nunca es la única señal, siempre acompañado de ícono y texto. Debajo,
un gráfico de barras horizontal mostrando la distribución de fichas por nivel de riesgo. Al fondo,
una tabla densa (widget de resumen, top 10 registros) con columnas "Ficha", "KPI", "Valor actual",
"Umbral", "Estado" (badge con ícono), "Período", "Medido", con el texto "Mostrando 10 de 47 · Ver
todos" debajo (sin barra de paginación — es un widget, no la lista completa). Incluir el estado
vacío ("No hay fichas en seguimiento para este filtro") y el estado de carga con skeletons en
tarjetas y tabla. Estilo institucional sobrio, verde SENA (placeholder), alto contraste WCAG AA,
tablas densas con buen espaciado.

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

## Pantalla 2 — Administración — Usuarios

- **Ruta:** `/admin/usuarios` · **Rol:** Administrador de Centro / Director · **HU:** HU-18
  (Gestionar usuarios e instructores, *RF-IAM-02, RF-IAM-04*), HU-17 (Controlar el acceso por rol y
  centro, *RF-IAM-03*).
- **Endpoints:**
  - `GET /api/v1/users` (`IDENTITY_USER_VIEW`) — filtros `training_center_id`, `role`, `is_active`,
    `page`, `page_size`, `sort`. → `{ data: User[], pagination }` con `{ id, email, first_name,
    last_name, full_name, actor_type, actor_id, is_active, last_login_at, created_at, updated_at }`.
  - `POST /api/v1/users` (`IDENTITY_USER_MANAGE`) — `UserCreate{ email, first_name, last_name,
    actor_type[USER|INSTRUCTOR|LEARNER], actor_id?, initial_role, training_center_id? }` →
    `UserCreateResponse{ id, email, temporary_password }` (caduca en 72 h, RN-IAM-05).
  - `GET /api/v1/users/{id}` (`IDENTITY_USER_VIEW`) → `User` (detalle).
  - `PUT /api/v1/users/{id}` (`IDENTITY_USER_MANAGE`) — `UserUpdate{ first_name, last_name,
    actor_type, actor_id, is_active }` → `User`.
  - `POST /api/v1/users/{id}/deactivate` (`IDENTITY_USER_MANAGE`) → `204` (soft delete + revoca
    sesiones).
  - `GET /api/v1/users/{id}/sessions` (`IDENTITY_USER_VIEW`) → `Session[]{ id, device_hint,
    ip_address, created_at, expires_at, is_revoked, revoked_at }`.
  - `DELETE /api/v1/users/{id}/sessions/{session_id}` (`IDENTITY_USER_VIEW`) → `204`.
  - `POST /api/v1/users/{id}/roles` (`IDENTITY_ROLE_ASSIGN`) — `AssignRoleRequest{ role_name,
    training_center_id?, expires_at? }` → `UserRole`.
  - `DELETE /api/v1/users/{id}/roles/{role_name}` (`IDENTITY_ROLE_ASSIGN`) → `204`.
  - `GET /api/v1/roles` (`IDENTITY_ROLE_VIEW`) → `Role[]{ id, name, display_name, description,
    is_system_role, created_at }` — puebla el selector de rol.
- **Errores del contrato:** `401`, `403`, `404`, `409` (rol duplicado / desactivar dos veces),
  `422`.

**Limitación conocida del contrato (no inventar campos):** `iam.yaml` no expone un `GET` para
listar los roles **actualmente asignados** a un usuario (solo `POST`/`DELETE` para asignar/
revocar). El panel de detalle v0 no puede mostrar el historial de roles vigentes sin ese endpoint;
se deja marcado como pendiente de contrato en vez de inventarlo.

**Propósito:** dar de alta/baja al personal del centro, asignarles rol y auditar sus sesiones
activas, dentro del alcance del propio centro (scope `TRAINING_CENTER`, análogo a RN-IAM-03).

**Layout:**
- **Barra de filtros:** selector **Rol** (poblado con `GET /roles`), selector **Estado** (Activo/
  Inactivo → `is_active`), botón primario **+ Nuevo usuario**.
- **Tabla densa:** columnas Nombre completo (`full_name`), Correo (`email`), Tipo de actor
  (badge `actor_type`), Estado (badge Activo/Inactivo), Último acceso (`last_login_at`). Fila
  clicable → abre panel lateral de detalle.
- **Barra de paginación** (pantalla de LISTA — real, no widget): debajo de la tabla, ‹ anterior ·
  1 2 3 … › siguiente, selector de tamaño de página (`page_size`: 10/20/50) y texto **"Mostrando
  X–Y de N"**, alineado a `page`/`page_size` de `GET /users`.
- **Panel lateral de detalle** (al seleccionar un usuario), con 3 pestañas:
  - **Perfil:** campos de `User` + formulario de edición (`UserUpdate`) + botón **Desactivar**.
  - **Roles:** formulario **Asignar rol** (`role_name` + `training_center_id` opcional +
    `expires_at` opcional) → `POST .../roles`; lista de asignaciones recientes (de la propia
    sesión de trabajo, ya que no hay GET) con botón revocar (`DELETE .../roles/{role_name}`).
  - **Sesiones:** tabla de `Session[]` (dispositivo, IP, creada, expira) con botón **Revocar**
    por fila.
- **Modal Crear usuario:** formulario `UserCreate`; al éxito muestra `temporary_password` una
  única vez con opción de copiar y aviso "caduca en 72 h".

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| + Nuevo usuario | `POST /users` | éxito → modal con contraseña temporal; error → mensaje de validación |
| Fila de la tabla | `GET /users/{id}` | abre panel de detalle |
| Paginación (‹ › · página) / selector `page_size` | `GET /users?page=&page_size=` | refresca la tabla con la página/tamaño elegido |
| Guardar (Perfil) | `PUT /users/{id}` | actualiza usuario |
| Desactivar | `POST /users/{id}/deactivate` | modal de confirmación → 204 → usuario pasa a Inactivo |
| Asignar rol | `POST /users/{id}/roles` | 201 → chip de rol agregado a la lista |
| Revocar rol (chip ×) | `DELETE /users/{id}/roles/{role_name}` | 204 → chip removido |
| Ver sesiones | `GET /users/{id}/sessions` | lista sesiones activas |
| Revocar sesión | `DELETE /users/{id}/sessions/{session_id}` | 204 → sesión removida de la lista |

**Estados:** *loading* (skeleton de tabla y panel) · *empty* ("No hay usuarios con estos filtros")
· *error* (banner de red/permiso, `403` con mensaje "no tiene permiso para esta acción") ·
*success* (toasts por cada acción) · *confirm* (modal de confirmación antes de desactivar).

```text
PROMPT STITCH
Pantalla "Administración — Usuarios" para el Administrador/Director de un centro SENA, plataforma
Horarios SENA, en español, responsive, dentro del app shell (nav lateral "Administración" activo).
Barra superior de la sección con selector "Rol", selector "Estado" (Activo/Inactivo) y un botón
primario "+ Nuevo usuario". Debajo, una tabla densa con columnas "Nombre completo", "Correo",
"Tipo de actor" (badge), "Estado" (badge verde/gris) y "Último acceso", con filas seleccionables.
Debajo de la tabla, una barra de paginación REAL y visible: flecha "‹ anterior", números de página
"1 2 3 …", flecha "siguiente ›", un selector de tamaño de página (10/20/50) y el texto "Mostrando
1–20 de 84". Al seleccionar una fila, mostrar un panel lateral derecho con tres pestañas: "Perfil" (formulario
editable con nombre, apellido, tipo de actor, estado, y un botón "Desactivar" en rojo), "Roles"
(un selector para asignar un rol nuevo y una lista de chips de roles asignados con botón × para
revocar) y "Sesiones" (tabla de dispositivo, IP, fecha de creación, expiración, con botón
"Revocar" por fila). Incluir un modal de "Nuevo usuario" con campos correo, nombre, apellido, tipo
de actor y rol inicial, que al confirmar muestra una tarjeta con la contraseña temporal generada y
un aviso "Caduca en 72 horas" con botón de copiar. Mostrar el estado vacío de la tabla y el estado
de carga con skeleton. Estilo institucional sobrio, verde SENA (placeholder), alto contraste WCAG
AA, objetivos táctiles ≥44px.

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

## Pantalla 3 — Administración — Datos de referencia

- **Ruta:** `/admin/datos-referencia` · **Rol:** Administrador de Centro / Director · **HU:** HU-19
  (Administrar la jerarquía institucional y catálogos, *RF-REF-01, RF-REF-02*), con matiz de RBAC
  descrito abajo.
- **Nota de RBAC (precisión sobre HU-19):** el criterio de aceptación de HU-19 dice *"Solo
  `ADMIN_STAFF`/`SYSTEM_ADMIN` pueden editar catálogos; para el resto son solo lectura"*
  (RN-REF-03), y `functional.md` (RF-REF-03) restringe la edición de **parámetros** a
  `SYSTEM_ADMIN`. Por lo tanto, para el rol Administrador de Centro / Director esta pantalla es:
  **jerarquía de su centro → editable**; **catálogos → solo lectura**; **parámetros → solo
  lectura**. La UI debe ocultar/deshabilitar los controles de edición de catálogos y parámetros
  para este rol en vez de asumir que están disponibles.
- **Endpoints:**
  - **Mi centro y sedes** (editable):
    - `GET /api/v1/training-centers` (`REF_HIERARCHY_VIEW`) — filtros `municipality_id`,
      `center_code`, `is_active`. → `{ data: TrainingCenter[], pagination }` con `{ id,
      municipality_id, center_code, name, address, phone, is_active, created_at, updated_at }`.
    - `PUT /api/v1/training-centers/{id}` (`REF_HIERARCHY_MANAGE`) — `TrainingCenterUpdate{
      municipality_id, center_code, name, address, phone, is_active }`; el campo `center_code` es
      inmutable en la UI (RN-REF-01) aunque el schema lo permita — se muestra de solo lectura.
    - `GET /api/v1/institutional-units` (`REF_HIERARCHY_VIEW`) — filtro `training_center_id`,
      `unit_type`, `is_active`. → `{ data: InstitutionalUnit[], pagination }` con `{ id,
      training_center_id, name, unit_type[ACADEMIC|ADMINISTRATIVE|MIXED], is_active, created_at }`.
    - `POST /api/v1/institutional-units` (`REF_HIERARCHY_MANAGE`) —
      `InstitutionalUnitCreate{ training_center_id, name, unit_type, is_active }`.
    - `PUT /api/v1/institutional-units/{id}` (`REF_HIERARCHY_MANAGE`) — `InstitutionalUnitUpdate`.
    - `DELETE /api/v1/institutional-units/{id}` (`REF_HIERARCHY_MANAGE`) — `204` (soft delete
      `is_active=false`).
  - **Catálogos del sistema** (solo lectura para este rol):
    - `GET /api/v1/catalogs` (`REF_CATALOG_VIEW`) — filtros `code`, `is_active`. →
      `{ data: Catalog[], pagination }` con `{ id, code, name, description, is_active,
      created_at }`.
    - `GET /api/v1/catalogs/{catalog_id}/details` (`REF_CATALOG_VIEW`) → `{ data:
      CatalogDetail[], pagination }` con `{ id, catalog_id, code, label, display_order, is_active,
      created_at }`.
  - **Parámetros del sistema** (solo lectura para este rol):
    - `GET /api/v1/parameters` (`REF_PARAMETER_VIEW`) — filtros `key`, `value_type`. →
      `{ data: Parameter[], pagination }` con `{ id, key, value, value_type[integer|string|
      boolean|json], description, created_at }`.
- **Errores del contrato:** `401`, `403`, `404`, `409` (código duplicado), `422`.

**Propósito:** que el Director mantenga al día los datos de su propio centro (sedes/unidades) y
consulte —sin poder alterar— los catálogos y parámetros que gobiernan el resto del sistema.

**Layout:** 3 pestañas dentro de la misma pantalla.
- **Pestaña "Mi centro":** tarjeta con los datos del `TrainingCenter` del Director (`center_code`
  de solo lectura, `name`/`address`/`phone` editables) y botón **Guardar**. Debajo, tabla de
  `InstitutionalUnit` (Nombre, Tipo, Estado) del centro con botón **+ Nueva sede** y edición/
  desactivación por fila. **Pantalla de LISTA → barra de paginación real** debajo de la tabla
  (‹ anterior · 1 2 3 … › siguiente, selector `page_size` 10/20/50, "Mostrando X–Y de N"),
  alineada a `page`/`page_size` de `GET /institutional-units`.
- **Pestaña "Catálogos" (candado/solo lectura):** lista de `Catalog` (código, nombre) con
  expansión a sus `CatalogDetail` (código, etiqueta, orden). Mensaje visible: *"Solo
  ADMIN_STAFF/SYSTEM_ADMIN pueden editar catálogos"* — sin botones de crear/editar/eliminar para
  este rol. **Pantalla de LISTA → barra de paginación real** para la lista de catálogos (‹
  anterior · 1 2 3 … › siguiente, selector `page_size` 10/20/50, "Mostrando X–Y de N"), alineada a
  `page`/`page_size` de `GET /catalogs`; los `CatalogDetail` expandidos usan su propia página si
  `N` supera el `page_size` (mismo patrón, sobre `GET /catalogs/{id}/details`).
- **Pestaña "Parámetros" (candado/solo lectura):** tabla de `Parameter` (clave, valor, tipo,
  descripción). Mensaje visible: *"Solo SYSTEM_ADMIN puede configurar parámetros del sistema"* —
  sin botón de edición para este rol. **Pantalla de LISTA → barra de paginación real** debajo de
  la tabla (‹ anterior · 1 2 3 … › siguiente, selector `page_size` 10/20/50, "Mostrando X–Y de N"),
  alineada a `page`/`page_size` de `GET /parameters`.

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Guardar (Mi centro) | `PUT /training-centers/{id}` | actualiza nombre/dirección/teléfono |
| + Nueva sede | `POST /institutional-units` | crea unidad institucional |
| Editar sede | `PUT /institutional-units/{id}` | actualiza sede |
| Desactivar sede | `DELETE /institutional-units/{id}` | soft delete (`is_active=false`) |
| Ver catálogo | `GET /catalogs/{id}/details` | expande valores del catálogo (solo lectura) |
| Filtro Parámetros (clave/tipo) | `GET /parameters?key=&value_type=` | refresca tabla (solo lectura) |
| Paginación / `page_size` (Mi centro) | `GET /institutional-units?page=&page_size=` | refresca tabla de sedes |
| Paginación / `page_size` (Catálogos) | `GET /catalogs?page=&page_size=` | refresca lista de catálogos |
| Paginación / `page_size` (Parámetros) | `GET /parameters?page=&page_size=` | refresca tabla de parámetros |

**Estados:** *loading* (skeleton por pestaña) · *empty* ("Este centro aún no tiene sedes
registradas" / "Sin catálogos activos" / "Sin parámetros configurados") · *error* (banner de red)
· *success* (toast al guardar centro/sede) · *readonly* (candado visible + tooltip explicando la
restricción de rol en Catálogos y Parámetros).

```text
PROMPT STITCH
Pantalla "Administración — Datos de referencia" para el Administrador/Director de un centro SENA,
plataforma Horarios SENA, en español, responsive, dentro del app shell (nav lateral
"Administración" activo). Tres pestañas horizontales: "Mi centro", "Catálogos" y "Parámetros". En
"Mi centro": una tarjeta superior con los datos del centro de formación (código de centro en modo
solo lectura con un pequeño ícono de candado, y campos editables de nombre, dirección y teléfono,
con botón "Guardar"); debajo, una tabla de sedes/unidades institucionales con columnas Nombre,
Tipo y Estado, botón "+ Nueva sede" y acciones de editar/desactivar por fila, y debajo de esa
tabla una barra de paginación REAL y visible ("‹ anterior", números "1 2 3 …", "siguiente ›",
selector de tamaño de página 10/20/50 y "Mostrando 1–10 de 23"). En "Catálogos":
mostrar un banner sutil con ícono de candado y el texto "Solo ADMIN_STAFF/SYSTEM_ADMIN pueden
editar catálogos"; debajo, una lista paginada de catálogos (ej. Modalidad, Jornada) que al
expandirse muestra sus valores (código, etiqueta, orden) sin ningún botón de edición, con su
propia barra de paginación real ("‹ anterior · 1 2 3 · siguiente ›", selector de tamaño de
página, "Mostrando X–Y de N"). En "Parámetros":
mismo patrón de banner de solo lectura con el texto "Solo SYSTEM_ADMIN puede configurar
parámetros del sistema"; debajo, una tabla con columnas Clave, Valor, Tipo y Descripción, sin
botón de edición, con su barra de paginación real debajo ("‹ anterior · 1 2 3 · siguiente ›",
selector de tamaño de página 10/20/50, "Mostrando X–Y de N"). Incluir estados vacíos por pestaña
y skeleton de carga. Estilo institucional sobrio, verde SENA (placeholder), alto contraste WCAG
AA, objetivos táctiles ≥44px.

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
_(pendiente — guardar en `../mockups/05-administrador/` y enlazar aquí: indicadores.png,
usuarios.png, datos-referencia.png)_
