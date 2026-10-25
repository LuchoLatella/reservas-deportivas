
import { turnosMock } from '../../mocks/turnos';
import { Turno } from '../../tipos/turno';
import { obtenerFechaRelativa } from '../../utils/fechas';
import {
    obtenerTurnosDisponibles,
    obtenerTurnosPorEspacioYFecha,
} from '../turnos';

describe('Servicio de turnos', () => {
  let turnosOriginales: Turno[];

  beforeEach(() => {
    // Guardamos los datos para evitar que una prueba afecte a otra.
    turnosOriginales = turnosMock.map((turno) => ({ ...turno }));
  });

  afterEach(() => {
    // Restauramos los mocks al finalizar cada prueba.
    turnosMock.splice(
      0,
      turnosMock.length,
      ...turnosOriginales,
    );

    jest.useRealTimers();
  });

  it('devuelve los turnos del espacio y fecha solicitados', async () => {
    const fecha = obtenerFechaRelativa(1);
    const espacioId = 'esp-01';

    const turnos = await obtenerTurnosPorEspacioYFecha(
      espacioId,
      fecha,
    );

    expect(turnos.length).toBeGreaterThan(0);

    expect(
      turnos.every(
        (turno) =>
          turno.espacioId === espacioId &&
          turno.fecha === fecha,
      ),
    ).toBe(true);
  });

  it('devuelve una lista vacía cuando no hay turnos para esa consulta', async () => {
    const turnos = await obtenerTurnosPorEspacioYFecha(
      'espacio-inexistente',
      obtenerFechaRelativa(1),
    );

    expect(turnos).toEqual([]);
  });

  it('ofrece únicamente turnos libres con horario futuro', async () => {
    const fecha = obtenerFechaRelativa(1);

    const turnos = await obtenerTurnosDisponibles(
      'esp-01',
      fecha,
    );

    expect(
      turnos.every((turno) => turno.estado === 'libre'),
    ).toBe(true);

    expect(
      turnos.every(
        (turno) =>
          new Date(
            `${turno.fecha}T${turno.inicio}:00`,
          ).getTime() > Date.now(),
      ),
    ).toBe(true);
  });

  it('excluye los turnos reservados, fijos y en mantenimiento', async () => {
    const fecha = obtenerFechaRelativa(30);
    const espacioId = 'esp-01';

    const estados = [
      'libre',
      'reservado',
      'fijo',
      'mantenimiento',
    ] as const;

    const turnosDePrueba: Turno[] = estados.map(
      (estado, indice) => ({
        id: `turno-prueba-${indice}`,
        espacioId,
        fecha,
        inicio: `${String(10 + indice).padStart(2, '0')}:00`,
        fin: `${String(11 + indice).padStart(2, '0')}:00`,
        estado,
        reservaId: estado === 'reservado' ? 'res-prueba' : null,
        motivoBloqueo:
          estado === 'mantenimiento'
            ? 'Prueba de mantenimiento'
            : null,
        precio: 100,
      }),
    );

    turnosMock.push(...turnosDePrueba);

    const disponibles = await obtenerTurnosDisponibles(
      espacioId,
      fecha,
    );

    expect(disponibles).toHaveLength(1);
    expect(disponibles[0].estado).toBe('libre');
    expect(disponibles[0].id).toBe('turno-prueba-0');
  });

  it('no ofrece turnos cuyo horario de inicio ya pasó', async () => {
    const fecha = obtenerFechaRelativa(0);

    // Simulamos que ya terminó el día de hoy.
    jest.useFakeTimers();
    jest.setSystemTime(new Date(`${fecha}T23:59:59`));

    const disponibles = await obtenerTurnosDisponibles(
      'esp-01',
      fecha,
    );

    expect(disponibles).toEqual([]);
  });
});
