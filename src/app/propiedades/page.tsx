'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link'; 
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import Navbar from '../../components/Navbar';
import { FaBed, FaBath, FaCar, FaRulerCombined, FaMapMarkerAlt, FaHome } from 'react-icons/fa';

const UBICACIONES = [
  "Arequipa", "Yanahuara", "Cayma", "Cerro Colorado", "Jose Luis Bustamante y Rivero",
  "Sachaca", "Miraflores", "Mariano Melgar", "Paucarpata", "Socabaya", "Jacobo Hunter",
  "Alto Selva Alegre", "Tiabaya", "Uchumayo", "Characato", "Sabandía", "Mollebaya",
  "Yura", "La Joya", "Mollendo", "Camaná", "Mejía", "Pedregal"
];

// URL del Backend para cargar las fotos
const BACKEND_URL = 'http://localhost:4000/';

export default function PropiedadesPage() {
  const { propiedades, fetchPropiedades, fetchPropietarios, loading } = useInmobiliariaStore();

  // ESTADOS PARA LOS FILTROS
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');

  useEffect(() => {
    fetchPropiedades();
    fetchPropietarios();
  }, []);

  // LÓGICA DE FILTRADO
  const propiedadesFiltradas = propiedades.filter(p => {
    return (
      (filtroModalidad === '' || p.modalidad === filtroModalidad) &&
      (filtroTipo === '' || p.tipo === filtroTipo) &&
      (filtroUbicacion === '' || p.ubicacion === filtroUbicacion)
    );
  });

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      {/* --- BARRA DE FILTROS SUPERIOR --- */}
      <div className="bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-40 shadow-sm mb-8">
        <div className="container mx-auto p-4">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-4">
            
            <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro Categoría */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-400">Categoría</label>
                <select 
                  className="select select-bordered w-full bg-base-100 text-base-content" 
                  onChange={(e) => setFiltroModalidad(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="Venta">Venta</option>
                  <option value="Alquiler">Alquiler</option>
                  <option value="Anticresis">Anticresis</option>
                  <option value="PreVenta">PreVenta</option>
                </select>
              </div>

              {/* Filtro Tipo */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-400">Tipo de Inmueble</label>
                <select 
                  className="select select-bordered w-full bg-base-100 text-base-content" 
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Casa">Casas</option>
                  <option value="Departamento">Departamentos</option>
                  <option value="Terreno">Terrenos</option>
                  <option value="Local">Locales / Oficinas</option>
                </select>
              </div>

              {/* Filtro Ubicación */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-400">Ubicación</label>
                <select 
                  className="select select-bordered w-full bg-base-100 text-base-content" 
                  onChange={(e) => setFiltroUbicacion(e.target.value)}
                >
                  <option value="">Todas las ubicaciones</option>
                  {UBICACIONES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* BOTÓN NUEVO -> LLEVA A LA PÁGINA DE CREACIÓN */}
            <Link 
              href="/propiedades/nuevo" 
              className="btn w-full lg:w-auto px-10 h-12 text-lg font-bold border-0 border-b-4 border-purple-600 shadow-lg backdrop-blur-md bg-white/80 text-gray-900 hover:bg-white dark:bg-black/40 dark:text-white dark:hover:bg-black/60 flex items-center justify-center"
            >
              + Publicar Propiedad
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-6">
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          {propiedadesFiltradas.length} propiedades encontradas
        </h2>

        {loading ? <div className="text-center">Cargando...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propiedadesFiltradas.map((p) => (
              <Link href={`/propiedades/${p.id}`} key={p.id} className="block h-full group">
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                  
                  {/* FOTO REAL O PLACEHOLDER */}
                  <figure className="h-52 bg-gray-300 dark:bg-gray-800 relative">
                    {p.fotoPrincipal ? (
                      <img 
                        src={`${BACKEND_URL}${p.fotoPrincipal}`} 
                        alt={p.tipo} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
                        <span className="text-4xl">🏠</span>
                        <span className="text-sm font-bold opacity-50">Sin foto</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 badge badge-lg bg-orange-600 text-white border-none font-bold shadow-md">
                      {p.modalidad.toUpperCase()}
                    </div>
                  </figure>

                  <div className="card-body p-5 flex-grow">
                    {/* Título y Ubicación */}
                    <h2 className="card-title text-lg font-bold text-primary uppercase leading-tight mb-1 line-clamp-2">
                      {p.modalidad} {p.tipo}, {p.ubicacion.toUpperCase()}
                    </h2>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                      <FaMapMarkerAlt /> <span className="truncate">{p.direccion}</span>
                    </div>
                    
                    {/* Precio */}
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                      {p.moneda === 'PEN' ? 'S/.' : '$'} {Number(p.precio).toLocaleString()}
                    </div>

                    {/* Características */}
                    <div className="bg-gray-50 dark:bg-base-200 p-3 rounded-lg border border-gray-100 dark:border-none mt-auto">
                      
                      {/* Habitaciones */}
                      <div className="flex justify-between items-center text-sm mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-1" title="Dormitorios">
                          <FaBed className="text-indigo-500 text-lg" /> 
                          <span className="font-bold text-gray-700 dark:text-gray-300">{p.habitaciones}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Baños">
                          <FaBath className="text-sky-500 text-lg" /> 
                          <span className="font-bold text-gray-700 dark:text-gray-300">{p.banos}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Cocheras">
                          <FaCar className="text-orange-500 text-lg" /> 
                          <span className="font-bold text-gray-700 dark:text-gray-300">{p.cocheras}</span>
                        </div>
                      </div>

                      {/* Áreas */}
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400" title="Área Total">
                          <FaRulerCombined className="text-base" /> 
                          <span>{p.area}m² <span className="opacity-70">Terr.</span></span>
                        </div>
                        
                        {p.areaConstruida > 0 && (
                          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400" title="Área Construida">
                             <FaHome className="text-base" /> 
                             <span>{p.areaConstruida}m² <span className="opacity-70">Const.</span></span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}