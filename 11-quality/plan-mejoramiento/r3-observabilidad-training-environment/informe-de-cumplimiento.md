# Informe de Cumplimiento - Plan de Mejoramiento (Ficha ADSO-3145555)

## Datos de IdentificaciÃ³n y Control de Entrega

| Dato | InformaciÃ³n |
|---|---|
| **Aprendiz Responsable** | Emily Sharith AmÃ©zquita Saavedra |
| **Documento de Identidad** | CC 1075243904 |
| **Programa de FormaciÃ³n** | ADSO (AnÃ¡lisis y Desarrollo de Software) â€” SENA |
| **Dominio Funcional** | `training-environment` (GestiÃ³n de ambientes de formaciÃ³n y reservas) |
| **Repositorio Asignado** | `design-software-training-environment-service` |
| **Reto Individual Asignado** | Reto R3 â€” Observabilidad Integral |
| **RÃºbrica de EvaluaciÃ³n** | Acta No. 02-2026 (14 de octubre de 2026), Numeral 10 |
| **Rama de Trabajo** | `feature/r3-observability` |
| **Pull Request Oficial** | **PR #19** (`feature/r3-observability` â†’ `develop`) en repositorio oficial SENA |
| **Commit HEAD Actual** | `00ea8de` |
| **Repositorios Sincronizados** | **Origin (SENA):** `https://github.com/code-sena/design-software-training-environment-service/pull/19`<br>**Personal:** `https://github.com/sharithsaavedra1/reto.git` |
| **Fecha de Corte y Estado** | 19 de octubre de 2026 â€” **100% Cumplido / PASS (Bloqueador de Observabilidad Cerrado)** |

---

## 1. Resumen Ejecutivo y ResoluciÃ³n de Revalidaciones QA

En el marco del plan de mejoramiento del programa ADSO (Ficha 3145555) y en estricto cumplimiento de los acuerdos del **Acta No. 02-2026** (Numeral 10) y el **Anexo 1**, se completÃ³ de forma integral la implementaciÃ³n tÃ©cnica del **Reto R3 de Observabilidad** en el microservicio `training-environment-service`.

A lo largo del proceso de revisiÃ³n y aseguramiento de calidad (QA) sobre el **PR #19**, se atendieron y subsanaron satisfactoriamente la totalidad de las observaciones y criterios de revalidaciÃ³n emitidos por el equipo evaluador:

1. **AdopciÃ³n del SDK Oficial de OpenTelemetry:** Se incorporaron las librerÃ­as oficiales `go.opentelemetry.io/otel`, `otel/trace`, `otel/sdk`, `otel/exporters/otlp` y `otel/exporters/stdout`, sustituyendo cualquier aproximaciÃ³n manual por un `TracerProvider` estÃ¡ndar de producciÃ³n con muestreo `ParentBased(AlwaysSample)` y apagado ordenado (`Shutdown`).
2. **Trazabilidad Distribuida hacia PostgreSQL con `otelsql`:** Se integrÃ³ la librerÃ­a `github.com/XSAM/otelsql` mediante la funciÃ³n constructora `observability.OpenTracedPostgresDB(dbURL)`, permitiendo que cada consulta (`QueryContext`, `ExecContext`, transacciones) genere automÃ¡ticamente spans de tipo `Client` enlazados jerÃ¡rquicamente a la traza activa.
3. **ValidaciÃ³n Automatizada de Traza con OperaciÃ³n SQL Real (Bloqueador Cerrado):** En respuesta al requerimiento de QA, la prueba `TestDistributedTracing_MFE_To_Service_To_Database` ejecuta una consulta SQL real sobre PostgreSQL utilizando la conexiÃ³n instrumentada por `otelsql`. Se verificÃ³ y cerrÃ³ el bloqueador de QA comprobando que:
   - El span de base de datos (`sql.conn.query`) se genera automÃ¡ticamente durante la consulta.
   - Comparte exactamente el mismo `trace_id` de la peticiÃ³n HTTP y del MFE.
   - Tiene como padre (`ParentSpanID`) el span del servidor HTTP.
   - Incluye los atributos semÃ¡nticos oficiales (`db.system = postgresql`, `db.name = training_environment_db`, `db.query.text = SELECT 1 AS trace_check`).
