import { Turno } from '../tipos/turno';

const generarTurnos = (
  espacioId: string,
  fecha: string,
  precio: number,
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
      precio,
    });
  }

  return turnos;
};

export const turnosMock: Turno[] = [
  ...generarTurnos('esp-01', '2026-09-28', 12000),
  ...generarTurnos('esp-01', '2026-09-29', 12000),

  ...generarTurnos('esp-02', '2026-09-28', 12000),
  ...generarTurnos('esp-02', '2026-09-29', 12000),

  ...generarTurnos('esp-03', '2026-09-28', 20000),
  ...generarTurnos('esp-03', '2026-09-29', 20000),

  ...generarTurnos('esp-09', '2026-09-28', 7000),
  ...generarTurnos('esp-09', '2026-09-29', 7000),
];

/*
 * Reserva existente
 */
const turnoReservado = turnosMock.find(
  (turno) =>
    turno.espacioId === 'esp-02' &&
    turno.fecha === '2026-09-28' &&
    turno.inicio === '18:00',
);

if (turnoReservado) {
  turnoReservado.estado = 'reservado';
  turnoReservado.reservaId = 'res-01';
}

/*
 * Mantenimiento
 */
const turnoMantenimiento = turnosMock.find(
  (turno) =>
    turno.espacioId === 'esp-01' &&
    turno.fecha === '2026-09-28' &&
    turno.inicio === '16:00',
);

if (turnoMantenimiento) {
  turnoMantenimiento.estado = 'mantenimiento';
  turnoMantenimiento.motivoBloqueo =
    'Mantenimiento de iluminación';
}

/*
 * Reserva fija
 * Martes de 20:00 a 21:00
 */
const turnoFijo = turnosMock.find(
  (turno) =>
    turno.espacioId === 'esp-01' &&
    turno.fecha === '2026-09-29' &&
    turno.inicio === '20:00',
);

if (turnoFijo) {
  turnoFijo.estado = 'fijo';
}