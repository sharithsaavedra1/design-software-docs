# Contrato — iam-api

> Estado: 🟡 Revisión | Última actualización: 2026-06-17

## Base URL

`/api/v1`

---

## Autenticación

### `POST /auth/login`

Login con email y contraseña. No requiere token.

**Request:**
```json
{ "email": "coordinador@sena.edu.co", "password": "plain-text-password" }
```

**Response 200:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "coordinador@sena.edu.co",
    "full_name": "María García",
    "roles": ["COORDINATOR"],
    "training_center_id": "uuid-del-centro",
    "features": ["SCH_CREATE:TRAINING_CENTER", "SCH_PUBLISH:TRAINING_CENTER", "..."]
  }
}
```

El `access_token` lleva pre-calculados los features del usuario. TTL: 15 min.
El `refresh_token` tiene TTL: 7 días.

### `POST /auth/refresh`

Renueva el access_token usando el refresh_token. No requiere Authorization header.

**Request:**
```json
{ "refresh_token": "eyJhbGci..." }
```

**Response 200:** igual a `/auth/login` pero sin cambiar el `refresh_token`.

### `POST /auth/logout`

Revoca el refresh_token activo.

**Headers:** `Authorization: Bearer <access_token>`

**Response 204:** sin body.

### `GET /auth/me`

Información del usuario autenticado con todos sus features calculados.

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "id": "uuid",
  "email": "...",
  "full_name": "...",
  "actor_type": "INSTRUCTOR",
  "actor_id": "uuid-del-instructor",
  "roles": [{ "name": "INSTRUCTOR", "training_center_id": "uuid" }],
  "features": ["SCH_VIEW_OWN:OWN_SCHEDULE", "ACT_INSTRUCTOR_VIEW:OWN_PROFILE", "..."],
  "modules": ["MOD_SCHEDULING", "MOD_ACTORS", "MOD_MONITORING"]
}
```

`modules` lista los módulos donde el usuario tiene al menos un feature activo (para construir el menú de la UI).

### `POST /auth/password-reset/request`

Solicita un token de reset de contraseña enviado al email.

**Request:**
```json
{ "email": "usuario@sena.edu.co" }
```

**Response 202:** Siempre 202 (no revela si el email existe o no).

### `POST /auth/password-reset/confirm`

Confirma el reset de contraseña con el token recibido por email.

**Request:**
```json
{ "token": "...", "new_password": "nueva-contraseña" }
```

**Response 204.**

---

## Gestión de usuarios

### `GET /users`

Lista usuarios. Paginado.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `training_center_id` | UUID (query) | Filtrar por centro |
| `role` | STRING (query) | Filtrar por nombre de rol |
| `is_active` | BOOLEAN (query) | Filtrar por estado |
| `page` | INT | Default 1 |
| `page_size` | INT | Default 20, max 100 |

**Feature requerido:** `IDENTITY_USER_VIEW`

### `POST /users`

Crea un usuario nuevo.

**Feature requerido:** `IDENTITY_USER_MANAGE`

**Request:**
```json
{
  "email": "nuevo@sena.edu.co",
  "full_name": "Nombre Completo",
  "actor_type": "INSTRUCTOR",
  "actor_id": "uuid-del-instructor",
  "initial_role": "INSTRUCTOR",
  "training_center_id": "uuid-del-centro"
}
```

**Response 201:**
```json
{ "id": "uuid", "email": "...", "temporary_password": "..." }
```

La contraseña temporal se envía también al email del usuario.

### `GET /users/{id}`

**Feature requerido:** `IDENTITY_USER_VIEW`

### `PUT /users/{id}`

Actualizar datos del usuario (no contraseña).

**Feature requerido:** `IDENTITY_USER_MANAGE`

### `POST /users/{id}/deactivate`

Desactiva la cuenta (soft delete). Revoca todos los refresh tokens activos.

**Feature requerido:** `IDENTITY_USER_MANAGE`

### `GET /users/{id}/sessions`

Lista sesiones activas (refresh tokens válidos) del usuario.

**Feature requerido:** `IDENTITY_USER_VIEW`

### `DELETE /users/{id}/sessions/{session_id}`

Revoca una sesión específica (permite al usuario cerrar una sesión remota).

**Feature requerido:** `IDENTITY_USER_VIEW` (propietario) o `IDENTITY_USER_MANAGE` (admin)

---

## Gestión de roles y features

### `GET /roles`

Lista todos los roles con sus features y scopes.

**Feature requerido:** `IDENTITY_ROLE_VIEW`

### `GET /roles/{id}/features`

Lista los features asignados a un rol, con su scope_type.

**Feature requerido:** `IDENTITY_ROLE_VIEW`

### `POST /users/{id}/roles`

Asigna un rol a un usuario.

**Feature requerido:** `IDENTITY_ROLE_ASSIGN`

**Request:**
```json
{
  "role_name": "COORDINATOR",
  "training_center_id": "uuid-del-centro",
  "expires_at": null
}
```

### `DELETE /users/{id}/roles/{role_name}`

Revoca un rol de un usuario.

**Feature requerido:** `IDENTITY_ROLE_ASSIGN`

---

## Gestión de módulos y features (solo lectura)

### `GET /modules`

Lista todos los módulos del sistema con sus features.

**Feature requerido:** `IDENTITY_ROLE_VIEW`

**Response:**
```json
[
  {
    "code": "MOD_SCHEDULING",
    "name": "Horarios",
    "features": [
      { "code": "SCH_CREATE", "name": "Crear horario", "action_level": "WRITE" },
      ...
    ]
  }
]
```

---

## Overrides de scope

### `GET /users/{id}/scope-overrides`

Lista los overrides activos de un usuario.

**Feature requerido:** `IDENTITY_SCOPE_MANAGE`

### `POST /users/{id}/scope-overrides`

Crea un override de acceso para un usuario.

**Feature requerido:** `IDENTITY_SCOPE_MANAGE`

**Request:**
```json
{
  "feature_code": "SCH_VIEW_ALL",
  "scope_type": "TRAINING_CENTER",
  "is_allowed": true,
  "reason": "Cubriendo al coordinador durante licencia",
  "expires_at": "2026-07-15T23:59:59Z"
}
```

### `DELETE /users/{id}/scope-overrides/{override_id}`

Revoca un override.

---

## Formato de error estándar

```json
{
  "error_code": "INSUFFICIENT_PERMISSIONS",
  "message": "No tiene acceso a este recurso",
  "required_feature": "SCH_PUBLISH",
  "trace_id": "uuid-v4"
}
```

## Códigos de error propios

| Código | HTTP | Descripción |
|--------|------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `ACCOUNT_LOCKED` | 401 | Cuenta bloqueada temporalmente |
| `ACCOUNT_INACTIVE` | 401 | Cuenta desactivada |
| `TOKEN_EXPIRED` | 401 | Access token expirado |
| `TOKEN_REVOKED` | 401 | Refresh token revocado |
| `TOKEN_INVALID` | 401 | Token malformado o firma inválida |
| `INSUFFICIENT_PERMISSIONS` | 403 | No tiene el feature requerido |
| `SCOPE_VIOLATION` | 403 | Tiene el feature pero no el scope (intenta acceder a datos de otro centro) |
| `USER_NOT_FOUND` | 404 | Usuario no encontrado |
| `RESET_TOKEN_EXPIRED` | 400 | Token de reset expirado o ya usado |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiados intentos de login o reset |
