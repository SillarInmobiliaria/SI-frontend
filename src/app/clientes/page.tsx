'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createCliente, createInteres, eliminarCliente } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext'; 
import { 
  FaUser, FaSearch, FaEye, FaPhone, FaUserPlus, FaTrafficLight, FaCalendarCheck, 
  FaCalendarAlt, FaUndo, FaTrash, FaUserTie, FaFilter, FaHistory, FaInfoCircle, FaBullhorn,
  FaHome, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaRulerCombined, FaHammer, FaTimes,
  FaBed, FaBath, FaCar, FaImages, FaChevronDown, FaHandshake
} from 'react-icons/fa';

const BACKEND_URL = 'http://localhost:4000/';

interface FormClienteCompleto {
  nombre: string;
  telefono1: string; 
  dni?: string;
  email?: string;
  direccion?: string;
  fechaNacimiento?: string;
  telefono2?: string; 
  estadoCivil?: string;
  ocupacion?: string;
  fechaAlta: string;
  propiedadId?: string;
  asesorCliente?: string;
  observaciones?: string;
  origen?: string;
}

export default function ClientesPage() {
  const router = useRouter(); 
  const { clientes, fetchClientes, propiedades, fetchPropiedades, intereses, fetchIntereses, loading } = useInmobiliariaStore();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  const today = new Date().toISOString().split('T')[0];

  const [filterDate, setFilterDate] = useState(today);
  const [filterType, setFilterType] = useState<'TODOS' | 'PROSPECTO' | 'CLIENTE'>('TODOS'); 

  // Modales
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [showFullProperty, setShowFullProperty] = useState(false); 

  // Buscador Propiedades
  const [propSearch, setPropSearch] = useState(''); 
  const [showPropSuggestions, setShowPropSuggestions] = useState(false); 

  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormClienteCompleto>();

  const selectedPropiedadId = watch('propiedadId');
  const propiedadSeleccionada = propiedades.find(p => p.id === selectedPropiedadId);

  useEffect(() => {
    fetchClientes();
    fetchPropiedades();
    fetchIntereses();
  }, []);

  const filteredProps = useMemo(() => {
      if (!propSearch) return [];
      const search = propSearch.toLowerCase();
      return propiedades.filter(p => 
          p.tipo.toLowerCase().includes(search) || 
          p.ubicacion.toLowerCase().includes(search) ||
          (p.direccion && p.direccion.toLowerCase().includes(search))
      );
  }, [propiedades, propSearch]);

  const handleSelectPropiedad = (prop: any) => {
      setValue('propiedadId', prop.id); 
      setPropSearch(`${prop.tipo} - ${prop.ubicacion} (${prop.direccion || ''})`); 
      setShowPropSuggestions(false); 
  };

  const handleOpenModal = () => {
      setModalOpen(true);
      setPropSearch(''); 
      setValue('propiedadId', '');
      reset(); 
  };

  const clientesFiltrados = useMemo(() => {
      let filtrados = clientes.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.dni && c.dni.includes(searchTerm)) ||
        c.telefono1.includes(searchTerm)
      );

      if (searchTerm === '') {
          filtrados = filtrados.filter(c => {
              const fechaRaw = c.fechaAlta || c.createdAt || '';
              const fechaRegistro = fechaRaw.split('T')[0];
              return fechaRegistro === filterDate;
          });
      }

      if (filterType !== 'TODOS') {
          filtrados = filtrados.filter(c => c.tipo === filterType);
      }

      filtrados.sort((a, b) => {
          const dateA = new Date(a.fechaAlta || a.createdAt || new Date().toISOString());
          const dateB = new Date(b.fechaAlta || b.createdAt || new Date().toISOString());
          return dateB.getTime() - dateA.getTime();
      });

      return filtrados;
  }, [clientes, searchTerm, filterDate, filterType]);

  const handleEliminar = async (id: string) => {
      if(!confirm('⚠️ ¿Estás seguro de eliminar este registro?')) return;
      try { await eliminarCliente(id); fetchClientes(); } 
      catch (e) { alert('❌ Error al eliminar'); }
  };

  const handleViewDetail = (c: any) => { 
      setSelectedCliente(c); 
      setDetailOpen(true); 
  };

  const handleOpenAgendarVisita = (c: any) => {
      const interes = intereses.find(i => i.clienteId === c.id);
      const propiedadId = interes ? interes.propiedadId : '';
      const url = `/visitas?clienteId=${c.id}&clienteNombre=${encodeURIComponent(c.nombre)}&propiedadId=${propiedadId}`;
      router.push(url);
  };

  const onSubmitCliente = async (data: FormClienteCompleto) => {
    setIsSubmitting(true);
    try {
      const resp = await createCliente({
          nombre: data.nombre,
          telefono1: data.telefono1,
          dni: data.dni || undefined,
          email: data.email || undefined,
          direccion: data.direccion || undefined,
          fechaNacimiento: data.fechaNacimiento || undefined,
          telefono2: data.telefono2 || undefined,
          estadoCivil: data.estadoCivil || undefined,
          ocupacion: data.ocupacion || undefined,
          fechaAlta: data.fechaAlta, 
          origen: data.origen,
          activo: undefined,
          usuarioId: undefined,
          tipo: (data.dni && data.email) ? 'CLIENTE' : 'PROSPECTO' 
      } as any);

      const nuevoId = (resp as any).data?.id || (resp as any).id; 
      
      if (data.propiedadId && nuevoId) {
        await createInteres({
          clienteId: nuevoId,
          propiedadId: data.propiedadId,
          nota: `Asesor: ${data.asesorCliente || 'N/A'}. Notas: ${data.observaciones || ''}`
        });
      }

      await fetchClientes();
      await fetchIntereses();
      setModalOpen(false);
      reset();
      alert('✅ Registrado Exitosamente');
  
      if (data.fechaAlta === today) {
          setFilterDate(today);
      } else {
          setFilterDate(data.fechaAlta); 
      }

    } catch (error) {
      console.error(error);
      alert('❌ Error al registrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
  };

  const formatDateLabel = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00'); 
      return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <main className="container mx-auto p-6 max-w-7xl">
        
        {/* HEADER & BUSCADOR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-600">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">Módulo de Atención</h1>
              <p className="text-gray-500 mt-1">Gestiona tus interesados y clientes.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto items-center">
             <div className="relative w-full md:w-64">
                 <FaSearch className={`absolute left-3 top-3.5 ${searchTerm ? 'text-indigo-600' : 'text-gray-400'}`}/>
                 <input 
                    type="text" 
                    placeholder="Buscar por nombre..." 
                    className={`input input-bordered w-full pl-10 ${searchTerm ? 'border-indigo-500 bg-indigo-50' : 'bg-gray-50'}`}
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                 />
             </div>
             <button onClick={handleOpenModal} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none px-6 shadow-md">
                 <FaUserPlus className="text-lg"/> Nuevo
             </button>
          </div>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-col xl:flex-row items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4 transition-all">
            <div className="flex items-center gap-4 w-full xl:w-auto">
                <div className={`p-3 rounded-full hidden sm:block ${searchTerm ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {searchTerm ? <FaHistory className="text-xl"/> : <FaCalendarAlt className="text-xl"/>}
                </div>
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {searchTerm ? 'MODO BÚSQUEDA GLOBAL' : 'VIENDO REGISTROS DEL:'}
                    </h3>
                    
                    {searchTerm ? (
                        <div className="text-sm font-bold text-orange-600 animate-pulse">
                            Buscando "{searchTerm}" en todo el historial...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="input input-bordered input-sm font-bold text-gray-700"
                            />
                            {filterDate !== today && (
                                <button onClick={() => setFilterDate(today)} className="btn btn-sm btn-ghost text-indigo-600 hover:bg-indigo-50" title="Volver a Hoy"><FaUndo/></button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg w-full xl:w-auto">
                <button onClick={() => setFilterType('TODOS')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all ${filterType === 'TODOS' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Todos</button>
                <button onClick={() => setFilterType('PROSPECTO')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${filterType === 'PROSPECTO' ? 'bg-white shadow text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}><FaTrafficLight/> Interesados</button>
                {/* 🟢 CORRECCIÓN: Volvemos a "Clientes" */}
                <button onClick={() => setFilterType('CLIENTE')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${filterType === 'CLIENTE' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}><FaHandshake/> Clientes</button>
            </div>
        </div>

        {/* LISTA */}
        {loading ? (
            <div className="text-center py-10">Cargando datos...</div>
        ) : (
            <div className="animate-fade-in-up">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium text-sm">
                            {searchTerm ? (<>Resultados para <b>"{searchTerm}"</b> en el historial</>) : (<>Registros del <b>{formatDateLabel(filterDate)}</b></>)}
                        </span>
                    </div>
                    <span className="badge badge-lg bg-indigo-100 text-indigo-800 border-none font-bold">
                        {clientesFiltrados.length} resultados
                    </span>
                </div>

                {clientesFiltrados.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <FaFilter className="text-4xl text-gray-200 mx-auto mb-3"/>
                        <p className="text-gray-400 font-medium">No se encontraron registros.</p>
                        <div className="flex gap-2 justify-center mt-3">
                            {searchTerm && <button onClick={() => setSearchTerm('')} className="btn btn-sm btn-ghost text-red-500">Borrar Búsqueda</button>}
                            {!searchTerm && filterDate !== today && <button onClick={() => setFilterDate(today)} className="btn btn-sm btn-ghost text-indigo-500">Ir a Hoy</button>}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="pl-6 w-32">Nivel</th>
                                        <th>Nombre</th>
                                        <th>Contacto</th>
                                        <th>Interés</th>
                                        {searchTerm && <th>Fecha Reg.</th>} 
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {clientesFiltrados.map((c: any) => {
                                        const interesC = intereses.find(i => i.clienteId === c.id);
                                        const propC = interesC?.Propiedad;
                                        const fechaReg = new Date(c.fechaAlta || c.createdAt).toLocaleDateString();

                                        return (
                                            <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="pl-6">
                                                    {/* 🟢 CORRECCIÓN: "CLIENTE" sin formal */}
                                                    {c.tipo === 'CLIENTE' ? (
                                                        <div className="badge bg-green-100 text-green-700 border-none font-bold gap-1 p-3 w-full justify-start"><FaUserTie/> CLIENTE</div>
                                                    ) : (
                                                        <div className="badge bg-yellow-100 text-yellow-700 border-none font-bold gap-1 p-3 w-full justify-start"><FaTrafficLight/> INTERESADO</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="font-bold text-gray-800">{c.nombre}</div>
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        {c.dni ? `DNI: ${c.dni}` : 'Sin DNI'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                        <FaPhone className="text-xs text-indigo-400"/> {c.telefono1}
                                                    </div>
                                                </td>
                                                <td>
                                                    {propC ? (
                                                        <div className="text-xs">
                                                            <span className="font-bold text-gray-700">{propC.tipo}</span>
                                                            <span className="text-gray-500"> - {propC.ubicacion}</span>
                                                            <div className="text-green-600 font-bold text-[10px]">{propC.moneda} {propC.precio}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-300 italic">Sin interés</span>
                                                    )}
                                                </td>
                                                {searchTerm && <td className="text-xs font-bold text-gray-500">{fechaReg}</td>}
                                                <td>
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleOpenAgendarVisita(c)} className="btn btn-sm bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200 gap-2 font-medium" title="Agendar"><FaCalendarCheck /> Visita</button>
                                                        <button onClick={() => handleViewDetail(c)} className="btn btn-square btn-sm btn-ghost text-gray-400 hover:text-blue-500"><FaEye /></button>
                                                        {isAdmin && <button onClick={() => handleEliminar(c.id)} className="btn btn-square btn-sm btn-ghost text-gray-300 hover:text-red-500"><FaTrash /></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* MODAL NUEVO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto relative">
                
                <div className="bg-indigo-900 text-white p-6 flex justify-between items-center">
                  <h3 className="font-bold text-xl flex items-center gap-2"><FaUserPlus/> Nuevo Interesado</h3>
                  <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white">✕</button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmitCliente)} className="p-8 bg-gray-50">
                    <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm mb-6">
                        <div className="pb-2 border-b mb-4 flex justify-between items-center">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase">Datos Básicos</h4>
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">Registro Rápido</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label font-bold text-gray-700">Nombre Completo *</label>
                                <input {...register('nombre', { required: true })} className="input input-bordered w-full"/>
                                {errors.nombre && <span className="text-red-500 text-xs">Requerido</span>}
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-gray-700">Celular (9 dígitos) *</label>
                                <input {...register('telefono1', { required: true, minLength: 9, maxLength: 9 })} maxLength={9} onInput={handleNumberInput} className="input input-bordered w-full" placeholder="900000000"/>
                                {errors.telefono1 && <span className="text-red-500 text-xs">Debe tener 9 dígitos</span>}
                            </div>
                            
                            {/* BUSCADOR PREDICTIVO DE PROPIEDADES */}
                            <div className="form-control relative">
                                <label className="label font-bold text-gray-700">Propiedad de Interés (Buscar)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="input input-bordered w-full pr-10" 
                                        placeholder="Escribe para buscar (ej: Los Delfines...)"
                                        value={propSearch}
                                        onChange={(e) => {
                                            setPropSearch(e.target.value);
                                            setShowPropSuggestions(true);
                                            if(e.target.value === '') setValue('propiedadId', '');
                                        }}
                                    />
                                    <FaChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"/>
                                    <input type="hidden" {...register('propiedadId')} />

                                    {showPropSuggestions && propSearch.length > 0 && (
                                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1">
                                            {filteredProps.length > 0 ? (
                                                filteredProps.map(p => (
                                                    <div 
                                                        key={p.id} 
                                                        className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 flex flex-col"
                                                        onClick={() => handleSelectPropiedad(p)}
                                                    >
                                                        <span className="font-bold text-gray-800 text-sm">{p.tipo} - {p.ubicacion}</span>
                                                        <span className="text-xs text-gray-500">{p.direccion}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-3 text-gray-400 text-sm">No se encontraron propiedades.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label font-bold text-gray-700">Fecha Registro</label>
                                <input {...register('fechaAlta')} type="date" defaultValue={filterDate} className="input input-bordered w-full"/>
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label font-bold text-gray-700 flex items-center gap-2"><FaBullhorn className="text-orange-500"/> Medio de Captación</label>
                                <select {...register('origen')} className="select select-bordered w-full">
                                    <option value="">-- Seleccionar --</option>
                                    <option value="Letrero">Letrero</option>
                                    <option value="Urbania">Urbania</option>
                                    <option value="Redes Sociales">Redes Sociales</option>
                                    <option value="Llamada">Llamada</option>
                                    <option value="Referido">Referido</option>
                                </select>
                            </div>
                        </div>

                        {/* TARJETA DE PROPIEDAD INTELIGENTE */}
                        {propiedadSeleccionada && (
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5 animate-fade-in-up relative">
                                <button 
                                    type="button" 
                                    onClick={() => setShowFullProperty(true)}
                                    className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost bg-white text-indigo-600 shadow-sm hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-100 tooltip tooltip-left"
                                    data-tip="Ver ficha completa"
                                >
                                    <FaEye />
                                </button>

                                <div className="flex items-center gap-3 mb-4 border-b border-blue-200 pb-3">
                                    <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm"><FaInfoCircle /></div>
                                    <h5 className="font-bold text-blue-900 text-lg">Información de la Propiedad</h5>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                    <div className="flex justify-between sm:justify-start sm:gap-2 items-center">
                                        <span className="font-semibold text-gray-600 flex items-center gap-1"><FaHome className="text-gray-400"/> Tipo:</span>
                                        <span className="font-bold text-gray-800">{propiedadSeleccionada.tipo}</span>
                                    </div>
                                    <div className="flex justify-between sm:justify-start sm:gap-2 items-center">
                                        <span className="font-semibold text-gray-600 flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400"/> Ubicación:</span>
                                        <span className="font-bold text-gray-800">{propiedadSeleccionada.ubicacion}</span>
                                    </div>

                                    {/* Fila 2 - ÁREAS PARA TODOS */}
                                    <div className="flex justify-between sm:justify-start sm:gap-2 items-center">
                                        <span className="font-semibold text-gray-600 flex items-center gap-1"><FaRulerCombined className="text-gray-400"/> Área Terreno:</span>
                                        <span className="font-bold text-gray-800">{propiedadSeleccionada.area} m²</span>
                                    </div>
                                    <div className="flex justify-between sm:justify-start sm:gap-2 items-center">
                                        <span className="font-semibold text-gray-600 flex items-center gap-1"><FaHammer className="text-gray-400"/> Área Construida:</span>
                                        <span className="font-bold text-gray-800">{propiedadSeleccionada.areaConstruida || 0} m²</span>
                                    </div>

                                    {/* Fila 3 - Precio */}
                                    <div className="flex justify-between sm:justify-start sm:gap-2 sm:col-span-2 items-center border-t border-blue-200 pt-2 mt-1">
                                        <span className="font-semibold text-gray-600 flex items-center gap-1"><FaDollarSign className="text-gray-400"/> Precio:</span>
                                        <span className="font-bold text-green-600 text-lg">
                                            {propiedadSeleccionada.moneda} {Number(propiedadSeleccionada.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Fila 4 - Mantenimiento (Solo Depas) */}
                                    {propiedadSeleccionada.tipo === 'Departamento' && (
                                        <div className="sm:col-span-2 mt-1">
                                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100 w-fit">
                                                <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">Mantenimiento:</span>
                                                <span className={`font-bold ${propiedadSeleccionada.mantenimiento && Number(propiedadSeleccionada.mantenimiento) > 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                                                    {propiedadSeleccionada.mantenimiento && Number(propiedadSeleccionada.mantenimiento) > 0 
                                                        ? `S/ ${Number(propiedadSeleccionada.mantenimiento).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` 
                                                        : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-indigo-600">{isSubmitting ? 'Guardando...' : 'Registrar Interesado'}</button>
                    </div>
                </form>

                {/* MODAL FLOTANTE DE DETALLE DE PROPIEDAD */}
                {showFullProperty && propiedadSeleccionada && (
                    <div className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-sm p-6 flex flex-col animate-fade-in">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaBuilding className="text-indigo-500"/> {propiedadSeleccionada.tipo} en {propiedadSeleccionada.ubicacion}
                                </h3>
                                <p className="text-gray-500 text-sm">{propiedadSeleccionada.direccion}</p>
                            </div>
                            <button type="button" onClick={() => setShowFullProperty(false)} className="btn btn-circle btn-ghost text-gray-500 hover:bg-gray-100"><FaTimes className="text-xl"/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm border border-gray-200">
                                {propiedadSeleccionada.fotoPrincipal ? (
                                    <img src={`${BACKEND_URL}${propiedadSeleccionada.fotoPrincipal}`} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300"><FaImages className="text-5xl"/></div>
                                )}
                                <div className="absolute bottom-4 right-4 badge badge-lg bg-white/90 text-indigo-900 border-none font-bold shadow-lg">
                                    {propiedadSeleccionada.moneda} {Number(propiedadSeleccionada.precio).toLocaleString('es-PE')}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                    <FaBed className="mx-auto text-2xl text-indigo-400 mb-2"/>
                                    <span className="block font-bold text-gray-800">{propiedadSeleccionada.habitaciones || 0}</span>
                                    <span className="text-xs text-gray-500">Dormitorios</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                    <FaBath className="mx-auto text-2xl text-sky-400 mb-2"/>
                                    <span className="block font-bold text-gray-800">{propiedadSeleccionada.banos || 0}</span>
                                    <span className="text-xs text-gray-500">Baños</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                    <FaCar className="mx-auto text-2xl text-orange-400 mb-2"/>
                                    <span className="block font-bold text-gray-800">{propiedadSeleccionada.cocheras || 0}</span>
                                    <span className="text-xs text-gray-500">Cocheras</span>
                                </div>
                            </div>

                            {propiedadSeleccionada.descripcion && (
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Descripción</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{propiedadSeleccionada.descripcion}</p>
                                </div>
                            )}

                            {propiedadSeleccionada.detalles && (
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Distribución</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{propiedadSeleccionada.detalles}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100 mt-2 flex justify-end">
                            <button type="button" onClick={() => setShowFullProperty(false)} className="btn btn-primary bg-indigo-600 w-full">Volver al Registro</button>
                        </div>
                    </div>
                )}

             </div>
          </div>
        )}

        {/* MODAL DETALLE DE CLIENTE */}
        {isDetailOpen && selectedCliente && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                <div className="bg-white w-full max-w-2xl rounded-2xl p-6 relative">
                    <button onClick={()=>setDetailOpen(false)} className="btn btn-sm btn-circle absolute right-4 top-4">✕</button>
                    <h2 className="text-2xl font-bold mb-4 text-indigo-900">{selectedCliente.nombre}</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong>Celular:</strong> {selectedCliente.telefono1}</p>
                        {/* 🟢 CORRECCIÓN: Volvemos a "CLIENTE" */}
                        <p><strong>Tipo:</strong> {selectedCliente.tipo === 'CLIENTE' ? 'CLIENTE' : 'INTERESADO'}</p>
                        <p><strong>Email:</strong> {selectedCliente.email || '---'}</p>
                        <p><strong>DNI:</strong> {selectedCliente.dni || '---'}</p>
                        {selectedCliente.origen && <p><strong>Captación:</strong> {selectedCliente.origen}</p>}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}