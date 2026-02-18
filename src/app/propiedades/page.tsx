'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link'; // Importamos Link para navegar
import Navbar from '../../components/Navbar';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { useAuth } from '../../context/AuthContext';
import { toggleEstadoPropiedad, eliminarPropiedad } from '../../services/api';
import { 
  FaMapMarkerAlt, FaBed, FaBath, FaCar, FaRulerCombined, 
  FaHome, FaSearch, FaTrash, FaBan, FaCheck, FaBuilding, FaPlus, FaFilter
} from 'react-icons/fa';

const BACKEND_URL = 'https://sillar-backend.onrender.com';

export default function PropiedadesPage() {
  const { propiedades, fetchPropiedades, loading } = useInmobiliariaStore();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  const [filtroUbicacion, setFiltroUbicacion] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  useEffect(() => {
    fetchPropiedades();
  }, []);

  const propiedadesFiltradas = propiedades.filter(p => {
    return (filtroUbicacion === 'Todas' || p.ubicacion === filtroUbicacion) &&
           (filtroTipo === 'Todos' || p.tipo === filtroTipo) &&
           (filtroCategoria === 'Todas' || p.modalidad === filtroCategoria);
  });

  // --- ACCIONES (CON stopPropagation PARA NO ACTIVAR EL LINK) ---
  const handleSuspender = async (e: React.MouseEvent, id: string, estadoActual: boolean) => {
      e.preventDefault(); // Evita navegar al detalle
      e.stopPropagation(); // Evita propagar el click al Link padre
      if(!confirm(`¿${estadoActual ? 'Suspender' : 'Activar'} esta propiedad?`)) return;
      try { await toggleEstadoPropiedad(id, !estadoActual); fetchPropiedades(); } 
      catch (e) { alert('Error al cambiar estado'); }
  };

  const handleEliminar = async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if(!confirm('⚠️ ¿Estás seguro de eliminar permanentemente esta propiedad?')) return;
      try { await eliminarPropiedad(id); fetchPropiedades(); } 
      catch (e) { alert('Error al eliminar'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-800">
      <Navbar />
      
      {/* HEADER Y BARRA DE FILTROS */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
            
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-center">
                
                {/* Título */}
                <div className="flex items-center gap-4 w-full xl:w-auto mb-2 xl:mb-0">
                    <div className="bg-indigo-100 p-3 rounded-xl text-indigo-700 hidden sm:block">
                        <FaHome className="text-2xl"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 leading-none">Inmuebles</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            {loading ? 'Cargando...' : `${propiedadesFiltradas.length} resultados`}
                        </p>
                    </div>
                </div>
                
                {/* BARRA DE FILTROS ESTILIZADA */}
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
                    
                    <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 w-full md:w-auto shadow-sm">
                        <div className="px-4 text-gray-400 border-r border-gray-200 py-2"><FaFilter/></div>
                        
                        {/* Select Categoría */}
                        <select 
                            className="select select-sm select-ghost w-full md:w-36 bg-transparent focus:bg-white focus:shadow-sm rounded-lg text-gray-700 font-medium h-10" 
                            value={filtroCategoria} 
                            onChange={e=>setFiltroCategoria(e.target.value)}
                        >
                            <option value="Todas">Categoría</option>
                            <option value="Venta">Venta</option>
                            <option value="Alquiler">Alquiler</option>
                            <option value="Anticresis">Anticresis</option>
                        </select>
                        
                        <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>

                        {/* Select Tipo */}
                        <select 
                            className="select select-sm select-ghost w-full md:w-36 bg-transparent focus:bg-white focus:shadow-sm rounded-lg text-gray-700 font-medium h-10" 
                            value={filtroTipo} 
                            onChange={e=>setFiltroTipo(e.target.value)}
                        >
                            <option value="Todos">Tipo</option>
                            <option value="Casa">Casa</option>
                            <option value="Departamento">Departamento</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Local">Local</option>
                        </select>

                        <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>

                        {/* Select Ubicación */}
                        <select 
                            className="select select-sm select-ghost w-full md:w-48 bg-transparent focus:bg-white focus:shadow-sm rounded-lg text-gray-700 font-medium h-10" 
                            value={filtroUbicacion} 
                            onChange={e=>setFiltroUbicacion(e.target.value)}
                        >
                            <option value="Todas">Ubicación</option>
                            <option value="Arequipa">Arequipa</option>
                            <option value="Yanahuara">Yanahuara</option>
                            <option value="Cayma">Cayma</option>
                            <option value="Cerro Colorado">Cerro Colorado</option>
                            <option value="Socabaya">Socabaya</option>
                            <option value="Jose Luis Bustamante">J.L.B y Rivero</option>
                        </select>
                    </div>

                    {/* Botón Publicar */}
                    <Link 
                        href="/propiedades/nuevo" 
                        className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-200 px-6 w-full md:w-auto flex items-center gap-2 text-white h-12"
                    >
                        <FaPlus/> Publicar
                    </Link>
                </div>
            </div>
        </div>
      </div>

      {/* GRID DE PROPIEDADES */}
      <div className="container mx-auto p-6 max-w-7xl">
        
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                <p className="mt-4 font-medium text-gray-500">Cargando catálogo...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {propiedadesFiltradas.map((prop) => (
                    
                    <Link 
                        key={prop.id} 
                        href={`/propiedades/${prop.id}`} 
                        className="group relative block bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1"
                    >
                        
                        {/* BOTONES ADMIN FLOTANTES */}
                        {isAdmin && (
                            <div className="absolute top-3 right-3 z-20 flex gap-2">
                                <button 
                                    onClick={(e) => handleSuspender(e, prop.id, prop.activo || false)}
                                    className={`btn btn-circle btn-sm border-none shadow-lg ${prop.activo ? 'bg-white text-amber-500 hover:bg-amber-50' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                    title={prop.activo ? "Suspender" : "Activar"}
                                >
                                    {prop.activo ? <FaBan/> : <FaCheck/>}
                                </button>
                                <button 
                                    onClick={(e) => handleEliminar(e, prop.id)}
                                    className="btn btn-circle btn-sm bg-white text-red-500 border-none shadow-lg hover:bg-red-50"
                                    title="Eliminar"
                                >
                                    <FaTrash/>
                                </button>
                            </div>
                        )}

                        {/* IMAGEN HERO */}
                        <div className="h-64 overflow-hidden bg-gray-200 relative">
                            {prop.fotoPrincipal ? (
                                <img 
                                    src={`${BACKEND_URL}${prop.fotoPrincipal}`} 
                                    alt={prop.ubicacion} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-100">
                                    <FaBuilding className="text-5xl mb-2 opacity-50"/>
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Sin Imagen</span>
                                </div>
                            )}
                            
                            {/* ETIQUETA MODALIDAD */}
                            <div className="absolute bottom-3 left-3 flex gap-2">
                                <div className={`badge badge-lg border-none text-white shadow-md font-bold px-4 py-3 ${
                                    prop.modalidad === 'Venta' ? 'bg-gradient-to-r from-orange-500 to-red-500' : 
                                    prop.modalidad === 'Alquiler' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                    'bg-gradient-to-r from-purple-500 to-pink-500'
                                }`}>
                                    {prop.modalidad}
                                </div>
                            </div>

                            {!prop.activo && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                    <span className="text-white font-bold text-lg border-2 border-white px-6 py-2 rounded-lg uppercase tracking-widest transform -rotate-12 shadow-2xl">Suspendida</span>
                                </div>
                            )}
                        </div>

                        {/* CONTENIDO TARJETA */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-xl uppercase leading-tight text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {prop.tipo} en {prop.ubicacion}
                                </h3>
                            </div>
                            
                            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-5 font-medium">
                                <FaMapMarkerAlt className="text-red-400"/> {prop.direccion}
                            </p>
                            
                            {/* CARACTERÍSTICAS GRID */}
                            <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-100 mb-4 text-gray-600 text-sm bg-gray-50/50 rounded-xl px-2">
                                <div className="flex flex-col items-center justify-center p-1">
                                    <FaBed className="text-indigo-400 text-lg mb-1"/> 
                                    <span className="font-bold text-gray-800">{prop.habitaciones} <span className="font-normal text-xs text-gray-500">Hab</span></span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-1 border-l border-r border-gray-200">
                                    <FaBath className="text-sky-400 text-lg mb-1"/> 
                                    <span className="font-bold text-gray-800">{prop.banos} <span className="font-normal text-xs text-gray-500">Baños</span></span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-1">
                                    <FaCar className="text-orange-400 text-lg mb-1"/> 
                                    <span className="font-bold text-gray-800">{prop.cocheras} <span className="font-normal text-xs text-gray-500">Coch</span></span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg mb-1.5 w-fit border border-emerald-100">
                                        <FaRulerCombined/> {prop.area} m² Total
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg w-fit border border-purple-100">
                                        <FaHome/> {prop.areaConstruida} m² Const.
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5">Precio</span>
                                    <span className="text-2xl font-black text-gray-900 tracking-tight flex items-center justify-end gap-1">
                                        {prop.moneda === 'USD' ? '$' : 'S/'} {Number(prop.precio).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}