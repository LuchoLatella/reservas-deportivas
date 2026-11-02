import { usuariosMock } from '../mocks/usuarios';
import { Usuario } from '../tipos/usuario';

export async function obtenerUsuarios(): Promise<Usuario[]> {
  return usuariosMock;
}

export async function obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
  return usuariosMock.find((u) => u.id === id) ?? null;
}

export async function obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const emailLimpio = email.trim().toLowerCase();
  return usuariosMock.find((u) => u.email.trim().toLowerCase() === emailLimpio) ?? null;
}

export const UsuarioServicio = {
  iniciarSesion: async (email: string, contrasenia: string) => {
    const usuario = await obtenerUsuarioPorEmail(email);
    if (!usuario) {
      return { exito: false, mensaje: 'Usuario no encontrado' };
    }
    return { exito: true, usuario };
  },
  registrar: async (nombre: string, email: string, telefono: string, contrasenia: string) => {
    const nuevoUsuario: Usuario = {
      id: `usr-${Date.now()}`,
      nombre,
      email,
      telefono,
      rol: 'jugador',
      espaciosFavoritos: [],
      cancelacionesTardias: 0,
      ausencias: 0,
    };
    usuariosMock.push(nuevoUsuario);
    return { exito: true, usuario: nuevoUsuario };
  },
  autenticarBiometria: async () => {
    const usuario = usuariosMock[0] || { nombre: 'Usuario', rol: 'jugador' };
    return { exito: true, usuario };
  },
};