/**
 * Sólo usuarios de prueba, no autenticación real. No se debe usar en producción.
 */

import { usuariosMock } from '../mocks/usuarios';
import { Usuario } from '../tipos/usuario';

export async function obtenerUsuarios(): Promise<Usuario[]> {
  return usuariosMock;
}

export async function obtenerUsuarioPorId(
  id: string,
): Promise<Usuario | null> {
  return (
    usuariosMock.find(
      (usuario) => usuario.id === id,
    ) ?? null
  );
}

export async function obtenerUsuarioPorEmail(
  email: string,
): Promise<Usuario | null> {
  const emailNormalizado = email.trim().toLowerCase();

  return (
    usuariosMock.find(
      (usuario) =>
        usuario.email.toLowerCase() === emailNormalizado,
    ) ?? null
  );
}