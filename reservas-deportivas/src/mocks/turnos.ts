import { Turno } from '../tipos/turno';

const generarTurnos = (
  espacioId: string,
  fecha: string,
): Turno[] => {
  const turnos: Turno[] = [];

  for (let hora = 8; hora < 24; hora++) {
    const inicio = `${String(hora).padStart(2, '0')}:00`;
    const fin = `${String(hora + 1).padStart(2, '0')}:00`;

    turnos.push({
      id: `turno-${espacioId}-${fecha}-${hora}`,
      espacioId,
      fecha,
      inicio,
      fin,
      estado: 'libre',
      reservaId: null,
      motivoBloqueo: null,
      precio: 12000,
    });
  }

  return turnos;
};

export const turnosMock: Turno[] = [
  ...generarTurnos('esp-01', '2026-09-28'),
  ...generarTurnos('esp-02', '2026-09-28'),
  ...generarTurnos('esp-03', '2026-09-28'),
  ...generarTurnos('esp-09', '2026-09-28'),
];