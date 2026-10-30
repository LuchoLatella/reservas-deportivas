import { Espacio } from '../tipos/espacio';
import { Reserva } from '../tipos/reserva';
import { Turno } from '../tipos/turno';
import { obtenerEspacioPorId } from './espacios';
import { obtenerReservaPorId } from './reservas';
import { obtenerTurnoPorId } from './turnos';

export interface DetalleReservaCompleto {
  reserva: Reserva;
  espacio: Espacio | null;
  turno: Turno | null;
}

export async function obtenerDetalleReservaCompleto(
  reservaId: string,
): Promise<DetalleReservaCompleto | null> {
  const reserva = await obtenerReservaPorId(reservaId);
  if (!reserva) return null;

  const [espacio, turnos] = await Promise.all([
    obtenerEspacioPorId(reserva.espacioId),
    obtenerTurnoPorId ? obtenerTurnoPorId(reserva.turnoId) : Promise.resolve(null),
  ]);

  return {
    reserva,
    espacio,
    turno: turnos,
  };
}