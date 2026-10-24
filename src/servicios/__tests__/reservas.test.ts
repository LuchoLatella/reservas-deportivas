
import {
  cancelarReserva,
  crearReserva,
} from '../reservas';

import { reservasMock } from '../../mocks/reservas';
import { turnosMock } from '../../mocks/turnos';
import { obtenerFechaRelativa } from '../../utils/fechas';

// Guardamos el estado inicial para que cada prueba
// comience con los mismos datos.
const reservasIniciales = reservasMock.map((reserva) => ({
  ...reserva,
}));

const turnosIniciales = turnosMock.map((turno) => ({
  ...turno,
}));

beforeEach(() => {
  reservasMock.splice(
    0,
    reservasMock.length,
    ...reservasIniciales.map((reserva) => ({ ...reserva })),
  );

  turnosMock.splice(
    0,
    turnosMock.length,
    ...turnosIniciales.map((turno) => ({ ...turno })),
  );
});

describe('Servicio de reservas', () => {
  it('crea una reserva y ocupa el turno', async () => {
    const turnoId =
      `turno-esp-02-${obtenerFechaRelativa(2)}-10`;

    const reserva = await crearReserva(
      turnoId,
      'usr-01',
      4,
    );

    const turno = turnosMock.find(
      (item) => item.id === turnoId,
    );

    expect(reserva.estado).toBe('confirmada');
    expect(reserva.turnoId).toBe(turnoId);
    expect(reserva.usuarioId).toBe('usr-01');
    expect(turno?.estado).toBe('reservado');
    expect(turno?.reservaId).toBe(reserva.id);
  });

  it('rechaza un turno que ya está ocupado', async () => {
    const turnoId =
      `turno-esp-02-${obtenerFechaRelativa(2)}-10`;

    await crearReserva(turnoId, 'usr-01', 4);

    await expect(
      crearReserva(turnoId, 'usr-01', 4),
    ).rejects.toThrow('El turno no está disponible.');
  });

  it('rechaza una reserva para un turno pasado', async () => {
    const turnoId =
      `turno-esp-02-${obtenerFechaRelativa(2)}-10`;

    const turno = turnosMock.find(
      (item) => item.id === turnoId,
    );

    if (!turno) {
      throw new Error('No se encontró el turno de prueba.');
    }

    turno.fecha = obtenerFechaRelativa(-1);

    await expect(
      crearReserva(turnoId, 'usr-01', 4),
    ).rejects.toThrow(
      'No se pueden reservar turnos pasados.',
    );
  });

  it('cancela una reserva dentro del plazo permitido', async () => {
    const turnoId =
      `turno-esp-02-${obtenerFechaRelativa(5)}-10`;

    const reserva = await crearReserva(
      turnoId,
      'usr-01',
      4,
    );

    const resultado = await cancelarReserva(
      reserva.id,
      'usr-01',
    );

    const turno = turnosMock.find(
      (item) => item.id === turnoId,
    );

    expect(resultado.cancelada).toBe(true);
    expect(resultado.requiereEncargado).toBe(false);
    expect(resultado.reserva.estado).toBe('cancelada');
    expect(turno?.estado).toBe('libre');
    expect(turno?.reservaId).toBeNull();
  });

  it('requiere un encargado si venció el plazo de cancelación', async () => {
    const turnoId =
      `turno-esp-02-${obtenerFechaRelativa(5)}-10`;

    const reserva = await crearReserva(
      turnoId,
      'usr-01',
      4,
    );

    reserva.cancelableHasta = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const resultado = await cancelarReserva(
      reserva.id,
      'usr-01',
    );

    const turno = turnosMock.find(
      (item) => item.id === turnoId,
    );

    expect(resultado.cancelada).toBe(false);
    expect(resultado.requiereEncargado).toBe(true);
    expect(resultado.reserva.estado).toBe('confirmada');
    expect(turno?.estado).toBe('reservado');
  });

  it('no permite superar tres reservas activas', async () => {
    const turnoUno =
      `turno-esp-02-${obtenerFechaRelativa(2)}-10`;

    const turnoDos =
      `turno-esp-02-${obtenerFechaRelativa(3)}-10`;

    const turnoTres =
      `turno-esp-02-${obtenerFechaRelativa(4)}-10`;

    // El usuario ya tiene una reserva activa en los mocks.
    await crearReserva(turnoUno, 'usr-01', 4);
    await crearReserva(turnoDos, 'usr-01', 4);

    await expect(
      crearReserva(turnoTres, 'usr-01', 4),
    ).rejects.toThrow(
      'Ya tenés 3 reservas activas.',
    );
  });
});
