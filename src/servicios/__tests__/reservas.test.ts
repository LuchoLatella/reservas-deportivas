
import {
  cancelarReserva,
  confirmarCancelacionTardia,
  crearReserva,
} from '../reservas';

import { espaciosMock } from '../../mocks/espacios';
import { reservasMock } from '../../mocks/reservas';
import { turnosMock } from '../../mocks/turnos';
import { usuariosMock } from '../../mocks/usuarios';
import { obtenerFechaRelativa } from '../../utils/fechas';

const reservasIniciales = reservasMock.map((reserva) => ({
  ...reserva,
}));

const turnosIniciales = turnosMock.map((turno) => ({
  ...turno,
}));

const usuariosIniciales = usuariosMock.map((usuario) => ({
  ...usuario,
  espaciosFavoritos: [...usuario.espaciosFavoritos],
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

  usuariosMock.splice(
    0,
    usuariosMock.length,
    ...usuariosIniciales.map((usuario) => ({
      ...usuario,
      espaciosFavoritos: [...usuario.espaciosFavoritos],
    })),
  );
});

function obtenerTurnoDePrueba(dias: number, hora = '10') {
  const turnoId =
    `turno-esp-02-${obtenerFechaRelativa(dias)}-${hora}`;

  const turno = turnosMock.find((item) => item.id === turnoId);

  if (!turno) {
    throw new Error(`No se encontró el turno de prueba: ${turnoId}`);
  }

  return turno;
}

describe('Servicio de reservas', () => {
  it('crea una reserva y ocupa el turno', async () => {
    const turno = obtenerTurnoDePrueba(2);

    const reserva = await crearReserva(turno.id, 'usr-01', 4);

    expect(reserva.estado).toBe('confirmada');
    expect(reserva.turnoId).toBe(turno.id);
    expect(reserva.usuarioId).toBe('usr-01');
    expect(turno.estado).toBe('reservado');
    expect(turno.reservaId).toBe(reserva.id);
  });

  it('rechaza un usuario inexistente sin ocupar el turno', async () => {
    const turno = obtenerTurnoDePrueba(2);

    await expect(
      crearReserva(turno.id, 'usuario-inexistente', 4),
    ).rejects.toThrow('El usuario no existe.');

    expect(turno.estado).toBe('libre');
    expect(turno.reservaId).toBeNull();
  });

  it('rechaza un turno que ya está ocupado', async () => {
    const turno = obtenerTurnoDePrueba(2);

    await crearReserva(turno.id, 'usr-01', 4);

    await expect(
      crearReserva(turno.id, 'usr-01', 4),
    ).rejects.toThrow('El turno no está disponible.');
  });

  it('rechaza una reserva para un turno pasado', async () => {
    const turno = obtenerTurnoDePrueba(2);
    turno.fecha = obtenerFechaRelativa(-1);

    await expect(
      crearReserva(turno.id, 'usr-01', 4),
    ).rejects.toThrow('No se pueden reservar turnos pasados.');

    expect(turno.estado).toBe('libre');
    expect(turno.reservaId).toBeNull();
  });

  it.each([0, -1, 1.5, Number.NaN])(
    'rechaza una cantidad de personas inválida: %s',
    async (cantidad) => {
      const turno = obtenerTurnoDePrueba(2);

      await expect(
        crearReserva(turno.id, 'usr-01', cantidad),
      ).rejects.toThrow(
        'La cantidad de personas debe ser un número entero positivo.',
      );

      expect(turno.estado).toBe('libre');
      expect(turno.reservaId).toBeNull();
    },
  );

  it('rechaza una cantidad superior a la capacidad del espacio', async () => {
    const turno = obtenerTurnoDePrueba(2);
    const espacio = espaciosMock.find(
      (item) => item.id === turno.espacioId,
    );

    if (!espacio) {
      throw new Error('No se encontró el espacio de prueba.');
    }

    await expect(
      crearReserva(turno.id, 'usr-01', espacio.capacidad + 1),
    ).rejects.toThrow(
      `La capacidad máxima de este espacio es de ${espacio.capacidad} personas.`,
    );

    expect(turno.estado).toBe('libre');
    expect(turno.reservaId).toBeNull();
  });

  it('rechaza un turno libre que conserva un ID de reserva', async () => {
    const turno = obtenerTurnoDePrueba(2);
    turno.reservaId = 'res-inexistente';

    await expect(
      crearReserva(turno.id, 'usr-01', 4),
    ).rejects.toThrow('datos inconsistentes');

    expect(turno.estado).toBe('libre');
    expect(turno.reservaId).toBe('res-inexistente');
  });

  it('cancela dentro del plazo y libera el turno correcto', async () => {
    const turno = obtenerTurnoDePrueba(5);
    const reserva = await crearReserva(turno.id, 'usr-01', 4);

    const resultado = await cancelarReserva(reserva.id, 'usr-01');

    expect(resultado.cancelada).toBe(true);
    expect(resultado.requiereEncargado).toBe(false);
    expect(resultado.reserva.estado).toBe('cancelada');
    expect(turno.estado).toBe('libre');
    expect(turno.reservaId).toBeNull();
  });

  it('rechaza cancelar una reserva de otro usuario', async () => {
    const turno = obtenerTurnoDePrueba(5);
    const reserva = await crearReserva(turno.id, 'usr-01', 4);

    await expect(
      cancelarReserva(reserva.id, 'usr-02'),
    ).rejects.toThrow(
      'No podés cancelar una reserva de otro usuario.',
    );

    expect(reserva.estado).toBe('confirmada');
    expect(turno.estado).toBe('reservado');
    expect(turno.reservaId).toBe(reserva.id);
  });

  it('requiere un encargado si venció el plazo automático', async () => {
    const turno = obtenerTurnoDePrueba(5);
    const reserva = await crearReserva(turno.id, 'usr-01', 4);

    reserva.cancelableHasta = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const resultado = await cancelarReserva(reserva.id, 'usr-01');

    expect(resultado.cancelada).toBe(false);
    expect(resultado.requiereEncargado).toBe(true);
    expect(reserva.estado).toBe('confirmada');
    expect(turno.estado).toBe('reservado');
    expect(turno.reservaId).toBe(reserva.id);
  });

  it('no incrementa el contador al solicitar una cancelación tardía', async () => {
    const turno = obtenerTurnoDePrueba(5);
    const reserva = await crearReserva(turno.id, 'usr-01', 4);
    const usuario = usuariosMock.find((item) => item.id === 'usr-01');

    if (!usuario) {
      throw new Error('No se encontró el usuario de prueba.');
    }

    reserva.cancelableHasta = new Date(
      Date.now() - 60 * 60 * 1000,
    ).toISOString();

    const contadorInicial = usuario.cancelacionesTardias;

    await cancelarReserva(reserva.id, 'usr-01');

    expect(usuario.cancelacionesTardias).toBe(contadorInicial);
    expect(reserva.estado).toBe('confirmada');
    expect(turno.estado).toBe('reservado');
  });

  it('permite al encargado confirmar una cancelación tardía', async () => {
    const turno = obtenerTurnoDePrueba(5);
    const reserva = await crearReserva(turno.id, 'usr-01', 4);
    const usuario = usuariosMock.find((item) => item.id === 'usr-01');
    const encargado = usuariosMock.find(
      (item) => item.rol === 'encargado',
    );

    if (!usuario || !encargado) {
      throw new Error('Falta el usuario o el encargado de prueba.');
    }

    reserva.cancelableHasta = new Date(
      Date.now() - 60 * 60 * 1000,
    ).toISOString();

    const contadorInicial = usuario.cancelacionesTardias;

    const resultado = await confirmarCancelacionTardia(
      reserva.id,
      encargado.id,
    );

    expect(resultado.estado).toBe('cancelada');
    expect(usuario.cancelacionesTardias).toBe(contadorInicial + 1);
    expect(turno.estado).toBe('libre');
    expect(turno.reservaId).toBeNull();
  });

  it('no permite confirmar una cancelación tardía como jugador', async () => {
    const turno = obtenerTurnoDePrueba(5);
    const reserva = await crearReserva(turno.id, 'usr-01', 4);

    reserva.cancelableHasta = new Date(
      Date.now() - 60 * 60 * 1000,
    ).toISOString();

    await expect(
      confirmarCancelacionTardia(reserva.id, 'usr-01'),
    ).rejects.toThrow('Solo un encargado o administrador');

    expect(reserva.estado).toBe('confirmada');
    expect(turno.estado).toBe('reservado');
    expect(turno.reservaId).toBe(reserva.id);
  });

  it('rechaza cancelar una reserva que ya fue cancelada', async () => {
    const turno = obtenerTurnoDePrueba(5);
    const reserva = await crearReserva(turno.id, 'usr-01', 4);

    await cancelarReserva(reserva.id, 'usr-01');

    await expect(
      cancelarReserva(reserva.id, 'usr-01'),
    ).rejects.toThrow('ya no está confirmada');

    expect(turno.estado).toBe('libre');
    expect(turno.reservaId).toBeNull();
  });

  it('rechaza cancelar si el turno ya no está vinculado a la reserva', async () => {
    const turno = obtenerTurnoDePrueba(5);
    const reserva = await crearReserva(turno.id, 'usr-01', 4);

    turno.reservaId = 'res-otra';

    await expect(
      cancelarReserva(reserva.id, 'usr-01'),
    ).rejects.toThrow('vinculación válida');

    expect(reserva.estado).toBe('confirmada');
    expect(turno.estado).toBe('reservado');
    expect(turno.reservaId).toBe('res-otra');
  });

  it('no permite superar tres reservas activas', async () => {
    const turnoUno = obtenerTurnoDePrueba(2);
    const turnoDos = obtenerTurnoDePrueba(3);
    const turnoTres = obtenerTurnoDePrueba(4);

    // En los mocks, usr-01 ya tiene una reserva activa.
    await crearReserva(turnoUno.id, 'usr-01', 4);
    await crearReserva(turnoDos.id, 'usr-01', 4);

    await expect(
      crearReserva(turnoTres.id, 'usr-01', 4),
    ).rejects.toThrow('Ya tenés 3 reservas activas.');

    expect(turnoTres.estado).toBe('libre');
    expect(turnoTres.reservaId).toBeNull();
  });
});
