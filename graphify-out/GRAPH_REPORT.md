# Graph Report - Teacher_hub  (2026-10-13)

## Corpus Check
- 4 files · ~4,865 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 71 nodes · 161 edges · 11 communities (8 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aede42e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- calcularNotaFinalLapso
- teacher_hub
- Architect Agent
- Coder Agent
- QA Agent
- renderizar
- app.js
- renderizarAlumnos
- guardarDatos
- importarDatos
- actualizarIndicadorRespaldo

## God Nodes (most connected - your core abstractions)
1. `renderizar()` - 20 edges
2. `renderizarAlumnos()` - 12 edges
3. `guardarDatos()` - 11 edges
4. `importarDesdeArchivo()` - 8 edges
5. `leerDatos()` - 7 edges
6. `renderizarMigas()` - 7 edges
7. `renderizarMaterias()` - 7 edges
8. `crearFormularioAlumno()` - 7 edges
9. `importarDatos()` - 7 edges
10. `generarId()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `crearFormularioAlumno()` --calls--> `calcularNotaFinal()`  [EXTRACTED]
  src/js/app.js → src/js/calculadora.js
- `calcularNotaFinalLapso()` --calls--> `calcularNotaFinal()`  [EXTRACTED]
  src/js/app.js → src/js/calculadora.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Multi-Agent System Roles** — agent_orchestrator, agent_architect, agent_coder, agent_qa [EXTRACTED 1.00]

## Communities (11 total, 3 thin omitted)

### Community 0 - "calcularNotaFinalLapso"
Cohesion: 0.28
Nodes (7): calcularNotaFinalLapso(), crearFilaAlumno(), crearTablaAlumnos(), obtenerNotasLapso(), calcularNotaFinal(), calculateWeightedFinalGrade(), validateWeights()

### Community 1 - "teacher_hub"
Cohesion: 0.67
Nodes (3): Multi-Agent Orchestration, Specification-Driven Development, teacher_hub

### Community 5 - "renderizar"
Cohesion: 0.26
Nodes (12): buscarCurso(), buscarMateria(), crearBotonMiga(), estadoPorDefecto(), guardarLapso(), leerDatos(), migasRoot(), renderizar() (+4 more)

### Community 6 - "app.js"
Cohesion: 0.24
Nodes (7): aplicarTema(), crearBotonPlantilla(), descargarPlantilla(), iniciarTema(), lapsoActivo, LAPSOS, nav

### Community 7 - "renderizarAlumnos"
Cohesion: 0.23
Nodes (12): appRoot(), crearBotonExportarPDF(), crearBotonVolver(), crearItemMateria(), crearSeccionPegarTexto(), crearTarjetaCurso(), crearTitulo(), exportarActaPDF() (+4 more)

### Community 8 - "guardarDatos"
Cohesion: 0.31
Nodes (11): crearBotonImportarPDF(), crearCampo(), crearFormularioAlumno(), crearFormularioCurso(), crearFormularioMateria(), extraerTextoPDF(), generarId(), guardarDatos() (+3 more)

### Community 9 - "importarDatos"
Cohesion: 0.40
Nodes (6): exportarDatos(), importarDatos(), iniciarCopiaSeguridad(), marcarRespaldoCompleto(), normalizarDatos(), validarEstructuraDatos()

### Community 10 - "actualizarIndicadorRespaldo"
Cohesion: 0.67
Nodes (3): actualizarIndicadorRespaldo(), estadoRespaldo(), marcarCambiosPendientes()

## Knowledge Gaps
- **10 isolated node(s):** `LAPSOS`, `nav`, `lapsoActivo`, `Multi-Agent Orchestration`, `Specification-Driven Development` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 13 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderizar()` connect `renderizar` to `calcularNotaFinalLapso`, `app.js`, `renderizarAlumnos`, `guardarDatos`, `importarDatos`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `calcularNotaFinal()` connect `calcularNotaFinalLapso` to `guardarDatos`, `app.js`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `renderizarAlumnos()` connect `renderizarAlumnos` to `guardarDatos`, `calcularNotaFinalLapso`, `renderizar`, `app.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `LAPSOS`, `nav`, `lapsoActivo` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._