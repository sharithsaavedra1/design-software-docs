<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: DDD de flujo UX (Back-office / Soporte) + prompts Stitch
fase: diseño (UX/UI)
estado: draft
dependencias_entrada: 07-api/contracts/openapi/document.yaml, template.yaml, reference-data.yaml;
  09-microservices/services/07-document-service/data-model.md,
  02-reference-data-service/data-model.md, 09-audit-service/data-model.md;
  09-audit-service/components/audit-worker/contract.md; event-catalog.md;
  01-iam-service/rbac-design.md (MOD_AUDIT); 04-requirements/functional.md, user-stories.md
consumidores_siguientes: Google Stitch; validación de diseño
tldr: Pantallas de soporte back-office (documentos, plantillas, auditoría, parametrización)
  derivadas de los contratos document/template/reference-data reales y del modelo de datos de
  audit-service, con prompts listos para Stitch.
decisiones_clave: storage_key nunca se muestra (write-only); descarga solo por URL firmada de la
  versión vigente; auditoría es de solo lectura y append-only; catálogos/parámetros solo editables
  por ADMIN_STAFF/SYSTEM_ADMIN (RN-REF-03)
halts_registrados: HALT-BACKOFFICE-AUDIT-API — audit-service declara explícitamente "no expone API"
  (README.md); no existe `07-api/contracts/openapi/audit.yaml`. La Pantalla 3 asume un endpoint de
  consulta de solo lectura (`GET /api/v1/audit-records`) sobre el modelo real de `audit_record` y el
  feature RBAC ya definido (`AUDIT_LOG_VIEW`, `AUDIT_EXPORT` en rbac-design.md §MOD_AUDIT); ese
  endpoint queda pendiente de contrato formal. No se inventan campos: los mostrados son los reales
  del data-model de audit-service.
-->

# Flujo — Back-office / Soporte (documentos, auditoría, parametrización)

