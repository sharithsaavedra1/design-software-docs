# Definition of Done

> Estado: 🟢 Estable | Última actualización: 2026-08-01
> Autor: Jesús Ariel González Bonilla (PM + Arquitecto) | Equipo: Por definir

Un documento está **done** cuando:

- [ ] Fue aprobado por al menos un revisor
- [ ] Está enlazado desde el `README.md` de su sección
- [ ] El estado cambió a 🟢
- [ ] Los enlaces relativos funcionan
- [ ] No contiene información sensible
- [ ] El CHANGELOG fue actualizado si el cambio modifica gobernanza, estructura de carpetas, o un contrato compartido (API, modelo de datos, convenciones de Git)

## Cambios que modifican schema de BD (regla endurecida 2026-08-25)

Toda **HU o cambio que modifique el schema de una base de datos** (nueva tabla, columna, índice o grant en un repo `-db`) **NO está done** hasta que, en la **misma entrega**, actualice:

- [ ] El `data-model.md` del servicio dueño (`09-microservices/services/<svc>/`).
- [ ] El diccionario de datos (`06-data/data-dictionary.md`).

...referenciando el **changeset** que introdujo el cambio (tabla/columna/índice: nombre, tipo, propósito). Sin este sync, el docs SSOT deja de reflejar la BD real y se pierde trazabilidad. Aplica a todos los servicios; el revisor central lo verifica antes de mergear.
