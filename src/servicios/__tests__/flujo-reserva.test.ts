import { reservasMock } from '../../mocks/reservas';
import { turnosMock } from '../../mocks/turnos';
import { obtenerFechaRelativa } from '../../utils/fechas';
import {
    cancelarReserva,
    crearReserva,
    obtenerReservasPorUsuario,
} from '../reservas';
import { obtenerTurnosDisponibles } from '../turnos';

const turnosIniciales = turnosMock.map((t) => ({ ...t }));
const reservasIniciales = reservasMock.map((r) => ({ ...r }));

beforeEach(() => {
  turnosMock.splice(
    0,
    turnosMock.length,
    ...turnosIniciales.map((t) => ({ ...t })),
  );
  reservasMock.splice(
    0,
    reservasMock.length,
    ...reservasIniciales.map((r) => ({ ...r })),
  );
});

describe('Flujo Integrante 2 — Espacios y Reservas', () => {
  it('permite consultar disponibilidad, crear una reserva y verla en la lista del usuario', async () => {
    const fechaFutura = obtenerFechaRelativa(3);

    // 1. Consulta disponibilidad
    const disponibles = await obtenerTurnosDisponibles('esp-01', fechaFutura);
    expect(disponibles.length).toBeGreaterThan(0);

    const turnoAElegir = disponibles[0];

    // 2. Crea la reserva
    const nuevaReserva = await crearReserva(turnoAElegir.id, 'usr-01', 4);
    expect(nuevaReserva.estado).toBe('confirmada');
    expect(nuevaReserva.turnoId).toBe(turnoAElegir.id);

    // 3. Verifica que aparezca en el listado de reservas del usuario
    const misReservas = await obtenerReservasPorUsuario('usr-01');
    expect(misReservas.some((r) => r.id === nuevaReserva.id)).toBe(true);
  });

  it('permite cancelar la reserva creada dentro del plazo y liberar el turno', async () => {
    const fechaFutura = obtenerFechaRelativa(4);
    const disponibles = await obtenerTurnosDisponibles('esp-01', fechaFutura);
    const turnoAElegir = disponibles[0];

    const nuevaReserva = await crearReserva(turnoAElegir.id, 'usr-01', 4);

    // Cancelación por parte del usuario
    const resultado = await cancelarReserva(nuevaReserva.id, 'usr-01');

    expect(resultado.cancelada).toBe(true);
    expect(resultado.reserva.estado).toBe('cancelada');
  });
});