import { calcularNotaFinal } from './calculadora.js';

const CLAVE_DATOS = 'academic_data';
const CLAVE_TEMA = 'academic_theme';
const CLAVE_LAPSO = 'academic_lapso';
const CLAVE_SIDEBAR = 'academic_sidebar';

/* ============================================================
 *  Capa 3: Persistencia (localStorage, formato JSON)
 *  Estructura:
 *  { cursos: [{ id, nombre, materias: [
 *    { id, nombre, minNota, maxNota, evaluaciones: [{id, nombre, peso}],
 *      alumnos: [{ id, nombre, notas: { [lapsoId]: { [evalId]: number } } }]
 *    } ] } ] }
 * ============================================================ */

const LAPSOS = [
  { id: 'lapso1', nombre: '1º Lapso' },
  { id: 'lapso2', nombre: '2º Lapso' },
  { id: 'lapso3', nombre: '3º Lapso' }
];

function estadoPorDefecto() {
  return { cursos: [] };
}

function leerDatos() {
  try {
    const datos = localStorage.getItem(CLAVE_DATOS);
    const parsed = datos ? JSON.parse(datos) : null;
    if (parsed && Array.isArray(parsed.cursos)) {
      return normalizarDatos(parsed);
    }
    return estadoPorDefecto();
  } catch {
    return estadoPorDefecto();
  }
}

/**
 * Garantiza que cada materia tenga la estructura de lapsos/notas esperada
 * (migración desde versiones anteriores o datos sin lapsos).
 */
function normalizarDatos(datos) {
  if (!datos || !Array.isArray(datos.cursos)) datos.cursos = [];
  datos.cursos = datos.cursos.filter((curso) => curso && typeof curso === 'object');
  datos.cursos.forEach((curso) => {
    if (!Array.isArray(curso.materias)) curso.materias = [];
    curso.materias = curso.materias.filter((materia) => materia && typeof materia === 'object');
    curso.materias.forEach((materia) => {
      if (!materia.evaluaciones) materia.evaluaciones = [];
      if (!materia.alumnos) materia.alumnos = [];
      materia.evaluaciones = materia.evaluaciones.filter((e) => e && typeof e === 'object');
      materia.alumnos = materia.alumnos.filter((a) => a && typeof a === 'object');
      materia.alumnos.forEach((alumno) => {
        if (!alumno.notas || typeof alumno.notas !== 'object' || Array.isArray(alumno.notas)) {
          alumno.notas = {};
        }
        LAPSOS.forEach((lapso) => {
          if (!alumno.notas[lapso.id] || typeof alumno.notas[lapso.id] !== 'object') {
            alumno.notas[lapso.id] = {};
          }
        });
      });
    });
  });
  return datos;
}

function guardarDatos(datos) {
  localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
  marcarCambiosPendientes();
}

/** Genera un identificador único simple. */
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ============================================================
 *  Estado de respaldo (backup status)
 * ============================================================ */

const CLAVE_RESPALDO = 'academic_backup_status';

function marcarCambiosPendientes() {
  sessionStorage.setItem(CLAVE_RESPALDO, 'pendiente');
  actualizarIndicadorRespaldo();
}

function marcarRespaldoCompleto() {
  sessionStorage.setItem(CLAVE_RESPALDO, 'guardado');
  actualizarIndicadorRespaldo();
}

function estadoRespaldo() {
  return sessionStorage.getItem(CLAVE_RESPALDO) || 'guardado';
}

/**
 * Actualiza el indicador visual de estado de respaldo en la sidebar.
 */
function actualizarIndicadorRespaldo() {
  const contenedor = document.getElementById('indicador-respaldo');
  const texto = document.getElementById('indicador-respaldo-texto');
  if (!contenedor || !texto) return;

  const pendiente = estadoRespaldo() === 'pendiente';
  contenedor.classList.toggle('indicador-pendiente', pendiente);
  contenedor.classList.toggle('indicador-guardado', !pendiente);
  texto.textContent = pendiente ? 'Cambios sin respaldar en archivo' : 'Todo respaldado';
}

/* ============================================================
 *  Helpers de acceso a datos
 * ============================================================ */

function buscarCurso(datos, cursoId) {
  return datos.cursos.find((c) => c.id === cursoId);
}

function buscarMateria(curso, materiaId) {
  return curso?.materias.find((m) => m.id === materiaId) ?? null;
}

/* ============================================================
 *  Estado de navegación y estado global
 * ============================================================ */

let nav = { vista: 'cursos' };
let lapsoActivo = leerLapso();

function leerLapso() {
  const guardado = localStorage.getItem(CLAVE_LAPSO);
  return guardado || 'lapso1';
}

function guardarLapso(id) {
  lapsoActivo = id;
  localStorage.setItem(CLAVE_LAPSO, id);
}

function obtenerLapso(id) {
  return LAPSOS.find((l) => l.id === id) || LAPSOS[0];
}

/* ============================================================
 *  Renderizado de vistas
 * ============================================================ */

