import axios from 'axios';
import { 
  Propietario, 
  Propiedad, 
  Cliente, 
  Interes, 
  Operacion, 
  Visita, 
  Seguimiento, 
  ApiResponse,
  AuthResponse
} from '../types';

// 1. Configuración Base
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Asegúrate de que coincida con tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor Mágico (Para que funcione el Login y Crear Usuario)
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
//            FUNCIONES DE DATOS
// ==========================================

// --- PROPIETARIOS ---
export const getPropietarios = async () => {
  const { data } = await api.get<Propietario[]>('/propietarios');
  return data;
};

export const createPropietario = async (datos: Omit<Propietario, 'id'>) => {
  const { data } = await api.post<ApiResponse<Propietario>>('/propietarios', datos);
  return data;
};

// --- PROPIEDADES ---
export const getPropiedades = async () => {
  const { data } = await api.get<Propiedad[]>('/propiedades');
  return data;
};

export const createPropiedad = async (datos: FormData) => {
  const { data } = await api.post<ApiResponse<Propiedad>>('/propiedades', datos, {
    headers: { 'Content-Type': 'multipart/form-data' } 
  });
  return data;
};

// --- CLIENTES ---
export const getClientes = async () => {
  const { data } = await api.get<Cliente[]>('/clientes');
  return data;
};

export const createCliente = async (datos: Omit<Cliente, 'id'>) => {
  const { data } = await api.post<ApiResponse<Cliente>>('/clientes', datos);
  return data;
};

// --- INTERESES ---
export const getIntereses = async () => {
  const { data } = await api.get<Interes[]>('/intereses');
  return data;
};

export const createInteres = async (datos: { clienteId: string; propiedadId: string; nota?: string }) => {
  const { data } = await api.post<ApiResponse<Interes>>('/intereses', datos);
  return data;
};

// --- OPERACIONES --- 
export const getOperaciones = async () => {
  const { data } = await api.get<Operacion[]>('/operaciones');
  return data;
};

export const createOperacion = async (datos: any) => {
  const { data } = await api.post<ApiResponse<Operacion>>('/operaciones', datos);
  return data;
};

// --- VISITAS ---
export const getVisitas = async () => {
  const { data } = await api.get<Visita[]>('/visitas');
  return data;
};

export const createVisita = async (datos: any) => {
  const { data } = await api.post<ApiResponse<Visita>>('/visitas', datos);
  return data;
};

// --- SEGUIMIENTO ---
export const getSeguimientos = async () => {
  const { data } = await api.get<Seguimiento[]>('/seguimientos');
  return data;
};

export const createSeguimiento = async (datos: any) => {
  const { data } = await api.post<ApiResponse<Seguimiento>>('/seguimientos', datos);
  return data;
};

// ==========================================
//           SEGURIDAD Y USUARIOS
// ==========================================

export const login = async (credenciales: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credenciales);
  return response.data;
};

export const cambiarPassword = async (datos: { userId: string; nuevaPassword: string }) => {
  const response = await api.post('/auth/cambiar-password', datos);
  return response.data;
};

export const createUsuario = async (datos: { nombre: string; email: string; rol: string }) => {
  const response = await api.post('/usuarios', datos); 
  return response.data;
};

export const fetchUsuarios = async () => {
  const response = await api.get('/usuarios');
  return response.data;
};

export default api;