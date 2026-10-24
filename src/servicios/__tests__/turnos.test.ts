
import { espaciosMock } from '../../mocks/espacios';
import { turnosMock } from '../../mocks/turnos';
import { obtenerFechaRelativa } from '../../utils/fechas';
import { obtenerTurnosDisponibles, obtenerTurnosPorEspacioYFecha } from '../turnos';

describe('Servicio de turnos', () => {
  it('genera 16 turnos por día para cada espacio activo', () => {
    const espaciosActivos = espaciosMock.filter(
      (espacio) => espacio.activo,
    );

    const fechas = [
      ...new Set(turnosMock.map((turno) => turno.fecha)),
    ];

    expect(fechas).toHaveLength(7);

    for (const espacio of espaciosActivos) {
      for (const fecha of fechas) {
        const turnos = turnosMock.filter(
          (turno) =>
            turno.espacioId === espacio.id &&
            turno.fecha === fecha,
        );

        expect(turnos).toHaveLength(16);
      }
    }
  });

  it('no genera identificadores de turno duplicados', () => {
    const identificadores = turnosMock.map(
      (turno) => turno.id,
    );

    expect(new Set(identificadores).size).toBe(
      identificadores.length,
    );
  });

  it('consulta los turnos de un espacio y fecha específicos', async () => {
    const fecha = obtenerFechaRelativa(1);

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

  it('no ofrece como disponibles los turnos ocupados', async () => {
    const fecha = obtenerFechaRelativa(1);

    const turnos = await obtenerTurnosDisponibles(
      'esp-02',
      fecha,
    );

    expect(
      turnos.every((turno) => turno.estado === 'libre'),
    ).toBe(true);

    expect(
      turnos.some((turno) => turno.inicio === '18:00'),
    ).toBe(false);
  });

  it('no ofrece turnos cuyo inicio ya pasó', async () => {
    const hoy = obtenerFechaRelativa(0);

    const turnos = await obtenerTurnosDisponibles(
      'esp-02',
      hoy,
    );

    const ahora = Date.now();

    for (const turno of turnos) {
      const inicio = new Date(
        `${turno.fecha}T${turno.inicio}:00`,
      ).getTime();

      expect(inicio).toBeGreaterThan(ahora);
    }
  });

  it('mantiene bloqueado el turno de mantenimiento', async () => {
    const fecha = obtenerFechaRelativa(1);

    const turnos = await obtenerTurnosPorEspacioYFecha(
      'esp-01',
      fecha,
    );

    const turno = turnos.find(
      (item) => item.inicio === '16:00',
    );

    expect(turno?.estado).toBe('mantenimiento');
    expect(turno?.motivoBloqueo).toBe(
      'Mantenimiento de iluminación',
    );
  });

  it('mantiene bloqueada la jornada de lluvia', async () => {
    const fecha = obtenerFechaRelativa(2);

    const turnos = await obtenerTurnosPorEspacioYFecha(
      'esp-06',
      fecha,
    );

    expect(turnos).toHaveLength(16);

    expect(
      turnos.every(
        (turno) =>
          turno.estado === 'mantenimiento' &&
          turno.motivoBloqueo ===
            'Suspensión de actividades por lluvia',
      ),
    ).toBe(true);
  });

  it('reconoce los turnos de una agenda completa', async () => {
    const fecha = obtenerFechaRelativa(3);

    const turnos = await obtenerTurnosPorEspacioYFecha(
      'esp-04',
      fecha,
    );

    expect(turnos).toHaveLength(16);

    expect(
      turnos.every((turno) => turno.estado === 'reservado'),
    ).toBe(true);
  });

  it('aplica las reservas fijas en la agenda', () => {
    const turnosFijos = turnosMock.filter(
      (turno) => turno.estado === 'fijo',
    );

    expect(turnosFijos.length).toBeGreaterThan(0);
  });
});