const appRoot = () => document.getElementById('aplicacion');
const migasRoot = () => document.getElementById('migas');

/** Renderiza la vista actual completa (sidebar + migas + contenido). */
function renderizar() {
  renderizarSidebar();
  renderizarMigas();

  const datos = leerDatos();

  if (nav.vista === 'cursos') {
    renderizarCursos(datos);
  } else if (nav.vista === 'materias') {
    const curso = buscarCurso(datos, nav.cursoId);
    if (!curso) {
      nav = { vista: 'cursos' };
      renderizar();
      return;
    }
    renderizarMaterias(datos, curso);
  } else if (nav.vista === 'alumnos') {
    const curso = buscarCurso(datos, nav.cursoId);
    const materia = buscarMateria(curso, nav.materiaId);
    if (!materia) {
      nav = { vista: 'materias', cursoId: nav.cursoId };
      renderizar();
      return;
    }
    renderizarAlumnos(datos, curso, materia);
  }
}

/* ============================================================
 *  Sidebar (lista de cursos + selector de lapso)
 * ============================================================ */

function renderizarSidebar() {
  renderizarListaCursosSidebar();
  renderizarSelectorLapso();
}

function renderizarListaCursosSidebar() {
  const contenedor = document.getElementById('lista-cursos-sidebar');
  contenedor.replaceChildren();

  const datos = leerDatos();

  const itemTodos = document.createElement('button');
  itemTodos.type = 'button';
  itemTodos.className = 'sidebar-item';
  itemTodos.textContent = '📚 Todos los cursos';
  itemTodos.addEventListener('click', () => {
    nav = { vista: 'cursos' };
    renderizar();
  });
  contenedor.appendChild(itemTodos);

  if (datos.cursos.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'sidebar-vacio';
    vacio.textContent = 'Sin cursos aún.';
    contenedor.appendChild(vacio);
    return;
  }

  datos.cursos.forEach((curso) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'sidebar-item';
    item.textContent = curso.nombre;
    item.addEventListener('click', () => {
      nav = { vista: 'materias', cursoId: curso.id };
      renderizar();
    });
    contenedor.appendChild(item);
  });
}

function renderizarSelectorLapso() {
  const contenedor = document.getElementById('selector-lapso');
  contenedor.replaceChildren();

  LAPSOS.forEach((lapso) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'opcion-lapso';
    if (lapso.id === lapsoActivo) boton.classList.add('activo');
    boton.textContent = lapso.nombre;
    boton.addEventListener('click', () => {
      guardarLapso(lapso.id);
      renderizar();
    });
    contenedor.appendChild(boton);
  });
}

function renderizarMigas() {
  const migas = migasRoot();
  migas.replaceChildren();

  const datos = leerDatos();

  const enlaceCursos = crearBotonMiga('Cursos', () => {
    nav = { vista: 'cursos' };
    renderizar();
  });
  migas.appendChild(enlaceCursos);

  if (nav.vista === 'materias' || nav.vista === 'alumnos') {
    const curso = buscarCurso(datos, nav.cursoId);
    if (curso) {
      migas.appendChild(document.createTextNode(' / '));
      const enlaceMaterias = crearBotonMiga(curso.nombre, () => {
        nav = { vista: 'materias', cursoId: curso.id };
        renderizar();
      });
      migas.appendChild(enlaceMaterias);
    }
  }

  if (nav.vista === 'alumnos') {
    const curso = buscarCurso(datos, nav.cursoId);
    const materia = buscarMateria(curso, nav.materiaId);
    if (materia) {
      migas.appendChild(document.createTextNode(' / '));
      const span = document.createElement('span');
      span.className = 'miga-actual';
      span.textContent = materia.nombre;
      migas.appendChild(span);
    }
  }
}

function crearBotonMiga(texto, alClick) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'miga-enlace';
  boton.textContent = texto;
  boton.addEventListener('click', alClick);
  return boton;
}

/* ---------- Vista: Cursos ---------- */

function renderizarCursos(datos) {
  const root = appRoot();
  root.replaceChildren();

  const titulo = crearTitulo('Cursos', 'Crea y gestiona tus cursos.');
  root.appendChild(titulo);

  root.appendChild(crearFormularioCurso(datos));

  const seccion = document.createElement('section');
  seccion.className = 'tarjeta';
  const encabezado = document.createElement('div');
  encabezado.className = 'encabezado-tarjeta';
  const h2 = document.createElement('h2');
  h2.textContent = 'Mis cursos';
  encabezado.appendChild(h2);
  seccion.appendChild(encabezado);

  if (datos.cursos.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.textContent = 'Todavía no hay cursos. Crea el primero arriba.';
    seccion.appendChild(vacio);
  } else {
    const rejilla = document.createElement('div');
    rejilla.className = 'rejilla-cursos';
    datos.cursos.forEach((curso) => {
      rejilla.appendChild(crearTarjetaCurso(datos, curso));
    });
    seccion.appendChild(rejilla);
  }

  root.appendChild(seccion);
}

