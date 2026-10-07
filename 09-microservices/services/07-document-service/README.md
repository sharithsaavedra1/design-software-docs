# document-service

| Campo | Valor |
|---|---|
| Modulo | Transversal |
| App repo | `design-software-document-service` |
| DB repo | `design-software-document-db` |
| Stack | Python / FastAPI |
| Deployables | document_api, template_api, pdf_renderer_worker, document_lifecycle_worker |
| Estado observado | Esqueleto hexagonal con APIs FastAPI y workers definidos. |

## Responsabilidad

Documentos, versiones, plantillas, variables de plantilla, renderizado PDF y ciclo de vida documental.

## Persistencia

- Esquemas: document
- Tablas: document.document, document.document_template, document.document_template_variable, document.document_template_version, document.document_version

## API detectada

| Metodo | Ruta | Fuente |
|---|---|---|
| GET | `/health` | `.\design-software-document-service\apps\template_api\main.py` |
| GET | `/health` | `.\design-software-document-service\apps\document_api\main.py` |

## Configuracion

- Sin variables detectadas automaticamente en archivos de configuracion/codigo.

## Notas

Aun tiene endpoints minimos de health en las APIs.
