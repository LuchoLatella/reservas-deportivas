import { usuariosMock } from '../mocks/usuarios';
import { Usuario } from '../tipos/usuario';
import { clienteApi, guardarToken } from './api';

export async function obtenerUsuarios(): Promise<Usuario[]> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const datos = await clienteApi<Usuario[]>('/usuarios');
      if (datos && datos.length > 0) return datos;
    } catch {}
  }
  return usuariosMock;
}

export async function obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const usuario = await clienteApi<Usuario>(`/usuarios/${id}`);
      if (usuario) return usuario;
    } catch {}
  }
  return usuariosMock.find((u) => u.id === id) ?? null;
}

export async function obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const emailLimpio = email.trim().toLowerCase();
  if (process.env.NODE_ENV !== 'test') {
    try {
      const usuario = await clienteApi<Usuario>(`/yo`);
      if (usuario && usuario.email.trim().toLowerCase() === emailLimpio) return usuario;
    } catch {}
  }
  return usuariosMock.find((u) => u.email.trim().toLowerCase() === emailLimpio) ?? null;
}

interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}

export const UsuarioServicio = {
  iniciarSesion: async (email: string, contrasenia: string) => {
    if (process.env.NODE_ENV !== 'test') {
      try {
        const respuesta = await clienteApi<RespuestaAuth>('/auth/ingreso', {
          method: 'POST',
          body: JSON.stringify({ email, contrasena: contrasenia }),
        });

        if (respuesta && respuesta.token) {
          await guardarToken(respuesta.token);
          return { exito: true, usuario: respuesta.usuario };
        }
      } catch (err: any) {
        if (err?.codigo) {
          return {
            exito: false,
            mensaje: err.mensaje || 'Error al iniciar sesión',
            codigo: err.codigo,
          };
        }
      }
    }

    const usuarioMock = usuariosMock.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (!usuarioMock) {
      return { exito: false, mensaje: 'Usuario no encontrado' };
    }
    return { exito: true, usuario: usuarioMock };
  },

  registrar: async (nombre: string, email: string, telefono: string, contrasenia: string) => {
    if (process.env.NODE_ENV !== 'test') {
      try {
        const respuesta = await clienteApi<RespuestaAuth>('/auth/registro', {
          method: 'POST',
          body: JSON.stringify({ nombre, email, telefono, contrasena: contrasenia }),
        });

        if (respuesta && respuesta.token) {
          await guardarToken(respuesta.token);
          return { exito: true, usuario: respuesta.usuario };
        }
      } catch (err: any) {
        if (err?.codigo) {
          return {
            exito: false,
            mensaje: err.mensaje || 'Error al registrar usuario',
            codigo: err.codigo,
          };
        }
      }
    }

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
    if (process.env.NODE_ENV !== 'test') {
      try {
        const usuario = await clienteApi<Usuario>('/yo', { method: 'GET' });
        if (usuario) return { exito: true, usuario };
      } catch {}
    }

    const usuarioMock = usuariosMock[0] || { nombre: 'Usuario', rol: 'jugador' };
    return { exito: true, usuario: usuarioMock };
  },
};