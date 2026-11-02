export interface ReservaFija {
  id: string;
  espacioId: string;
  titular: string;
  dia: number;
  inicio: string;
  fin: string;
  desde: string;
  hasta: string | null;
  activa: boolean;
}