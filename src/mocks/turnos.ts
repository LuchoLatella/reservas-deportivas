import { Turno } from '../tipos/turno';
import {
  obtenerDiaSemana,
  obtenerFechaRelativa,
} from '../utils/fechas';
import { espaciosMock } from './espacios';
import { reservasFijasMock } from './reservas-fijas';

/**
 * Nos genera turnos de una hora entre las 08:00 y las 24:00.
 */
function generarTurnos(
  espacioId: string,
  fecha: string,
  precio: number,
): Turno[] {
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
}

/**
 * nos genera la agenda de todos los espacios activos
 * para hoy y los próximos seis días.
 */
const fechasProximas = Array.from(
  { length: 7 },
  (_, indice) => obtenerFechaRelativa(indice),
);

export const turnosMock: Turno[] = espaciosMock
  .filter((espacio) => espacio.activo)
  .flatMap((espacio) =>
    fechasProximas.flatMap((fecha) =>
      generarTurnos(
        espacio.id,
        fecha,
        espacio.precioPorHora,
      ),
    ),
  );

/**
 * aplica las reservas fijas semanales.
 */
for (const reservaFija of reservasFijasMock) {
  if (!reservaFija.activa) {
    continue;
  }

  for (const turno of turnosMock) {
    const coincideEspacio =
      turno.espacioId === reservaFija.espacioId;

    const coincideDia =
      obtenerDiaSemana(turno.fecha) === reservaFija.dia;

    const fechaDentroDelPeriodo =
      turno.fecha >= reservaFija.desde &&
      (
        reservaFija.hasta === null ||
        turno.fecha <= reservaFija.hasta
      );

    const coincideHorario =
      turno.inicio >= reservaFija.inicio &&
      turno.fin <= reservaFija.fin;

    if (
      coincideEspacio &&
      coincideDia &&
      fechaDentroDelPeriodo &&
      coincideHorario &&
      turno.estado === 'libre'
    ) {
      turno.estado = 'fijo';
    }
  }
}

/**
 * Escenario de prueba: reserva existente.
 * Cancha de Fútbol 5 B, mañana de 18:00 a 19:00.
 */
const fechaReservaExistente = obtenerFechaRelativa(1);

const turnoReservado = turnosMock.find(
  (turno) =>
    turno.espacioId === 'esp-02' &&
    turno.fecha === fechaReservaExistente &&
    turno.inicio === '18:00',
);

if (turnoReservado) {
  turnoReservado.estado = 'reservado';
  turnoReservado.reservaId = 'res-01';
}

/**
 * Escenario de prueba: mantenimiento de una hora.
 * Cancha de Fútbol 5 A, mañana de 16:00 a 17:00.
 */
const fechaMantenimiento = obtenerFechaRelativa(1);

const turnoMantenimiento = turnosMock.find(
  (turno) =>
    turno.espacioId === 'esp-01' &&
    turno.fecha === fechaMantenimiento &&
    turno.inicio === '16:00',
);

if (turnoMantenimiento) {
  turnoMantenimiento.estado = 'mantenimiento';
  turnoMantenimiento.reservaId = null;
  turnoMantenimiento.motivoBloqueo =
    'Mantenimiento de iluminación';
}

/**
 * Escenario de prueba: espacio cerrado por lluvia
 * durante toda una jornada.
 */
const fechaLluvia = obtenerFechaRelativa(2);

const turnosPorLluvia = turnosMock.filter(
  (turno) =>
    turno.espacioId === 'esp-06' &&
    turno.fecha === fechaLluvia,
);

for (const turno of turnosPorLluvia) {
  turno.estado = 'mantenimiento';
  turno.reservaId = null;
  turno.motivoBloqueo = 'Suspensión de actividades por lluvia';
}

/**
 * Escenario de prueba: agenda sin horarios libres.
 * Los turnos se muestran como ocupados para poder
 * probar el estado de agenda completa en la interfaz.
 */
const fechaAgendaCompleta = obtenerFechaRelativa(3);

const turnosAgendaCompleta = turnosMock.filter(
  (turno) =>
    turno.espacioId === 'esp-04' &&
    turno.fecha === fechaAgendaCompleta,
);

for (const turno of turnosAgendaCompleta) {
  turno.estado = 'reservado';
  turno.reservaId = null;
}