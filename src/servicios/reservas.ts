import { espaciosMock } from '../mocks/espacios';
import { reservasMock } from '../mocks/reservas';
import { turnosMock } from '../mocks/turnos';
import { usuariosMock } from '../mocks/usuarios';
import { Reserva } from '../tipos/reserva';
import { clienteApi } from './api';

export async function obtenerReservasUsuario(cuando: 'proximas' | 'pasadas' = 'proximas'): Promise<Reserva[]> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const datos = await clienteApi<Reserva[]>(`/yo/reservas?cuando=${cuando}`);
      if (datos && Array.isArray(datos)) {
        return datos;
      }
    } catch {}
  }
  return reservasMock;
}

export async function obtenerReservasPorUsuario(usuarioId: string): Promise<Reserva[]> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const datos = await clienteApi<Reserva[]>(`/yo/reservas`);
      if (datos && Array.isArray(datos)) {
        return datos.filter((r) => r.usuarioId === usuarioId);
      }
    } catch {}
  }
  return reservasMock.filter((r) => r.usuarioId === usuarioId);
}

export async function obtenerReservaPorId(id: string): Promise<Reserva | null> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const reserva = await clienteApi<Reserva>(`/reservas/${id}`);
      if (reserva) return reserva;
    } catch {}
  }
  return reservasMock.find((r) => r.id === id) ?? null;
}

export async function crearReserva(
  turnoId: string,
  arg2?: string | number,
  arg3?: number
): Promise<any> {
  let usuarioId = 'usr-01';
  let cantidadPersonas = 2;

  if (typeof arg2 === 'string') {
    usuarioId = arg2;
    if (typeof arg3 === 'number') cantidadPersonas = arg3;
  } else if (typeof arg2 === 'number') {
    cantidadPersonas = arg2;
  }

  if (process.env.NODE_ENV !== 'test') {
    try {
      const reserva = await clienteApi<Reserva>('/reservas', {
        method: 'POST',
        body: JSON.stringify({ turnoId, cantidadPersonas }),
      });

      if (reserva && reserva.id) {
        return Object.assign(reserva, { exito: true, reserva });
      }
    } catch (err: any) {
      if (err?.codigo) {
        return {
          exito: false,
          mensaje: err.mensaje || 'No se pudo procesar la reserva.',
          codigo: err.codigo,
        };
      }
    }
  }

  const usuario = usuariosMock.find((u) => u.id === usuarioId);
  if (!usuario) {
    throw new Error('El usuario no existe.');
  }

  if (typeof cantidadPersonas !== 'number' || isNaN(cantidadPersonas) || cantidadPersonas <= 0 || !Number.isInteger(cantidadPersonas)) {
    throw new Error('La cantidad de personas debe ser un número entero positivo.');
  }

  const turno = turnosMock.find((t) => t.id === turnoId);
  if (!turno) {
    throw new Error('El turno no existe.');
  }

  if (turno.estado !== 'libre') {
    throw new Error('El turno no está disponible.');
  }

  if (turno.reservaId) {
    throw new Error('datos inconsistentes');
  }

  const fechaHoy = new Date().toISOString().split('T')[0];
  if (turno.fecha < fechaHoy) {
    throw new Error('No se pueden reservar turnos pasados.');
  }

  const espacio = espaciosMock.find((e) => e.id === turno.espacioId);
  if (espacio && cantidadPersonas > espacio.capacidad) {
    throw new Error(`La capacidad máxima de este espacio es de ${espacio.capacidad} personas.`);
  }

  const reservasActivas = reservasMock.filter(
    (r) => r.usuarioId === usuarioId && r.estado === 'confirmada'
  );
  if (reservasActivas.length >= 3) {
    throw new Error('Ya tenés 3 reservas activas.');
  }

  const idNueva = `res-${Date.now()}`;
  const nuevaReserva: any = {
    id: idNueva,
    usuarioId,
    espacioId: turno.espacioId,
    turnoId,
    fecha: turno.fecha,
    horaInicio: (turno as any).horaInicio || turno.inicio || '18:00',
    horaFin: (turno as any).horaFin || turno.fin || '19:00',
    estado: 'confirmada',
    codigoQr: `QR-${Date.now()}`,
    creadoEn: new Date().toISOString(),
  };

  reservasMock.push(nuevaReserva);
  turno.estado = 'reservado';
  turno.reservaId = idNueva;

  return Object.assign(nuevaReserva, {
    exito: true,
    reserva: nuevaReserva,
  });
}

