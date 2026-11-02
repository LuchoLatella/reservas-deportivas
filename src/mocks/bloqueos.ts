import { Bloqueo } from '../tipos/bloqueo';

export const bloqueosMock: Bloqueo[] = [
  {
    id: 'bloqueo-01',
    espacioId: 'esp-02',
    motivo: 'Mantenimiento de césped sintético',
    fechaInicio: '2026-10-01',
    fechaFin: '2026-12-31',
    horaInicio: '08:00',
    horaFin: '12:00',
    activo: true,
  },
  {
    id: 'bloqueo-02',
    espacioId: 'esp-03',
    motivo: 'Cancha anegada por lluvia',
    fechaInicio: '2026-10-25',
    fechaFin: '2026-10-27',
    activo: true,
  },
];