function crearFormularioCurso(datos) {
  const formulario = document.createElement('form');
  formulario.className = 'formulario';
  formulario.autocomplete = 'off';
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const nombre = formulario.elements.nombre.value.trim();
    if (!nombre) return;
    datos.cursos.push({ id: generarId(), nombre, materias: [] });
    guardarDatos(datos);
    renderizar();
  });

  formulario.appendChild(crearCampo('nombre', 'Nombre del curso', 'text', 'Ej. 4º ESO E', true));

  const boton = document.createElement('button');
  boton.type = 'submit';
  boton.className = 'boton-primario';
  boton.textContent = 'Crear curso';
  formulario.appendChild(boton);

  return formulario;
}

function crearTarjetaCurso(datos, curso) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta-curso';

  const nombre = document.createElement('h3');
  nombre.textContent = curso.nombre;

  const detalle = document.createElement('p');
  detalle.className = 'muted';
  const numMaterias = curso.materias?.length ?? 0;
  detalle.textContent = `${numMaterias} ${numMaterias === 1 ? 'materia' : 'materias'}`;

  const acciones = document.createElement('div');
  acciones.className = 'fila-acciones';

  const abrir = document.createElement('button');
  abrir.type = 'button';
  abrir.className = 'boton-primario';
  abrir.textContent = 'Abrir';
  abrir.addEventListener('click', () => {
    nav = { vista: 'materias', cursoId: curso.id };
    renderizar();
  });

  const eliminar = document.createElement('button');
  eliminar.type = 'button';
  eliminar.className = 'boton-eliminar';
  eliminar.textContent = 'Eliminar';
  eliminar.addEventListener('click', () => {
    if (confirm(`¿Eliminar el curso "${curso.nombre}" y todas sus materias y alumnos?`)) {
      datos.cursos = datos.cursos.filter((c) => c.id !== curso.id);
      guardarDatos(datos);
      renderizar();
    }
  });

  acciones.append(abrir, eliminar);
  tarjeta.append(nombre, detalle, acciones);
  return tarjeta;
}

/* ---------- Vista: Materias ---------- */

function renderizarMaterias(datos, curso) {
  const root = appRoot();
  root.replaceChildren();

  const botonVolver = crearBotonVolver('Todos los cursos', () => {
    nav = { vista: 'cursos' };
    renderizar();
  });
  root.appendChild(botonVolver);

  root.appendChild(crearTitulo(curso.nombre, 'Gestiona las materias de este curso.'));

  root.appendChild(crearFormularioMateria(datos, curso));

  const seccion = document.createElement('section');
  seccion.className = 'tarjeta';
  const encabezado = document.createElement('div');
  encabezado.className = 'encabezado-tarjeta';
  const h2 = document.createElement('h2');
  h2.textContent = 'Materias';
  encabezado.appendChild(h2);
  seccion.appendChild(encabezado);

  if (!curso.materias || curso.materias.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.textContent = 'Todavía no hay materias en este curso.';
    seccion.appendChild(vacio);
  } else {
    const lista = document.createElement('ul');
    lista.className = 'lista-materias';
    curso.materias.forEach((materia) => {
      lista.appendChild(crearItemMateria(datos, curso, materia));
    });
    seccion.appendChild(lista);
  }

  root.appendChild(seccion);
}

