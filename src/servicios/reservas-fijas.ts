import { reservasFijasMock } from '../mocks/reservas-fijas';
import { ReservaFija } from '../tipos/reserva-fija';

export async function obtenerReservasFijas(): Promise<
  ReservaFija[]
> {
  return reservasFijasMock;
}

export async function obtenerReservasFijasPorEspacio(
  espacioId: string,
): Promise<ReservaFija[]> {
  return reservasFijasMock.filter(
    (reserva) =>
      reserva.espacioId === espacioId &&
      reserva.activa,
  );
}

export async function tieneReservaFija(
  espacioId: string,
  fecha: string,
  horaInicio: string,
  horaFin: string,
): Promise<boolean> {
  const [year, month, day] = fecha.split('-').map(Number);
  const diaSemana = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  const reservasFijas = await obtenerReservasFijasPorEspacio(espacioId);

  return reservasFijas.some((rf) => {
    if (rf.dia !== diaSemana) {
      return false;
    }

    if (fecha < rf.desde) {
      return false;
    }

    if (rf.hasta && fecha > rf.hasta) {
      return false;
    }

    return horaInicio < rf.fin && horaFin > rf.inicio;
  });
}