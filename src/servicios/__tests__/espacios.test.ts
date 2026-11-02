import { espaciosMock } from '../../mocks/espacios';
import {
    obtenerComplejos,
    obtenerEspacioPorId,
    obtenerEspacios,
} from '../espacios';

const espaciosIniciales = espaciosMock.map((espacio) => ({
  ...espacio,
  coordenadas: { ...espacio.coordenadas },
  imagenes: [...espacio.imagenes],
  reglas: [...espacio.reglas],
}));

beforeEach(() => {
  espaciosMock.splice(
    0,
    espaciosMock.length,
    ...espaciosIniciales.map((espacio) => ({
      ...espacio,
      coordenadas: { ...espacio.coordenadas },
      imagenes: [...espacio.imagenes],
      reglas: [...espacio.reglas],
    })),
  );
});

describe('Servicio de espacios deportivos', () => {
  it('obtiene únicamente espacios activos por defecto', async () => {
    const espacios = await obtenerEspacios();
    expect(espacios.length).toBeGreaterThan(0);
    expect(espacios.every((e) => e.activo)).toBe(true);
  });

  it('permite filtrar espacios por deporte', async () => {
    const espacios = await obtenerEspacios({ deporteId: 'dep-01' });
    expect(espacios.length).toBeGreaterThan(0);
    expect(espacios.every((e) => e.deporteId === 'dep-01')).toBe(true);
  });

  it('permite filtrar espacios por complejo', async () => {
    const espacios = await obtenerEspacios({ complejo: 'Parque Berduc' });
    expect(espacios.length).toBeGreaterThan(0);
    expect(espacios.every((e) => e.complejo === 'Parque Berduc')).toBe(true);
  });

  it('permite incluir espacios inactivos si se solicita explícitamente', async () => {
    const espacioPrueba = espaciosMock[0];
    espacioPrueba.activo = false;

    const activos = await obtenerEspacios();
    expect(activos.some((e) => e.id === espacioPrueba.id)).toBe(false);

    const todos = await obtenerEspacios({ incluirInactivos: true });
    expect(todos.some((e) => e.id === espacioPrueba.id)).toBe(true);
  });

  it('obtiene un espacio por su ID independientemente de si está activo', async () => {
    const espacioPrueba = espaciosMock[0];
    espacioPrueba.activo = false;

    const obtenido = await obtenerEspacioPorId(espacioPrueba.id);
    expect(obtenido).not.toBeNull();
    expect(obtenido?.id).toBe(espacioPrueba.id);
  });

  it('devuelve null si se consulta un ID de espacio inexistente', async () => {
    const obtenido = await obtenerEspacioPorId('esp-inexistente');
    expect(obtenido).toBeNull();
  });

  it('obtiene la lista de complejos únicos disponibles', async () => {
    const complejos = await obtenerComplejos();
    expect(complejos).toContain('Polideportivo Municipal');
    expect(complejos).toContain('Parque Berduc');
    expect(new Set(complejos).size).toBe(complejos.length);
  });
});