function crearFormularioMateria(datos, curso) {
  const formulario = document.createElement('form');
  formulario.className = 'formulario formulario-materia';
  formulario.autocomplete = 'off';

  formulario.appendChild(crearCampo('nombre', 'Nombre de la materia', 'text', 'Ej. Matemáticas', true));

  const filaRango = document.createElement('div');
  filaRango.className = 'fila-campos';
  filaRango.appendChild(crearCampo('minNota', 'Nota mínima', 'number', '0', true, '0', null, '0.01'));
  filaRango.appendChild(crearCampo('maxNota', 'Nota máxima', 'number', '10', true, null, null, '0.01'));
  formulario.appendChild(filaRango);

  const subtituloEval = document.createElement('h3');
  subtituloEval.className = 'subtitulo-evaluaciones';
  subtituloEval.textContent = 'Evaluaciones (deben sumar 100%)';
  formulario.appendChild(subtituloEval);

  const contenedorEval = document.createElement('div');
  contenedorEval.className = 'contenedor-evaluaciones';
  formulario.appendChild(contenedorEval);

  const filaPesoSuma = document.createElement('p');
  filaPesoSuma.className = 'suma-pesos muted';
  formulario.appendChild(filaPesoSuma);

  const filasEvaluaciones = [];
  const agregarFilaEvaluacion = (nombre = '', peso = '') => {
    const fila = document.createElement('div');
    fila.className = 'fila-campos fila-evaluacion';

    const campoNombre = document.createElement('input');
    campoNombre.type = 'text';
    campoNombre.className = 'input-eval-nombre';
    campoNombre.placeholder = 'Nombre (ej. Examen 1)';
    campoNombre.value = nombre;

    const campoPeso = document.createElement('input');
    campoPeso.type = 'number';
    campoPeso.className = 'input-eval-peso';
    campoPeso.placeholder = 'Peso %';
    campoPeso.min = '0';
    campoPeso.max = '100';
    campoPeso.step = '0.01';
    campoPeso.value = peso;

    fila.append(campoNombre, campoPeso);
    contenedorEval.appendChild(fila);
    filasEvaluaciones.push({ nombre: campoNombre, peso: campoPeso });

    campoPeso.addEventListener('input', actualizarSumaPesos);
  };

  const actualizarSumaPesos = () => {
    const suma = filasEvaluaciones.reduce(
      (acc, { peso }) => acc + (Number(peso.value) || 0),
      0
    );
    filaPesoSuma.textContent = `Suma actual: ${suma.toFixed(2)}%`;
    filaPesoSuma.className = `suma-pesos ${Math.abs(suma - 100) < 0.001 ? 'ok' : 'error'}`;
  };

  agregarFilaEvaluacion();

  const botonAddEval = document.createElement('button');
  botonAddEval.type = 'button';
  botonAddEval.className = 'boton-secundario';
  botonAddEval.textContent = '+ Añadir evaluación';
  botonAddEval.addEventListener('click', () => agregarFilaEvaluacion());
  formulario.appendChild(botonAddEval);

  const botonGuardar = document.createElement('button');
  botonGuardar.type = 'submit';
  botonGuardar.className = 'boton-primario';
  botonGuardar.textContent = 'Crear materia';
  formulario.appendChild(botonGuardar);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nombre = formulario.elements.nombre.value.trim();
    const minNota = Number(formulario.elements.minNota.value);
    const maxNota = Number(formulario.elements.maxNota.value);

    const evaluaciones = filasEvaluaciones
      .map(({ nombre: n, peso: p }) => ({
        id: generarId(),
        nombre: n.value.trim(),
        peso: Number(p.value)
      }))
      .filter((e) => e.nombre !== '' && !isNaN(e.peso));

    const sumaPesos = evaluaciones.reduce((acc, e) => acc + e.peso, 0);
    if (!nombre || evaluaciones.length === 0) {
      alert('Debes indicar el nombre de la materia y al menos una evaluación.');
      return;
    }
    if (Math.abs(sumaPesos - 100) > 0.001) {
      alert('Los porcentajes de las evaluaciones deben sumar exactamente 100%.');
      return;
    }
    if (isNaN(minNota) || isNaN(maxNota) || minNota >= maxNota) {
      alert('El rango de notas debe ser válido (mínima < máxima).');
      return;
    }

    if (!curso.materias) curso.materias = [];
    curso.materias.push({
      id: generarId(),
      nombre,
      minNota,
      maxNota,
      evaluaciones,
      alumnos: []
    });
    guardarDatos(datos);
    renderizar();
  });

  return formulario;
}

function crearItemMateria(datos, curso, materia) {
  const item = document.createElement('li');
  item.className = 'item-materia';

  const info = document.createElement('div');
  info.className = 'item-info';

  const nombre = document.createElement('h3');
  nombre.textContent = materia.nombre;

  const detalle = document.createElement('p');
  detalle.className = 'muted';
  const evals = materia.evaluaciones.map((e) => `${e.nombre} ${e.peso}%`).join(' · ');
  const numAlumnos = materia.alumnos?.length ?? 0;
  detalle.textContent = `Rango [${materia.minNota}, ${materia.maxNota}] · ${evals} · ${numAlumnos} ${numAlumnos === 1 ? 'alumno' : 'alumnos'}`;

  info.append(nombre, detalle);

  const acciones = document.createElement('div');
  acciones.className = 'fila-acciones';

  const abrir = document.createElement('button');
  abrir.type = 'button';
  abrir.className = 'boton-primario';
  abrir.textContent = 'Alumnos';
  abrir.addEventListener('click', () => {
    nav = { vista: 'alumnos', cursoId: curso.id, materiaId: materia.id };
    renderizar();
  });

  const eliminar = document.createElement('button');
  eliminar.type = 'button';
  eliminar.className = 'boton-eliminar';
  eliminar.textContent = 'Eliminar';
  eliminar.addEventListener('click', () => {
    if (confirm(`¿Eliminar la materia "${materia.nombre}"?`)) {
      curso.materias = curso.materias.filter((m) => m.id !== materia.id);
      guardarDatos(datos);
      renderizar();
    }
  });

  acciones.append(abrir, eliminar);
  item.append(info, acciones);
  return item;
}

/* ---------- Vista: Alumnos ---------- */

