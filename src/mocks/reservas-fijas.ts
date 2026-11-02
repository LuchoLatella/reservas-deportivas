import { ReservaFija } from '../tipos/reserva-fija';

export const reservasFijasMock: ReservaFija[] = [
  {
    id: 'fija-01',
    espacioId: 'esp-01',
    titular: 'Club Deportivo Municipal',
    dia: 2,
    inicio: '20:00',
    fin: '21:00',
    desde: '2026-09-01',
    hasta: null,
    activa: true,
  },
  {
    id: 'fija-02',
    espacioId: 'esp-03',
    titular: 'Escuela Municipal de Fútbol',
    dia: 4,
    inicio: '18:00',
    fin: '20:00',
    desde: '2026-09-01',
    hasta: '2026-12-15',
    activa: true,
  },
  {
    id: 'fija-03',
    espacioId: 'esp-09',
    titular: 'Escuela Municipal de Tenis',
    dia: 6,
    inicio: '10:00',
    fin: '12:00',
    desde: '2026-09-01',
    hasta: null,
    activa: true,
  },
];