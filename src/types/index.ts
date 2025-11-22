// Definición de Propietario
export interface Propietario {
  id: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  createdAt?: string; // Opcional porque al crear no lo tenemos
  updatedAt?: string;
}

// Definición de Propiedad
export interface Propiedad {
  id: string;
  direccion: string;
  precio: number | string; // Puede venir como texto del input o numero de la BD
  tipo: 'Venta' | 'Alquiler' | string;
  descripcion: string;
  area: number;
  areaConstruida: number;
  propietarioId: string;
  Propietario?: Propietario; // Relación anidada (opcional)
}

// Definición de Cliente
export interface Cliente {
  id: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
}

// Definición de Interés (El match)
export interface Interes {
  id: string;
  estado: string;
  nota?: string;
  clienteId: string;
  propiedadId: string;
  Cliente?: Cliente;     // Para mostrar el nombre del interesado
  Propiedad?: Propiedad; // Para mostrar qué casa quiere
  createdAt?: string; 
  updatedAt?: string;
}

// Respuesta genérica de tu API (Backend)
// Esto nos ayuda a leer los mensajes: { message: "Éxito", data: ... }
export interface ApiResponse<T> {
  message: string;
  data: T;
  error?: string;
}