import { turnosMock } from '../mocks/turnos';
import { Turno } from '../tipos/turno';

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

export async function obtenerTurnosDisponibles(
  espacioId: string,
  fecha: string,
): Promise<Turno[]> {
  const turnos = await obtenerTurnosPorEspacioYFecha(
    espacioId,
    fecha,
  );

  return turnos.filter(
    (turno) => turno.estado === 'libre',
  );
}