> **ESTADO: PRELIMINAR (v0).** Igual que el resto del DDD, este flujo es un instrumento de
> descubrimiento para Stitch, no un diseño final. La trazabilidad a **endpoint + tabla** es
> completa; donde no existe `HU-##` en `04-requirements/user-stories.md` se marca `HU: pendiente`.
> **Rol:** `ADMIN_STAFF` / `SYSTEM_ADMIN` (área de soporte, dentro del bucket "Administración" de
> [navigation-map.md](../../navigation-map.md); el mapa aún no detalla rutas de back-office, así
> que las rutas de este archivo son propuestas v0). Todas las pantallas se montan dentro del
> **app shell** ya definido en [01-auth.md § Pantalla 4](./01-auth.md#pantalla-4--app-shell-marco-por-rol)
> (barra superior + nav lateral), bajo un ítem de nav "Soporte" con sub-secciones Documentos,
> Plantillas, Auditoría y Parametrización.

**Servicios origen:** `document-service` · `reference-data-service` · `audit-service`
**Contratos:** `../../../07-api/contracts/openapi/document.yaml` ·
`../../../07-api/contracts/openapi/template.yaml` ·
`../../../07-api/contracts/openapi/reference-data.yaml`
**Modelos:** `../../../09-microservices/services/07-document-service/data-model.md` ·
`../../../09-microservices/services/02-reference-data-service/data-model.md` ·
`../../../09-microservices/services/09-audit-service/data-model.md`

---

## Pantalla 1 — Documentos

- **Ruta:** `/backoffice/documentos` · **Rol:** `ADMIN_STAFF`/`SYSTEM_ADMIN` · **HU:** pendiente
  *(RF-DOC-01, RF-DOC-02 en functional.md cubren generación/versionado; no hay HU de pantalla de
  soporte)*
- **Endpoints:**
  - `GET /api/v1/documents` (`DOC_DOCUMENT_VIEW`) — lista paginada. Filtros: `domain`, `status`,
    `owner_service`, `owner_entity_id`; paginación `page`/`page_size`/`sort`.
  - `POST /api/v1/documents/generate` (`DOC_DOCUMENT_GENERATE`) — genera un documento de forma
    asíncrona a partir de una plantilla.
  - `GET /api/v1/documents/{id}` (`DOC_DOCUMENT_VIEW`) — detalle.
  - `GET /api/v1/documents/{id}/versions` (`DOC_VERSION_VIEW`) — historial de `document_version`.
  - `GET /api/v1/documents/{id}/download-url` (`DOC_DOWNLOAD`) — URL firmada (TTL 300 s) de la
    versión vigente; requiere `status = AVAILABLE`.
  - `DELETE /api/v1/documents/{id}` (`DOC_DOCUMENT_MANAGE`) — archiva (soft delete, `status = ARCHIVED`).
- **Campos reales (`Document`):** `id`, `template_id` (nullable), `title`, `domain` (`SCHEDULE` /
  `FICHA` / `CERTIFICATE` / `ACTOR` / `REPORT`), `owner_service`, `owner_entity_id`, `mime_type`,
  `size_bytes` (nullable), `status` (`GENERATING` / `AVAILABLE` / `ARCHIVED` / `EXPIRED` /
  `GENERATION_FAILED`), `row_version`, `created_by`, `created_at`, `updated_at`.
  **Nota:** `storage_key` es `writeOnly` — **nunca** se retorna ni se muestra; la descarga se
  resuelve siempre vía `download-url`.
- **Campos reales (`DocumentVersion`):** `id`, `document_id`, `version_number`, `created_by`,
  `created_at`, `notes` (nullable). Solo la versión vigente es descargable en este contrato v1
  (no hay descarga por `version_id`); versiones previas se listan como metadata/historial.

**Propósito:** dar soporte a coordinadores/administradores para localizar, regenerar, versionar y
descargar documentos generados por el sistema (constancias, horarios publicados, reportes), sin
exponer nunca la ruta interna de almacenamiento.

**Layout:**
- **Filtros** (barra superior de la tabla): select **Dominio** (`domain`), select **Estado**
  (`status`), campo **Servicio propietario** (`owner_service`, texto), campo **Entidad propietaria**
  (`owner_entity_id`, UUID — no existe endpoint transversal de búsqueda por nombre, se filtra por
  UUID exacto). Botón **Generar documento** a la derecha.
- **Tabla** (paginada): columnas Título, Dominio, Servicio propietario, Estado (badge con
  icono+texto: `GENERATING` neutro/spinner, `AVAILABLE` éxito, `ARCHIVED` neutro, `EXPIRED`
  advertencia, `GENERATION_FAILED` crítico), Actualizado (`updated_at`). Fila con acciones: **Ver
  detalle**, **Descargar** (deshabilitado si `status ≠ AVAILABLE`), **Archivar**.
- **Paginación** (al pie de la tabla, REAL y visible): barra ‹ anterior · 1 2 3 … › siguiente,
  selector de tamaño de página (`page_size`: 10/20/50) y texto **"Mostrando X–Y de N"**, alineados
  a los parámetros `page`/`page_size`/`sort` de `GET /documents`.
- **Panel de detalle** (lateral, al seleccionar fila): metadatos del documento + sección
  **Versiones** (tabla `version_number`, `created_by`, `created_at`, `notes`) + botón **Descargar
  versión vigente**.
- **Modal "Generar documento":** select **Plantilla** (`template_code`, alimentado por
  `document-templates` activos), select **Dominio**, campo **Servicio propietario**, campo
  **Entidad propietaria** (UUID), campo **Título**, editor JSON opcional **Datos** (`data`, contexto
  para el renderizador). Botón **Generar**.

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Generar documento | `POST /documents/generate` | `202` → `document_id`, `status = GENERATING`; la fila aparece con badge "Generando…" y se sondea `GET /documents/{id}` hasta `AVAILABLE`/`GENERATION_FAILED` |
| Ver detalle | `GET /documents/{id}` | abre panel lateral |
| Ver versiones | `GET /documents/{id}/versions` | lista historial en el panel |
| Descargar | `GET /documents/{id}/download-url` | abre la URL firmada en pestaña nueva; error si `status ≠ AVAILABLE` (`409`) |
| Archivar | `DELETE /documents/{id}` | `204` → `status = ARCHIVED`; fila se atenúa, ya no descargable |

**Estados:** *loading* (skeleton de filas) · *empty* ("No hay documentos que coincidan con los
filtros") · *error* (banner de red/permisos, `401`/`403`) · *generando* (badge con spinner en la
fila mientras `status = GENERATING`) · *error de generación* (`GENERATION_FAILED`, badge crítico +
icono, con acción "Reintentar" que reabre el modal prellenado).

```text
PROMPT STITCH
Pantalla "Documentos" del área de soporte back-office de la plataforma SENA — Gestión de Horarios,
en español, dentro del app shell (barra superior con marca y usuario; nav lateral con ítem activo
"Soporte > Documentos"). Área de contenido con: fila de filtros (select "Dominio" con opciones
Horario/Ficha/Constancia/Actor/Reporte, select "Estado", campo de texto "Servicio propietario",
campo de texto "Entidad propietaria (UUID)") y un botón primario "Generar documento" a la derecha.
Debajo, una tabla densa con columnas Título, Dominio, Servicio propietario, Estado (con badges de
color + icono + texto: verde "Disponible", gris "Generando" con spinner, gris "Archivado", ámbar
"Expirado", rojo "Error de generación") y Actualizado, con acciones por fila (ver, descargar,
archivar) y al pie una **barra de paginación real y visible** (‹ anterior · 1 2 3 … › siguiente),
un **selector de tamaño de página** (10/20/50) y el texto **"Mostrando X–Y de N"**. Un panel
lateral derecho de detalle muestra metadatos del documento
seleccionado y una lista de versiones con fecha y autor, y un botón "Descargar versión vigente".
Incluir un modal de "Generar documento" con select de plantilla, select de dominio, campos de
texto y un textarea de datos JSON opcional. Mostrar también el estado vacío ("No hay documentos
que coincidan con los filtros") y el estado de carga (skeleton de filas). Estilo institucional
sobrio, verde SENA (placeholder), alto contraste WCAG AA, navegable por teclado, responsive.

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

## Pantalla 2 — Plantillas de documento

- **Ruta:** `/backoffice/documentos/plantillas` · **Rol:** `ADMIN_STAFF`/`SYSTEM_ADMIN` · **HU:** pendiente
- **Endpoints:**
  - `GET /api/v1/document-templates` (`DOC_TEMPLATE_VIEW`) — lista paginada (sin `template_body`).
    Filtros: `output_type`, `code`, `is_active`.
  - `POST /api/v1/document-templates` (`DOC_TEMPLATE_MANAGE`) — crea (`version = 1`, `is_active = true`).
  - `GET /api/v1/document-templates/{id}` (`DOC_TEMPLATE_VIEW`) — detalle, incluye `template_body`
    (acepta `id` o `code`).
  - `PUT /api/v1/document-templates/{id}` (`DOC_TEMPLATE_MANAGE`) — actualiza; incrementa `version`.
  - `DELETE /api/v1/document-templates/{id}` (`DOC_TEMPLATE_MANAGE`) — desactiva (`is_active = false`).
  - `POST /api/v1/document-templates/{id}/preview` (`DOC_TEMPLATE_MANAGE`) — renderiza
    `template_body` contra `sample_data` sin persistir nada.
- **Campos reales (lista, `DocumentTemplateListItem`):** `id`, `code`, `name`, `output_type`
  (`PDF`/`EXCEL`/`WORD`), `version`, `is_active`.
- **Campos reales (detalle, `DocumentTemplate`):** los anteriores + `template_body` (HTML/Handlebars).
  `code` es **inmutable** tras la creación (no viaja en `DocumentTemplateUpdate`).

**Propósito:** mantener el catálogo de plantillas que el `pdf-renderer-worker` usa para generar
documentos, y validar su renderizado antes de publicarla.

**Layout:**
- **Filtros:** select **Tipo de salida**, campo **Código**, toggle **Activa**. Botón **Nueva
  plantilla**.
- **Tabla:** columnas Código, Nombre, Tipo de salida, Versión, Activa (badge sí/no). Acciones:
  **Editar**, **Desactivar**.
- **Paginación** (al pie de la tabla, REAL y visible): barra ‹ anterior · 1 2 3 … › siguiente,
  selector de tamaño de página (`page_size`: 10/20/50) y texto **"Mostrando X–Y de N"**, alineados
  a la paginación de `GET /document-templates`.
- **Editor de plantilla** (pantalla/panel completo): campo **Código** (bloqueado si ya existe),
  campo **Nombre**, select **Tipo de salida**, editor de texto/código **Cuerpo de la plantilla**
  (HTML/Handlebars), toggle **Activa**, botón **Guardar** y botón secundario **Previsualizar**.
- **Modal de previsualización:** editor JSON **Datos de muestra** (`sample_data`) + botón
  **Renderizar** → muestra `rendered_html` en un iframe/preview y, si aplica,
  **Placeholders sin valor** (`missing_placeholders`) como aviso no bloqueante.

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Nueva plantilla | `POST /document-templates` | `201` → plantilla `version = 1` |
| Guardar | `PUT /document-templates/{id}` | `200` → `version` se incrementa; documentos ya generados no se ven afectados |
| Previsualizar | `POST /document-templates/{id}/preview` | `200` → `rendered_html` + `missing_placeholders[]`; no persiste nada |
| Desactivar | `DELETE /document-templates/{id}` | `204` → `is_active = false` (soft delete) |

**Estados:** *loading* (skeleton de tabla/editor) · *empty* ("No hay plantillas registradas") ·
*error* (`400`/`422` con detalle de campo) · *previsualización con placeholders faltantes*
(aviso ámbar, no bloquea guardar) · *success* (toast "Plantilla guardada — versión N").

```text
PROMPT STITCH
Pantalla "Plantillas de documento" del área de soporte back-office SENA — Gestión de Horarios, en
español, dentro del app shell (nav lateral con ítem activo "Soporte > Plantillas"). Vista de lista:
filtros (select "Tipo de salida" con PDF/Excel/Word, campo "Código", interruptor "Activa") y botón
primario "Nueva plantilla". Tabla con columnas Código, Nombre, Tipo de salida, Versión, Activa
(badge), con al pie una **barra de paginación real y visible** (‹ anterior · 1 2 3 … › siguiente),
un **selector de tamaño de página** (10/20/50) y el texto **"Mostrando X–Y de N"**. Vista de editor
(pantalla completa o panel ancho): campo "Código" bloqueado en modo
edición, campo "Nombre", select "Tipo de salida", un editor de código grande para el cuerpo
HTML/Handlebars de la plantilla, interruptor "Activa", botón primario "Guardar" y botón secundario
"Previsualizar". Modal de previsualización con un editor JSON de datos de muestra a la izquierda y
el HTML renderizado a la derecha, con una lista de "placeholders sin valor" en un aviso ámbar con
icono de advertencia. Estilo institucional sobrio, alto contraste WCAG AA, tipografía monoespaciada
para el código, responsive.

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

## Pantalla 3 — Auditoría

- **Ruta:** `/backoffice/auditoria` · **Rol:** `ADMIN_STAFF`/`SYSTEM_ADMIN` · **HU:** pendiente
- **Endpoint:** ⚠️ **`GET /api/v1/audit-records`** — **no existe en ningún contrato openapi
  actual** (`audit-service` declara explícitamente "no expone API", ver
  `09-audit-service/README.md`). Esta pantalla asume, para efectos de este DDD v0, un endpoint de
  **solo lectura** sobre `audit_record` protegido por los features RBAC ya definidos en
  `rbac-design.md §MOD_AUDIT`: `AUDIT_LOG_VIEW` (ver) y `AUDIT_EXPORT` (exportar). **Queda
  pendiente de contrato formal** (`07-api/contracts/openapi/audit.yaml` no existe todavía).
  Filtros propuestos, consistentes con los índices reales de `audit_record`: `actor_id`,
  `entity_type` + `entity_id`, `event_type`, `source_service`, rango de fechas sobre `received_at`
  (clave de partición) con `event_occurred_at` visible por registro.
- **Campos reales (`audit_record`, data-model de audit-service):** `id`, `event_id`, `event_type`
  (ej. `scheduling.class_session.created`), `source_service`, `actor_id` (nullable — null =
  acción del sistema), `entity_type` (nullable), `entity_id` (nullable), `payload` (JSONB,
  completo), `event_occurred_at` (nullable, timestamp en el servicio origen), `received_at`
  (timestamp de recepción en el audit-worker; **no nullable**).

**Propósito:** dar trazabilidad de solo lectura de toda acción de negocio del sistema (quién,
qué, cuándo, en qué servicio), consumida vía el envelope estándar de eventos y persistida
append-only por `audit-worker`.

**Layout:**
- **Filtros:** campo **Actor** (`actor_id`, UUID), campo **Tipo de entidad** (`entity_type`),
  campo **ID de entidad** (`entity_id`, UUID), campo **Tipo de evento** (`event_type`, ej.
  `scheduling.class_session.created`), select **Servicio origen** (`source_service`), rango de
  fechas **Desde/Hasta** (sobre `received_at`). Sin botón de creación/edición: pantalla 100 %
  solo-lectura. Botón **Exportar** (`AUDIT_EXPORT`).
- **Tabla** (paginada por **cursor**, orden descendente por `received_at`): columnas Recibido
  (`received_at`), Ocurrido en origen (`event_occurred_at`), Evento (`event_type`), Servicio origen
  (`source_service`), Actor (`actor_id`; "Sistema" si null), Entidad (`entity_type` + `entity_id`).
  Acción por fila: **Ver payload**.
- **Paginación por CURSOR** (al pie de la tabla — `audit_record` es una colección append-only
  grande, no usa `page`/`page_size`): barra **"Cargar más / Siguiente"** que avanza con
  `cursor`/`limit` (sin números de página absolutos) y texto **"Mostrando X de N aprox."**.
- **Panel/modal "Ver payload":** JSON completo de `payload` en visor de solo lectura (JSON
  formateado/colapsable), más `event_id` para soporte de trazabilidad cruzada.
- **Nota de retención/partición** (visible como texto de ayuda al pie de la tabla): "Registro
  append-only; retención mínima 7 años; particionado mensual por fecha de recepción; datos con
  más de 2 años se archivan a almacenamiento frío y pueden tardar en consultarse."

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Aplicar filtros | `GET /audit-records?…` | refresca la tabla paginada |
| Ver payload | — (dato ya cargado en la fila) | abre panel/modal con el JSON completo |
| Exportar | `GET /audit-records?…&format=export` *(supuesto)* | descarga CSV/JSON de la selección filtrada |

**Estados:** *loading* (skeleton de tabla) · *empty* ("No hay eventos que coincidan con los
filtros") · *error* (`401`/`403`; o error de servicio dado que no hay contrato aún) · *rango de
fechas inválido* (validación en línea: "Desde" no puede ser posterior a "Hasta").

```text
PROMPT STITCH
Pantalla "Auditoría" del área de soporte back-office SENA — Gestión de Horarios, en español,
dentro del app shell (nav lateral con ítem activo "Soporte > Auditoría"), de solo lectura. Fila de
filtros: campo "Actor (UUID)", campo "Tipo de entidad", campo "ID de entidad", campo "Tipo de
evento" (ej. scheduling.class_session.created), select "Servicio origen", dos selectores de fecha
"Desde" / "Hasta", y un botón secundario "Exportar" a la derecha. Tabla densa de solo lectura con
columnas Recibido, Ocurrido en origen, Evento, Servicio origen, Actor (o "Sistema" si no aplica),
Entidad, y una acción "Ver payload" por fila que abre un panel con JSON formateado y colapsable.
Al pie de la tabla, una **barra de paginación por cursor** con un botón "Cargar más / Siguiente"
(sin números de página absolutos, avanza con `cursor`/`limit`) y el texto **"Mostrando X de N
aprox."**, seguida de una nota de ayuda en texto pequeño: "Registro append-only · retención mínima
7 años · particionado mensual · datos de más de 2 años se archivan en frío". Mostrar el estado
vacío ("No hay eventos que coincidan con los filtros") y el estado de carga (skeleton de filas).
Estilo institucional sobrio, alto contraste WCAG AA, tabla con scroll horizontal en móvil,
responsive.

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

## Pantalla 4 — Parametrización / catálogos

- **Ruta:** `/backoffice/parametrizacion` · **Rol:** `ADMIN_STAFF`/`SYSTEM_ADMIN` (edición); resto
  de roles solo lectura (RN-REF-03) · **HU:** HU-19 — *Administrar la jerarquía institucional y
  catálogos* (RF-REF-01, RF-REF-02)
- **Endpoints — Catálogos (`catalog`):**
  - `GET /api/v1/catalogs` (`REF_CATALOG_VIEW`) — lista paginada. Filtros: `code`, `is_active`.
  - `POST /api/v1/catalogs` (`REF_CATALOG_MANAGE`) — crea.
  - `GET /api/v1/catalogs/{id}` (`REF_CATALOG_VIEW`) — detalle.
  - `PUT /api/v1/catalogs/{id}` (`REF_CATALOG_MANAGE`) — actualiza.
  - `DELETE /api/v1/catalogs/{id}` (`REF_CATALOG_MANAGE`) — desactiva (soft delete, `is_active = false`).
- **Endpoints — Valores de catálogo (`catalog_detail`, anidado a su `catalog` padre):**
  - `GET /api/v1/catalogs/{catalog_id}/details` (`REF_CATALOG_VIEW`) — filtros `code`, `is_active`.
  - `POST /api/v1/catalogs/{catalog_id}/details` (`REF_CATALOG_MANAGE`) — agrega valor.
  - `PUT /api/v1/catalogs/{catalog_id}/details/{id}` (`REF_CATALOG_MANAGE`) — actualiza valor.
  - `DELETE /api/v1/catalogs/{catalog_id}/details/{id}` (`REF_CATALOG_MANAGE`) — desactiva valor.
- **Endpoints — Parámetros del sistema (`parameter`, EAV):**
  - `GET /api/v1/parameters` (`REF_PARAMETER_VIEW`) — filtros `key`, `value_type`.
  - `POST /api/v1/parameters` (`REF_PARAMETER_MANAGE`) — crea.
  - `GET /api/v1/parameters/{id}` (`REF_PARAMETER_VIEW`) — detalle.
  - `PUT /api/v1/parameters/{id}` (`REF_PARAMETER_MANAGE`) — actualiza el valor. **Sin `DELETE`**:
    `parameter` no tiene `is_active`/`deleted_at`; los valores se superseden, no se eliminan.
- **Campos reales (`Catalog`):** `id`, `code` (único, ej. `MODALITY`, `SHIFT`), `name`,
  `description` (nullable), `is_active`, `created_at`.
- **Campos reales (`CatalogDetail`):** `id`, `catalog_id`, `code` (único dentro del catálogo, ej.
  `IN_PERSON`), `label`, `display_order` (nullable), `is_active`, `created_at`.
- **Campos reales (`Parameter`):** `id`, `key` (único, ej. `MAX_HOURS_PER_WEEK`), `value` (string,
  se valida según `value_type` en la capa de aplicación), `value_type`
  (`integer`/`string`/`boolean`/`json`), `description` (nullable), `created_at`.
- **Fuera de alcance de esta pantalla:** la jerarquía institucional
  (`macroregion`→`institutional_unit`, mismo servicio `reference-data-service`) no se incluye en
  este v0; queda como pantalla separada si se prioriza más adelante.

**Propósito:** dar a soporte/administración un panel único para mantener los catálogos
parametrizables que consume toda la plataforma (estados, modalidades, jornadas, etc.) y los
parámetros globales del sistema, sin hardcodear listas en el frontend.

**Layout:** dos pestañas.
- **Pestaña "Catálogos":** panel maestro-detalle. Izquierda: tabla de catálogos (Código, Nombre,
  Activo) con filtros `code`/`is_active` y botón **Nuevo catálogo**, con **paginación REAL visible**
  al pie (‹ anterior · 1 2 3 … › siguiente, selector `page_size`: 10/20/50, "Mostrando X–Y de N"),
  alineada a `GET /catalogs`. Al seleccionar un catálogo, a la derecha: cabecera con
  `name`/`description` editable + tabla de sus valores (`catalog_detail`: Código, Etiqueta, Orden,
  Activo) con filtros `code`/`is_active`, botón **Agregar valor**, acciones por fila
  **Editar**/**Desactivar**, y su propia **paginación REAL visible** al pie (misma barra
  ‹anterior·1 2 3…›siguiente + `page_size` + "Mostrando X–Y de N"), alineada a
  `GET /catalogs/{catalog_id}/details`.
- **Pestaña "Parámetros del sistema":** tabla (Clave, Valor, Tipo, Descripción) con filtros
  `key`/`value_type`, botón **Nuevo parámetro**, acción por fila **Editar** (abre modal con
  `value` tipado según `value_type`; sin acción de eliminar, solo "Actualizar valor"), y
  **paginación REAL visible** al pie (‹ anterior · 1 2 3 … › siguiente, selector `page_size`:
  10/20/50, "Mostrando X–Y de N"), alineada a `GET /parameters`.
- **Aviso de permisos:** si el usuario no tiene `REF_CATALOG_MANAGE`/`REF_PARAMETER_MANAGE`, la
  pantalla se muestra en modo solo-lectura (sin botones de creación/edición), conforme a RN-REF-03.

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Nuevo catálogo | `POST /catalogs` | `201` → catálogo activo |
| Guardar catálogo | `PUT /catalogs/{id}` | `200` → actualizado |
| Desactivar catálogo | `DELETE /catalogs/{id}` | `204` → `is_active = false` |
| Agregar valor | `POST /catalogs/{catalog_id}/details` | `201` → nuevo `catalog_detail` |
| Editar valor | `PUT /catalogs/{catalog_id}/details/{id}` | `200` → actualizado |
| Desactivar valor | `DELETE /catalogs/{catalog_id}/details/{id}` | `204` → `is_active = false` |
| Nuevo parámetro | `POST /parameters` | `201` → parámetro creado |
| Actualizar valor | `PUT /parameters/{id}` | `200` → nuevo `value` (no hay historial expuesto por contrato) |

**Estados:** *loading* (skeleton en ambas columnas/tabla) · *empty* ("No hay catálogos" / "Este
catálogo aún no tiene valores" / "No hay parámetros registrados") · *error* (`400`/`404`/`409` —
p. ej. `code` duplicado) · *solo lectura* (banner informativo, sin controles de edición) ·
*success* (toast de guardado).

```text
PROMPT STITCH
Pantalla "Parametrización / catálogos" del área de soporte back-office SENA — Gestión de Horarios,
en español, dentro del app shell (nav lateral con ítem activo "Soporte > Parametrización"). Dos
pestañas superiores: "Catálogos" y "Parámetros del sistema". Pestaña Catálogos activa: layout
maestro-detalle de dos columnas; columna izquierda angosta con una lista de catálogos (código y
nombre) con un filtro, botón "Nuevo catálogo" y, al pie, una barra de paginación real y visible
(‹ anterior · 1 2 3 … › siguiente, selector de tamaño de página, "Mostrando X–Y de N"); columna
derecha ancha con el catálogo seleccionado mostrando nombre y descripción editables arriba, y
debajo una tabla de sus valores con columnas Código, Etiqueta, Orden, Activo, botón "Agregar
valor", acciones editar/desactivar por fila, y su propia barra de paginación real al pie.
Pestaña Parámetros del sistema (mostrar como vista secundaria): tabla con columnas Clave, Valor,
Tipo (integer/string/boolean/json), Descripción, botón "Nuevo parámetro", acción "Editar" por
fila, y al pie una barra de paginación real y visible (‹ anterior · 1 2 3 … › siguiente, selector
de tamaño de página, "Mostrando X–Y de N"). Incluir un banner superior opcional de "Modo solo
lectura" para el estado sin permisos de edición. Mostrar estado vacío ("Este catálogo aún no tiene
valores") y estado de carga (skeleton). Estilo institucional sobrio, verde SENA (placeholder),
alto contraste WCAG AA, objetivos táctiles ≥44px, responsive.

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
_(pendiente — guardar en `../mockups/06-backoffice/` y enlazar aquí: documentos.png,
plantillas.png, auditoria.png, parametrizacion.png)_
