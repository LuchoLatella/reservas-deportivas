export interface Bloqueo {
  id: string;
  espacioId: string;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  activo: boolean;
}