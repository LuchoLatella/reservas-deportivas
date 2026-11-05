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
  const token = await obtenerToken();

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