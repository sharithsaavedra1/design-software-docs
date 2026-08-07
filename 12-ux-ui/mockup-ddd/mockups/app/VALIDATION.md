# Validación del mockup

Fecha de validación: 2026-08-06.

## Resultado

- Inventario: **45/45** pantallas y modales registrados.
- Capturas: **45/45 desktop** (`1440×1000`) y **45/45 móviles** (`390×844`).
- Render estático: **45/45** rutas producen HTML sin excepción.
- JavaScript: todos los archivos superan `node --check`.
- Router: rutas públicas, rutas protegidas y fallback 404 registrados.
- RBAC: acceso directo no permitido deriva a 403.
- Roles: Coordinador, Instructor, Aprendiz, Director y Soporte.
- Responsive: breakpoint móvil `<768px`; tablas se convierten en tarjetas y navegación en drawer.
- Accesibilidad base: skip-link, foco visible, ARIA en modales/drawers, estados con icono + texto y controles de mínimo 44px.
- Listas: componente compartido de paginación, selector 10/20/50 y rango visible.
- Estados: loading, empty, error y offline disponibles mediante query del hash.
- Arquitectura: un solo set de tokens y componentes compartidos; carpetas espejo por micro-frontend.

## Verificación reproducible

```bash
find . -name '*.js' -print0 | xargs -0 -n1 node --check
node tools/validate-routes.js
python3 -m http.server 8080
```

Abrir `http://localhost:8080/#/inventory` y recorrer el índice maestro.
