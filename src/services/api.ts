import axios from 'axios';
import { 
  Propietario, 
  Propiedad, 
  Interes, 
  Operacion, 
  Visita, 
  Seguimiento, 
  ApiResponse
} from '../types';

// Configuración Base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://sillar-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor (Token)
api.interceptors.request.use((config: any) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
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

export const getInteresados = async () => { 
  const { data } = await api.get('/clientes');
  return data;
};
export const createInteresado = async (datos: any) => { 
  const { data } = await api.post('/clientes', datos);
  return data;
};
export const updateInteresado = async (id: number, datos: any) => {
    const { data } = await api.put(`/clientes/${id}`, datos);
    return data;
};
export const deleteInteresado = async (id: number) => { 
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
};

// ALIAS DE COMPATIBILIDAD
export const getClientes = getInteresados;
export const createCliente = createInteresado;
export const updateCliente = updateInteresado; 
export const deleteCliente = deleteInteresado; 
export const eliminarCliente = deleteInteresado; 

// BUSCADOR INTELIGENTE
export const buscarInteresadoPorNombre = async (query: string) => {
    if (!query) return [];
    const { data } = await api.get(`/cartera/buscar?query=${query}`);
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
export const updateVisita = async (id: string, datos: any) => {
  const { data } = await api.put(`/visitas/${id}`, datos);
  return data;
};
export const cancelVisita = async (id: string, motivo: string) => {
  const { data } = await api.put(`/visitas/${id}/cancelar`, { motivo });
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
export const updateSeguimiento = async (id: string, datos: any) => {
  const { data } = await api.put<ApiResponse<Seguimiento>>(`/seguimientos/${id}`, datos);
  return data;
};

// --- REQUERIMIENTOS ---
export const getRequerimientos = async () => {
  const { data } = await api.get('/requerimientos');
  return data;
};
export const createRequerimiento = async (data: any) => {
  const response = await api.post('/requerimientos', data);
  return response.data;
};
export const updateEstadoRequerimiento = async (id: string, estado: string) => {
  const response = await api.put(`/requerimientos/${id}`, { estado });
  return response.data;
};

// SEGURIDAD Y USUARIOS
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

// --- AGENTES ---
export const getAgentes = async () => {
    const res = await api.get('/agentes');
    return res.data;
};
export const createAgente = async (data: any) => {
    const res = await api.post('/agentes', data);
    return res.data;
};
export const importarAgentesMasivo = async (listaAgentes: any[]) => {
    const res = await api.post('/agentes/masiva', listaAgentes);
    return res.data;
};
export const toggleEstadoAgente = async (id: string) => {
    const res = await api.put(`/agentes/${id}/estado`);
    return res.data;
};
export const deleteAgente = async (id: string) => {
    const res = await api.delete(`/agentes/${id}`);
    return res.data;
};

// --- CAPTACIONES ---
export const getCaptaciones = async () => {
    const res = await api.get('/captaciones');
    return res.data;
};
export const createCaptacion = async (data: any) => {
    const res = await api.post('/captaciones', data);
    return res.data;
};
export const updateCaptacion = async (id: string, data: any) => {
    const res = await api.put(`/captaciones/${id}`, data);
    return res.data;
};
export const importarCaptacionesMasivo = async (data: any[]) => {
    const res = await api.post('/captaciones/masiva', data);
    return res.data;
};
export const deleteCaptacion = async (id: string) => {
    const res = await api.delete(`/captaciones/${id}`);
    return res.data;
};

// --- CIERRES (VENTAS/ALQUILERES) ---
export const createCierre = async (data: any) => {
    const res = await api.post('/cierres', data);
    return res.data;
};

export const getCierres = async () => {
    const res = await api.get('/cierres');
    return res.data;
};

// --- CARTERA DE CLIENTES (Formales) ---
export const getCartera = async () => {
    const response = await api.get('/cartera');
    return response.data;
};

export const createClienteCartera = async (data: any) => {
    const response = await api.post('/cartera', data);
    return response.data;
};

export const deleteClienteCartera = async (id: number) => {
    const response = await api.delete(`/cartera/${id}`);
    return response.data;
};

export default api;