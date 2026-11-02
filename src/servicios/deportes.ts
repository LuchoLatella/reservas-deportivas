import { deportesMock } from '../mocks/deportes';
import { Deporte } from '../tipos/deporte';

/**
 * Nos tienen que devolver todos los deportes disponibles.
 */
export async function obtenerDeportes(): Promise<Deporte[]> {
  return deportesMock;
}

/**
 * Buscamos un deporte por su id.
 */
export async function obtenerDeportePorId(
  id: string,
): Promise<Deporte | null> {
  return deportesMock.find((deporte) => deporte.id === id) ?? null;
}