import { bloqueosMock } from '../mocks/bloqueos';
import { Bloqueo } from '../tipos/bloqueo';

export async function obtenerBloqueos(): Promise<Bloqueo[]> {
  return bloqueosMock.filter((b) => b.activo);
}

export async function obtenerBloqueosPorEspacio(
  espacioId: string,
): Promise<Bloqueo[]> {
  return bloqueosMock.filter((b) => b.activo && b.espacioId === espacioId);
}

export async function estaEspacioBloqueado(
  espacioId: string,
  fecha: string,
  horaInicio?: string,
  horaFin?: string,
): Promise<boolean> {
  const bloqueos = await obtenerBloqueosPorEspacio(espacioId);

  return bloqueos.some((bloqueo) => {
    if (fecha < bloqueo.fechaInicio || fecha > bloqueo.fechaFin) {
      return false;
    }

    if (!bloqueo.horaInicio || !bloqueo.horaFin || !horaInicio || !horaFin) {
      return true;
    }

    return horaInicio < bloqueo.horaFin && horaFin > bloqueo.horaInicio;
  });
}