function renderizarAlumnos(datos, curso, materia) {
  const root = appRoot();
  root.replaceChildren();

  const botonVolver = crearBotonVolver('Volver a materias', () => {
    nav = { vista: 'materias', cursoId: curso.id };
    renderizar();
  });
  root.appendChild(botonVolver);

  const lapso = obtenerLapso(lapsoActivo);
  root.appendChild(
    crearTitulo(
      materia.nombre,
      `Curso: ${curso.nombre} · ${lapso.nombre} · Rango [${materia.minNota}, ${materia.maxNota}]`
    )
  );

  if (materia.evaluaciones.length === 0) {
    const aviso = document.createElement('p');
    aviso.className = 'vacio';
    aviso.textContent = 'Esta materia no tiene evaluaciones definidas.';
    root.appendChild(aviso);
    return;
  }

  root.appendChild(crearFormularioAlumno(datos, curso, materia));

  const seccion = document.createElement('section');
  seccion.className = 'tarjeta';
  const encabezado = document.createElement('div');
  encabezado.className = 'encabezado-tarjeta';
  const h2 = document.createElement('h2');
  h2.textContent = 'Alumnos';
  encabezado.appendChild(h2);

  const grupoHerramientas = document.createElement('div');
  grupoHerramientas.className = 'grupo-herramientas';
  grupoHerramientas.appendChild(crearBotonImportarPDF(datos, curso, materia));
  grupoHerramientas.appendChild(crearBotonPlantilla());
  grupoHerramientas.appendChild(crearBotonExportarPDF(datos, curso, materia));
  encabezado.appendChild(grupoHerramientas);
  seccion.appendChild(encabezado);

  // Sección de importación por texto (TXT/CSV/pegar)
  seccion.appendChild(crearSeccionPegarTexto(datos, curso, materia));

  if (!materia.alumnos || materia.alumnos.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.textContent = 'Todavía no hay alumnos en esta materia.';
    seccion.appendChild(vacio);
  } else {
    seccion.appendChild(crearTablaAlumnos(datos, curso, materia));
  }

  root.appendChild(seccion);
}

function crearFormularioAlumno(datos, curso, materia) {
  const formulario = document.createElement('form');
  formulario.className = 'formulario';
  formulario.autocomplete = 'off';

  formulario.appendChild(crearCampo('nombre', 'Nombre del alumno', 'text', 'Nombre y apellidos', true));

  const contenedorNotas = document.createElement('div');
  contenedorNotas.className = 'fila-campos contenedor-notas';
  materia.evaluaciones.forEach((evaluacion) => {
    contenedorNotas.appendChild(
      crearCampo(
        `nota-${evaluacion.id}`,
        `${evaluacion.nombre} (${evaluacion.peso}%)`,
        'number',
        '',
        false,
        String(materia.minNota),
        String(materia.maxNota),
        '0.01'
      )
    );
  });
  formulario.appendChild(contenedorNotas);

  const boton = document.createElement('button');
  boton.type = 'submit';
  boton.className = 'boton-primario';
  boton.textContent = 'Añadir alumno';
  formulario.appendChild(boton);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nombre = formulario.elements.nombre.value.trim();
    if (!nombre) return;

    const notasLapso = {};
    const valoresNotas = [];
    materia.evaluaciones.forEach((evaluacion) => {
      const raw = formulario.elements[`nota-${evaluacion.id}`]?.value;
      const valor = raw === '' || raw == null ? null : Number(raw);
      if (valor !== null) notasLapso[evaluacion.id] = valor;
      valoresNotas.push(valor);
    });

    // Si se han introducido notas, validar el cálculo del lapso activo.
    const conNotas = valoresNotas.filter((v) => v !== null);
    if (conNotas.length > 0 && conNotas.length !== materia.evaluaciones.length) {
      alert('Debes rellenar todas las notas o ninguna.');
      return;
    }
    if (conNotas.length === materia.evaluaciones.length) {
      try {
        calcularNotaFinal(
          valoresNotas,
          materia.evaluaciones.map((e) => e.peso),
          materia.minNota,
          materia.maxNota
        );
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    if (!materia.alumnos) materia.alumnos = [];
    const notas = {};
    LAPSOS.forEach((l) => { notas[l.id] = {}; });
    notas[lapsoActivo] = notasLapso;
    materia.alumnos.push({ id: generarId(), nombre, notas });
    guardarDatos(datos);
    renderizar();
  });

  return formulario;
}

function crearTablaAlumnos(datos, curso, materia) {
  const tabla = document.createElement('table');
  tabla.className = 'tabla-alumnos';

  const thead = document.createElement('thead');
  const filaEncabezado = document.createElement('tr');
  ['Alumno', ...materia.evaluaciones.map((e) => e.nombre), 'Nota final', 'Acciones'].forEach(
    (texto) => {
      const th = document.createElement('th');
      th.textContent = texto;
      filaEncabezado.appendChild(th);
    }
  );
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement('tbody');
  materia.alumnos.forEach((alumno) => {
    tbody.appendChild(crearFilaAlumno(datos, curso, materia, alumno));
  });
  tabla.appendChild(tbody);

  return tabla;
}

/**
 * Obtiene las notas de un alumno para el lapso activo.
 * Devuelve null si no hay notas registradas para ese lapso.
 */
