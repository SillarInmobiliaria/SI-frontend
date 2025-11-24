// Definición de Propietario
export interface Propietario {
  id: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  createdAt?: string;
  updatedAt?: string;
}

// Definición de Propiedad
export interface Propiedad {
  id: string;
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
  propietarioId: string;
  distribucion?: string;
  asesor?: string;
  mapaUrl?: string;
  videoUrl?: string;
  fotoPrincipal?: string;
  galeria?: string[];
  pdfUrl?: string;

  // Relaciones
  Propietario?: Propietario;
}

// Definición de Cliente
export interface Cliente {
  id: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
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

// Definición de Usuario
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

// Respuestas de API
export interface ApiResponse<T> {
  message: string;
  data: T;
  error?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  usuario: Usuario;
}