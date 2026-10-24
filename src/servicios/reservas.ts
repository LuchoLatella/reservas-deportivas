
import { reservasMock } from '../mocks/reservas';
import { turnosMock } from '../mocks/turnos';
import { Reserva } from '../tipos/reserva';
import { Turno } from '../tipos/turno';
import { obtenerEspacioPorId } from './espacios';
import { obtenerUsuarioPorId } from './usuarios';

const HORAS_ANTICIPACION_CANCELACION = 4;
const MAX_RESERVAS_ACTIVAS = 3;

export interface ResultadoCancelacion {
  cancelada: boolean;
  requiereEncargado: boolean;
  mensaje: string;
  reserva: Reserva;
}

// permitir consultar todas las reservas.
export async function obtenerReservas(): Promise<Reserva[]> {
  return reservasMock;
}

// permitir consultar las reservas de un usuario.
export async function obtenerReservasPorUsuario(
  usuarioId: string,
): Promise<Reserva[]> {
  return reservasMock.filter(
    (reserva) => reserva.usuarioId === usuarioId,
  );
}

// permitir consultar una reserva por su id.
export async function obtenerReservaPorId(
  id: string,
): Promise<Reserva | null> {
  return reservasMock.find(
    (reserva) => reserva.id === id,
  ) ?? null;
}

// Buscar un turno por su id.
function buscarTurno(turnoId: string): Turno | undefined {
  return turnosMock.find((turno) => turno.id === turnoId);
}

// permite omprobar si el turno todavía no comenzó.
function esTurnoFuturo(turno: Turno): boolean {
  const fechaHoraInicio = new Date(
    `${turno.fecha}T${turno.inicio}:00`,
  );

  return fechaHoraInicio.getTime() > Date.now();
}

// permitir crear una reserva nueva.
export async function crearReserva(
  turnoId: string,
  usuarioId: string,
  cantidadPersonas: number,
): Promise<Reserva> {
  // 1. Verificar que el usuario exista.
  const usuario = await obtenerUsuarioPorId(usuarioId);

  if (!usuario) {
    throw new Error('El usuario no existe.');
  }

  // 2. Verificar que el turno exista.
  const turno = buscarTurno(turnoId);

  if (!turno) {
    throw new Error('El turno solicitado no existe.');
  }

  // 3. Verificar que el turno esté disponible.
  if (turno.estado !== 'libre') {
    throw new Error('El turno no está disponible.');
  }

  // 4. Verificar que el turno sea futuro.
  if (!esTurnoFuturo(turno)) {
    throw new Error('No se pueden reservar turnos pasados.');
  }

  // 5. Verificar la cantidad de personas.
  if (
    !Number.isInteger(cantidadPersonas) ||
    cantidadPersonas < 1
  ) {
    throw new Error(
      'La cantidad de personas debe ser un número entero positivo.',
    );
  }

  const espacio = await obtenerEspacioPorId(turno.espacioId);

  if (!espacio || !espacio.activo) {
    throw new Error('El espacio deportivo no está disponible.');
  }

  if (cantidadPersonas > espacio.capacidad) {
    throw new Error(
      `La capacidad máxima de este espacio es de ${espacio.capacidad} personas.`,
    );
  }

  // 6. Contar las reservas confirmadas futuras del usuario.
  const reservasActivas = reservasMock.filter((reserva) => {
    if (
      reserva.usuarioId !== usuarioId ||
      reserva.estado !== 'confirmada'
    ) {
      return false;
    }

    const turnoReservado = buscarTurno(reserva.turnoId);

    return turnoReservado
      ? esTurnoFuturo(turnoReservado)
      : false;
  });

  if (reservasActivas.length >= MAX_RESERVAS_ACTIVAS) {
    throw new Error(
      'Ya tenés 3 reservas activas. Cancelá una antes de reservar otra.',
    );
  }

  // 7. Calcular el límite para cancelar automáticamente.
  const fechaHoraInicio = new Date(
    `${turno.fecha}T${turno.inicio}:00`,
  );

  const cancelableHasta = new Date(
    fechaHoraInicio.getTime() -
      HORAS_ANTICIPACION_CANCELACION * 60 * 60 * 1000,
  );

  // 8. Crear el registro de la reserva.
  const nuevaReserva: Reserva = {
    id: `res-${Date.now()}`,
    turnoId: turno.id,
    espacioId: turno.espacioId,
    usuarioId,
    cantidadPersonas,
    codigoQr: `QR-${Date.now().toString(36).toUpperCase()}`,
    estado: 'confirmada',
    ingresoEn: null,
    creadaEn: new Date().toISOString(),
    cancelableHasta: cancelableHasta.toISOString(),
  };

  // 9. Guardar la reserva y actualizar el turno.
  reservasMock.push(nuevaReserva);

  turno.estado = 'reservado';
  turno.reservaId = nuevaReserva.id;

  return nuevaReserva;
}

// Cancelar una reserva.
export async function cancelarReserva(
  reservaId: string,
  usuarioId: string,
): Promise<ResultadoCancelacion> {
  // 1. Buscar la reserva.
  const reserva = await obtenerReservaPorId(reservaId);

  if (!reserva) {
    throw new Error('La reserva no existe.');
  }

  // 2. Verificar que pertenezca al usuario.
  if (reserva.usuarioId !== usuarioId) {
    throw new Error(
      'No podés cancelar una reserva de otro usuario.',
    );
  }

  // 3. Verificar que siga confirmada.
  if (reserva.estado !== 'confirmada') {
    throw new Error(
      'La reserva ya no está confirmada y no se puede cancelar.',
    );
  }

  // 4. Buscar el turno asociado.
  const turno = buscarTurno(reserva.turnoId);

  if (!turno) {
    throw new Error('No se encontró el turno de la reserva.');
  }

  // 5. Comprobar el plazo de cancelación.
  const limiteCancelacion = new Date(reserva.cancelableHasta);

  if (Date.now() > limiteCancelacion.getTime()) {
    return {
      cancelada: false,
      requiereEncargado: true,
      mensaje:
        'Pasó el plazo de cancelación automática. Contactá al encargado del espacio.',
      reserva,
    };
  }

  // 6. Marcar la reserva como cancelada.
  const indiceReserva = reservasMock.findIndex(
    (item) => item.id === reservaId,
  );

  reservasMock[indiceReserva] = {
    ...reserva,
    estado: 'cancelada',
  };

  // 7. Liberar el turno.
  turno.estado = 'libre';
  turno.reservaId = null;

  return {
    cancelada: true,
    requiereEncargado: false,
    mensaje: 'La reserva se canceló correctamente.',
    reserva: reservasMock[indiceReserva],
  };
}
