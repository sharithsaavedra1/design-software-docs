# Estrategia CI/CD (Continuous Integration & Deployment)

*(Definición en proceso: Alinearse con el equipo Cloud del SENA para el proveedor final: GitHub Actions o GitLab CI).*

## Pipeline de Integración (Al hacer Push)
Todo código enviado al sistema pasa por:
1. **Static Analysis & Linting:** Se verifica la calidad estructural.
2. **Suite de Testing del Motor de Reglas:** Es imperativo correr el test donde al *Instructor A* se le asignen dos clases simultáneas. Si el backend lo ignora y *NO* explota, el build fallará bloqueando el PR.

## Pipeline de Despliegue (Al Margear)
- Empaquetado `build` (React/Angular) o Creación de Imagen Docker para el Backend.
- Despliegue Zero-Downtime. Dado que los Coordinadores no se detienen en época de programación, el sistema no puede presentar caída en la actualización de parche.
