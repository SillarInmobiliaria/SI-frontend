import { create } from 'zustand';
import { 
  Propietario, 
  Propiedad, 
  Cliente, 
  Interes, 
  Operacion, 
  Visita, 
  Seguimiento
} from '../types';
import { 
  getPropietarios, 
  getPropiedades, 
  getClientes, 
  getIntereses,
  getOperaciones, 
  getVisitas, 
  getSeguimientos
} from '../services/api';

interface InmobiliariaState {
  propietarios: Propietario[];
  propiedades: Propiedad[];
  clientes: Cliente[];
  intereses: Interes[];
  operaciones: Operacion[];
  visitas: Visita[];
  seguimientos: Seguimiento[];
  loading: boolean;
  error: string | null;

  fetchPropietarios: () => Promise<void>;
  fetchPropiedades: () => Promise<void>;
  fetchClientes: () => Promise<void>;
  fetchIntereses: () => Promise<void>;
  fetchOperaciones: () => Promise<void>;
  fetchVisitas: () => Promise<void>;
  fetchSeguimientos: () => Promise<void>;
}

export const useInmobiliariaStore = create<InmobiliariaState>((set) => ({
  propietarios: [],
  propiedades: [],
  clientes: [],
  intereses: [],
  operaciones: [],
  visitas: [],
  seguimientos: [],
  loading: false,
  error: null,

  fetchPropietarios: async () => {
    set({ loading: true });
    try {
      const data = await getPropietarios();
      set({ propietarios: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  fetchPropiedades: async () => {
    set({ loading: true });
    try {
      const data = await getPropiedades();
      set({ propiedades: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  fetchClientes: async () => {
    set({ loading: true });
    try {
      const data = await getClientes();
      set({ clientes: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  fetchIntereses: async () => {
    set({ loading: true });
    try {
      const data = await getIntereses();
      set({ intereses: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  fetchOperaciones: async () => {
    set({ loading: true });
    try {
      const data = await getOperaciones();
      set({ operaciones: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  fetchVisitas: async () => {
    set({ loading: true });
    try {
      const data = await getVisitas();
      set({ visitas: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  fetchSeguimientos: async () => {
    set({ loading: true });
    try {
      const data = await getSeguimientos();
      set({ seguimientos: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));