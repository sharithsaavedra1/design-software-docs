# Modelo de Amenazas de Seguridad — SENA Gestión de Horarios

> Fase: 03-Design | Agente: A04 (Security) · validación A12 (AppSec gate) | Estado: 🟡 Borrador
> Fecha: 2026-06-17
> Prerequisitos: [overview.md](./overview.md) · [authentication.md](../07-api/authentication.md) · [rbac-design.md](../09-microservices/services/01-iam-service/rbac-design.md)

## Alcance

Modelo de amenazas STRIDE para la plataforma de microservicios. Cubre los 9 servicios, el API Gateway, el broker de mensajes y el almacenamiento de objetos. Clasifica activos, identifica amenazas por categoría STRIDE y define controles con su estado.

---

## Activos a proteger (clasificación)

| Activo | Clasificación | Servicio dueño | Impacto si se compromete |
|--------|--------------|----------------|--------------------------|
| Credenciales de usuario (`password_hash`) | CRÍTICO | iam-service | Acceso total suplantando usuarios |
| Tokens JWT (access + refresh) | CRÍTICO | iam-service | Suplantación de sesión activa |
| PII de instructores y aprendices (documento, email, teléfono) | ALTO | actors-service | Violación Ley 1581/2012 (Habeas Data) |
| Datos de empresas (NIT, contactos) | MEDIO | actors-service | Exposición de aliados comerciales |
| Horarios publicados | MEDIO | scheduling-service | Manipulación de la operación del centro |
| Log de auditoría (`audit_record`) | ALTO | audit-service | Pérdida de trazabilidad / encubrimiento |
| Clave privada RSA (firma JWT) | CRÍTICO | iam-service / Secret Manager | Falsificación de cualquier token |
| Catálogos y parámetros del sistema | BAJO | reference-data-service | Alteración de reglas operativas |

---

## Superficie de ataque

| Componente | Exposición | Vector principal |
|------------|-----------|------------------|
| API Gateway | Pública (Internet) | Inyección, fuerza bruta, DoS |
| iam-api | Pública (vía gateway) | Credential stuffing, robo de token |
| Endpoints de consulta (`/instructors/available`, etc.) | Pública (autenticada) | Abuso de scope, scraping de PII |
| Broker de mensajes | Interna (red privada) | Inyección de eventos falsos, replay |
| Bases de datos PostgreSQL (×9) | Interna | SQL injection, acceso lateral |
| Object Storage (S3/MinIO) | Interna + URLs firmadas | URLs firmadas filtradas, enumeración |
| Secret Manager | Interna restringida | Escalamiento de privilegios |

---

## Amenazas STRIDE

### S — Spoofing (Suplantación de identidad)

| ID | Amenaza | Componente | Prob. | Impacto | Control mitigante |
|----|---------|-----------|-------|---------|-------------------|
| S-01 | Robo de access_token vía XSS y reuso | Cliente web / gateway | Media | Alto | access_token en memoria (no localStorage); CSP estricta; TTL 15 min |
| S-02 | Robo de refresh_token | Cliente web | Media | Alto | refresh_token en cookie HttpOnly+Secure+SameSite=Strict |
| S-03 | Falsificación de JWT con clave comprometida | Todos los servicios | Baja | Crítico | RSA 2048 asimétrico; clave privada solo en Secret Manager; rotación trimestral |
| S-04 | Inyección de evento falso en el broker | Broker | Baja | Alto | Red privada; autenticación mutua TLS entre servicios y broker; `source_service` verificado |
| S-05 | Credential stuffing con credenciales filtradas | iam-api | Alta | Alto | Bloqueo por intentos (RN-IAM-01); rate limiting por IP; (2FA en V2) |

### T — Tampering (Manipulación de datos)

| ID | Amenaza | Componente | Prob. | Impacto | Control mitigante |
|----|---------|-----------|-------|---------|-------------------|
| T-01 | Modificación de datos en tránsito | Todos los canales | Baja | Alto | TLS 1.2+ obligatorio en todos los canales (cliente↔gateway↔servicios) |
| T-02 | Manipulación de horario publicado (debe ser inmutable) | scheduling-service | Baja | Medio | Invariante de dominio RN-SCH-01: `PUBLISHED` inmutable; cambios crean nueva versión |
| T-03 | Alteración del log de auditoría | audit-service | Baja | Alto | `audit_record` solo INSERT (RN-CROSS-01); sin endpoint de UPDATE/DELETE; permisos de BD restringidos |
| T-04 | SQL Injection | Todas las APIs | Media | Crítico | Queries parametrizadas / ORM; nunca concatenación de SQL; validación de entrada |
| T-05 | Replay de eventos del broker | Consumers | Media | Medio | Idempotencia por `event_id` (UNIQUE en audit_record y consumers) |

