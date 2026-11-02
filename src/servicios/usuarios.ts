/**
 * Sólo usuarios de prueba, no autenticación real. No se debe usar en producción.

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
 */
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import * as SQLite from "expo-sqlite";
import { Usuario, RolUsuario } from "../tipos/usuario";
import { usuariosMock } from "../mocks/usuarios"; // Asegúrate de tener tus datos falsos aquí

const TOKEN_KEY = "auth_token_reservas_deportivas";
const USER_SESSION_KEY = "user_session_data";

// Interfaces internas para las respuestas del servicio autónomo
interface AuthResponse {
  datos: {
    usuario: Usuario;
    token: string;
  };
}

interface ErrorResponse {
  error: {
    codigo: string;
    mensaje: string;
  };
}

/**
 * Servicio de Usuarios y Seguridad - Integrante 3
 */
export const UsuarioServicio = {
  /**
   * Inicializa la base de datos local SQLite para soporte offline coordinado
   */
  async inicializarBaseDatosLocal(): Promise<void> {
    try {
      const db = await SQLite.openDatabaseAsync("reservas_offline.db");
      // Crear tabla de perfil de usuario para persistencia offline
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS usuario_perfil (
          id TEXT PRIMARY KEY NOT NULL,
          nombre TEXT NOT NULL,
          email TEXT NOT NULL,
          telefono TEXT NOT NULL,
          rol TEXT NOT NULL,
          espaciosFavoritos TEXT NOT NULL,
          cancelacionesTardias INTEGER NOT NULL,
          ausencias INTEGER NOT NULL
        );
      `);
    } catch (error) {
      console.error("Error al inicializar SQLite:", error);
      throw new Error(
        "No se pudo inicializar el almacenamiento local offline.",
      );
    }
  },

  /**
   * Registro de un nuevo usuario
   */
  async registrar(
    nombre: string,
    email: string,
    telefono: string,
    contrasenia: string,
  ): Promise<Usuario> {
    // Simulación asíncrona contra mocks (reemplazar por fetch a la API de la cátedra posteriormente)
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const existe = usuariosMock.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (existe) {
          return reject({
            error: {
              codigo: "EMAIL_DUPLICADO",
              mensaje: "El correo electrónico ya se encuentra registrado.",
            },
          });
        }

        const nuevoUsuario: Usuario = {
          id: `usr-${Math.floor(Math.random() * 1000)}`, // ID tipo string como pide la convención
          nombre,
          email,
          telefono,
          rol: "jugador", // Rol inicial por defecto
          espaciosFavoritos: [],
          cancelacionesTardias: 0,
          ausencias: 0,
        };

        // Guardar copia local offline en SQLite
        await this.guardarPerfilEnSQLite(nuevoUsuario);
        resolve(nuevoUsuario);
      }, 800);
    });
  },

  /**
   * Inicio de sesión clásico por Email y Contraseña
   */
  async iniciarSesion(
    email: string,
    contrasenia: string,
  ): Promise<{ usuario: Usuario; token: string }> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // Validación simulada usando los mocks existentes
        const usuario = usuariosMock.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );

        if (!usuario) {
          return reject({
            error: {
              codigo: "CREDENCIALES_INVALIDAS",
              mensaje: "El usuario o la contraseña son incorrectos.",
            },
          });
        }

        // Simulación de Token JWT firmado por el backend
        const tokenFake = `mock-jwt-token-bearer-${usuario.id}-${Date.now()}`;

        // PERSISTENCIA EXPO-SECURE-STORE: El token va aquí estrictamente sin excepción
        await SecureStore.setItemAsync(TOKEN_KEY, tokenFake);
        await SecureStore.setItemAsync(
          USER_SESSION_KEY,
          JSON.stringify(usuario),
        );

        // Sincronizar tabla local SQLite para uso sin conectividad
        await this.guardarPerfilEnSQLite(usuario);

        resolve({ usuario, token: tokenFake });
      }, 800);
    });
  },

  /**
   * Reingreso Biométrico (Huella dactilar / FaceID) con alternativa si no está disponible
   */
  async autenticarBiometria(): Promise<{
    usuario: Usuario;
    token: string;
  } | null> {
    try {
      // Verificar si el dispositivo cuenta con hardware biométrico y está configurado
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const registrado = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !registrado) {
        throw new Error(
          "La autenticación biométrica no está disponible o configurada en este dispositivo.",
        );
      }

      // Ejecutar el prompt nativo de autenticación
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Ingresa con tu huella o reconocimiento facial",
        cancelLabel: "Usar contraseña alternativa",
        disableDeviceFallback: false, // Permite usar el PIN/Patrón del sistema operativo como alternativa
      });

      if (resultado.success) {
        // Recuperar sesión guardada de manera segura
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const usuarioJson = await SecureStore.getItemAsync(USER_SESSION_KEY);

        if (token && usuarioJson) {
          const usuario: Usuario = JSON.parse(usuarioJson);
          return { usuario, token };
        }
      }
      return null;
    } catch (error) {
      console.warn("Fallo o indisponibilidad biométrica:", error);
      return null; // El flujo alternativo redirige al formulario clásico de contraseña
    }
  },

  /**
   * Obtiene el token actual para inyectarlo en la cabecera Authorization: Bearer <token>
   */
  async obtenerTokenDeSesion(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  /**
   * Cierre de sesión y limpieza completa de persistencias
   */
  async cerrarSesion(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_SESSION_KEY);

    // Limpiar SQLite local
    const db = await SQLite.openDatabaseAsync("reservas_offline.db");
    await db.runAsync("DELETE FROM usuario_perfil;");
  },

  /**
   * Obtiene los datos del perfil almacenados localmente si no hay conexión a internet
   */
  async obtenerPerfilOffline(): Promise<Usuario | null> {
    try {
      const db = await SQLite.openDatabaseAsync("reservas_offline.db");
      const fila: any = await db.getFirstAsync(
        "SELECT * FROM usuario_perfil LIMIT 1;",
      );

      if (!fila) return null;

      return {
        id: fila.id,
        nombre: fila.nombre,
        email: fila.email,
        telefono: fila.telefono,
        rol: fila.rol as RolUsuario,
        espaciosFavoritos: JSON.parse(fila.espaciosFavoritos),
        cancelacionesTardias: fila.cancelacionesTardias,
        ausencias: fila.ausencias,
      };
    } catch (error) {
      console.error("Error leyendo perfil offline:", error);
      return null;
    }
  },

  /**
   * Helper privado para guardar los datos en SQLite
   */
  async guardarPerfilEnSQLite(usuario: Usuario): Promise<void> {
    try {
      const db = await SQLite.openDatabaseAsync("reservas_offline.db");
      await db.runAsync("DELETE FROM usuario_perfil;"); // Mantener un solo perfil activo localmente
      await db.runAsync(
        `INSERT INTO usuario_perfil (id, nombre, email, telefono, rol, espaciosFavoritos, cancelacionesTardias, ausencias) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          usuario.id,
          usuario.nombre,
          usuario.email,
          usuario.telefono,
          usuario.rol,
          JSON.stringify(usuario.espaciosFavoritos),
          usuario.cancelacionesTardias,
          usuario.ausencias,
        ],
      );
    } catch (error) {
      console.error("Error escribiendo en SQLite:", error);
    }
  },
};
 