# Reglas de frontera de servicios

> Estado: 🔴 Pendiente | Última actualización: 2026-06-17

Define las reglas que gobiernan cómo los microservicios interactúan entre sí y cómo se mantienen los bounded contexts.

## Reglas de propiedad de datos

| # | Regla | Justificación |
|---|-------|--------------|
| R01 | Cada entidad tiene un único servicio propietario (ver [data-ownership-matrix.md](./data-ownership-matrix.md)) | Evitar escrituras concurrentes desde múltiples servicios |
| R02 | Ningún servicio accede directamente a la BD de otro | Permite despliegue y escalado independiente |
| R03 | Los IDs externos se guardan como campos simples (no FK de BD) | Las FKs cruzadas entre BDs no existen |
| R04 | Si un servicio necesita datos de otro con frecuencia alta, crea un read model local | Reducir latencia y desacoplamiento |

## Reglas de comunicación

| # | Regla | Justificación |
|---|-------|--------------|
| R05 | Llamadas síncronas (REST) solo para operaciones que necesitan respuesta inmediata | Las llamadas síncronas crean acoplamiento de disponibilidad |
| R06 | Un servicio no puede encadenar más de 2 llamadas síncronas para completar una operación | Evitar el antipatrón de "cadena de servicios" |
| R07 | Mutaciones que no requieren respuesta inmediata se propagan como eventos | Desacopla la escritura del resultado |
| R08 | El `audit-service` recibe todos los eventos; nunca se llama síncronamente | Es un consumidor pasivo de toda mutación |

## Reglas de despliegue

| # | Regla | Justificación |
|---|-------|--------------|
| R09 | Cada servicio se despliega y escala independientemente | Principio fundamental de microservicios |
| R10 | Un cambio de schema en la BD de un servicio no puede requerir despliegue coordinado con otro | Autonomía de equipos |
| R11 | Las versiones de API deben soportar al menos una versión anterior durante el periodo de transición | Permite despliegue sin big bang |

## Reglas de creación de nuevo servicio

| # | Regla |
|---|-------|
| R12 | Debe existir ADR aprobada antes de crear la carpeta del servicio |
| R13 | El bounded context debe estar documentado en [data-ownership-matrix.md](./data-ownership-matrix.md) antes de crear código |
| R14 | El servicio debe aparecer en [service-catalog.md](./service-catalog.md) con owner definido |
| R15 | Al menos un componente debe tener `contract.md` completado antes de ser consumido por otro servicio |

## Antipatrones a evitar

| Antipatrón | Señal de alerta | Solución |
|-----------|----------------|---------|
| Módulo disfrazado | El servicio no tiene BD propia | Asignarle BD o fusionarlo con otro |
| Omnibus service | Más de 15 entidades propias | Dividir por sub-dominio |
| Llamada en cadena | A llama a B que llama a C que llama a D | Introducir evento o saga |
| BD compartida | Dos servicios escriben en la misma tabla | Asignar propietario único |
| Sync en cascada | Una request HTTP dispara > 2 llamadas HTTP | Introducir read model o caché |