### R — Repudiation (Repudio)

| ID | Amenaza | Componente | Prob. | Impacto | Control mitigante |
|----|---------|-----------|-------|---------|-------------------|
| R-01 | Usuario niega haber publicado un horario | scheduling-service | Media | Medio | `published_by` + `published_at` registrados; evento `scheduling.schedule.published` con actor_id en audit |
| R-02 | Falta de trazabilidad de cambios sensibles | Todos | Media | Alto | audit-service consume todos los topics; `actor_id` extraído del payload |
| R-03 | Negación de intentos de acceso fallidos | iam-service | Baja | Medio | `audit_login` registra todos los intentos con IP y outcome |

### I — Information Disclosure (Divulgación de información)

| ID | Amenaza | Componente | Prob. | Impacto | Control mitigante |
|----|---------|-----------|-------|---------|-------------------|
| I-01 | Exposición de PII en logs | Todos los servicios | Media | Alto | RN-CROSS-02: PII nunca en logs, solo IDs; logs estructurados sin campos sensibles |
| I-02 | Fuga de PII por scope mal aplicado | Servicios con datos de actor | Media | Alto | RBAC scope obligatorio (TRAINING_CENTER/OWN_*); error `SCOPE_VIOLATION` si se viola |
| I-03 | Enumeración de usuarios en login/reset | iam-api | Media | Bajo | Respuestas genéricas: login 401 igual para usuario inexistente; reset siempre 202 |
| I-04 | URLs firmadas de Object Storage filtradas | document-service | Media | Medio | URLs firmadas con expiración corta (5 min); scope verificado antes de firmar |
| I-05 | Mensajes de error con stack trace | Todas las APIs | Media | Medio | Formato de error estándar sin detalles internos; `trace_id` para correlación interna |
| I-06 | Acceso lateral entre BDs de servicios | PostgreSQL ×9 | Baja | Alto | Una BD por servicio con credenciales propias; sin usuario compartido; red segmentada |

### D — Denial of Service (Denegación de servicio)

| ID | Amenaza | Componente | Prob. | Impacto | Control mitigante |
|----|---------|-----------|-------|---------|-------------------|
| D-01 | Saturación de endpoints públicos | API Gateway | Alta | Medio | Rate limiting por IP y por usuario; circuit breaker |
| D-02 | Query costosa de disponibilidad sin límite | training-environment / actors | Media | Medio | Índices optimizados (<300 ms); paginación obligatoria; timeout 5 s |
| D-03 | Saturación del broker por evento masivo | Broker | Baja | Alto | Backpressure; DLQ; particionamiento de topics |
| D-04 | Agotamiento del pool de conexiones a BD | Cualquier servicio | Media | Alto | Connection pooling con límite; circuit breaker; health checks |

### E — Elevation of Privilege (Elevación de privilegios)

| ID | Amenaza | Componente | Prob. | Impacto | Control mitigante |
|----|---------|-----------|-------|---------|-------------------|
| E-01 | Usuario accede a features no asignados | Todos los servicios | Media | Alto | Verificación de `feature` en JWT en cada endpoint; features pre-calculados firmados |
| E-02 | Escalamiento horizontal (coordinador ve otro centro) | Servicios con scope TRAINING_CENTER | Media | Alto | Filtro `WHERE training_center_id = jwt.training_center_id` obligatorio |
| E-03 | Manipulación del JWT para agregar features | Cliente | Baja | Crítico | Firma RSA verificada en cada servicio; payload no modificable sin clave privada |
| E-04 | Propagación de privilegios en cadena de servicios | Service-to-service | Media | Alto | Se propaga el JWT del usuario, no un token de servicio elevado (least privilege) |
| E-05 | Abuso de `UserScopeOverride` para acceso permanente | iam-service | Baja | Medio | Overrides requieren `reason` y `granted_by`; soportan `expires_at`; auditados |

---

## Controles de seguridad — Resumen y estado

### Autenticación y autorización

