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