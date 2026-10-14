
## 1. ESPECIFICACIÓN DEL PROYECTO (Fuente de Verdad)

### Visión
Aplicación web cliente (Single-Page Application modular en HTML, CSS y JavaScript) para gestión de aula: administración de grupos, control de asistencia diaria y cálculo de calificaciones ponderadas.

### Entidades y Reglas de Negocio
* **Alumnos**: `id`, `nombre`, `apellidos`, `grupo`.
* **Asistencia**: Estados admitidos: `Presente (P)`, `Ausente Justificado (AJ)`, `Ausente Injustificado (AI)`, `Retraso (R)`.
* **Criterios de Evaluación**: Conjunto de ítems ponderados.
  * **Invariante 1**: La suma de los pesos de una evaluación debe ser exactamente el 100%.
  * **Invariante 2**: Las notas numéricas deben situarse estrictamente en el rango [0.00, 10.00].
  * **Cálculo**: Nota Final = Suma(Nota_i * Peso_i).
* **Persistencia**: `localStorage` (formato JSON) con soporte para exportar/importar copias de seguridad.

### Arquitectura de Código (`src/js/`)
* `models.js`: Entidades y validaciones de datos.
* `calculator.js`: Lógica pura de cálculo (medias ponderadas y asistencia).
* `storage.js`: Lectura, guardado y serialización JSON.
* `app.js`: Manejo de eventos del DOM y renderizado.

---

## 2. ROL Y PROTOCOLO DE LOS AGENTES

### Modos de Operación
1. **Orchestrator**:
   * Desglosa tareas según los requisitos de este documento.
   * Prohibido escribir código directamente. Asigna tareas al Coder.
2. **Architect**:
   * Valida que la estructura respete la separación de responsabilidades y las invariantes.
3. **Coder**:
   * Escribe código modular en `src/js/`, `src/css/` o `index.html`.
   * Solo modifica los archivos necesarios para la tarea asignada.
4. **QA**:
   * Verifica los cálculos numéricos y las reglas de validación antes de dar por buena una tarea.

---

## 3. INTEGRACIÓN CON GRAPHIFY (Optimización de Contexto)

Para evitar lecturas innecesarias de archivos completos y ahorrar tokens:

* **Antes de modificar código**:
  * Usar `graphify query "<pregunta>"` para localizar módulos relevantes.
  * Usar `graphify affected "<Entidad>"` antes de refactorizar para comprobar dependencias.
* **Después de crear o modificar código**:
  * Ejecutar en terminal: `graphify update .` para sincronizar el AST.
* **Prohibido**:
  * Volcar archivos enteros en el prompt si la información se puede consultar mediante `graphify`.