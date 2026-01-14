'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createCliente, createInteres, eliminarCliente, createSeguimiento, createRequerimiento } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext'; 
import { 
  FaUser, FaSearch, FaEye, FaPhone, FaUserPlus, FaTrafficLight, FaCalendarCheck, 
  FaCalendarAlt, FaUndo, FaTrash, FaUserTie, FaFilter, FaHistory, FaInfoCircle, FaBullhorn,
  FaHome, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaRulerCombined, FaHammer, FaTimes,
  FaBed, FaBath, FaCar, FaImages, FaChevronDown, FaHandshake, FaRoute, FaCheckCircle, FaSave, FaClipboardList
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
  const fechaHoyVisual = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [filterDate, setFilterDate] = useState(today);
  const [filterType, setFilterType] = useState<'TODOS' | 'PROSPECTO' | 'CLIENTE'>('TODOS'); 

  // Modales
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [showFullProperty, setShowFullProperty] = useState(false); 

  // --- ESTADOS PARA SEGUIMIENTO ---
  const [isSeguimientoOpen, setSeguimientoOpen] = useState(false);
  const [clienteSeguimiento, setClienteSeguimiento] = useState<any>(null);

  // --- ESTADOS PARA REQUERIMIENTO ---
  const [isReqOpen, setReqOpen] = useState(false);
  const [clienteReq, setClienteReq] = useState<any>(null);

  // Buscador Propiedades
  const [propSearch, setPropSearch] = useState(''); 
  const [showPropSuggestions, setShowPropSuggestions] = useState(false); 

  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario Principal (Clientes)
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormClienteCompleto>();

  // Formulario Seguimiento
  const { 
    register: registerSeg, 
    handleSubmit: handleSubmitSeg, 
    reset: resetSeg,
    formState: { errors: errorsSeg }
  } = useForm();

  // Formulario Requerimiento
  const { 
    register: registerReq, 
    handleSubmit: handleSubmitReq, 
    reset: resetReq
  } = useForm();

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

  // --- LÓGICA SEGUIMIENTO ---
  const handleOpenSeguimiento = (cliente: any) => {
      setClienteSeguimiento(cliente);
      setSeguimientoOpen(true);
      resetSeg(); 
  };

  const onSubmitSeguimiento = async (data: any) => {
      if (!clienteSeguimiento) return;
      try {
          const fechaProximaISO = new Date(data.fechaProxima).toISOString();
          const payload = {
              clienteId: clienteSeguimiento.id,
              usuarioId: user?.id, 
              fecha: new Date().toISOString(), 
              comentario: data.comentario,
              fechaProxima: fechaProximaISO,   
              estado: data.estado
          };
          await createSeguimiento(payload);
          alert('✅ Seguimiento registrado correctamente');
          setSeguimientoOpen(false);
          resetSeg();
      } catch (error) {
          console.error(error);
          alert('❌ Error al guardar seguimiento.');
      }
  };

  // LÓGICA REQUERIMIENTO
  const handleOpenReq = (cliente: any) => {
      setClienteReq(cliente);
      setReqOpen(true);
      resetReq();
  };

  const onSubmitReq = async (data: any) => {
      if (!clienteReq) return;
      try {
          await createRequerimiento({
              clienteId: clienteReq.id,
              fecha: new Date().toISOString(),
              pedido: data.pedido,
              prioridad: data.prioridad,
              usuarioId: user?.id
          });
          alert('✅ Requerimiento creado exitosamente');
          setReqOpen(false);
          resetReq();
      } catch (error) {
          console.error(error);
          alert('❌ Error al crear requerimiento');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-gray-800">
      <Navbar />
      <main className="container mx-auto p-6 max-w-7xl">
        
        {/* HEADER & BUSCADOR - MEJORADO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 backdrop-blur-sm bg-white/80">
          <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Módulo de Atención</h1>
              <p className="text-gray-600 mt-2 font-medium">Gestiona tus interesados y clientes de manera eficiente</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto items-center">
             <div className="relative w-full md:w-72">
                 <FaSearch className={`absolute left-4 top-4 transition-colors ${searchTerm ? 'text-indigo-600' : 'text-gray-400'}`}/>
                 <input 
                    type="text" 
                    placeholder="Buscar por nombre, DNI o teléfono..." 
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${searchTerm ? 'border-indigo-400 bg-indigo-50/50 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent`}
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                 />
             </div>
             <button 
                onClick={handleOpenModal} 
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap transform hover:scale-105"
             >
                 <FaUserPlus className="text-lg"/> Nuevo
             </button>
          </div>
        </div>

        {/* BARRA DE FILTROS - MEJORADA */}
        <div className="flex flex-col xl:flex-row items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 gap-6 transition-all">
            <div className="flex items-center gap-5 w-full xl:w-auto">
                <div className={`p-4 rounded-2xl shadow-sm ${searchTerm ? 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600' : 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600'}`}>
                    {searchTerm ? <FaHistory className="text-2xl"/> : <FaCalendarAlt className="text-2xl"/>}
                </div>
                <div className="flex-1">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                        {searchTerm ? 'MODO BÚSQUEDA GLOBAL' : 'VIENDO REGISTROS DEL:'}
                    </h3>
                    
                    {searchTerm ? (
                        <div className="text-sm font-bold text-orange-600 animate-pulse">
                            Buscando "{searchTerm}" en todo el historial...
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <input 
                                type="date" 
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="px-4 py-2 border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                            />
                            {filterDate !== today && (
                                <button 
                                    onClick={() => setFilterDate(today)} 
                                    className="bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 hover:from-indigo-100 hover:to-blue-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow transform hover:scale-105" 
                                    title="Volver a Hoy"
                                >
                                    <FaUndo/> Hoy
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 rounded-xl w-full xl:w-auto shadow-inner">
                <button 
                    onClick={() => setFilterType('TODOS')} 
                    className={`flex-1 px-5 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${filterType === 'TODOS' ? 'bg-white shadow-md text-indigo-600 transform scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                >
                    Todos
                </button>
                <button 
                    onClick={() => setFilterType('PROSPECTO')} 
                    className={`flex-1 px-5 py-3 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${filterType === 'PROSPECTO' ? 'bg-white shadow-md text-orange-500 transform scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                >
                    <FaTrafficLight/> Interesados
                </button>
                <button 
                    onClick={() => setFilterType('CLIENTE')} 
                    className={`flex-1 px-5 py-3 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${filterType === 'CLIENTE' ? 'bg-white shadow-md text-green-600 transform scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                >
                    <FaHandshake/> Clientes
                </button>
            </div>
        </div>

        {/* LISTA - MEJORADA */}
        {loading ? (
            <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                <p className="mt-4 text-gray-500 font-medium">Cargando datos...</p>
            </div>
        ) : (
            <div className="animate-fade-in-up">
                <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold text-sm">
                            {searchTerm ? (<>Resultados para <b className="text-indigo-600">"{searchTerm}"</b> en el historial</>) : (<>Registros del <b className="text-indigo-600">{formatDateLabel(filterDate)}</b></>)}
                        </span>
                    </div>
                    <span className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 px-4 py-2 rounded-lg border-none font-bold shadow-sm">
                        {clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'resultado' : 'resultados'}
                    </span>
                </div>

                {clientesFiltrados.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
                        <FaFilter className="text-6xl text-gray-200 mx-auto mb-4"/>
                        <p className="text-gray-400 font-semibold text-lg mb-4">No se encontraron registros.</p>
                        <div className="flex gap-3 justify-center mt-6">
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')} 
                                    className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow"
                                >
                                    Borrar Búsqueda
                                </button>
                            )}
                            {!searchTerm && filterDate !== today && (
                                <button 
                                    onClick={() => setFilterDate(today)} 
                                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow"
                                >
                                    Ir a Hoy
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500 uppercase text-xs font-black tracking-wider border-b-2 border-gray-100">
                                    <tr>
                                        <th className="pl-8 w-36 py-4">Nivel</th>
                                        <th className="py-4">Nombre</th>
                                        <th className="py-4">Contacto</th>
                                        <th className="py-4">Interés</th>
                                        {searchTerm && <th className="py-4">Fecha Reg.</th>} 
                                        <th className="text-center py-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {clientesFiltrados.map((c: any) => {
                                        const interesC = intereses.find(i => i.clienteId === c.id);
                                        const propC = interesC?.Propiedad;
                                        const fechaReg = new Date(c.fechaAlta || c.createdAt).toLocaleDateString();

                                        return (
                                            <tr key={c.id} className="hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-blue-50/30 transition-all duration-200">
                                                <td className="pl-8 py-4">
                                                    {c.tipo === 'CLIENTE' ? (
                                                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 font-bold gap-2 px-4 py-2.5 rounded-xl w-full flex items-center justify-start shadow-sm">
                                                            <FaUserTie className="text-lg"/> CLIENTE
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200 font-bold gap-2 px-4 py-2.5 rounded-xl w-full flex items-center justify-start shadow-sm">
                                                            <FaTrafficLight className="text-lg"/> INTERESADO
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <div className="font-bold text-gray-800 text-base">{c.nombre}</div>
                                                    <div className="text-xs text-gray-400 font-mono mt-1">
                                                        {c.dni ? `DNI: ${c.dni}` : 'Sin DNI'}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold bg-gray-50 px-3 py-2 rounded-lg w-fit">
                                                        <FaPhone className="text-xs text-indigo-500"/> {c.telefono1}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {propC ? (
                                                        <div className="text-xs">
                                                            <span className="font-bold text-gray-800">{propC.tipo}</span>
                                                            <span className="text-gray-500"> - {propC.ubicacion}</span>
                                                            <div className="text-green-600 font-bold text-sm mt-1">{propC.moneda} {propC.precio}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-300 italic">Sin interés</span>
                                                    )}
                                                </td>
                                                {searchTerm && <td className="text-xs font-bold text-gray-500 py-4">{fechaReg}</td>}
                                                <td className="py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleOpenReq(c)}
                                                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-semibold text-xs flex items-center gap-1.5" 
                                                            title="Requerimiento"
                                                        >
                                                            <FaClipboardList /> Req.
                                                        </button>

                                                        <button 
                                                            onClick={() => handleOpenSeguimiento(c)}
                                                            className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-semibold text-xs flex items-center gap-1.5" 
                                                            title="Seguimiento"
                                                        >
                                                            <FaRoute /> Seg.
                                                        </button>

                                                        <button 
                                                            onClick={() => handleOpenAgendarVisita(c)} 
                                                            className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 text-indigo-600 hover:from-indigo-100 hover:to-blue-100 hover:border-indigo-300 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 font-semibold text-xs flex items-center gap-1.5" 
                                                            title="Visita"
                                                        >
                                                            <FaCalendarCheck /> Visita
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleViewDetail(c)} 
                                                            className="bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105" 
                                                            title="Ver"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        
                                                        {isAdmin && (
                                                            <button 
                                                                onClick={() => handleEliminar(c.id)} 
                                                                className="bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105" 
                                                                title="Eliminar"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        )}
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

        {/* MODAL NUEVO CLIENTE - MEJORADO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto relative">
                
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-8 flex justify-between items-center">
                  <div>
                      <h3 className="font-black text-2xl flex items-center gap-3"><FaUserPlus className="text-3xl"/> Nuevo Interesado</h3>
                      <p className="text-indigo-200 mt-1 font-medium">Registra un nuevo cliente potencial</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all">
                      <FaTimes className="text-xl"/>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmitCliente)} className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-lg mb-6">
                        <div className="pb-3 border-b-2 border-indigo-100 mb-6 flex justify-between items-center">
                            <h4 className="text-sm font-black text-indigo-600 uppercase tracking-wider">Datos Básicos</h4>
                            <span className="text-xs bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 px-4 py-1.5 rounded-full font-bold shadow-sm">Registro Rápido</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label font-bold text-gray-700 mb-1">Nombre Completo *</label>
                                <input {...register('nombre', { required: true })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                                {errors.nombre && <span className="text-red-500 text-xs mt-1 font-semibold">Requerido</span>}
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-gray-700 mb-1">Celular (9 dígitos) *</label>
                                <input {...register('telefono1', { required: true, minLength: 9, maxLength: 9 })} maxLength={9} onInput={handleNumberInput} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="900000000"/>
                                {errors.telefono1 && <span className="text-red-500 text-xs mt-1 font-semibold">Debe tener 9 dígitos</span>}
                            </div>
                            
                            <div className="form-control relative">
                                <label className="label font-bold text-gray-700 mb-1">Propiedad de Interés (Buscar)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
                                        placeholder="Escribe para buscar (ej: Los Delfines...)"
                                        value={propSearch}
                                        onChange={(e) => {
                                            setPropSearch(e.target.value);
                                            setShowPropSuggestions(true);
                                            if(e.target.value === '') setValue('propiedadId', '');
                                        }}
                                    />
                                    <FaChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none"/>
                                    <input type="hidden" {...register('propiedadId')} />

                                    {showPropSuggestions && propSearch.length > 0 && (
                                        <div className="absolute z-50 w-full bg-white border-2 border-indigo-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto mt-2">
                                            {filteredProps.length > 0 ? (
                                                filteredProps.map(p => (
                                                    <div 
                                                        key={p.id} 
                                                        className="p-4 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 flex flex-col transition-all"
                                                        onClick={() => handleSelectPropiedad(p)}
                                                    >
                                                        <span className="font-bold text-gray-800">{p.tipo} - {p.ubicacion}</span>
                                                        <span className="text-xs text-gray-500 mt-1">{p.direccion}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-gray-400">No se encontraron propiedades.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label font-bold text-gray-700 mb-1">Fecha Registro</label>
                                <input {...register('fechaAlta')} type="date" defaultValue={filterDate} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label font-bold text-gray-700 mb-1 flex items-center gap-2"><FaBullhorn className="text-orange-500"/> Medio de Captación</label>
                                <select {...register('origen')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                                    <option value="">-- Seleccionar --</option>
                                    <option value="Letrero">Letrero</option>
                                    <option value="Urbania">Urbania</option>
                                    <option value="Redes Sociales">Redes Sociales</option>
                                    <option value="Llamada">Llamada</option>
                                    <option value="Referido">Referido</option>
                                </select>
                            </div>
                        </div>

                        {propiedadSeleccionada && (
                            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 animate-fade-in-up relative shadow-md">
                                <button 
                                    type="button" 
                                    onClick={() => setShowFullProperty(true)}
                                    className="absolute top-4 right-4 bg-white hover:bg-indigo-100 text-indigo-600 rounded-full p-3 shadow-md hover:shadow-lg transition-all transform hover:scale-110"
                                    title="Ver ficha completa"
                                >
                                    <FaEye className="text-lg"/>
                                </button>

                                <div className="flex items-center gap-3 mb-5 border-b-2 border-blue-200 pb-4">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-md"><FaInfoCircle className="text-xl"/></div>
                                    <h5 className="font-black text-blue-900 text-lg">Información de la Propiedad</h5>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div className="flex justify-between sm:justify-start sm:gap-3 items-center bg-white p-3 rounded-xl shadow-sm">
                                        <span className="font-semibold text-gray-600 flex items-center gap-2"><FaHome className="text-gray-400"/> Tipo:</span>
                                        <span className="font-bold text-gray-800">{propiedadSeleccionada.tipo}</span>
                                    </div>
                                    <div className="flex justify-between sm:justify-start sm:gap-3 items-center bg-white p-3 rounded-xl shadow-sm">
                                        <span className="font-semibold text-gray-600 flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400"/> Ubicación:</span>
                                        <span className="font-bold text-gray-800">{propiedadSeleccionada.ubicacion}</span>
                                    </div>
                                    <div className="flex justify-between sm:justify-start sm:gap-3 items-center bg-white p-3 rounded-xl shadow-sm">
                                        <span className="font-semibold text-gray-600 flex items-center gap-2"><FaRulerCombined className="text-gray-400"/> Área Terreno:</span>
                                        <span className="font-bold text-gray-800">{propiedadSeleccionada.area} m²</span>
                                    </div>
                                    <div className="flex justify-between sm:justify-start sm:gap-3 items-center bg-white p-3 rounded-xl shadow-sm">
                                        <span className="font-semibold text-gray-600 flex items-center gap-2"><FaHammer className="text-gray-400"/> Área Construida:</span>
                                        <span className="font-bold text-gray-800">{propiedadSeleccionada.areaConstruida || 0} m²</span>
                                    </div>
                                    <div className="flex justify-between sm:justify-start sm:gap-3 sm:col-span-2 items-center border-t-2 border-blue-200 pt-3 mt-2 bg-white p-4 rounded-xl shadow-sm">
                                        <span className="font-semibold text-gray-600 flex items-center gap-2"><FaDollarSign className="text-gray-400"/> Precio:</span>
                                        <span className="font-bold text-green-600 text-xl">
                                            {propiedadSeleccionada.moneda} {Number(propiedadSeleccionada.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {propiedadSeleccionada.tipo === 'Departamento' && (
                                        <div className="sm:col-span-2 mt-2">
                                            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm w-fit">
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
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold transition-all">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Guardando...' : 'Registrar Interesado'}
                        </button>
                    </div>
                </form>

                {showFullProperty && propiedadSeleccionada && (
                    <div className="absolute inset-0 z-[60] bg-white/98 backdrop-blur-sm p-8 flex flex-col animate-fade-in">
                        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 pb-5">
                            <div>
                                <h3 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                                    <FaBuilding className="text-indigo-500"/> {propiedadSeleccionada.tipo} en {propiedadSeleccionada.ubicacion}
                                </h3>
                                <p className="text-gray-500 mt-1 font-medium">{propiedadSeleccionada.direccion}</p>
                            </div>
                            <button type="button" onClick={() => setShowFullProperty(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-3 transition-all transform hover:scale-110">
                                <FaTimes className="text-xl"/>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            <div className="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden relative shadow-lg border-2 border-gray-200">
                                {propiedadSeleccionada.fotoPrincipal ? (
                                    <img src={`${BACKEND_URL}${propiedadSeleccionada.fotoPrincipal}`} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300"><FaImages className="text-6xl"/></div>
                                )}
                                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm text-indigo-900 px-6 py-3 rounded-2xl font-black shadow-2xl text-lg">
                                    {propiedadSeleccionada.moneda} {Number(propiedadSeleccionada.precio).toLocaleString('es-PE')}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl text-center border-2 border-indigo-100 shadow-sm">
                                    <FaBed className="mx-auto text-3xl text-indigo-500 mb-3"/>
                                    <span className="block font-black text-gray-800 text-2xl">{propiedadSeleccionada.habitaciones || 0}</span>
                                    <span className="text-xs text-gray-600 font-semibold">Dormitorios</span>
                                </div>
                                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 p-5 rounded-2xl text-center border-2 border-sky-100 shadow-sm">
                                    <FaBath className="mx-auto text-3xl text-sky-500 mb-3"/>
                                    <span className="block font-black text-gray-800 text-2xl">{propiedadSeleccionada.banos || 0}</span>
                                    <span className="text-xs text-gray-600 font-semibold">Baños</span>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl text-center border-2 border-orange-100 shadow-sm">
                                    <FaCar className="mx-auto text-3xl text-orange-500 mb-3"/>
                                    <span className="block font-black text-gray-800 text-2xl">{propiedadSeleccionada.cocheras || 0}</span>
                                    <span className="text-xs text-gray-600 font-semibold">Cocheras</span>
                                </div>
                            </div>

                            {propiedadSeleccionada.descripcion && (
                                <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-md">
                                    <h4 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wider">Descripción</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{propiedadSeleccionada.descripcion}</p>
                                </div>
                            )}

                            {propiedadSeleccionada.detalles && (
                                <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-md">
                                    <h4 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wider">Distribución</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{propiedadSeleccionada.detalles}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-5 border-t-2 border-gray-100 mt-4 flex justify-end">
                            <button type="button" onClick={() => setShowFullProperty(false)} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold w-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                                Volver al Registro
                            </button>
                        </div>
                    </div>
                )}

             </div>
          </div>
        )}

        {/* MODAL SEGUIMIENTO - MEJORADO */}
        {isSeguimientoOpen && clienteSeguimiento && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative border-t-8 border-sky-500">
                    <button onClick={() => setSeguimientoOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 hover:bg-gray-100">✕</button>
                    <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3 mb-2"><FaRoute className="text-sky-500 text-3xl"/> Nuevo Seguimiento</h3>
                    <p className="text-sm text-gray-500 mb-6">Registrando actividad para: <span className="font-bold text-gray-800">{clienteSeguimiento.nombre}</span></p>
                    <form onSubmit={handleSubmitSeg(onSubmitSeguimiento)} className="space-y-5">
                        <div className="bg-gradient-to-r from-blue-100 to-sky-100 p-4 rounded-xl flex items-center gap-3 border-2 border-blue-200 shadow-sm">
                            <FaCalendarCheck className="text-blue-500 text-2xl"/>
                            <div>
                                <p className="text-xs font-black text-blue-600 uppercase tracking-wide">Fecha de Registro</p>
                                <p className="font-bold text-gray-800">{fechaHoyVisual}</p>
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-gray-700 mb-2">Comentario / Resultado *</label>
                            <textarea {...registerSeg('comentario', { required: true })} className="w-full px-4 py-3 h-32 border-2 border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all" placeholder="Ej. El cliente está interesado pero viaja mañana..."></textarea>
                            {errorsSeg.comentario && <span className="text-red-500 text-xs mt-1 font-semibold">Este campo es obligatorio</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label font-bold text-gray-700 mb-2">Estado *</label>
                                <select {...registerSeg('estado')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all">
                                    <option value="PENDIENTE">⏳ Pendiente</option>
                                    <option value="FINALIZADO">✅ Finalizado</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-gray-700 mb-2">Próximo Contacto</label>
                                <input type="date" {...registerSeg('fechaProxima', { required: true })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all flex-1" onClick={() => setSeguimientoOpen(false)}>Cancelar</button>
                            <button type="submit" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex-1 flex items-center justify-center gap-2">
                                <FaSave /> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL REQUERIMIENTO - MEJORADO */}
        {isReqOpen && clienteReq && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative border-t-8 border-orange-500">
                    <button onClick={() => setReqOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 hover:bg-gray-100">✕</button>
                    
                    <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3 mb-2">
                       <FaClipboardList className="text-orange-500 text-3xl"/> Nuevo Requerimiento
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Pedido de: <span className="font-bold text-gray-800">{clienteReq.nombre}</span>
                    </p>

                    <form onSubmit={handleSubmitReq(onSubmitReq)} className="space-y-5">
                        <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 rounded-xl flex items-center gap-3 border-2 border-orange-200 shadow-sm">
                            <FaCalendarCheck className="text-orange-500 text-2xl"/>
                            <div>
                                <p className="text-xs font-black text-orange-600 uppercase tracking-wide">Fecha de Registro</p>
                                <p className="font-bold text-gray-800">{fechaHoyVisual}</p>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold text-gray-700 mb-2">¿Qué busca el cliente? *</label>
                            <textarea 
                                {...registerReq('pedido', { required: true })} 
                                className="w-full px-4 py-3 h-32 border-2 border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all" 
                                placeholder="Ej. Busca casa en Cayma, 3 habitaciones, con cochera, presupuesto $200k..."
                            ></textarea>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold text-gray-700 mb-3">Prioridad</label>
                            <div className="flex gap-4">
                                <label className="cursor-pointer flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 w-full justify-center transition-all">
                                    <input {...registerReq('prioridad')} type="radio" value="NORMAL" className="radio" defaultChecked /> 
                                    <span className="font-semibold">Normal</span>
                                </label>
                                <label className="cursor-pointer flex items-center gap-3 p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 w-full justify-center transition-all">
                                    <input {...registerReq('prioridad')} type="radio" value="URGENTE" className="radio radio-error" /> 
                                    <span className="font-bold text-red-600">URGENTE</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all flex-1" onClick={() => setReqOpen(false)}>Cancelar</button>
                            <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex-1 flex items-center justify-center gap-2">
                                <FaSave /> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL DETALLE DE CLIENTE - MEJORADO */}
        {isDetailOpen && selectedCliente && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-white w-full max-w-2xl rounded-3xl p-8 relative shadow-2xl">
                    <button onClick={()=>setDetailOpen(false)} className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 absolute right-6 top-6 transition-all">
                        <FaTimes className="text-gray-600"/>
                    </button>
                    <h2 className="text-3xl font-black mb-6 text-indigo-900 flex items-center gap-3">
                        <FaUser className="text-indigo-500"/> {selectedCliente.nombre}
                    </h2>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 font-semibold mb-1">Celular</p>
                            <p className="font-bold text-gray-800">{selectedCliente.telefono1}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 font-semibold mb-1">Tipo</p>
                            <p className="font-bold text-gray-800">{selectedCliente.tipo === 'CLIENTE' ? 'CLIENTE' : 'INTERESADO'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                            <p className="font-bold text-gray-800">{selectedCliente.email || '---'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-500 font-semibold mb-1">DNI</p>
                            <p className="font-bold text-gray-800">{selectedCliente.dni || '---'}</p>
                        </div>
                        {selectedCliente.origen && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 col-span-2">
                                <p className="text-xs text-gray-500 font-semibold mb-1">Medio de Captación</p>
                                <p className="font-bold text-gray-800">{selectedCliente.origen}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}