function obtenerNotasLapso(alumno, materia) {
  const notasLapso = alumno.notas?.[lapsoActivo];
  if (!notasLapso) return null;

  const valores = materia.evaluaciones.map((e) => notasLapso[e.id]);
  if (valores.some((v) => v == null)) return null;
  return valores.map(Number);
}

function calcularNotaFinalLapso(alumno, materia) {
  const valores = obtenerNotasLapso(alumno, materia);
  if (!valores) return null;
  try {
    return calcularNotaFinal(
      valores,
      materia.evaluaciones.map((e) => e.peso),
      materia.minNota,
      materia.maxNota
    );
  } catch {
    return null;
  }
}

function crearFilaAlumno(datos, curso, materia, alumno) {
  const fila = document.createElement('tr');

  const celdaNombre = document.createElement('td');
  celdaNombre.textContent = alumno.nombre;
  fila.appendChild(celdaNombre);

  const notasLapso = alumno.notas?.[lapsoActivo] ?? {};
  materia.evaluaciones.forEach((evaluacion) => {
    const celda = document.createElement('td');
    const valor = notasLapso[evaluacion.id];
    celda.textContent = valor == null ? '—' : Number(valor).toFixed(2);
    fila.appendChild(celda);
  });

  const celdaFinal = document.createElement('td');
  celdaFinal.className = 'nota-final';
  const notaFinal = calcularNotaFinalLapso(alumno, materia);
  celdaFinal.textContent = notaFinal == null ? '—' : notaFinal.toFixed(2);
  fila.appendChild(celdaFinal);

  const celdaAcciones = document.createElement('td');
  const eliminar = document.createElement('button');
  eliminar.type = 'button';
  eliminar.className = 'boton-eliminar';
  eliminar.textContent = 'Eliminar';
  eliminar.addEventListener('click', () => {
    if (confirm(`¿Eliminar a "${alumno.nombre}"?`)) {
      materia.alumnos = materia.alumnos.filter((a) => a.id !== alumno.id);
      guardarDatos(datos);
      renderizar();
    }
  });
  celdaAcciones.appendChild(eliminar);
  fila.appendChild(celdaAcciones);

  return fila;
}

/* ============================================================
 *  Importación de alumnos desde PDF
 * ============================================================ */

function crearBotonImportarPDF(datos, curso, materia) {
  const etiqueta = document.createElement('label');
  etiqueta.className = 'boton-secundario boton-archivo';
  etiqueta.textContent = '📄 Importar alumnos (PDF/TXT/CSV)';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.txt,.csv,application/pdf,text/plain,text/csv';
  input.style.display = 'none';
  input.addEventListener('change', () => {
    const archivo = input.files?.[0];
    if (!archivo) return;
    importarDesdeArchivo(archivo, datos, curso, materia);
    input.value = '';
  });

  etiqueta.appendChild(input);
  return etiqueta;
}

/** Devuelve el contenedor con textarea + botón de pegado. */
function crearSeccionPegarTexto(datos, curso, materia) {
  const contenedor = document.createElement('div');
  contenedor.className = 'importar-texto';

  const textarea = document.createElement('textarea');
  textarea.className = 'importar-textarea';
  textarea.rows = 4;
  textarea.placeholder = 'Pega aquí la lista de alumnos (un nombre por línea)…';
  contenedor.appendChild(textarea);

  const botonPegar = document.createElement('button');
  botonPegar.type = 'button';
  botonPegar.className = 'boton-secundario';
  botonPegar.textContent = 'Añadir desde texto';
  botonPegar.addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto.trim()) {
      alert('El área de texto está vacía.');
      return;
    }
    importarNombres(texto, datos, curso, materia);
    textarea.value = '';
  });
  contenedor.appendChild(botonPegar);

  return contenedor;
}

/** Añade alumnos a la materia a partir de un texto (una línea = un nombre). */
function importarNombres(texto, datos, curso, materia) {
  const nombres = texto
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea !== '');

  if (nombres.length === 0) {
    alert('No se detectaron nombres.');
    return;
  }

  const existentes = new Set((materia.alumnos || []).map((a) => a.nombre.toLowerCase()));
  let agregados = 0;
  nombres.forEach((nombre) => {
    if (existentes.has(nombre.toLowerCase())) return;
    const notas = {};
    LAPSOS.forEach((l) => { notas[l.id] = {}; });
    materia.alumnos.push({ id: generarId(), nombre, notas });
    existentes.add(nombre.toLowerCase());
    agregados++;
  });

  if (agregados === 0) {
    alert('Todos los nombres ya existen en la materia.');
    return;
  }

  guardarDatos(datos);
  renderizar();
  alert(`Importación completada: ${agregados} alumno(s) añadidos.`);
}

