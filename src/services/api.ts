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
  baseURL: 'http://localhost:4000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor (Token)
api.interceptors.request.use((config: any) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

//            FUNCIONES DE DATOS

// --- PROPIETARIOS ---
export const getPropietarios = async () => {
  const { data } = await api.get<Propietario[]>('/propietarios');
  return data;
};

export const createPropietario = async (datos: Omit<Propietario, 'id'>) => {
  const { data } = await api.post<ApiResponse<Propietario>>('/propietarios', datos);
  return data;
};

export const toggleEstadoPropietario = async (id: string, activo: boolean) => {
  const { data } = await api.put(`/propietarios/${id}/estado`, { activo });
  return data;
};
export const eliminarPropietario = async (id: string) => {
  const { data } = await api.delete(`/propietarios/${id}`);
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

export const getPropiedad = async (id: string) => {
    const { data } = await api.get(`/propiedades/${id}`);
    return data;
};

export const toggleEstadoPropiedad = async (id: string, activo: boolean) => {
  const { data } = await api.put(`/propiedades/${id}/estado`, { activo });
  return data;
};
export const eliminarPropiedad = async (id: string) => {
  const { data } = await api.delete(`/propiedades/${id}`);
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

export const toggleEstadoCliente = async (id: string, activo: boolean) => {
  const { data } = await api.put(`/clientes/${id}/estado`, { activo });
  return data;
};
export const eliminarCliente = async (id: string) => {
  const { data } = await api.delete(`/clientes/${id}`);
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

// Función para actualizar seguimiento (usado para cambiar estado)
export const updateSeguimiento = async (id: string, datos: any) => {
  const { data } = await api.put<ApiResponse<Seguimiento>>(`/seguimientos/${id}`, datos);
  return data;
};

//          SEGURIDAD Y USUARIOS

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

export const toggleEstadoUsuario = async (id: string, activo: boolean, motivo?: string) => {
  const response = await api.put(`/usuarios/${id}/estado`, { activo, motivo });
  return response.data;
};

export const deleteUsuario = async (id: string) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};

export const getNotificaciones = async () => {
  const response = await api.get('/usuarios/notificaciones');
  return response.data;
};

export const getCumpleanos = (mes: number) => {
  return api.get(`/admin/cumpleanos?mes=${mes}`);
};

export const downloadExcelCumpleanos = (mes: number) => {
  return api.get(`/admin/cumpleanos/excel?mes=${mes}`, {
    responseType: 'blob',
  });
};

export default api;