4. **Seguridad y Reproducibilidad en CI (Ajuste Final Solicitado por QA):** Se eliminaron todas las credenciales/URLs codificadas en duro en el cÃ³digo de prueba. Ahora la conexiÃ³n de prueba se parametriza mediante la variable de entorno estÃ¡ndar `TEST_DATABASE_URL` (o `DATABASE_URL`). Si la variable no estÃ¡ definida (entorno limpio de CI), la prueba se omite elegantemente con `t.Skip()`, garantizando la ejecuciÃ³n limpia de `go test ./...` al 100% PASS sin fallos espurios.
5. **MÃ©tricas RED y Tablero Grafana Provisionado:** ExposiciÃ³n textual de mÃ©tricas RED en `GET /metrics` (`http_requests_total`, `http_requests_errors_total`, `http_request_duration_seconds`), stack desplegable en Docker Compose (Prometheus + Grafana) y tablero provisionado con lÃ­nea de alerta SLA ante tasas de error > 5%.
6. **Evidencias Visuales y DocumentaciÃ³n Oficial:** IncorporaciÃ³n de 5 capturas de pantalla organizadas en `docs/img/` dentro del repositorio e integradas en el informe tÃ©cnico oficial [Informe Técnico R3](./informe-tecnico.md) y en el [ADR-011: Observabilidad Integral en Training Environment](../../../05-architecture/decisions/records/ADR-011-training-environment-r3-observability.md).

---

## 2. Matriz de Cumplimiento: RÃºbrica Oficial (Acta 02) vs. ImplementaciÃ³n

| Criterio Exigido en Acta 02 (Numeral 10) | Requisito Oficial de la RÃºbrica | Estado QA | SoluciÃ³n TÃ©cnica Implementada en esta Entrega |
| :--- | :--- | :---: | :--- |
| **1. Traza Distribuida W3C de Extremo a Extremo** | Trazabilidad distribuida desde el microfrontend hasta la BD, con propagaciÃ³n de cabecera `traceparent` bajo estÃ¡ndar W3C. | **100% PASS** | - `internal/observability/trace.go`: ExtracciÃ³n y parseo de cabecera W3C `traceparent` (`00-{trace_id}-{span_id}-{flags}`).<br>- `internal/observability/tracer.go`: SDK oficial OTel con `TracerProvider` y exportadores OTLP/Stdout.<br>- `internal/observability/middleware.go`: InyecciÃ³n de Server Span y propagaciÃ³n de `Traceparent`, `X-Trace-Id` y `X-Correlation-Id`.<br>- ConexiÃ³n PostgreSQL instrumentada con `otelsql.Open` (`OpenTracedPostgresDB`). |
| **2. MÃ©tricas RED en la API** | MÃ©tricas RED (Rate, Errors y Duration) expuestas por cada endpoint del microservicio. | **100% PASS** | - `internal/observability/metrics.go`: Registro concurrente thread-safe.<br>- Endpoint `GET /metrics` en formato estÃ¡ndar Prometheus 0.0.4.<br>- Contador de peticiones (`http_requests_total{method, path, status}`).<br>- Contador de fallas (`http_requests_errors_total` para cÃ³digos $\ge 400$).<br>- Histograma de latencia con 11 buckets (`http_request_duration_seconds_bucket`).<br>- Gauge de peticiones en vuelo (`http_requests_in_flight`). |
| **3. Logs Estructurados Correlacionados** | Emitir registros enriquecidos en formato estructurado JSON, correlacionados mediante identificadores de traza. | **100% PASS** | - `internal/observability/logger.go`: `log/slog` con `JSONHandler` hacia `stdout`.<br>- Cada registro incluye: `service.name`, `environment`, `correlation_id`, `trace_id`, `span_id`, `traceparent`, mÃ©todo HTTP, ruta, cÃ³digo de estado, latencia y cliente IP. |
| **4. Tablero Grafana y Regla de Alerta > 5%** | Provisionamiento de tablero de Grafana como cÃ³digo y regla de alerta por tasa de errores superior al 5%. | **100% PASS** | - `deploy/grafana/dashboards/training-environment-red-dashboard.json`: Tablero con 4 paneles ejecutivos (Rate, Errors %, P95 Latency, In-Flight) y paneles detallados por endpoint.<br>- `deploy/grafana/alerts/red-alerts.yml`: Regla de alerta ante `Errors % > 5%`.<br>- `deploy/docker-compose.observability.yml`: Stack integrado Grafana + Prometheus con datasources y dashboards provisionados automÃ¡ticamente. |
| **5. DocumentaciÃ³n y Evidencias Obligatorias** | Registro de DecisiÃ³n de Arquitectura (ADR) e informe tÃ©cnico con evidencias verificables de ejecuciÃ³n. | **100% PASS** | - `05-architecture/decisions/records/ADR-011-training-environment-r3-observability.md`: JustificaciÃ³n arquitectÃ³nica y decisiones de diseÃ±o.<br>- `11-quality/plan-mejoramiento/r3-observabilidad-training-environment/informe-tecnico.md`: Informe tÃ©cnico completo con tabla de equivalencias Go vs. Spring Boot.<br>- `docs/img/`: 5 capturas de pantalla con recortes oficiales de tests en Docker, traza distribuida, consultas cURL, Docker Compose y dashboard de Grafana en tiempo real. |