/** Descarga una plantilla de ejemplo (.txt) con nombres ficticios. */
function descargarPlantilla() {
  const contenido = 'Ana Pérez González\nLuis Martínez Rojas\nValentina Suárez Díaz\n';
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'plantilla_alumnos.txt';
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function crearBotonPlantilla() {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton-secundario';
  boton.textContent = '📋 Descargar plantilla';
  boton.addEventListener('click', descargarPlantilla);
  return boton;
}

async function importarDesdeArchivo(archivo, datos, curso, materia) {
  try {
    let texto = '';
    const esPDF = archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf');
    if (esPDF) {
      texto = await extraerTextoPDF(archivo);
      const nombres = parsearNombres(texto);
      if (nombres.length === 0) {
        alert('No se detectaron nombres en el archivo.');
        return;
      }
      const existentes = new Set((materia.alumnos || []).map((a) => a.nombre.toLowerCase()));
      let agregados = 0;
      nombres.forEach((nombre) => {
        if (existentes.has(nombre.toLowerCase())) return;
        const notas = {};
        LAPSOS.forEach((l) => { notas[l.id] = {}; });
        materia.alumnos.push({ id: generarId(), nombre, notas });
        existentes.add(nombre.toLowerCase());
        agregados++;
      });

      if (agregados === 0) {
        alert('Todos los nombres ya existen en la materia.');
        return;
      }

      guardarDatos(datos);
      renderizar();
      alert(`Importación completada: ${agregados} alumno(s) añadidos.`);
      return;
    }

    // Archivos de texto plano (TXT/CSV): una línea = un nombre.
    texto = await archivo.text();
    importarNombres(texto, datos, curso, materia);
  } catch (error) {
    console.error(error);
    alert('No se pudo procesar el archivo.');
  }
}

async function extraerTextoPDF(archivo) {
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  if (!pdfjsLib) {
    throw new Error('pdf.js no está disponible');
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const buffer = await archivo.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let textoCompleto = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const pagina = await pdf.getPage(i);
    const contenido = await pagina.getTextContent();
    const lineas = contenido.items.map((item) => item.str);
    textoCompleto += lineas.join(' ') + '\n';
  }
  return textoCompleto;
}

/**
 * Detecta nombres propios (dos o más palabras capitalizadas) línea a línea.
 * Devuelve un array de nombres sin duplicados.
 */
function parsearNombres(texto) {
  const nombres = [];
  const lineas = texto.split(/\r?\n/);

  lineas.forEach((linea) => {
    const limpia = linea.trim();
    if (!limpia) return;

    // Busca grupos de palabras que empiecen por mayúscula (posible nombre/apellido).
    const coincidencias = limpia.match(
      /\b[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+(?:\s+[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+){1,4}\b/g
    );
    if (!coincidencias) return;

    coincidencias.forEach((nombre) => {
      const nombreLimpio = nombre.trim();
      // Filtra líneas que no parecen nombres (números, fechas, etc.)
      if (nombreLimpio.split(/\s+/).length >= 2 && nombreLimpio.length > 3) {
        nombres.push(nombreLimpio);
      }
    });
  });

  return [...new Set(nombres)];
}

/* ============================================================
 *  Exportación de calificaciones a PDF
 * ============================================================ */

function crearBotonExportarPDF(datos, curso, materia) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton-secundario';
  boton.textContent = '📥 Exportar acta (PDF)';
  boton.addEventListener('click', () => exportarActaPDF(datos, curso, materia));
  return boton;
}

function exportarActaPDF(datos, curso, materia) {
  const lapso = obtenerLapso(lapsoActivo);

  if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
    alert('La librería de generación de PDF (jsPDF) no está disponible.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Cabecera
  const fecha = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  doc.setFontSize(16);
  doc.text('Acta de Calificaciones', 14, 20);
  doc.setFontSize(11);
  doc.text(`Curso: ${curso.nombre}`, 14, 30);
  doc.text(`Materia: ${materia.nombre}`, 14, 36);
  doc.text(`Lapso: ${lapso.nombre}`, 14, 42);
  doc.text(`Fecha: ${fecha}`, 14, 48);

  // Cuerpo de la tabla (blindado ante materias sin evaluaciones)
  const evaluaciones = materia.evaluaciones || [];
  const alumnos = materia.alumnos || [];
  const cabeceras = ['Alumno', ...evaluaciones.map((e) => e.nombre), 'Nota final'];
  const filas = alumnos.map((alumno) => {
    const notasLapso = alumno.notas?.[lapsoActivo] ?? {};
    const celdas = evaluaciones.map((e) => {
      const v = notasLapso[e.id];
      return v == null ? '—' : Number(v).toFixed(2);
    });
    const notaFinal = calcularNotaFinalLapso(alumno, materia);
    return [alumno.nombre, ...celdas, notaFinal == null ? '—' : notaFinal.toFixed(2)];
  });

  // Si no hay alumnos, generamos una fila informativa para que autotable no falle.
  const cuerpo = filas.length > 0
    ? filas
    : [['Sin alumnos registrados', ...evaluaciones.map(() => '—'), '—']];

  doc.autoTable({
    head: [cabeceras],
    body: cuerpo,
    startY: 56,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 }
  });

  doc.save(`acta_${curso.nombre}_${materia.nombre}_${lapso.id}.pdf`);
}

/* ============================================================
 *  Helpers de UI reutilizables
 * ============================================================ */

function crearTitulo(titulo, subtitulo) {
  const div = document.createElement('div');
  div.className = 'titulo-pagina';
  const h2 = document.createElement('h2');
  h2.textContent = titulo;
  div.appendChild(h2);
  if (subtitulo) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = subtitulo;
    div.appendChild(p);
  }
  return div;
}

function crearBotonVolver(texto, alClick) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton-volver';
  boton.textContent = `← ${texto}`;
  boton.addEventListener('click', alClick);
  return boton;
}

