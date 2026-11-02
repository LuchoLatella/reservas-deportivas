
import {
    obtenerDeportePorId,
    obtenerDeportes,
} from '../deportes';

import {
    obtenerEspacioPorId,
    obtenerEspacios,
} from '../espacios';

import {
    obtenerUsuarioPorEmail,
    obtenerUsuarioPorId,
    obtenerUsuarios,
} from '../usuarios';

import {
    obtenerReservasFijas,
    obtenerReservasFijasPorEspacio,
} from '../reservas-fijas';

describe('Contratos de consulta de datos', () => {
  it('consulta los deportes y busca uno por identificador', async () => {
    const deportes = await obtenerDeportes();

    expect(deportes.length).toBeGreaterThan(0);

    const deporte = await obtenerDeportePorId(deportes[0].id);

    expect(deporte).toEqual(deportes[0]);

    await expect(
      obtenerDeportePorId('id-inexistente'),
    ).resolves.toBeNull();
  });

  it('consulta los espacios y devuelve solo espacios activos', async () => {
    const espacios = await obtenerEspacios();

    expect(espacios.length).toBeGreaterThan(0);
    expect(
      espacios.every((espacio) => espacio.activo),
    ).toBe(true);

    const espacio = await obtenerEspacioPorId(espacios[0].id);

    expect(espacio).toEqual(espacios[0]);

    await expect(
      obtenerEspacioPorId('id-inexistente'),
    ).resolves.toBeNull();
  });

  it('filtra los espacios por deporte', async () => {
    const espacios = await obtenerEspacios();

    const deporteId = espacios[0].deporteId;

    const resultado = await obtenerEspacios({ deporteId });

    expect(resultado.length).toBeGreaterThan(0);

    expect(
      resultado.every(
        (espacio) =>
          espacio.deporteId === deporteId && espacio.activo,
      ),
    ).toBe(true);
  });

  it('consulta usuarios por identificador y email normalizado', async () => {
    const usuarios = await obtenerUsuarios();

    expect(usuarios.length).toBeGreaterThan(0);

    const usuario = usuarios[0];

    await expect(
      obtenerUsuarioPorId(usuario.id),
    ).resolves.toEqual(usuario);

    await expect(
      obtenerUsuarioPorEmail(
        `  ${usuario.email.toUpperCase()}  `,
      ),
    ).resolves.toEqual(usuario);

    await expect(
      obtenerUsuarioPorId('id-inexistente'),
    ).resolves.toBeNull();

    await expect(
      obtenerUsuarioPorEmail('no-existe@example.com'),
    ).resolves.toBeNull();
  });

  it('consulta las reservas fijas y filtra las activas por espacio', async () => {
    const reservasFijas = await obtenerReservasFijas();

    expect(reservasFijas.length).toBeGreaterThan(0);

    const reglaActiva = reservasFijas.find(
      (regla) => regla.activa,
    );

    expect(reglaActiva).toBeDefined();

    if (!reglaActiva) {
      throw new Error(
        'Se necesita una reserva fija activa para esta prueba.',
      );
    }

    const resultado = await obtenerReservasFijasPorEspacio(
      reglaActiva.espacioId,
    );

    expect(
      resultado.every(
        (regla) =>
          regla.espacioId === reglaActiva.espacioId &&
          regla.activa,
      ),
    ).toBe(true);
  });
});
