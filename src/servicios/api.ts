import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/env';

const TOKEN_KEY = 'auth_token';

const clienteAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function guardarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function obtenerToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function eliminarToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function asegurarAutenticacionDemo(): Promise<string | null> {
  let token = await obtenerToken();
  if (token) return token;

  try {
    const respuesta = await clienteAxios.post('/auth/ingreso', {
      email: 'emiliano@mail.com',
      contrasena: 'villaguay2026',
    });

    const json = respuesta.data;
    if (json.datos?.token) {
      await guardarToken(json.datos.token);
      return json.datos.token;
    }
  } catch (e) {
    console.log('Error de autenticación demo con Axios:', e);
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
  let token = await obtenerToken();
  if (!token) {
    token = await asegurarAutenticacionDemo();
  }

  const headers: Record<string, string> = {
    ...(opciones.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const respuesta = await clienteAxios.request<RespuestaApi<T>>({
      url: endpoint,
      method: (opciones.method || 'GET') as any,
      data: opciones.body ? JSON.parse(opciones.body as string) : undefined,
      headers,
    });

    if (respuesta.status === 204) {
      return {} as T;
    }

    return respuesta.data.datos as T;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    
    throw {
      codigo: 'ERROR_CONEXION',
      mensaje: error.message || 'Error de comunicación con el servidor',
    };
  }
}