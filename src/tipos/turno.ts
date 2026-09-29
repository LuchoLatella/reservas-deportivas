export type EstadoTurno =
  | 'libre'
  | 'reservado'
  | 'fijo'
  | 'mantenimiento';

export interface Turno {
  id: string;
  espacioId: string;
  fecha: string;
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  reservaId: string | null;
  motivoBloqueo: string | null;
  precio: number;
}