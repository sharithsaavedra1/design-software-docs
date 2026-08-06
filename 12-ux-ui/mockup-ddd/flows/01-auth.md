<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: DDD de flujo UX (Auth) + prompts Stitch
fase: diseño (UX/UI)
estado: draft
dependencias_entrada: 09-microservices/services/01-iam-service/components/iam-api/openapi.yaml; 01-iam-service/data-model.md; 12-ux-ui/design-system.md, navigation-map.md; 04-requirements/user-stories.md
consumidores_siguientes: Google Stitch; validación de diseño
tldr: Pantallas de autenticación y el app shell por rol, derivadas del contrato iam y el modelo de datos, con prompts listos para Stitch.
decisiones_clave: 202 siempre en reset (no revela si el email existe); shell con nav por rol desde /auth/me.modules
halts_registrados: ninguno
-->

# Flujo — Autenticación y App Shell (transversal)

**Servicio origen:** `iam-service` · **Contrato:** `../../../09-microservices/services/01-iam-service/components/iam-api/openapi.yaml`
**Modelo:** `../../../09-microservices/services/01-iam-service/data-model.md`

---

## Pantalla 1 — Login

- **Ruta:** `/login` · **Rol:** anónimo · **HU:** autenticación (HU de acceso)
- **Endpoint:** `POST /api/v1/auth/login` → `TokenResponse { access_token, refresh_token, expires_in, user{ id, email, full_name, roles[], training_center_id, features[] } }`
- **Datos/errores del contrato:** `INVALID_CREDENTIALS` (401), `ACCOUNT_LOCKED` (401), `ACCOUNT_INACTIVE` (401), `RATE_LIMIT_EXCEEDED` (429).

**Propósito:** autenticar al usuario y llevarlo al espacio de su rol.

**Layout:** columna centrada, marca SENA arriba; card con título "Ingresar", campo **Correo**
(`email`), campo **Contraseña** (`password`, con mostrar/ocultar), enlace "¿Olvidó su contraseña?",
botón primario **Ingresar**. Nota institucional al pie.

**Acciones:**
| Control | Endpoint | Resultado |
|---|---|---|
| Ingresar | `POST /auth/login` | éxito → redirige según `user.roles` (Coordinador→dashboard, etc.); error → mensaje |
| ¿Olvidó su contraseña? | — | navega a `/forgot-password` |

**Estados:** *loading* (botón con spinner, campos bloqueados) · *error* (banner: credenciales
inválidas / cuenta bloqueada / demasiados intentos — texto + icono, no solo color) · *success*
(redirección).

```text
PROMPT STITCH
Pantalla de inicio de sesión para una plataforma web institucional del SENA (Colombia), en español.
Columna centrada sobre fondo claro. Arriba, marca "SENA — Gestión de Horarios" (verde institucional,
placeholder). Tarjeta central con título "Ingresar", un campo "Correo" (email) y un campo "Contraseña"
con icono para mostrar/ocultar, un enlace "¿Olvidó su contraseña?" y un botón primario grande "Ingresar".
Debajo, un banner de error de ejemplo con icono de alerta y texto "Correo o contraseña incorrectos"
(color crítico + icono, no solo color). Estilo sobrio, alto contraste WCAG AA, esquinas suaves,
tipografía sans-serif. Mostrar también el estado de carga (botón con spinner). Responsive (móvil y escritorio).

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

## Pantalla 2 — Recuperar contraseña

- **Ruta:** `/forgot-password` · **Rol:** anónimo
- **Endpoint:** `POST /api/v1/auth/password-reset/request` → **202 siempre** (no revela si el email existe).

**Layout:** card con título "Recuperar contraseña", texto explicativo, campo **Correo**, botón
**Enviar enlace**, enlace "Volver a ingresar".

**Estados:** *success* → mensaje neutro "Si el correo existe, enviamos instrucciones" (nunca confirma
existencia) · *loading* · *rate-limit* (429).

```text
PROMPT STITCH
Pantalla "Recuperar contraseña" de la plataforma SENA — Gestión de Horarios, en español. Tarjeta
centrada con título "Recuperar contraseña", un párrafo breve explicativo, un campo "Correo", un botón
primario "Enviar enlace" y un enlace secundario "Volver a ingresar". Mostrar el estado de éxito como un
mensaje neutro: "Si el correo existe, enviaremos instrucciones para restablecer la contraseña". Estilo
institucional, alto contraste WCAG AA, sobrio. Responsive.

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

