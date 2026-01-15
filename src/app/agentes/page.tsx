'use client';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion';
import { getAgentes, createAgente, toggleEstadoAgente, deleteAgente } from '../../services/api';
import { FaUserSecret, FaPlus, FaSearch, FaPhone, FaWhatsapp, FaBuilding, FaBan, FaCheckCircle, FaTrash, FaExclamationTriangle, FaFilter } from 'react-icons/fa';

export default function AgentesPage() {
  const [agentes, setAgentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // NUEVO: Estado para el filtro de botones
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'ALIADO' | 'OBSERVADO'>('TODOS');
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    inmobiliaria: '',
    celular1: '',
    celular2: '',
    celular3: '',
    datosAdicionales: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
        const data = await getAgentes();
        setAgentes(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          await createAgente(formData);
          alert('✅ Agente registrado');
          setModalOpen(false);
          setFormData({ nombre: '', inmobiliaria: '', celular1: '', celular2: '', celular3: '', datosAdicionales: '' });
          cargarDatos();
      } catch (error) {
          alert('Error al registrar');
      } finally { setIsSubmitting(false); }
  };

  const handleToggleStatus = async (id: string, estadoActual: string) => {
      const nuevoEstado = estadoActual === 'ALIADO' ? 'OBSERVADO' : 'ALIADO';
      const mensaje = nuevoEstado === 'OBSERVADO' 
        ? "⛔ ¿Marcar como OBSERVADO?\nEsto indicará que hay que tener cuidado con este agente." 
        : "✅ ¿Marcar como ALIADO?\nSe considerará un colega confiable.";
      
      if(!confirm(mensaje)) return;

      try {
          await toggleEstadoAgente(id);
          cargarDatos();
      } catch (error) { alert('Error al cambiar estado'); }
  };

  const handleEliminar = async (id: string) => {
      if(!confirm("⚠️ ¿Eliminar agente permanentemente?")) return;
      try { await deleteAgente(id); cargarDatos(); } 
      catch (e) { alert('Error'); }
  };

  // 🔍 LÓGICA DE BÚSQUEDA + FILTROS DE ESTADO
  const filtrados = useMemo(() => {
      const term = searchTerm.toLowerCase();
      
      return agentes.filter(a => {
        // 1. Filtro por Texto (Nombre, Inmobiliaria, Celulares)
        const matchesSearch = 
            a.nombre.toLowerCase().includes(term) || 
            a.inmobiliaria?.toLowerCase().includes(term) ||
            a.celular1?.includes(term) || 
            a.celular2?.includes(term) || 
            a.celular3?.includes(term);
        
        // 2. Filtro por Estado (Botones)
        const matchesStatus = filterStatus === 'TODOS' || a.estado === filterStatus;

        return matchesSearch && matchesStatus;
      });
  }, [agentes, searchTerm, filterStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 relative">
          <SidebarAtencion /> 

          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            
            {/* HEADER CON BUSCADOR Y FILTROS */}
            <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <div className="w-full xl:w-auto">
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <FaUserSecret className="text-slate-600"/> Directorio de Agentes
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Gestión de colegas y lista negra.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
                    
                    {/* BOTONES DE FILTRO */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setFilterStatus('TODOS')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === 'TODOS' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Todos
                        </button>
                        <button 
                            onClick={() => setFilterStatus('ALIADO')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filterStatus === 'ALIADO' ? 'bg-emerald-500 shadow text-white' : 'text-slate-500 hover:text-emerald-600'}`}
                        >
                            <FaCheckCircle/> Aliados
                        </button>
                        <button 
                            onClick={() => setFilterStatus('OBSERVADO')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filterStatus === 'OBSERVADO' ? 'bg-red-500 shadow text-white' : 'text-slate-500 hover:text-red-600'}`}
                        >
                            <FaExclamationTriangle/> Observados
                        </button>
                    </div>

                    {/* BUSCADOR */}
                    <div className="relative w-full md:w-64">
                        <FaSearch className="absolute left-3 top-3.5 text-slate-400"/>
                        <input 
                            type="text" 
                            placeholder="Nombre o celular..." 
                            className="input input-bordered w-full pl-10 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* BOTÓN NUEVO */}
                    <button onClick={() => setModalOpen(true)} className="btn bg-slate-800 text-white hover:bg-slate-900 rounded-xl gap-2 shadow-lg w-full md:w-auto">
                        <FaPlus/> Nuevo
                    </button>
                </div>
            </div>

            {/* GRID DE AGENTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrados.length === 0 && (
                    <div className="col-span-full text-center py-10 opacity-50">
                        <FaUserSecret className="text-6xl mx-auto mb-4 text-slate-300"/>
                        <p className="text-xl font-bold">No se encontraron agentes</p>
                        <p className="text-sm">Prueba cambiando los filtros o la búsqueda</p>
                    </div>
                )}

                {filtrados.map((agente) => {
                    const isBaneado = agente.estado === 'OBSERVADO';
                    
                    return (
                        <div key={agente.id} className={`relative p-6 rounded-2xl shadow-md border-2 transition-all duration-300 group hover:-translate-y-1 
                            ${isBaneado 
                                ? 'bg-red-50 border-red-200 hover:shadow-red-100' 
                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-indigo-50'
                            }`}
                        >
                            {/* ESTADO BADGE */}
                            <div className="absolute top-4 right-4">
                                {isBaneado ? (
                                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <FaExclamationTriangle/> Observado
                                    </div>
                                ) : (
                                    <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <FaCheckCircle/> Aliado
                                    </div>
                                )}
                            </div>

                            {/* INFO PRINCIPAL */}
                            <div className="mb-4 pr-24">
                                <h3 className={`text-xl font-bold ${isBaneado ? 'text-red-800' : 'text-slate-800'}`}>
                                    {agente.nombre}
                                </h3>
                                <p className="text-sm text-slate-500 font-bold flex items-center gap-2 mt-1">
                                    <FaBuilding className={isBaneado ? 'text-red-300' : 'text-indigo-400'}/> 
                                    {agente.inmobiliaria || 'Independiente'}
                                </p>
                            </div>

                            {/* CELULARES */}
                            <div className="space-y-2 mb-4">
                                {[agente.celular1, agente.celular2, agente.celular3].filter(Boolean).map((cel, idx) => (
                                    <div key={idx} className={`flex items-center gap-2 text-sm p-2 rounded-lg border w-fit ${isBaneado ? 'bg-white border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <FaPhone className="text-slate-400 text-xs"/>
                                        <span className={`font-mono font-bold ${searchTerm && cel.includes(searchTerm) ? 'text-blue-600 bg-blue-100 px-1 rounded' : 'text-slate-600'}`}>
                                            {cel}
                                        </span>
                                        <a href={`https://wa.me/51${cel}`} target="_blank" className="text-emerald-500 hover:scale-110 transition-transform ml-1"><FaWhatsapp/></a>
                                    </div>
                                ))}
                            </div>

                            {/* NOTAS */}
                            {agente.datosAdicionales && (
                                <div className={`text-xs italic p-3 rounded-xl mb-4 border ${isBaneado ? 'bg-red-100/50 text-red-700 border-red-100' : 'bg-slate-100/50 text-slate-500 border-slate-100'}`}>
                                    "{agente.datosAdicionales}"
                                </div>
                            )}

                            {/* BOTONES DE ACCIÓN */}
                            <div className="flex gap-2 pt-2 border-t border-slate-200/60 mt-auto">
                                <button 
                                    onClick={() => handleToggleStatus(agente.id, agente.estado)}
                                    className={`flex-1 btn btn-sm border-none text-white font-bold ${isBaneado ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                                >
                                    {isBaneado ? <><FaCheckCircle/> Quitar Alerta</> : <><FaBan/> Marcar Observado</>}
                                </button>
                                <button 
                                    onClick={() => handleEliminar(agente.id)}
                                    className="btn btn-sm btn-ghost text-slate-400 hover:text-red-500"
                                >
                                    <FaTrash/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL NUEVO AGENTE */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-scaleIn">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <FaUserSecret className="text-indigo-600"/> Registrar Colega
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control col-span-2">
                                    <label className="label font-bold text-slate-600">Nombre del Agente *</label>
                                    <input required type="text" className="input input-bordered" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                                </div>
                                <div className="form-control col-span-2">
                                    <label className="label font-bold text-slate-600">Inmobiliaria / Empresa</label>
                                    <input type="text" className="input input-bordered" value={formData.inmobiliaria} onChange={e => setFormData({...formData, inmobiliaria: e.target.value})} />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Celular 1</label>
                                    <input type="text" className="input input-bordered" placeholder="Principal" value={formData.celular1} onChange={e => setFormData({...formData, celular1: e.target.value})} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Celular 2</label>
                                    <input type="text" className="input input-bordered" placeholder="Opcional" value={formData.celular2} onChange={e => setFormData({...formData, celular2: e.target.value})} />
                                </div>
                                <div className="form-control col-span-2">
                                    <label className="label font-bold text-slate-600">Celular 3 (Opcional)</label>
                                    <input type="text" className="input input-bordered" placeholder="Opcional" value={formData.celular3} onChange={e => setFormData({...formData, celular3: e.target.value})} />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label font-bold text-slate-600">Datos Adicionales / Notas</label>
                                <textarea className="textarea textarea-bordered h-20" placeholder="Links de FB, observaciones..." value={formData.datosAdicionales} onChange={e => setFormData({...formData, datosAdicionales: e.target.value})}></textarea>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setModalOpen(false)} className="btn flex-1 btn-ghost">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="btn flex-1 bg-slate-800 text-white hover:bg-slate-900">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

          </main>
      </div>
    </div>
  );
}