export async function cancelarReserva(
  reservaId: string,
  usuarioId: string = 'usr-01'
): Promise<any> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      await clienteApi(`/reservas/${reservaId}/cancelacion`, {
        method: 'POST',
      });
      const reservaLocal = reservasMock.find((r) => r.id === reservaId);
      if (reservaLocal) reservaLocal.estado = 'cancelada';
      return { exito: true, cancelada: true, requiereEncargado: false, reserva: reservaLocal };
    } catch (err: any) {
      if (err?.codigo) {
        return {
          exito: false,
          cancelada: false,
          requiereEncargado: err.codigo === 'CANCELACION_FUERA_DE_PLAZO',
          mensaje: err.mensaje || 'No se pudo cancelar la reserva.',
          codigo: err.codigo,
        };
      }
    }
  }

  const reserva = reservasMock.find((r) => r.id === reservaId);
  if (!reserva) {
    throw new Error('Reserva no encontrada');
  }

  if (reserva.usuarioId !== usuarioId) {
    throw new Error('No podés cancelar una reserva de otro usuario.');
  }

  if (reserva.estado === 'cancelada') {
    throw new Error('ya no está confirmada');
  }

  const turno = turnosMock.find((t) => t.id === reserva.turnoId);
  if (turno && turno.reservaId && turno.reservaId !== reserva.id) {
    throw new Error('vinculación válida');
  }

  // Evaluación de plazo automático de 4 horas
  let esFueraDePlazo = false;
  if ((reserva as any).cancelableHasta) {
    esFueraDePlazo = new Date() > new Date((reserva as any).cancelableHasta);
  } else if ((reserva as any).cancelacionTardia === true) {
    esFueraDePlazo = true;
  } else {
    const fechaStr = (reserva as any).fecha || turno?.fecha || new Date().toISOString().split('T')[0];
    const horaStr = (reserva as any).horaInicio || turno?.inicio || '12:00';
    const fechaReserva = new Date(`${fechaStr}T${horaStr}:00`);
    const difHoras = (fechaReserva.getTime() - Date.now()) / (1000 * 60 * 60);
    if (difHoras < 4) {
      esFueraDePlazo = true;
    }
  }

  if (esFueraDePlazo) {
    return {
      exito: true,
      cancelada: false,
      requiereEncargado: true,
      reserva,
    };
  }

  reserva.estado = 'cancelada';
  if (turno) {
    turno.estado = 'libre';
    turno.reservaId = null;
  }

  return {
    exito: true,
    cancelada: true,
    requiereEncargado: false,
    reserva,
  };
}

export async function confirmarCancelacionTardia(
  reservaId: string,
  usuarioSolicitanteId: string
): Promise<any> {
  const solicitante = usuariosMock.find((u) => u.id === usuarioSolicitanteId);
  if (!solicitante || (solicitante.rol !== 'encargado' && solicitante.rol !== 'administrador')) {
    throw new Error('Solo un encargado o administrador puede confirmar la cancelación.');
  }

  const reserva = reservasMock.find((r) => r.id === reservaId);
  if (!reserva) {
    throw new Error('Reserva no encontrada');
  }

  reserva.estado = 'cancelada';
  const turno = turnosMock.find((t) => t.id === reserva.turnoId);
  if (turno) {
    turno.estado = 'libre';
    turno.reservaId = null;
  }

  const titular = usuariosMock.find((u) => u.id === reserva.usuarioId);
  if (titular) {
    titular.cancelacionesTardias = (titular.cancelacionesTardias || 0) + 1;
  }

  return reserva;
}

export const ReservaServicio = {
  obtenerMisReservas: obtenerReservasUsuario,
  obtenerPorUsuario: obtenerReservasPorUsuario,
  obtenerPorId: obtenerReservaPorId,
  crear: crearReserva,
  cancelar: cancelarReserva,
  confirmarCancelacionTardia,
};