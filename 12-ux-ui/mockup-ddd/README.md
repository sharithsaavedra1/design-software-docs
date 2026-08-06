<!-- RESUMEN-EJECUTIVO
agente: Jesús Ariel González Bonilla (PM + Arquitecto)
capacidad: DDD (Design-Driven Document) para generación de mockup con Google Stitch
fase: diseño (UX/UI)
estado: draft
dependencias_entrada: 12-ux-ui/design-system.md, navigation-map.md; 09-microservices/services/*/openapi.yaml; 06-data + services/*/data-model.md; 04-requirements/user-stories.md
consumidores_siguientes: Google Stitch (generación de mockup), luego repo frontend (que NO conoce el mockup)
tldr: Documento que traduce el SSOT (design-system + contratos + data-model + HU) en prompts listos para Stitch y aloja los mockups generados, todo dentro de docs.
decisiones_clave: DDD y mockups viven en docs/12-ux-ui; frontend jamás conoce el mockup; cada pantalla es trazable a HU+endpoint+tabla
halts_registrados: ninguno
-->

# DDD — Design-Driven Document (mockup con Google Stitch)

**Qué es:** el documento que **dirige la generación del mockup** de todo el sistema con
[Google Stitch](https://stitch.withgoogle.com/). Traduce el conocimiento ya existente
(design-system + contratos de API + modelo de datos + HU) en **prompts listos para pegar en
Stitch**, pantalla por pantalla.

## Regla de ubicación (decidida)

- **El DDD vive en `docs/12-ux-ui/mockup-ddd/`.**
- **El mockup generado vive en `docs/12-ux-ui/mockup-ddd/mockups/`.**
- **El repo `frontend/` es una capa limpia que JAMÁS conoce el mockup.** El frontend se
  construye contra los **contratos** (`09-microservices/**/openapi.yaml`) y el design-system,
  no contra estos artefactos. El mockup es insumo de diseño/validación, no dependencia de código.

## Fuente única de verdad (de dónde deriva cada pantalla)

El DDD **no inventa** dominio ni datos; deriva del SSOT:

| Insumo | Aporta a la pantalla |
|---|---|
| `04-requirements/user-stories.md` | la **HU** (qué necesita el usuario) |
| `09-microservices/services/<svc>/components/*/openapi.yaml` | las **acciones/datos** (endpoints que consume) |
| `06-data/*` + `services/<svc>/data-model.md` | los **campos** que se muestran (nombres/tipos/enums reales) |
| `12-ux-ui/navigation-map.md` | la **ubicación** en la navegación por rol |
| `12-ux-ui/design-system.md` | **estilo, tokens, accesibilidad** (WCAG 2.1 AA) |

**Trazabilidad obligatoria por pantalla:** `pantalla → HU → endpoint(s) → tabla(s)`.

## Principios que Stitch debe respetar (del design-system)

1. **Claridad antes que densidad.** Estado (BORRADOR/EN_REVISIÓN/PUBLICADO) y **conflictos** por encima de todo.
2. **El conflicto es ciudadano de primera clase** — su representación visual es prioritaria; nunca solo por color.
3. **Una interfaz por rol** (Coordinador, Instructor, Aprendiz, Administrador) — sin controles ocultos.
4. **Tolerante a conectividad variable** — estados loading / empty / error / offline básicos.
5. **Lenguaje del dominio SENA en español** (ficha, ambiente, competencia, RAP); código en inglés.
6. **Accesibilidad WCAG 2.1 AA** — contraste ≥4.5:1, teclado, objetivos táctiles 44×44, ARIA.
7. **Estados de negocio parametrizables** — la UI consume el catálogo `status`, no lo hardcodea.

## Cómo se usa este DDD con Stitch (workflow)

1. **Brief global de estilo** (una vez): se pega al iniciar el proyecto en Stitch —
   ver [§ Brief global de estilo](#brief-global-de-estilo). Fija paleta, tipografía,
   tono, accesibilidad y layout base (app shell por rol).
2. **Prompt por pantalla**: cada archivo en `flows/` trae, por pantalla, un bloque
   **`PROMPT STITCH`** listo para pegar. El prompt describe: propósito, layout, datos
   reales (campos del data-model), acciones (botones ↔ endpoints), y los estados
   loading/empty/error.
3. **Guardar el resultado**: el mockup generado (imagen/HTML export de Stitch) se guarda en
   `mockups/<flujo>/<pantalla>.<png|html>` y se enlaza desde el archivo del flujo.

## Brief global de estilo (pegar primero en Stitch)

> App web responsive para **gestión de horarios de formación del SENA (Colombia)**. Público:
> personal académico. Idioma de la interfaz: **español**. Tono: institucional, claro, sobrio.
> **Design system:** color de marca verde institucional SENA (placeholder hasta ratificar);
> superficies claras, texto de alto contraste (**WCAG 2.1 AA**, ≥4.5:1). Escala de espaciado de
> 4px, esquinas suaves (radius sm/md), sombras sutiles para tarjetas y menús. Tipografía
> sans-serif del sistema (rendimiento en conectividad baja). **Estados de negocio** con color
> semántico + **icono + texto** (nunca solo color): BORRADOR (neutro), EN_REVISIÓN (advertencia),
> PUBLICADO (éxito), **CONFLICTO (crítico)**. Layout: **app shell** con barra superior (marca,
> usuario, notificaciones) y **navegación lateral por rol**. Componentes: tablas densas con
> filtros y paginación, formularios con validación en línea, panel de detalle lateral, toasts,
> modales de confirmación. Todo navegable por teclado, objetivos táctiles ≥44px (uso en tablet).

## Inventario de pantallas por rol (deriva de navigation-map)

| Rol | Flujo (archivo) | Pantallas |
|---|---|---|
| Transversal | [flows/01-auth.md](flows/01-auth.md) | Login · Recuperar contraseña · Nueva contraseña · App shell |
| **Coordinador** (núcleo MVP) | flows/02-coordinador.md | Dashboard · Horarios (lista) · Crear/editar horario · **Panel de conflictos** · Disponibilidad · Fichas |
| Instructor | flows/03-instructor.md | Mi horario (semana) · Mi disponibilidad · Seguimiento de ficha |
| Aprendiz | flows/04-aprendiz.md | Mi horario (semana) · Notificaciones |
| Administrador | flows/05-administrador.md | Panel de indicadores (KPIs) · Administración (usuarios, datos de referencia) |
| Soporte back-office | flows/06-backoffice.md | Documentos · Auditoría · Catálogos/parametrización |

> El orden de prioridad para generar mockups sigue el MVP: **Auth → Coordinador → Instructor →
> Aprendiz → Administrador → back-office.**

## Convención de cada archivo de flujo (`flows/*.md`)

Por cada pantalla:
- **Encabezado:** nombre, ruta, rol, **HU**, **endpoints** (del openapi), **tabla(s)/campos** (del data-model).
- **Propósito** (1–2 líneas).
- **Layout** (regiones y componentes).
- **Datos mostrados** (tabla campo→origen real).
- **Acciones** (botón/control → endpoint → resultado).
- **Estados** (loading / empty / error / success; y conflicto donde aplique).
- **`PROMPT STITCH`** (bloque listo para pegar).
- **Mockup:** enlace a `mockups/...` una vez generado.