---

## 3. Detalle de Archivos del MÃ³dulo de Observabilidad en el Repositorio

Estructura final de archivos correspondiente al **PR #19** en la rama `feature/r3-observability`:

```text
design-software-training-environment-service/
â”œâ”€â”€ cmd/
â”‚   â””â”€â”€ training-environment-api/
â”‚       â””â”€â”€ main.go                                     # InicializaciÃ³n OTel, repositorios traced y router
â”œâ”€â”€ deploy/
â”‚   â”œâ”€â”€ docker-compose.observability.yml                # Despliegue de stack local Grafana + Prometheus
â”‚   â”œâ”€â”€ prometheus/
â”‚   â”‚   â””â”€â”€ prometheus.yml                              # ConfiguraciÃ³n de scrapeo hacia /metrics (8085 / 8080)
â”‚   â””â”€â”€ grafana/
â”‚       â”œâ”€â”€ provisioning/
â”‚       â”‚   â”œâ”€â”€ datasources/prometheus-datasource.yml   # Datasource Prometheus automÃ¡tico
â”‚       â”‚   â””â”€â”€ dashboards/dashboards-provisioning.yml  # Provisioning desatendido de tableros
â”‚       â”œâ”€â”€ dashboards/
â”‚       â”‚   â””â”€â”€ training-environment-red-dashboard.json # Tablero RED oficial con paneles y alertas
â”‚       â””â”€â”€ alerts/
â”‚           â””â”€â”€ red-alerts.yml                          # Regla de alerta ante Error Rate > 5%
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ adr/
â”‚   â”‚   â””â”€â”€ ADR-004-observability-opentelemetry-red-metrics.md # Registro de DecisiÃ³n ArquitectÃ³nica
â”‚   â”œâ”€â”€ img/                                            # Evidencias grÃ¡ficas oficiales (capturas de pantalla)
â”‚   â”‚   â”œâ”€â”€ Captura de pantalla 2026-10-18 200900.png   # Evidencia 1: Tests Go en Docker
â”‚   â”‚   â”œâ”€â”€ Captura de pantalla 2026-10-18 200918.png   # Evidencia 2: Traza distribuida MFE â†’ API â†’ DB
â”‚   â”‚   â”œâ”€â”€ Captura de pantalla 2026-10-18 201524.png   # Evidencia 3: Consultas cURL a /metrics y W3C
â”‚   â”‚   â”œâ”€â”€ Captura de pantalla 2026-10-18 203115.png   # Evidencia 4: Despliegue Docker Compose
â”‚   â”‚   â””â”€â”€ Captura de pantalla 2026-10-18 204407.png   # Evidencia 5: Tablero en vivo Grafana RED
â”‚   â””â”€â”€ INFORME-TECNICO-R3-OBSERVABILIDAD.md            # Informe tÃ©cnico oficial actualizado
â”œâ”€â”€ internal/
â”‚   â””â”€â”€ observability/
â”‚       â”œâ”€â”€ tracer.go                                   # OTel TracerProvider, OTLP/Stdout y otelsql
â”‚       â”œâ”€â”€ trace.go                                    # W3C Trace Context y formateo traceparent
â”‚       â”œâ”€â”€ metrics.go                                  # MÃ©tricas RED y formato Prometheus
â”‚       â”œâ”€â”€ logger.go                                   # Logger JSON estructurado con correlaciÃ³n
â”‚       â”œâ”€â”€ middleware.go                               # Middleware HTTP con Server Spans y cabeceras
â”‚       â””â”€â”€ observability_test.go                       # Suite de pruebas automatizadas con TEST_DATABASE_URL y t.Skip()
â”œâ”€â”€ go.mod                                              # Dependencias oficiales OTel y otelsql
â”œâ”€â”€ go.sum                                              # Checksums criptogrÃ¡ficos verificados
â””â”€â”€ .gitignore                                          # ExclusiÃ³n permanente de binarios *.exe
```

