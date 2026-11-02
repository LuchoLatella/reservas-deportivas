import { estaEspacioBloqueado } from '../bloqueos';
import {
    obtenerReservasFijas,
    obtenerReservasFijasPorEspacio,
    tieneReservaFija,
} from '../reservas-fijas';

describe('Servicio de reservas fijas y bloqueos', () => {
  it('obtiene las reservas fijas registradas', async () => {
    const reservas = await obtenerReservasFijas();
    expect(reservas.length).toBeGreaterThan(0);
  });

  it('obtiene reservas fijas por espacio', async () => {
    const reservas = await obtenerReservasFijasPorEspacio('esp-01');
    expect(reservas.every((r) => r.espacioId === 'esp-01')).toBe(true);
  });

  it('detecta una reserva fija para el día de la semana y horario correspondiente', async () => {
    const esMartes = '2026-10-27';
    const coincide = await tieneReservaFija('esp-01', esMartes, '20:00', '21:00');
    expect(coincide).toBe(true);
  });

  it('no marca reserva fija si es otro día de la semana', async () => {
    const esLunes = '2026-10-26';
    const coincide = await tieneReservaFija('esp-01', esLunes, '20:00', '21:00');
    expect(coincide).toBe(false);
  });

  it('detecta bloqueo activo por rango de fechas y horarios', async () => {
    const bloqueado = await estaEspacioBloqueado(
      'esp-02',
      '2026-10-27',
      '09:00',
      '10:00',
    );
    expect(bloqueado).toBe(true);
  });

  it('permite horarios fuera del rango bloqueado', async () => {
    const bloqueado = await estaEspacioBloqueado(
      'esp-02',
      '2026-10-27',
      '14:00',
      '15:00',
    );
    expect(bloqueado).toBe(false);
  });
});