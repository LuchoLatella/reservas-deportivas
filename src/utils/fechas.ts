/**
 * nos devuelve una fecha relativa a hoy en el formato AAAA-MM-DD.
 *
 * por ejemplos:
 * obtenerFechaRelativa(0)  -> hoy
 * obtenerFechaRelativa(1)  -> mañana
 * obtenerFechaRelativa(6)  -> dentro de seis días
 */
export function obtenerFechaRelativa(
  diasDesdeHoy: number = 0,
): string {
  const hoy = new Date();

  const fecha = new Date(
    Date.UTC(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() + diasDesdeHoy,
    ),
  );

  const anio = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getUTCDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

/**
 * Devuelve el día de la semana de una fecha.
 * Domingo = 0, lunes = 1, ..., sábado = 6.
 */
export function obtenerDiaSemana(fecha: string): number {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}