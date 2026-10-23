import { turnosMock } from '../mocks/turnos';
import { Turno } from '../tipos/turno';

/**
 * Crealiza consulta todos los turnos de un espacio para una fecha.
 */
export async function obtenerTurnosPorEspacioYFecha(
  espacioId: string,
  fecha: string,
): Promise<Turno[]> {
  return turnosMock.filter(
    (turno) =>
      turno.espacioId === espacioId &&
      turno.fecha === fecha,
  );
}

/**
 * determina si el horario de inicio todavía está en el futuro.
 */
function esTurnoFuturo(turno: Turno): boolean {
  const fechaHoraInicio = new Date(
    `${turno.fecha}T${turno.inicio}:00`,
  );

  return fechaHoraInicio.getTime() > Date.now();
}

/**
 * devuelve únicamente los turnos libres cuyo inicio
 * todavía no ha pasado.
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
      esTurnoFuturo(turno),
  );
}