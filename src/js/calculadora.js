
/**
 * Valida que los pesos porcentuales sumen exactamente 100%.
 * @param {Array<{weight: number}>} items
 * @returns {boolean}
 */
export function validateWeights(items) {
  if (!Array.isArray(items) || items.length === 0) return false;
  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
  return Math.abs(totalWeight - 100) < 0.001;
}

/**
 * Calcula la nota final ponderada de un alumno.
 * Invariante: La suma de pesos debe ser 100 y cada nota estar en [0.00, 10.00].
 * @param {Array<{score: number, weight: number}>} gradeEntries
 * @returns {number} Nota final redondeada a 2 decimales.
 */
export function calculateWeightedFinalGrade(gradeEntries) {
  if (!validateWeights(gradeEntries)) {
    throw new Error('Invariante violada: La suma de los pesos de evaluación debe ser exactamente 100%.');
  }

  const finalScore = gradeEntries.reduce((acc, entry) => {
    const score = Number(entry.score);
    if (isNaN(score) || score < 0 || score > 10) {
      throw new Error(`Invariante violada: Calificación fuera de rango [0.00, 10.00]: ${entry.score}`);
    }
    return acc + (score * (entry.weight / 100));
  }, 0);

  return Math.round(finalScore * 100) / 100;
}

/**
 * Calcula la nota final ponderada con configuración variable.
 * Invariante: la suma de pesos debe ser exactamente 100% y cada nota
 * debe estar dentro del rango [minNota, maxNota].
 * @param {Array<number>} notas Notas de cada evaluación (mismo orden que pesos).
 * @param {Array<number>} pesos Pesos porcentuales de cada evaluación.
 * @param {number} [minNota=0] Límite inferior del rango válido de notas.
 * @param {number} [maxNota=10] Límite superior del rango válido de notas.
 * @returns {number} Nota final redondeada a 2 decimales.
 */
export function calcularNotaFinal(notas, pesos, minNota = 0, maxNota = 10) {
  if (!Array.isArray(notas) || !Array.isArray(pesos)) {
    throw new Error('Invariante violada: "notas" y "pesos" deben ser arrays.');
  }
  if (notas.length === 0 || notas.length !== pesos.length) {
    throw new Error('Invariante violada: "notas" y "pesos" deben tener la misma longitud no vacía.');
  }

  const entries = notas.map((score, i) => ({ score, weight: pesos[i] }));

  if (!validateWeights(entries)) {
    throw new Error('Invariante violada: La suma de los pesos de evaluación debe ser exactamente 100%.');
  }

  const finalScore = entries.reduce((acc, entry) => {
    const score = Number(entry.score);
    if (isNaN(score) || score < minNota || score > maxNota) {
      throw new Error(`Invariante violada: Calificación fuera de rango [${minNota}, ${maxNota}]: ${entry.score}`);
    }
    return acc + (score * (entry.weight / 100));
  }, 0);

  return Math.round(finalScore * 100) / 100;
}

/**
 * Calcula los porcentajes de asistencia de un alumno.
 * @param {Array<{status: 'P' | 'AJ' | 'AI' | 'R'}>} attendanceRecords
 * @returns {{presenceRate: number, absenceRate: number, totalSessions: number}}
 */
export function calculateAttendanceStats(attendanceRecords) {
  if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    return { presenceRate: 0, absenceRate: 0, totalSessions: 0 };
  }

  const total = attendanceRecords.length;
  const presents = attendanceRecords.filter(r => r.status === 'P' || r.status === 'R').length;
  const absences = attendanceRecords.filter(r => r.status === 'AI' || r.status === 'AJ').length;

  return {
    presenceRate: Math.round((presents / total) * 10000) / 100,
    absenceRate: Math.round((absences / total) * 10000) / 100,
    totalSessions: total
  };
}