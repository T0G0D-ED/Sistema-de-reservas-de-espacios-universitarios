import axios from 'axios';

// URL base de la API publica del Gobierno Digital de Chile
const API_FERIADOS_URL = 'https://apis.digital.gob.cl/fl/feriados';

// Caché en memoria: { 2026: { feriados: [...], fuente: 'api' }, ... }
// Evita hacer una llamada a la API por cada reserva
const cacheFeriados = {};

// Respaldo de feriados nacionales irrenunciables y fijos (MM-DD)
// Garantiza que el sistema bloquee feriados incluso si la API externa esta caida
const FERIADOS_FIJOS_RESPALDO = [
  { mesDia: '01-01', nombre: 'Año Nuevo' },
  { mesDia: '05-01', nombre: 'Día Nacional del Trabajo' },
  { mesDia: '05-21', nombre: 'Día de las Glorias Navales' },
  { mesDia: '06-20', nombre: 'Día Nacional de los Pueblos Indígenas' },
  { mesDia: '06-29', nombre: 'San Pedro y San Pablo' },
  { mesDia: '07-16', nombre: 'Día de la Virgen del Carmen' },
  { mesDia: '08-15', nombre: 'Asunción de la Virgen' },
  { mesDia: '09-18', nombre: 'Independencia Nacional' },
  { mesDia: '09-19', nombre: 'Día de las Glorias del Ejército' },
  { mesDia: '10-12', nombre: 'Encuentro de Dos Mundos' },
  { mesDia: '10-31', nombre: 'Día de las Iglesias Evangélicas y Protestantes' },
  { mesDia: '11-01', nombre: 'Día de Todos los Santos' },
  { mesDia: '12-08', nombre: 'Inmaculada Concepción' },
  { mesDia: '12-25', nombre: 'Navidad' },
];

/**
 * Obtiene los feriados de un año desde la API publica.
 * Usa caché en memoria para no saturar la API.
 * @param {number} year - Año a consultar (ej: 2026)
 * @returns {Promise<{anio: number, feriados: Array, fuente: 'api'|'respaldo}>}
 */
export async function obtenerFeriadosDelAno(year) {
  // Si ya se tienen los feriados de ese año en caché, los retornamos
  if (cacheFeriados[year]) {
    return { anio: year, ...cacheFeriados[year] };
  }

  try {
    const response = await axios.get(`${API_FERIADOS_URL}/${year}`, {
      timeout: 5000, // 5 segundos maximo para no bloquear el servidor
    });
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      cacheFeriados[year] = { feriados: response.data, fuente: 'api' };
      return { anio: year, ...cacheFeriados[year] };
    }
   } catch (error) {
    console.warn(`API externa de feriados caída (${error.message}). Usando respaldo local de feriados.`);
    // Construye los feriados del año usando el arreglo FERIADOS_FIJOS_RESPALDO de arriba
    const respaldo = FERIADOS_FIJOS_RESPALDO.map((f) => ({
      fecha: `${year}-${f.mesDia}`,
      nombre: f.nombre,
    }));
    cacheFeriados[year] = { feriados: respaldo, fuente: 'respaldo' };
    return { anio: year, ...cacheFeriados[year] };
  }

  // Si falla la API o responde vacio, usamos el respaldo local de feriados fijos de Chile
  const respaldo = FERIADOS_FIJOS_RESPALDO.map((f) => ({
    fecha: `${year}-${f.mesDia}`,
    nombre: f.nombre,
  }));

  cacheFeriados[year] = { feriados: respaldo, fuente: 'respaldo' };
  return { anio: year, ...cacheFeriados[year] };
}

/**
 * Valida si una fecha es dia habil (no fin de semana ni feriado nacional).
 * @param {string|Date} fecha - Fecha a validar (ISO string o Date)
 * @returns {Promise<{ esHabil: boolean, motivo: string }>}
 */
export async function validarDiaHabil(fecha) {
  const date = new Date(fecha);
  
  // Validar que la fecha sea valida
  if (isNaN(date.getTime())) {
    return { esHabil: false, motivo: 'La fecha ingresada no es válida' };
  }

  const diaSemana = date.getUTCDay(); // 0 = domingo, 6 = sábado

  // 1. Validar fin de semana
  if (diaSemana === 0) {
    return { esHabil: false, motivo: 'La fecha corresponde a un domingo' };
  }
  if (diaSemana === 6) {
    return { esHabil: false, motivo: 'La fecha corresponde a un sábado' };
  }

  // 2. Validar feriado nacional
  const year = date.getUTCFullYear();
  const { feriados } = await obtenerFeriadosDelAno(year);

  // La API retorna fechas en formato "YYYY-MM-DD"
  const fechaStr = date.toISOString().split('T')[0];
  const feriadoEncontrado = feriados.find((f) => f.fecha === fechaStr);

  if (feriadoEncontrado) {
    return {
      esHabil: false,
      motivo: `La fecha corresponde a feriado nacional: ${feriadoEncontrado.nombre}`,
    };
  }

  // 3. Si paso todas las validaciones, es dia habil
  return { esHabil: true, motivo: 'Día hábil' };
}
