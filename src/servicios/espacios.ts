import { espaciosMock } from '../mocks/espacios';
import { Espacio } from '../tipos/espacio';

export interface FiltrosEspacios {
  deporteId?: string;
  complejo?: string;
  busqueda?: string;
  incluirInactivos?: boolean;
}

/**
 * Consulta la lista de espacios deportivos permitiendo filtrar por deporte,
 * complejo o búsqueda por texto, respetando el estado activo por defecto.
 */
export async function obtenerEspacios(
  filtros: FiltrosEspacios = {},
): Promise<Espacio[]> {
  const termino = filtros.busqueda?.trim().toLowerCase();

  return espaciosMock.filter((espacio) => {
    if (!filtros.incluirInactivos && !espacio.activo) {
      return false;
    }

    const coincideDeporte =
      !filtros.deporteId || espacio.deporteId === filtros.deporteId;

    const coincideComplejo =
      !filtros.complejo || espacio.complejo === filtros.complejo;

    const coincideBusqueda =
      !termino ||
      espacio.nombre.toLowerCase().includes(termino) ||
      espacio.complejo.toLowerCase().includes(termino);

    return coincideDeporte && coincideComplejo && coincideBusqueda;
  });
}

/**
 * consulta un espacio por su ID identificador único.
 */
export async function obtenerEspacioPorId(
  id: string,
): Promise<Espacio | null> {
  return espaciosMock.find((espacio) => espacio.id === id) ?? null;
}

/**
 * Devuelve el listado de nombres de complejos deportivos únicos.
 */
export async function obtenerComplejos(): Promise<string[]> {
  const complejos = espaciosMock
    .filter((e) => e.activo)
    .map((e) => e.complejo);

  return Array.from(new Set(complejos));
}