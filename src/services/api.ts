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

// Configuramos la URL base
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// 👇 ESTA ES LA FUNCIÓN IMPORTANTE PARA SUBIR FOTOS
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

// --- OPERACIONES (GESTIÓN) --- 
export const getOperaciones = async () => {
  const { data } = await api.get<Operacion[]>('/operaciones');
  return data;
};

export const createOperacion = async (datos: any) => {
  const { data } = await api.post<ApiResponse<Operacion>>('/operaciones', datos);
  return data;
};

// --- VISITAS FÍSICAS ---
export const getVisitas = async () => {
  const { data } = await api.get<Visita[]>('/visitas');
  return data;
};

export const createVisita = async (datos: any) => {
  const { data } = await api.post<ApiResponse<Visita>>('/visitas', datos);
  return data;
};

// --- SEGUIMIENTO (COMUNICACIÓN) ---
export const getSeguimientos = async () => {
  const { data } = await api.get<Seguimiento[]>('/seguimientos');
  return data;
};

export const createSeguimiento = async (datos: any) => {
  const { data } = await api.post<ApiResponse<Seguimiento>>('/seguimientos', datos);
  return data;
};

// --- AUTENTICACIÓN (LOGIN/REGISTRO) ---
export const loginUser = async (credentials: { email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
};

export const registerUser = async (credentials: { nombre: string; email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/registro', credentials);
  return data;
};

export default api;