---

## 4. Evidencias de ValidaciÃ³n Automatizada

### 4.1. VerificaciÃ³n de Traza Distribuida con Consulta SQL Real (`otelsql`)

EjecuciÃ³n de la prueba de integraciÃ³n `TestDistributedTracing_MFE_To_Service_To_Database` cuando `TEST_DATABASE_URL` estÃ¡ configurada, demostrando la continuidad de la traza desde el MFE, pasando por el servicio HTTP, hasta la ejecuciÃ³n de una consulta real en PostgreSQL instrumentada con `OpenTracedPostgresDB()`:

```text
=== RUN   TestDistributedTracing_MFE_To_Service_To_Database
{"time":"2026-10-20T00:40:42.937Z","level":"INFO","msg":"HTTP request completed","service.name":"training-environment-service","correlation_id":"4bf92f3577b34da6a3ce929d0e0e4736","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","span_id":"48a406a05e22361c","traceparent":"00-4bf92f3577b34da6a3ce929d0e0e4736-48a406a05e22361c-01","http.method":"GET","http.route":"/training-environments","http.status_code":200}
    observability_test.go:269: Total spans recorded: 3
    observability_test.go:271: Span[0]: Name="sql.conn.query", Kind=client, TraceID=4bf92f3577b34da6a3ce929d0e0e4736, SpanID=b8928368184f7a3a, ParentSpanID=48a406a05e22361c
    observability_test.go:274:    attr: db.system=postgresql
    observability_test.go:274:    attr: db.name=training_environment_db
    observability_test.go:274:    attr: db.query.text=SELECT 1 AS trace_check
    observability_test.go:271: Span[1]: Name="sql.rows", Kind=client, TraceID=4bf92f3577b34da6a3ce929d0e0e4736, SpanID=5deeef7dd783d7db, ParentSpanID=48a406a05e22361c
    observability_test.go:274:    attr: db.system=postgresql
    observability_test.go:274:    attr: db.name=training_environment_db
    observability_test.go:271: Span[2]: Name="GET /training-environments", Kind=server, TraceID=4bf92f3577b34da6a3ce929d0e0e4736, SpanID=48a406a05e22361c, ParentSpanID=00f067aa0ba902b7
    observability_test.go:274:    attr: http.method=GET
    observability_test.go:274:    attr: http.target=/training-environments
    observability_test.go:274:    attr: http.status_code=200
    observability_test.go:354: Distributed Trace Verified Successfully:
    observability_test.go:355:   MFE Span ID:      00f067aa0ba902b7
    observability_test.go:356:   HTTP Server Span: 48a406a05e22361c (Parent: 00f067aa0ba902b7)
    observability_test.go:357:   DB Client Span:   b8928368184f7a3a (Parent: 48a406a05e22361c)
    observability_test.go:358:   Shared Trace ID:  4bf92f3577b34da6a3ce929d0e0e4736
--- PASS: TestDistributedTracing_MFE_To_Service_To_Database (0.23s)
PASS
```

### 4.2. EjecuciÃ³n Completa de la Suite del Repositorio en CI Limpio (`go test ./...`)

En un entorno limpio de CI (sin base de datos provisionada), la prueba de integraciÃ³n se salta limpiamente (`t.Skip()`) sin provocar fallos de compilaciÃ³n ni ejecuciones fallidas:

