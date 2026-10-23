import { reservasMock } from '../mocks/reservas';
import { Reserva } from '../tipos/reserva';

export async function obtenerReservas(): Promise<Reserva[]> {
  return reservasMock;
}

export async function obtenerReservasPorUsuario(
  usuarioId: string,
): Promise<Reserva[]> {
  return reservasMock.filter(
    (reserva) => reserva.usuarioId === usuarioId,
  );
}

export async function obtenerReservaPorId(
  id: string,
): Promise<Reserva | null> {
  return (
    reservasMock.find(
      (reserva) => reserva.id === id,
    ) ?? null
  );
}