## Pantalla 3 — Nueva contraseña (confirmar reset)

- **Ruta:** `/reset-password?token=…` · **Rol:** anónimo
- **Endpoint:** `POST /api/v1/auth/password-reset/confirm { token, new_password }` → 204. Error `RESET_TOKEN_EXPIRED` (400).

**Layout:** card "Nueva contraseña": campo **Nueva contraseña** (mín 8), campo **Confirmar contraseña**,
indicador de fuerza, botón **Guardar**. Regla de coincidencia visible.

**Estados:** *error* token expirado/usado (400) con opción de solicitar de nuevo · *success* → confirmación + ir a login.

```text
PROMPT STITCH
Pantalla "Nueva contraseña" de la plataforma SENA — Gestión de Horarios, en español. Tarjeta centrada
con título "Definir nueva contraseña", campo "Nueva contraseña" (con medidor de fortaleza), campo
"Confirmar contraseña", texto de requisitos (mínimo 8 caracteres) y botón "Guardar". Incluir el estado
de error "El enlace expiró o ya fue usado" con un botón "Solicitar uno nuevo". Estilo institucional,
alto contraste WCAG AA. Responsive.

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

## Pantalla 4 — App Shell (marco por rol)

- **Ruta:** `/` (contenedor de todas las áreas autenticadas)
- **Endpoint:** `GET /api/v1/auth/me` → `{ id, email, full_name, actor_type, roles[], features[], modules[] }`.
- **Deriva:** `modules[]` construye el menú lateral; el rol determina el área de aterrizaje ([navigation-map.md](../../navigation-map.md)).

**Propósito:** marco común (top bar + nav lateral por rol) donde se montan todas las pantallas.

**Layout:**
- **Top bar:** marca SENA · buscador (opcional) · icono de **notificaciones** con badge · menú de
  usuario (nombre, rol, cerrar sesión).
- **Nav lateral (según `modules`):** ítems por rol —
  Coordinador: Inicio, Horarios, Disponibilidad, Fichas;
  Instructor: Mi horario, Mi disponibilidad, Seguimiento;
  Aprendiz: Mi horario, Notificaciones;
  Administrador: Indicadores, Administración.
- **Área de contenido** a la derecha.

**Estados:** *loading* (skeleton de nav y top bar) · *sin conexión* (banner offline básico, tolerante a conectividad).

```text
PROMPT STITCH
Marco (app shell) de una aplicación web institucional del SENA — Gestión de Horarios, en español,
responsive. Barra superior con la marca "SENA — Gestión de Horarios" a la izquierda, un icono de
notificaciones con un badge numérico y, a la derecha, un menú de usuario que muestra nombre y rol
("María García — Coordinador") con opción "Cerrar sesión". Navegación lateral izquierda colapsable con
íconos + texto para un Coordinador: "Inicio", "Horarios", "Disponibilidad", "Fichas". Área de contenido
principal a la derecha con un encabezado de página y espacio para tablas/tarjetas. Incluir un banner
sutil de "Sin conexión — mostrando datos guardados" para el estado offline. Estilo sobrio, verde
institucional (placeholder), alto contraste WCAG AA, navegable por teclado. Mostrar variante móvil con
nav lateral como menú hamburguesa.

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
_(pendiente — guardar en `../mockups/01-auth/` y enlazar aquí: login.png, forgot.png, reset.png, shell.png)_
