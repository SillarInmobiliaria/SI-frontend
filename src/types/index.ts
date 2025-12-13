// Definición de Propietario
export interface Propietario {
  usuarioId: any;
  activo: any;
  id: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  email?: string;
  celular1: string;
  celular2?: string;
  asesor?: string;
  fechaAlta?: string;
  detalles?: string;
  banco?: string;
  cuenta?: string;
  cci?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Definición de Propiedad
export interface Propiedad {
  id: string;
  titulo?: string;
  direccion: string;
  ubicacion: string;
  precio: number;
  moneda: string;
  tipo: string;
  modalidad: string;
  descripcion: string;
  area: number;
  areaConstruida: number;
  habitaciones: number;
  banos: number;
  cocheras: number;
  Propietarios?: Propietario[]; 
  distribucion?: string; 
  asesor?: string;       
  mapaUrl?: string;
  videoUrl?: string;
  fotoPrincipal?: string;
  galeria?: string[];
  pdfUrl?: string;
  
  // -- LEGAL --
  partidaRegistral?: string;
  numeroPartida?: string;
  partidaEstacionamiento?: string;
  partidaDeposito?: string;
  
  fechaInicioContrato?: string;
  fechaVencimientoContrato?: string;
  fechaCaptacion?: string;
  comision?: string;
  tipoContrato?: string;
  
  // -- CHECKS --
  testimonio?: boolean;
  hr?: boolean;
  pu?: boolean;
  impuestoPredial?: boolean;
  arbitrios?: boolean;
  copiaLiteral?: boolean;
  
  plataforma?: string[]; 
  
  // -- AUDITORÍA --
  observaciones?: any;

  [key: string]: any; 
}

// Definición de Cliente
export interface Cliente {
  activo: any;
  usuarioId: any;
  id: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  email?: string;
  telefono1?: string;
  telefono2?: string;
  estadoCivil?: string;
  ocupacion?: string;
  fechaAlta?: string;
}

// Definición de Interés
export interface Interes {
  id: string;
  estado: string;
  nota?: string;
  clienteId: string;
  propiedadId: string;
  Cliente?: Cliente;
  Propiedad?: Propiedad;
  createdAt?: string;
  updatedAt?: string;
}

// Definición de Operación
export interface Operacion {
  id: string;
  tipoGestion: string;
  estado: string;
  fechaOperacion: string;
  fechaContrato: string;
  precioFinal: number;
  honorarios: number;
  asesor: string;
  propiedadId: string;
  clienteId?: string;
  Propiedad?: Propiedad;
  Cliente?: Cliente;
}

// Definición de Visita
export interface Visita {
  id: string;
  asesor: string;
  fecha: string;
  hora: string;
  resultado: string;
  comentario?: string;
  clienteId: string;
  propiedadId: string;
  Cliente?: Cliente;
  Propiedad?: Propiedad;
}

// Definición de Seguimiento
export interface Seguimiento {
  id: string;
  tipoAccion: string;
  fecha: string;
  respuesta: string;
  clienteId: string;
  propiedadId: string;
  Cliente?: Cliente;
  Propiedad?: Propiedad;
}

// Definición de Usuario (Actualizada para el Dashboard)
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo?: boolean;
  mustChangePassword?: boolean;
  createdAt?: string;
  motivoSuspension?: string;
}

// Respuestas de API
export interface ApiResponse<T> {
  id: string;
  message: string;
  data: T;
  error?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  usuario: Usuario;
}