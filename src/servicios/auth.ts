import { clienteApi, guardarToken } from './api';

export interface DatosRegistro {
  nombre: string;
  email: string;
  contrasena: string;
  telefono?: string;
}

export interface RespuestaAuth {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
}

export async function registrarUsuario(datos: DatosRegistro): Promise<RespuestaAuth> {
  const respuesta = await clienteApi<RespuestaAuth>('/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datos),
  });

  if (respuesta.token) {
    await guardarToken(respuesta.token);
  }

  return respuesta;
}