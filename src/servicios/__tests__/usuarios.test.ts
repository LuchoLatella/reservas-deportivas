import { usuariosMock } from '../../mocks/usuarios';
import {
    obtenerUsuarioPorEmail,
    obtenerUsuarioPorId,
    obtenerUsuarios,
} from '../usuarios';

const usuariosIniciales = usuariosMock.map((usuario) => ({
  ...usuario,
  espaciosFavoritos: [...usuario.espaciosFavoritos],
}));

beforeEach(() => {
  usuariosMock.splice(
    0,
    usuariosMock.length,
    ...usuariosIniciales.map((usuario) => ({
      ...usuario,
      espaciosFavoritos: [...usuario.espaciosFavoritos],
    })),
  );
});

describe('Servicio de usuarios', () => {
  it('obtiene el listado completo de usuarios de prueba', async () => {
    const usuarios = await obtenerUsuarios();
    expect(usuarios.length).toBeGreaterThan(0);
  });

  it('obtiene un usuario existente por su ID', async () => {
    const usuario = await obtenerUsuarioPorId('usr-01');
    expect(usuario).not.toBeNull();
    expect(usuario?.id).toBe('usr-01');
  });

  it('devuelve null al buscar un ID de usuario inexistente', async () => {
    const usuario = await obtenerUsuarioPorId('usr-inexistente');
    expect(usuario).toBeNull();
  });

  it('obtiene un usuario por su email sin importar mayúsculas/minúsculas o espacios', async () => {
    const usuarioBase = usuariosMock[0];
    const emailConEspaciosYMayusculas = `  ${usuarioBase.email.toUpperCase()}  `;

    const usuario = await obtenerUsuarioPorEmail(emailConEspaciosYMayusculas);
    expect(usuario).not.toBeNull();
    expect(usuario?.id).toBe(usuarioBase.id);
  });

  it('devuelve null al buscar un email no registrado', async () => {
    const usuario = await obtenerUsuarioPorEmail('noexiste@ejemplo.com');
    expect(usuario).toBeNull();
  });
});