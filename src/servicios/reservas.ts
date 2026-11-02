
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

function buscarTurno(turnoId: string): Turno | undefined {
  return turnosMock.find((turno) => turno.id === turnoId);
}

function buscarReserva(reservaId: string): Reserva | undefined {
  return reservasMock.find((reserva) => reserva.id === reservaId);
}

function esTurnoFuturo(turno: Turno): boolean {
  const fechaHoraInicio = new Date(
    `${turno.fecha}T${turno.inicio}:00`,
  );

  return (
    !Number.isNaN(fechaHoraInicio.getTime()) &&
    fechaHoraInicio.getTime() > Date.now()
  );
}

function generarIdReserva(): string {
  const base = Date.now();
  let id = `res-${base}`;
  let sufijo = 1;

  while (reservasMock.some((reserva) => reserva.id === id)) {
    id = `res-${base}-${sufijo}`;
    sufijo += 1;
  }

  return id;
}

function generarCodigoQr(): string {
  let codigo = '';

  do {
    codigo = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
  } while (reservasMock.some((reserva) => reserva.codigoQr === codigo));

  return codigo;
}

function validarVinculoReservaTurno(
  reserva: Reserva,
  turno: Turno,
): void {
  if (
    turno.espacioId !== reserva.espacioId ||
    turno.estado !== 'reservado' ||
    turno.reservaId !== reserva.id
  ) {
    throw new Error(
      'La reserva y el turno no tienen una vinculación válida.',
    );
  }
}

function finalizarCancelacion(
  reserva: Reserva,
  turno: Turno,
): Reserva {
  validarVinculoReservaTurno(reserva, turno);

  const indiceReserva = reservasMock.findIndex(
    (item) => item.id === reserva.id,
  );

  if (indiceReserva === -1) {
    throw new Error('La reserva no existe.');
  }

  const reservaCancelada: Reserva = {
    ...reserva,
    estado: 'cancelada',
  };

  // Primero actualizamos la reserva y luego liberamos su turno.
  reservasMock[indiceReserva] = reservaCancelada;
  turno.estado = 'libre';
  turno.reservaId = null;

  return reservaCancelada;
}

export async function obtenerReservas(): Promise<Reserva[]> {
  return reservasMock;
}

export async function obtenerReservasPorUsuario(
  usuarioId: string,
): Promise<Reserva[]> {
  return reservasMock.filter(
    (reserva) => reserva.usuarioId === usuarioId,
  );
}

export async function obtenerReservaPorId(
  id: string,
): Promise<Reserva | null> {
  return buscarReserva(id) ?? null;
}

export async function crearReserva(
  turnoId: string,
  usuarioId: string,
  cantidadPersonas: number,
): Promise<Reserva> {
  // 1. El usuario debe existir.
  const usuario = await obtenerUsuarioPorId(usuarioId);

  if (!usuario) {
    throw new Error('El usuario no existe.');
  }

  // 2. El turno debe existir y estar libre.
  const turno = buscarTurno(turnoId);

  if (!turno) {
    throw new Error('El turno solicitado no existe.');
  }

  if (turno.estado !== 'libre') {
    throw new Error('El turno no está disponible.');
  }

  // Un turno libre no debería tener una reserva asociada.
  if (turno.reservaId !== null) {
    throw new Error(
      'El turno tiene datos inconsistentes y no puede reservarse.',
    );
  }

  if (!esTurnoFuturo(turno)) {
    throw new Error('No se pueden reservar turnos pasados.');
  }

  // 3. La cantidad de personas debe ser válida.
  if (
    !Number.isInteger(cantidadPersonas) ||
    cantidadPersonas < 1
  ) {
    throw new Error(
      'La cantidad de personas debe ser un número entero positivo.',
    );
  }

  // 4. El espacio debe existir, estar activo y tener capacidad.
  const espacio = await obtenerEspacioPorId(turno.espacioId);

  if (!espacio || !espacio.activo) {
    throw new Error('El espacio deportivo no está disponible.');
  }

  if (cantidadPersonas > espacio.capacidad) {
    throw new Error(
      `La capacidad máxima de este espacio es de ${espacio.capacidad} personas.`,
    );
  }

  // 5. Contar las reservas confirmadas cuyo turno aún no comenzó.
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

  // 6. Calcular el límite de cancelación automática.
  const fechaHoraInicio = new Date(
    `${turno.fecha}T${turno.inicio}:00`,
  );

  const cancelableHasta = new Date(
    fechaHoraInicio.getTime() -
      HORAS_ANTICIPACION_CANCELACION * 60 * 60 * 1000,
  );

  // 7. Preparar la reserva sin modificar todavía el turno.
  const nuevaReserva: Reserva = {
    id: generarIdReserva(),
    turnoId: turno.id,
    espacioId: turno.espacioId,
    usuarioId,
    cantidadPersonas,
    codigoQr: generarCodigoQr(),
    estado: 'confirmada',
    ingresoEn: null,
    creadaEn: new Date().toISOString(),
    cancelableHasta: cancelableHasta.toISOString(),
  };

  // 8. Confirmar la operación una vez superadas las validaciones.
  reservasMock.push(nuevaReserva);
  turno.estado = 'reservado';
  turno.reservaId = nuevaReserva.id;

  return nuevaReserva;
}

