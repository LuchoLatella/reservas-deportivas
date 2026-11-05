import { espaciosMock } from '../mocks/espacios';
import { Espacio } from '../tipos/espacio';
import { clienteApi } from './api';

export interface FiltrosEspacio {
  deporteId?: string;
  complejo?: string;
  iluminacion?: boolean;
  techado?: boolean;
  busqueda?: string;
  incluirInactivos?: boolean;
}

export async function obtenerEspacios(filtros?: FiltrosEspacio): Promise<Espacio[]> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const params = new URLSearchParams();
      if (filtros?.deporteId) params.append('deporteId', filtros.deporteId);
      if (filtros?.complejo) params.append('complejo', filtros.complejo);
      if (filtros?.iluminacion !== undefined) params.append('iluminacion', String(filtros.iluminacion));
      if (filtros?.techado !== undefined) params.append('techado', String(filtros.techado));

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const datos = await clienteApi<Espacio[]>(`/espacios${queryString}`);
      
      if (datos && Array.isArray(datos)) {
        let resultado = datos;
        if (!filtros?.incluirInactivos) {
          resultado = resultado.filter((e) => e.activo !== false);
        }
        if (filtros?.busqueda) {
          const b = filtros.busqueda.toLowerCase();
          resultado = resultado.filter(
            (e) => e.nombre.toLowerCase().includes(b) || e.complejo.toLowerCase().includes(b)
          );
        }
        return resultado;
      }
    } catch {}
  }

  let resultado = [...espaciosMock];

  if (!filtros?.incluirInactivos) {
    resultado = resultado.filter((e) => e.activo !== false);
  }

  if (filtros?.deporteId) {
    resultado = resultado.filter((e: any) => {
      if (e.deporteId) return e.deporteId === filtros.deporteId;
      if (Array.isArray(e.deportesIds)) return e.deportesIds.includes(filtros.deporteId);
      return false;
    });
  }

  if (filtros?.complejo) {
    resultado = resultado.filter((e) => e.complejo.toLowerCase() === filtros.complejo!.toLowerCase());
  }

  if (filtros?.iluminacion !== undefined) {
    resultado = resultado.filter((e) => e.iluminacion === filtros.iluminacion);
  }

  if (filtros?.techado !== undefined) {
    resultado = resultado.filter((e) => e.techado === filtros.techado);
  }

  if (filtros?.busqueda) {
    const b = filtros.busqueda.toLowerCase();
    resultado = resultado.filter(
      (e) => e.nombre.toLowerCase().includes(b) || e.complejo.toLowerCase().includes(b)
    );
  }

  return resultado;
}

export async function obtenerEspacioPorId(id: string): Promise<Espacio | null> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const espacio = await clienteApi<Espacio>(`/espacios/${id}`);
      if (espacio) return espacio;
    } catch {}
  }

  return espaciosMock.find((e) => e.id === id) ?? null;
}

export async function obtenerComplejos(): Promise<string[]> {
  const espacios = await obtenerEspacios({ incluirInactivos: true });
  const complejosUnicos = Array.from(new Set(espacios.map((e) => e.complejo)));
  return complejosUnicos;
}