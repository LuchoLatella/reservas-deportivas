import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/env';

const TOKEN_KEY = 'auth_token';

export async function guardarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function obtenerToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function eliminarToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Autentica automáticamente contra la API con el usuario de prueba del PRD si no hay token guardado
export async function asegurarAutenticacionDemo(): Promise<string | null> {
  let token = await obtenerToken();
  if (token) return token;

  try {
    const respuesta = await fetch(`${API_BASE_URL}/auth/ingreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'emiliano@mail.com',
        contrasena: 'villaguay2026',
      }),
    });

    const json = await respuesta.json();
    if (json.datos?.token) {
      await guardarToken(json.datos.token);
      return json.datos.token;
    }
  } catch (e) {
    console.log('No se pudo autenticar automáticamente con la API:', e);
  }
  return null;
}

interface RespuestaApi<T> {
  datos?: T;
  meta?: any;
  error?: {
    codigo: string;
    mensaje: string;
  };
}

export async function clienteApi<T>(
  endpoint: string,
  opciones: RequestInit = {}
): Promise<T> {
  // Asegurar que exista un token válido antes de enviar la petición a la API
  let token = await obtenerToken();
  if (!token) {
    token = await asegurarAutenticacionDemo();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opciones.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...opciones,
    headers,
  });

  // Manejo de DELETE exitoso (204 No Content)
  if (respuesta.status === 204) {
    return {} as T;
  }

  const json: RespuestaApi<T> = await respuesta.json();

  if (!respuesta.ok || json.error) {
    const errorDetalle = json.error || {
      codigo: 'ERROR_DESCONOCIDO',
      mensaje: 'Ocurrió un error inesperado',
    };
    throw errorDetalle;
  }

  return json.datos as T;
}