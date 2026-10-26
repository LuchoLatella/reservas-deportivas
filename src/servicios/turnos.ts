
import { turnosMock } from '../mocks/turnos';
import { Turno } from '../tipos/turno';
import { obtenerFechaRelativa } from '../utils/fechas';
import { obtenerEspacioPorId } from './espacios';

/**
 * Comprueba que la fecha tenga el formato AAAA-MM-DD
 * y que exista en el calendario.
 */
function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const fechaParseada = new Date(`${fecha}T00:00:00Z`);

  return (
    !Number.isNaN(fechaParseada.getTime()) &&
    fechaParseada.toISOString().slice(0, 10) === fecha
  );
}

/**
 * La aplicación permite consultar hoy y los seis días siguientes.
 */
function estaDentroDeLaVentana(fecha: string): boolean {
  if (!esFechaValida(fecha)) {
    return false;
  }

  const hoy = obtenerFechaRelativa(0);
  const ultimoDia = obtenerFechaRelativa(6);

  return fecha >= hoy && fecha <= ultimoDia;
}

/**
 * Convierte una hora HH:mm en minutos desde las 00:00.
 * Acepta 24:00 como fin de jornada.
 */
function horaAMinutos(hora: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(hora)) {
    return null;
  }

  const [horas, minutos] = hora.split(':').map(Number);

  if (minutos < 0 || minutos > 59) {
    return null;
  }

  if (horas === 24 && minutos === 0) {
    return 24 * 60;
  }

  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    return null;
  }

  return horas * 60 + minutos;
}

/**
 * Verifica que el turno sea un bloque de una hora entre
 * las 08:00 y las 24:00.
 */
function tieneHorarioValido(turno: Turno): boolean {
  const inicio = horaAMinutos(turno.inicio);
  const fin = horaAMinutos(turno.fin);

  if (inicio === null || fin === null) {
    return false;
  }

  const inicioMinimo = 8 * 60;
  const finMaximo = 24 * 60;

  return (
    inicio >= inicioMinimo &&
    inicio < finMaximo &&
    fin <= finMaximo &&
    fin - inicio === 60
  );
}

/**
 * Determina si el turno todavía no comenzó.
 */
function esTurnoFuturo(turno: Turno): boolean {
  if (
    !esFechaValida(turno.fecha) ||
    horaAMinutos(turno.inicio) === null
  ) {
    return false;
  }

  const fechaHoraInicio = new Date(
    `${turno.fecha}T${turno.inicio}:00`,
  );

  return (
    !Number.isNaN(fechaHoraInicio.getTime()) &&
    fechaHoraInicio.getTime() > Date.now()
  );
}

/**
 * Consulta todos los turnos de un espacio para una fecha permitida.
 * Incluye turnos libres, reservados, fijos y bloqueados.
 */
export async function obtenerTurnosPorEspacioYFecha(
  espacioId: string,
  fecha: string,
): Promise<Turno[]> {
  if (!espacioId || !estaDentroDeLaVentana(fecha)) {
    return [];
  }

  const espacio = await obtenerEspacioPorId(espacioId);

  if (!espacio || !espacio.activo) {
    return [];
  }

  return turnosMock.filter(
    (turno) =>
      turno.espacioId === espacioId &&
      turno.fecha === fecha,
  );
}

/**
 * Devuelve únicamente los turnos libres, futuros y con
 * horario válido que todavía pueden reservarse.
 */
export async function obtenerTurnosDisponibles(
  espacioId: string,
  fecha: string,
): Promise<Turno[]> {
  const turnos = await obtenerTurnosPorEspacioYFecha(
    espacioId,
    fecha,
  );

  return turnos.filter(
    (turno) =>
      turno.estado === 'libre' &&
      tieneHorarioValido(turno) &&
      esTurnoFuturo(turno) &&
      turno.reservaId === null,
  );
}
