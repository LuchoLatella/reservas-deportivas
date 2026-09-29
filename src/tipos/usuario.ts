export type RolUsuario =
  | 'jugador'
  | 'encargado'
  | 'administrador';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: RolUsuario;
  espaciosFavoritos: string[];
  cancelacionesTardias: number;
  ausencias: number;
}