import { create } from 'zustand';
import { Propietario, Propiedad, Cliente, Interes } from '../types';
import { getPropietarios, getPropiedades, getClientes, getIntereses } from '../services/api';

interface InmobiliariaState {
  // 1. Datos (El Estado)
  propietarios: Propietario[];
  propiedades: Propiedad[];
  clientes: Cliente[];
  intereses: Interes[];
  loading: boolean;

  // 2. Acciones (Funciones para llenar los datos)
  fetchPropietarios: () => Promise<void>;
  fetchPropiedades: () => Promise<void>;
  fetchClientes: () => Promise<void>;
  fetchIntereses: () => Promise<void>;
}

export const useInmobiliariaStore = create<InmobiliariaState>((set) => ({
  // Estado inicial (vacío)
  propietarios: [],
  propiedades: [],
  clientes: [],
  intereses: [],
  loading: false,

  // Acciones
  fetchPropietarios: async () => {
    set({ loading: true });
    try {
      const data = await getPropietarios();
      set({ propietarios: data });
    } catch (error) {
      console.error('Error cargando propietarios', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchPropiedades: async () => {
    set({ loading: true });
    try {
      const data = await getPropiedades();
      set({ propiedades: data });
    } catch (error) {
      console.error('Error cargando propiedades', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchClientes: async () => {
      const data = await getClientes();
      set({ clientes: data });
  },

  fetchIntereses: async () => {
      const data = await getIntereses();
      set({ intereses: data });
  }
}));