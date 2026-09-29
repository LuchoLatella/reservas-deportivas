import { Usuario } from '../tipos/usuario';

export const usuariosMock: Usuario[] = [
  {
    id: 'usr-01',
    nombre: 'Luciano',
    email: 'luciano@example.com',
    telefono: '3430000000',
    rol: 'jugador',
    espaciosFavoritos: ['esp-01', 'esp-09'],
    cancelacionesTardias: 0,
    ausencias: 0,
  },
  {
    id: 'usr-02',
    nombre: 'María Encargada',
    email: 'encargada@example.com',
    telefono: '3430000001',
    rol: 'encargado',
    espaciosFavoritos: [],
    cancelacionesTardias: 1,
    ausencias: 0,
  },
  {
    id: 'usr-03',
    nombre: 'Administrador',
    email: 'admin@example.com',
    telefono: '3430000002',
    rol: 'administrador',
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  },
];