| Control | Implementación | Estado |
|---------|----------------|--------|
| Autenticación | JWT RS256 con refresh token | ✅ Diseñado |
| Autorización | RBAC por Feature + Scope (matriz completa) | ✅ Diseñado |
| MFA | TOTP para COORDINATOR y CENTER_DIRECTOR | 🔴 V2 |
| Session timeout | access 15 min / refresh 7 días | ✅ Diseñado |
| Bloqueo por fuerza bruta | 5 intentos → 15 min; 10 → 24 h | ✅ Diseñado |

### Protección de datos

| Control | Dato protegido | Mecanismo | Estado |
|---------|----------------|-----------|--------|
| Cifrado en tránsito | Todo | TLS 1.2+ | 🟡 Por implementar |
| Cifrado en reposo | PII + credenciales | AES-256 a nivel de BD | 🟡 Por implementar |
| Hash de contraseñas | Credenciales | Bcrypt cost 12 | ✅ Diseñado |
| Secrets management | Claves, credenciales BD | Secret Manager (Vault/SSM) | 🟡 Por definir proveedor |
| Anonimización en logs | PII | Solo IDs en logs | ✅ Regla definida |

### Protección perimetral

| Regla | Límite | Respuesta | Estado |
|-------|--------|-----------|--------|
| Rate limit por IP | 1000 req/hora | 429 + Retry-After | 🟡 Por implementar |
| Rate limit por usuario | 300 req/min | 429 | 🟡 Por implementar |
| Login fallido | 5 intentos | Bloqueo 15 min | ✅ Diseñado |
| Reset de contraseña | 3 solicitudes / 24 h | 429 | ✅ Diseñado |

---

## Cumplimiento normativo

| Norma | Aplicación | Cómo se cumple |
|-------|-----------|----------------|
| Ley 1581 de 2012 (Habeas Data Colombia) | PII de aprendices, instructores, empresas | Marcación PII, cifrado en reposo, retención definida, acceso por scope |
| Ley 1273 de 2009 (Delitos informáticos) | Acceso no autorizado | RBAC, auditoría append-only, autenticación fuerte |
| Decreto 1377 de 2013 (Reglamenta Habeas Data) | Tratamiento de datos personales | Políticas de retención por entidad; derecho a actualización |
| OWASP Top 10 (2021) | Toda la aplicación | Ver mapeo abajo |

### Mapeo OWASP Top 10 (2021)

| Riesgo OWASP | Amenazas relacionadas | Control |
|--------------|----------------------|---------|
| A01 Broken Access Control | E-01, E-02, I-02 | RBAC Feature+Scope, verificación en cada servicio |
| A02 Cryptographic Failures | S-03, T-01, I-01 | TLS 1.2+, AES-256, bcrypt, RSA 2048 |
| A03 Injection | T-04 | Queries parametrizadas, validación de entrada |
| A04 Insecure Design | Todas | Threat model (este documento), pattern-guide |
| A05 Security Misconfiguration | I-05, I-06 | Errores genéricos, segmentación de red, BD por servicio |
| A07 Identification/Auth Failures | S-01, S-05 | Bloqueo de cuenta, rate limiting, MFA (V2) |
| A08 Data Integrity Failures | T-02, T-03, T-05 | Inmutabilidad de horario/audit, idempotencia |
| A09 Logging/Monitoring Failures | R-02, R-03 | audit-service, audit_login, observabilidad |
| A10 SSRF | D-02 | Validación de inputs, sin fetch de URLs de usuario |

---

## Acciones pendientes (priorizadas)

| # | Acción | Responsable | Prioridad |
|---|--------|-------------|-----------|
| 1 | Definir proveedor de Secret Manager (Vault vs SSM) | Arquitectura | Alta |
| 2 | Implementar rate limiting en API Gateway | DevOps | Alta |
| 3 | Configurar cifrado en reposo en PostgreSQL | DevOps | Alta |
| 4 | Definir CSP y headers de seguridad en el frontend | Frontend | Media |
| 5 | Diseñar rotación de claves RSA (proceso operativo) | Seguridad | Media |
| 6 | Especificar 2FA TOTP para V2 | Seguridad | Baja (V2) |

---

## Referencias

- [non-functional.md](../04-requirements/non-functional.md)
- [authentication.md](../07-api/authentication.md)
- [rbac-design.md](../09-microservices/services/01-iam-service/rbac-design.md)
- [security-rules.md](../00-governance/security-rules.md)
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Ley 1581 de 2012: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981
