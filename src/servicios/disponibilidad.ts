import { Turno } from '../tipos/turno';
import { obtenerEspacioPorId } from './espacios';
import { obtenerTurnosDisponibles } from './turnos';

export interface DisponibilidadEspacio {
  espacioId: string;
  fecha: string;
  turnosDisponibles: Turno[];
}

export async function consultarDisponibilidad(
  espacioId: string,
  fecha: string,
): Promise<DisponibilidadEspacio> {
  const espacio = await obtenerEspacioPorId(espacioId);
  if (!espacio || !espacio.activo) {
    return { espacioId, fecha, turnosDisponibles: [] };
  }

  const turnos = await obtenerTurnosDisponibles(espacioId, fecha);
  return {
    espacioId,
    fecha,
    turnosDisponibles: turnos,
  };
}