export async function cancelarReserva(
  reservaId: string,
  usuarioId: string,
): Promise<ResultadoCancelacion> {
  const reserva = buscarReserva(reservaId);

  if (!reserva) {
    throw new Error('La reserva no existe.');
  }

  if (reserva.usuarioId !== usuarioId) {
    throw new Error(
      'No podés cancelar una reserva de otro usuario.',
    );
  }

  if (reserva.estado !== 'confirmada') {
    throw new Error(
      'La reserva ya no está confirmada y no se puede cancelar.',
    );
  }

  const turno = buscarTurno(reserva.turnoId);

  if (!turno) {
    throw new Error('No se encontró el turno de la reserva.');
  }

  // No cancelar ni liberar un turno que no corresponda a la reserva.
  validarVinculoReservaTurno(reserva, turno);

  const limiteCancelacion = new Date(reserva.cancelableHasta);

  if (
    Number.isNaN(limiteCancelacion.getTime())
  ) {
    throw new Error('La fecha límite de cancelación no es válida.');
  }

  // El límite exacto todavía está permitido.
  if (Date.now() > limiteCancelacion.getTime()) {
    return {
      cancelada: false,
      requiereEncargado: true,
      mensaje:
        'Pasó el plazo de cancelación automática. Contactá al encargado del espacio.',
      reserva,
    };
  }

  const reservaCancelada = finalizarCancelacion(reserva, turno);

  return {
    cancelada: true,
    requiereEncargado: false,
    mensaje: 'La reserva se canceló correctamente.',
    reserva: reservaCancelada,
  };
}

/**
 * Confirma una cancelación que ya superó el plazo automático.
 * Solo puede ejecutarla un encargado o administrador.
 * El contador se incrementa únicamente cuando la cancelación se concreta.
 */
export async function confirmarCancelacionTardia(
  reservaId: string,
  encargadoId: string,
): Promise<Reserva> {
  const encargado = await obtenerUsuarioPorId(encargadoId);

  if (
    !encargado ||
    !['encargado', 'administrador'].includes(encargado.rol)
  ) {
    throw new Error(
      'Solo un encargado o administrador puede confirmar esta cancelación.',
    );
  }

  const reserva = buscarReserva(reservaId);

  if (!reserva) {
    throw new Error('La reserva no existe.');
  }

  if (reserva.estado !== 'confirmada') {
    throw new Error(
      'La reserva ya no está confirmada y no se puede cancelar.',
    );
  }

  const turno = buscarTurno(reserva.turnoId);

  if (!turno) {
    throw new Error('No se encontró el turno de la reserva.');
  }

  validarVinculoReservaTurno(reserva, turno);

  const limiteCancelacion = new Date(reserva.cancelableHasta);

  if (
    Number.isNaN(limiteCancelacion.getTime()) ||
    Date.now() <= limiteCancelacion.getTime()
  ) {
    throw new Error(
      'La reserva todavía está dentro del plazo de cancelación automática.',
    );
  }

  const usuario = await obtenerUsuarioPorId(reserva.usuarioId);

  if (!usuario) {
    throw new Error(
      'No se encontró al usuario titular de la reserva.',
    );
  }

  // Todas las validaciones se completaron antes de modificar los datos.
  const reservaCancelada = finalizarCancelacion(reserva, turno);
  usuario.cancelacionesTardias += 1;

  return reservaCancelada;
}
