
import {
  obtenerTurnosDisponibles,
  obtenerTurnosPorEspacioYFecha,
} from '../turnos';

import { espaciosMock } from '../../mocks/espacios';
import { turnosMock } from '../../mocks/turnos';
import { obtenerFechaRelativa } from '../../utils/fechas';

const turnosIniciales = turnosMock.map((turno) => ({ ...turno }));

const espaciosIniciales = espaciosMock.map((espacio) => ({
  ...espacio,
  coordenadas: { ...espacio.coordenadas },
  imagenes: [...espacio.imagenes],
}));

beforeEach(() => {
  turnosMock.splice(
    0,
    turnosMock.length,
    ...turnosIniciales.map((turno) => ({ ...turno })),
  );

  espaciosMock.splice(
    0,
    espaciosMock.length,
    ...espaciosIniciales.map((espacio) => ({
      ...espacio,
      coordenadas: { ...espacio.coordenadas },
      imagenes: [...espacio.imagenes],
    })),
  );
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Servicio de turnos', () => {
  it('devuelve los turnos del espacio y fecha solicitados', async () => {
    const fecha = obtenerFechaRelativa(2);

    const turnos = await obtenerTurnosPorEspacioYFecha(
      'esp-02',
      fecha,
    );

    expect(turnos.length).toBeGreaterThan(0);
    expect(
      turnos.every(
        (turno) =>
          turno.espacioId === 'esp-02' &&
          turno.fecha === fecha,
      ),
    ).toBe(true);
  });

  it('devuelve una lista vacía para un espacio inexistente', async () => {
    const turnos = await obtenerTurnosPorEspacioYFecha(
      'esp-inexistente',
      obtenerFechaRelativa(2),
    );

    expect(turnos).toEqual([]);
  });

  it('devuelve una lista vacía para un espacio inactivo', async () => {
    const espacio = espaciosMock.find(
      (item) => item.id === 'esp-02',
    );

    if (!espacio) {
      throw new Error('No se encontró el espacio de prueba.');
    }

    espacio.activo = false;

    const turnos = await obtenerTurnosPorEspacioYFecha(
      espacio.id,
      obtenerFechaRelativa(2),
    );

    expect(turnos).toEqual([]);
  });

  it.each([
    obtenerFechaRelativa(-1),
    obtenerFechaRelativa(7),
    'fecha-invalida',
    '2026-02-30',
  ])('rechaza una fecha fuera de la ventana o inválida: %s', async (fecha) => {
    const turnos = await obtenerTurnosPorEspacioYFecha(
      'esp-02',
      fecha,
    );

    expect(turnos).toEqual([]);
  });

  it('devuelve solo turnos libres y futuros como disponibles', async () => {
    const fecha = obtenerFechaRelativa(2);
    const turnoBase = turnosMock.find(
      (turno) =>
        turno.espacioId === 'esp-02' &&
        turno.fecha === fecha &&
        turno.inicio === '10:00',
    );

    if (!turnoBase) {
      throw new Error('No se encontró el turno base de prueba.');
    }

    turnoBase.estado = 'libre';
    turnoBase.reservaId = null;

    const turnoReservado = {
      ...turnoBase,
      id: `${turnoBase.id}-reservado`,
      inicio: '11:00',
      fin: '12:00',
      estado: 'reservado' as const,
      reservaId: 'res-prueba',
    };

    const turnoFijo = {
      ...turnoBase,
      id: `${turnoBase.id}-fijo`,
      inicio: '12:00',
      fin: '13:00',
      estado: 'fijo' as const,
      reservaId: null,
    };

    const turnoMantenimiento = {
      ...turnoBase,
      id: `${turnoBase.id}-mantenimiento`,
      inicio: '13:00',
      fin: '14:00',
      estado: 'mantenimiento' as const,
      reservaId: null,
    };

    turnosMock.push(
      turnoReservado,
      turnoFijo,
      turnoMantenimiento,
    );

    const disponibles = await obtenerTurnosDisponibles(
      'esp-02',
      fecha,
    );

    expect(disponibles.some((turno) => turno.id === turnoBase.id))
      .toBe(true);

    expect(disponibles.some((turno) => turno.id === turnoReservado.id))
      .toBe(false);

    expect(disponibles.some((turno) => turno.id === turnoFijo.id))
      .toBe(false);

    expect(
      disponibles.some(
        (turno) => turno.id === turnoMantenimiento.id,
      ),
    ).toBe(false);

    expect(
      disponibles.every((turno) => turno.estado === 'libre'),
    ).toBe(true);
  });

  it('no ofrece turnos con horarios fuera de la jornada', async () => {
    const fecha = obtenerFechaRelativa(2);
    const turnoBase = turnosMock.find(
      (turno) =>
        turno.espacioId === 'esp-02' &&
        turno.fecha === fecha &&
        turno.inicio === '10:00',
    );

    if (!turnoBase) {
      throw new Error('No se encontró el turno base de prueba.');
    }

    const turnoInvalido = {
      ...turnoBase,
      id: `${turnoBase.id}-horario-invalido`,
      inicio: '07:00',
      fin: '08:00',
      estado: 'libre' as const,
      reservaId: null,
    };

    turnosMock.push(turnoInvalido);

    const disponibles = await obtenerTurnosDisponibles(
      'esp-02',
      fecha,
    );

    expect(
      disponibles.some((turno) => turno.id === turnoInvalido.id),
    ).toBe(false);
  });

  it('no ofrece un turno que ya comenzó hoy', async () => {
    const ahora = new Date();
    ahora.setHours(23, 59, 59, 0);
    jest.useFakeTimers().setSystemTime(ahora);

    const disponibles = await obtenerTurnosDisponibles(
      'esp-02',
      obtenerFechaRelativa(0),
    );

    expect(disponibles).toEqual([]);
  });
});