```text
?   	github.com/code-sena/design-software-training-environment-service/cmd/training-environment-api	[no test files]
ok  	github.com/code-sena/design-software-training-environment-service/internal/adapter/in/http	0.057s
?   	github.com/code-sena/design-software-training-environment-service/internal/adapter/in/http/dto	[no test files]
ok  	github.com/code-sena/design-software-training-environment-service/internal/adapter/in/http/middleware	0.331s
?   	github.com/code-sena/design-software-training-environment-service/internal/adapter/in/http/response	[no test files]
ok  	github.com/code-sena/design-software-training-environment-service/internal/adapter/out/persistence	0.030s
?   	github.com/code-sena/design-software-training-environment-service/internal/application/port	[no test files]
ok  	github.com/code-sena/design-software-training-environment-service/internal/application/usecase	0.024s
ok  	github.com/code-sena/design-software-training-environment-service/internal/domain/model	0.024s
ok  	github.com/code-sena/design-software-training-environment-service/internal/observability	0.027s
```
**Resultado:** **100% de pruebas aprobadas (PASS)** en todos los paquetes del microservicio.

---

## 5. Historial de Commits en Rama `feature/r3-observability`

| Commit | DescripciÃ³n del Cambio | PropÃ³sito |
|---|---|---|
| **`00ea8de`** | `test(observability): configure TEST_DATABASE_URL and skip integration test in clean CI - Emily Amezquita` | Atiende la revalidaciÃ³n final de QA: elimina credenciales codificadas en duro, parametriza la conexiÃ³n mediante `TEST_DATABASE_URL` y aÃ±ade `t.Skip()` para garantizar reproducibilidad en CI. |
| **`839b6a8`** | `test(observability): validate real postgresql operation via OpenTracedPostgresDB and otelsql spans - Emily Amezquita` | Resuelve el bloqueador de QA: ejecuta operaciÃ³n SQL real en PostgreSQL instrumentada con `OpenTracedPostgresDB()` y valida spans generados automÃ¡ticamente por `otelsql`. |
| **`126bfb3`** | `docs: add visual evidence screenshots to technical report and Grafana config - Emily Amezquita` | Incorpora 5 capturas de pantalla de evidencia en `docs/img/`, actualiza el informe tÃ©cnico y corrige rutas de provisionamiento en Grafana. |
| **`1f6c900`** | `feat(observability): resolve QA blocker with official OpenTelemetry SDK and PostgreSQL tracing - Emily Amezquita` | Resuelve el bloqueador tÃ©cnico de QA incorporando el SDK oficial OpenTelemetry, `otelsql` y eliminando binarios `.exe` del Ã­ndice Git. |
| **`9df2be5`** | `feat(observability): implementa reto R3 OpenTelemetry, metricas RED, logs y Grafana - Emily Amezquita` | ImplementaciÃ³n base del reto R3 segÃºn rÃºbrica del Acta 02 Numeral 10. |

---

## 6. Procedimiento para Cierre y SustentaciÃ³n Individual

1. **Estado del Pull Request:** El **PR #19** se encuentra abierto, actualizado y con la totalidad de observaciones de QA subsanadas en su commit HEAD `00ea8de`.
2. **SincronizaciÃ³n:** Tanto el repositorio oficial de la organizaciÃ³n SENA (`origin`) como el repositorio personal de respaldo (`personal`) estÃ¡n sincronizados en el commit exacto `00ea8de`.
3. **SustentaciÃ³n Presencial:** Preparada para la sustentaciÃ³n individual y defensa tÃ©cnica ante el comitÃ© evaluador (Acta 02, Numeral 10) en el **Ambiente 209-2**, demostrando la arquitectura implementada, la ejecuciÃ³n en vivo de las pruebas y la modificaciÃ³n en tiempo real solicitada por los instructores.

---

*Informe de cumplimiento consolidado y firmado para radicaciÃ³n ante el equipo evaluador y QA:*  
**Emily Sharith AmÃ©zquita Saavedra**  
Aprendiz ADSO â€” Ficha 3145555  
Centro de Comercio y Servicios â€” SENA  
*Rama Oficial:* `feature/r3-observability` | *Pull Request:* #19