function crearCampo(nombre, etiqueta, tipo, placeholder, requerido, min, max, step) {
  const campo = document.createElement('div');
  campo.className = 'campo';

  const label = document.createElement('label');
  label.htmlFor = `campo-${nombre}`;
  label.textContent = etiqueta;

  const input = document.createElement('input');
  input.type = tipo;
  input.id = `campo-${nombre}`;
  input.name = nombre;
  input.placeholder = placeholder ?? '';
  if (requerido) input.required = true;
  if (min != null) input.min = min;
  if (max != null) input.max = max;
  if (step != null) input.step = step;

  campo.append(label, input);
  return campo;
}

/* ============================================================
 *  Tema claro / oscuro
 * ============================================================ */

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  const icono = document.getElementById('icono-tema');
  if (icono) icono.textContent = tema === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(CLAVE_TEMA, tema);
}

function iniciarTema() {
  const guardado = localStorage.getItem(CLAVE_TEMA);
  aplicarTema(guardado === 'dark' || guardado === 'light' ? guardado : 'light');

  const botonTema = document.getElementById('boton-tema');
  botonTema.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
  });
}

/* ============================================================
 *  Sidebar colapsable
 * ============================================================ */

function iniciarSidebar() {
  const boton = document.getElementById('boton-colapsar');
  const sidebar = document.getElementById('sidebar');

  const aplicar = (colapsada) => {
    document.body.classList.toggle('sidebar-colapsada', colapsada);
    const flecha = boton.querySelector('span');
    if (flecha) flecha.textContent = colapsada ? '»' : '«';
    localStorage.setItem(CLAVE_SIDEBAR, colapsada ? '1' : '0');
  };

  const guardado = localStorage.getItem(CLAVE_SIDEBAR);
  aplicar(guardado === '1');

  boton.addEventListener('click', () => {
    const colapsada = document.body.classList.contains('sidebar-colapsada');
    aplicar(!colapsada);
  });
}

/* ============================================================
 *  Copia de seguridad (exportar / importar)
 * ============================================================ */

/**
 * Descarga todo el estado actual como un archivo JSON legible.
 */
function exportarDatos() {
  const datos = leerDatos();
  const json = JSON.stringify(datos, null, 2);

  const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const nombre = `copia_gestor_academico_${hoy}.json`;

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  marcarRespaldoCompleto();
}

/**
 * Valida que el objeto tenga la estructura esperada por la aplicación.
 * @param {*} datos
 * @returns {boolean}
 */
function validarEstructuraDatos(datos) {
  return (
    datos &&
    typeof datos === 'object' &&
    !Array.isArray(datos) &&
    Array.isArray(datos.cursos)
  );
}

/**
 * Lee un archivo .json y sobreescribe el estado de localStorage.
 * @param {File} archivo
 */
function importarDatos(archivo) {
  const lector = new FileReader();

  lector.onload = () => {
    let datos;
    try {
      datos = JSON.parse(lector.result);
    } catch {
      alert('No se pudo leer el archivo: JSON inválido.');
      return;
    }

    if (!validarEstructuraDatos(datos)) {
      alert('El archivo no tiene la estructura esperada (falta el array "cursos").');
      return;
    }

    const continuar = confirm(
      '⚠️ Atención: Cargar esta copia de seguridad reemplazará todos los cursos, materias y notas actuales. ¿Deseas continuar?'
    );
    if (!continuar) {
      const input = document.getElementById('input-importar');
      if (input) input.value = '';
      return;
    }

    guardarDatos(normalizarDatos(datos));
    marcarRespaldoCompleto();
    renderizar();
    alert('Copia restaurada correctamente.');
  };

  lector.onerror = () => {
    alert('Error al leer el archivo seleccionado.');
  };

  lector.readAsText(archivo);
}

function iniciarCopiaSeguridad() {
  const botonExportar = document.getElementById('boton-exportar');
  botonExportar.addEventListener('click', exportarDatos);

  const inputImportar = document.getElementById('input-importar');
  inputImportar.addEventListener('change', () => {
    const archivo = inputImportar.files?.[0];
    if (!archivo) return;
    importarDatos(archivo);
    inputImportar.value = '';
  });
}

/* ============================================================
 *  Arranque
 * ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  iniciarTema();
  iniciarSidebar();
  iniciarCopiaSeguridad();
  actualizarIndicadorRespaldo();
  renderizar();
});
