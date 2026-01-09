'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createCliente, createInteres, eliminarCliente } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext'; 
import { 
  FaUser, FaSearch, FaEye, FaPhone, FaUserPlus, FaTrafficLight, FaCalendarCheck, 
  FaCalendarAlt, FaUndo, FaTrash, FaUserTie, FaFilter, FaHistory,
  FaInfoCircle
} from 'react-icons/fa';

// Interface del formulario de Cliente
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
}

export default function ClientesPage() {
  const router = useRouter(); 
  const { clientes, fetchClientes, propiedades, fetchPropiedades, intereses, fetchIntereses, loading } = useInmobiliariaStore();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  const today = new Date().toISOString().split('T')[0];

  const [filterDate, setFilterDate] = useState(today);
  const [filterType, setFilterType] = useState<'TODOS' | 'PROSPECTO' | 'CLIENTE'>('TODOS'); 

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormClienteCompleto>();

  const selectedPropiedadId = watch('propiedadId');
  const propiedadSeleccionada = propiedades.find(p => p.id === selectedPropiedadId);

  useEffect(() => {
    fetchClientes();
    fetchPropiedades();
    fetchIntereses();
  }, []);

  // --- 🟢 LÓGICA INTELIGENTE DE BÚSQUEDA ---
  const clientesFiltrados = useMemo(() => {
      // 1. Filtro por Texto (Nombre, DNI, Teléfono)
      let filtrados = clientes.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.dni && c.dni.includes(searchTerm)) ||
        c.telefono1.includes(searchTerm)
      );

      // 2. Lógica de Fecha:
      // SI HAY TEXTO EN EL BUSCADOR -> IGNORAMOS LA FECHA (Buscamos en todo el historial)
      // SI NO HAY TEXTO -> Aplicamos el filtro de fecha (Solo mostramos lo de ese día)
      if (searchTerm === '') {
          filtrados = filtrados.filter(c => {
              const fechaRaw = c.fechaAlta || c.createdAt || '';
              const fechaRegistro = fechaRaw.split('T')[0];
              return fechaRegistro === filterDate;
          });
      }

      // 3. Filtro por Tipo (Siempre aplica, para poder buscar "solo clientes llamados Moises")
      if (filterType !== 'TODOS') {
          filtrados = filtrados.filter(c => c.tipo === filterType);
      }

      // Ordenar por hora (más reciente primero)
      filtrados.sort((a, b) => {
          const dateA = new Date(a.fechaAlta || a.createdAt || new Date().toISOString());
          const dateB = new Date(b.fechaAlta || b.createdAt || new Date().toISOString());
          return dateB.getTime() - dateA.getTime();
      });

      return filtrados;
  }, [clientes, searchTerm, filterDate, filterType]);


  // --- ACCIONES ---

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
              <p className="text-gray-500 mt-1">Gestiona tus interesados y citas.</p>
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
             <button onClick={() => setModalOpen(true)} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none px-6 shadow-md">
                 <FaUserPlus className="text-lg"/> Nuevo
             </button>
          </div>
        </div>

        {/* 🟢 BARRA DE FILTROS (FECHA + TIPO) */}
        {/* Si hay búsqueda, cambiamos visualmente esta barra para indicar que se busca en todo el historial */}
        <div className="flex flex-col xl:flex-row items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4 transition-all">
            
            {/* SELECCIÓN DE FECHA O AVISO DE BÚSQUEDA GLOBAL */}
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
                                <button 
                                    onClick={() => setFilterDate(today)}
                                    className="btn btn-sm btn-ghost text-indigo-600 hover:bg-indigo-50"
                                    title="Volver a Hoy"
                                >
                                    <FaUndo/>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* FILTRO POR TIPO */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-full xl:w-auto">
                <button 
                    onClick={() => setFilterType('TODOS')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all ${filterType === 'TODOS' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Todos
                </button>
                <button 
                    onClick={() => setFilterType('PROSPECTO')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${filterType === 'PROSPECTO' ? 'bg-white shadow text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FaTrafficLight/> Interesados
                </button>
                <button 
                    onClick={() => setFilterType('CLIENTE')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${filterType === 'CLIENTE' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FaUserTie/> Clientes
                </button>
            </div>
        </div>

        {/* LISTA FILTRADA */}
        {loading ? (
            <div className="text-center py-10">Cargando datos...</div>
        ) : (
            <div className="animate-fade-in-up">
                
                {/* TÍTULO DE LA SECCIÓN (Dinámico) */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium text-sm">
                            {searchTerm ? (
                                <>Resultados para <b>"{searchTerm}"</b> en el historial</>
                            ) : (
                                <>Registros del <b>{formatDateLabel(filterDate)}</b></>
                            )}
                        </span>
                    </div>
                    <span className="badge badge-lg bg-indigo-100 text-indigo-800 border-none font-bold">
                        {clientesFiltrados.length} resultados
                    </span>
                </div>

                {/* TABLA O MENSAJE VACÍO */}
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
                                        {/* Si busco en historial, muestro la fecha de registro */}
                                        {searchTerm && <th>Fecha Reg.</th>} 
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {clientesFiltrados.map((c: any) => {
                                        const interesC = intereses.find(i => i.clienteId === c.id);
                                        const propC = interesC?.Propiedad;
                                        // Fecha legible si estamos buscando en historial
                                        const fechaReg = new Date(c.fechaAlta || c.createdAt).toLocaleDateString();

                                        return (
                                            <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="pl-6">
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
                                                {/* Mostrar fecha si es búsqueda global */}
                                                {searchTerm && (
                                                    <td className="text-xs font-bold text-gray-500">{fechaReg}</td>
                                                )}
                                                <td>
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleOpenAgendarVisita(c)} className="btn btn-sm bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200 gap-2 font-medium" title="Agendar en Calendario"><FaCalendarCheck /> Visita</button>
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
              <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
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
                                <input 
                                    {...register('telefono1', { required: true, minLength: 9, maxLength: 9 })} 
                                    maxLength={9} 
                                    onInput={handleNumberInput} 
                                    className="input input-bordered w-full"
                                    placeholder="900000000"
                                />
                                {errors.telefono1 && <span className="text-red-500 text-xs">Debe tener 9 dígitos</span>}
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-gray-700">Propiedad de Interés</label>
                                <select {...register('propiedadId')} className="select select-bordered w-full">
                                    <option value="">-- Seleccionar --</option>
                                    {propiedades.map(p => (
                                        <option key={p.id} value={p.id}>{p.tipo} - {p.direccion}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-gray-700">Fecha Registro</label>
                                <input {...register('fechaAlta')} type="date" defaultValue={filterDate} className="input input-bordered w-full"/>
                            </div>
                        </div>
                        {propiedadSeleccionada && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-4 items-start">
                                <div className="text-blue-500 text-xl mt-1"><FaInfoCircle/></div>
                                <div className="text-sm w-full">
                                    <h5 className="font-bold text-blue-900 mb-1">Información de la Propiedad</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <p><span className="font-semibold">Tipo:</span> {propiedadSeleccionada.tipo}</p>
                                        <p className="col-span-2"><span className="font-semibold">Ubicación:</span> {propiedadSeleccionada.ubicacion}</p>
                                        <p><span className="font-semibold">Área:</span> {propiedadSeleccionada.area} m²</p>
                                        <p className="col-span-2">
                                            <span className="font-semibold">Precio:</span> 
                                            <span className="text-green-600 font-bold ml-1">{propiedadSeleccionada.moneda} {propiedadSeleccionada.precio}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-indigo-600">{isSubmitting ? 'Guardando...' : 'Registrar Interesado'}</button>
                    </div>
                </form>
             </div>
          </div>
        )}

        {/* MODAL DETALLE */}
        {isDetailOpen && selectedCliente && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                <div className="bg-white w-full max-w-2xl rounded-2xl p-6 relative">
                    <button onClick={()=>setDetailOpen(false)} className="btn btn-sm btn-circle absolute right-4 top-4">✕</button>
                    <h2 className="text-2xl font-bold mb-4 text-indigo-900">{selectedCliente.nombre}</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong>Celular:</strong> {selectedCliente.telefono1}</p>
                        <p><strong>Tipo:</strong> {selectedCliente.tipo}</p>
                        <p><strong>Email:</strong> {selectedCliente.email || '---'}</p>
                        <p><strong>DNI:</strong> {selectedCliente.dni || '---'}</p>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}