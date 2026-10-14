# Graph Report - Teacher_hub  (2026-10-12)

## Corpus Check
- 4 files · ~2,921 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 41 nodes · 87 edges · 9 communities (6 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e5c360e9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- calculadora.js
- teacher_hub
- Architect Agent
- Coder Agent
- QA Agent
- crearFilaAlumno
- app.js
- renderizarMaterias
- crearFormularioAlumno

## God Nodes (most connected - your core abstractions)
1. `renderizar()` - 14 edges
2. `crearFilaAlumno()` - 10 edges
3. `guardarDatos()` - 7 edges
4. `renderizarMigas()` - 7 edges
5. `renderizarMaterias()` - 7 edges
6. `renderizarAlumnos()` - 7 edges
7. `crearFormularioAlumno()` - 7 edges
8. `renderizarCursos()` - 6 edges
9. `crearFormularioCurso()` - 6 edges
10. `crearFormularioMateria()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `crearFormularioAlumno()` --calls--> `calcularNotaFinal()`  [EXTRACTED]
  src/js/app.js → src/js/calculadora.js
- `crearFilaAlumno()` --calls--> `calcularNotaFinal()`  [EXTRACTED]
  src/js/app.js → src/js/calculadora.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Multi-Agent System Roles** — agent_orchestrator, agent_architect, agent_coder, agent_qa [EXTRACTED 1.00]

## Communities (9 total, 3 thin omitted)

### Community 0 - "calculadora.js"
Cohesion: 0.60
Nodes (3): calcularNotaFinal(), calculateWeightedFinalGrade(), validateWeights()

### Community 1 - "teacher_hub"
Cohesion: 0.67
Nodes (3): Multi-Agent Orchestration, Specification-Driven Development, teacher_hub

### Community 5 - "crearFilaAlumno"
Cohesion: 0.47
Nodes (6): crearFilaAlumno(), aplicarTema(), crearBotonVolver(), iniciarTema(), crearTablaAlumnos(), renderizarAlumnos()

### Community 6 - "app.js"
Cohesion: 0.42
Nodes (9): buscarCurso(), buscarMateria(), crearBotonMiga(), estadoPorDefecto(), leerDatos(), migasRoot(), nav, renderizar() (+1 more)

### Community 7 - "renderizarMaterias"
Cohesion: 0.40
Nodes (6): appRoot(), crearTitulo(), crearItemMateria(), crearTarjetaCurso(), renderizarCursos(), renderizarMaterias()

### Community 8 - "crearFormularioAlumno"
Cohesion: 0.60
Nodes (6): crearCampo(), crearFormularioAlumno(), crearFormularioCurso(), generarId(), guardarDatos(), crearFormularioMateria()

## Knowledge Gaps
- **8 isolated node(s):** `nav`, `Multi-Agent Orchestration`, `Specification-Driven Development`, `Architect Agent`, `Project Specification` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 9 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `crearFilaAlumno()` connect `crearFilaAlumno` to `crearFormularioAlumno`, `calculadora.js`, `app.js`, `renderizarMaterias`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `renderizar()` connect `app.js` to `crearFormularioAlumno`, `crearFilaAlumno`, `renderizarMaterias`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `calcularNotaFinal()` connect `calculadora.js` to `crearFormularioAlumno`, `crearFilaAlumno`, `app.js`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `nav`, `Multi-Agent Orchestration`, `Specification-Driven Development` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._