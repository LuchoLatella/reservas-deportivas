import { espaciosMock } from '../mocks/espacios';
import { Espacio } from '../tipos/espacio';

export interface FiltrosEspacios {
  deporteId?: string;
  complejo?: string;
}

export async function obtenerEspacios(
  filtros: FiltrosEspacios = {},
): Promise<Espacio[]> {
  return espaciosMock.filter((espacio) => {
    const coincideDeporte =
      !filtros.deporteId ||
      espacio.deporteId === filtros.deporteId;

    const coincideComplejo =
      !filtros.complejo ||
      espacio.complejo === filtros.complejo;

    return (
      espacio.activo &&
      coincideDeporte &&
      coincideComplejo
    );
  });
}

export async function obtenerEspacioPorId(
  id: string,
): Promise<Espacio | null> {
  return (
    espaciosMock.find(
      (espacio) => espacio.id === id,
    ) ?? null
  );
}