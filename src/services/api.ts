import axios from 'axios';
import { Propietario, Propiedad, Cliente, Interes, ApiResponse } from '../types';

// 1. Configuramos la URL base (Tu backend)
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

export const createPropiedad = async (datos: Omit<Propiedad, 'id'>) => {
  const { data } = await api.post<ApiResponse<Propiedad>>('/propiedades', datos);
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

export default api;