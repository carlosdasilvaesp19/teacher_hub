# TeacherHub - Gestor Notas

Aplicación web ligera y modular diseñada para que docentes gestionen cursos, asignaturas, evaluaciones y calificaciones de manera ágil, privada, orientado a la organización personal.

**Demo en vivo:** [https://management-teacher-app.netlify.app/](https://management-teacher-app.netlify.app/)

---
##  Arquitectura del Proyecto

- **Capa de Presentación e Interfaz (`index.html` + `src/css/`):** Estructura visual semántica y diseño adaptativo con temas claro/oscuro mediante variables CSS.
- **Capa de Control y Eventos (`src/js/app.js`):** Gestiona la captura de eventos del usuario, renderizado dinámico de tablas y actualización reactiva del DOM.
- **Capa de Lógica de Negocio (`src/js/calculadora.js`):** Funciones puras e independientes para el cómputo de ponderaciones, promedios por lapso/trimestre y redondeos.

## Características Principales

- **Portabilidad e Intercambio Seguro:** Sistema de copia y restauración mediante exportación/importación de archivos JSON.
- **Gestión Jerárquica:** Organización por cursos, asignaturas, trimestres/lapsos y estudiantes.
- **Carga Masiva de Alumnos:** Importación rápida desde listados de texto o archivos CSV.
- **Generación de Reportes:** Exportación de actas de notas directamente a formato PDF.
- **Auditoría Visual:** Indicador de estado para advertir sobre cambios pendientes de respaldo.

---

## Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3.
- **Lógica:** JavaScript, manipulación del DOM.
- **Despliegue:** Netlify (integración continua desde GitHub).
- **Herramientas de Desarrollo:** 
  - **Graphify CLI:**  generación del grafo de dependencias y arquitectura, muy eficiente para ahorrar tokens.
  - **Agente de Desarrollo:** Cline (orquestación y asistencia en la implementación).
  - **IA:** DeepSeek-V4 (generación de lógica, razonamiento y resolución de código).

---

## Licencia

Este proyecto está bajo la Licencia de Uso Personal, Educativo y No Comercial (BY-NC). Consulta el archivo [LICENSE](LICENSE) para más detalles.
