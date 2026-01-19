'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { getAgentes, createAgente, toggleEstadoAgente, deleteAgente, importarAgentesMasivo } from '../../services/api';
import { FaUserSecret, FaPlus, FaSearch, FaPhone, FaWhatsapp, FaBuilding, FaBan, FaCheckCircle, FaTrash, FaExclamationTriangle, FaFileUpload, FaLink, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { read, utils } from 'xlsx';

export default function AgentesPage() {
  const [agentes, setAgentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'ALIADO' | 'OBSERVADO'>('TODOS');
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    inmobiliaria: '',
    celular1: '',
    celular2: '',
    celular3: '',
    link: '', 
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

  const getValidUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event: any) => {
        const wb = read(event.target.result, { type: 'binary' });
        const sheets = wb.SheetNames;

        if (sheets.length) {
            const rows: any[] = utils.sheet_to_json(wb.Sheets[sheets[0]], { header: 1 });
            const agentesFormateados = rows.slice(1).map((row) => {
                if (!row[1] && !row[4]) return null;
                const rawInfo = row[6] ? String(row[6]) : '';
                let linkDetectado = '';
                let notaDetectada = '';

                if (rawInfo.toLowerCase().includes('http') || rawInfo.toLowerCase().includes('www') || rawInfo.toLowerCase().includes('.com')) {
                    linkDetectado = rawInfo;
                } else {
                    notaDetectada = rawInfo;
                }

                return {
                    celular1: row[1] ? String(row[1]).replace(/\D/g, '').slice(0, 9) : '',
                    celular2: row[2] ? String(row[2]).replace(/\D/g, '').slice(0, 9) : '',
                    celular3: row[3] ? String(row[3]).replace(/\D/g, '').slice(0, 9) : '',
                    nombre: row[4] || 'Agente Sin Nombre',
                    inmobiliaria: row[5] || '',
                    link: linkDetectado,
                    datosAdicionales: notaDetectada,
                    estado: 'ALIADO'
                };
            }).filter(Boolean);

            if (confirm(`📦 Se encontraron ${agentesFormateados.length} agentes.\n¿Importar ahora?`)) {
                try {
                    setLoading(true);
                    await importarAgentesMasivo(agentesFormateados);
                    alert('🚀 ¡Carga masiva exitosa!');
                    cargarDatos();
                } catch (error) { alert('Error al importar datos'); } 
                finally { setLoading(false); }
            }
        }
    };
    reader.readAsBinaryString(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await createAgente(formData);
        alert('✅ Agente registrado');
        setModalOpen(false);
        setFormData({ nombre: '', inmobiliaria: '', celular1: '', celular2: '', celular3: '', link: '', datosAdicionales: '' });
        cargarDatos();
    } catch (error) { alert('Error al registrar'); } 
    finally { setIsSubmitting(false); }
  };

  const handleToggleStatus = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'ALIADO' ? 'OBSERVADO' : 'ALIADO';
    if (nuevoEstado === 'OBSERVADO') {
      if(!confirm("⛔ ¿Marcar como OBSERVADO?\nEsto lo pondrá en la lista de alerta.")) return;
    }
    try { await toggleEstadoAgente(id); cargarDatos(); } catch (error) { alert('Error'); }
  };

  const handleEliminar = async (id: string) => {
    if(!confirm("⚠️ ¿Eliminar agente permanentemente?")) return;
    try { await deleteAgente(id); cargarDatos(); } catch (e) { alert('Error'); }
  };

  const filtrados = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return agentes.filter(a => {
      const matchesSearch = 
        a.nombre?.toLowerCase().includes(term) || 
        a.inmobiliaria?.toLowerCase().includes(term) ||
        a.celular1?.includes(term) || 
        a.celular2?.includes(term) || 
        a.celular3?.includes(term);
      const matchesStatus = filterStatus === 'TODOS' || a.estado === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [agentes, searchTerm, filterStatus]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 relative">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        
        {/* HEADER */}
        <div className="mb-8 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-white/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
          <div className="relative flex flex-col xl:flex-row justify-between items-center gap-6">
            <div className="w-full xl:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg">
                  <FaUserSecret className="text-white text-2xl"/>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
                    Directorio de Agentes
                  </h1>
                  <p className="text-slate-500 font-semibold text-sm">Gestión de colegas y lista de observación</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
              {/* FILTROS */}
              <div className="flex bg-white shadow-lg shadow-slate-200/50 p-1.5 rounded-2xl border border-slate-200/60">
                <button onClick={() => setFilterStatus('TODOS')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filterStatus === 'TODOS' ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 text-white scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>Todos</button>
                <button onClick={() => setFilterStatus('ALIADO')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${filterStatus === 'ALIADO' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 text-white scale-105' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}><FaCheckCircle/> Aliados</button>
                <button onClick={() => setFilterStatus('OBSERVADO')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${filterStatus === 'OBSERVADO' ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30 text-white scale-105' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`}><FaExclamationTriangle/> Observados</button>
              </div>

              {/* BUSCADOR */}
              <div className="relative w-full md:w-72 group">
                <FaSearch className="absolute left-4 top-4 text-slate-400 group-focus-within:text-purple-500 transition-colors"/>
                <input type="text" placeholder="Buscar agente o número..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-200/60 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
              </div>
              
              {/* BOTONES */}
              <div className="flex gap-3">
                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-2 hover:scale-105"><FaFileUpload className="text-lg"/> Importar</button>
                <button onClick={() => setModalOpen(true)} className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 flex items-center gap-2 hover:scale-105"><FaPlus className="text-lg"/> Nuevo</button>
              </div>
            </div>
          </div>
        </div>

        {/* GRID AGENTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtrados.length === 0 && (
            <div className="col-span-full text-center py-20"><div className="inline-block p-8 bg-white/60 backdrop-blur rounded-3xl"><FaUserSecret className="text-7xl mx-auto mb-4 text-slate-300"/><p className="text-xl font-bold text-slate-400">No se encontraron agentes</p></div></div>
          )}
          {filtrados.map((agente) => {
            const isBaneado = agente.estado === 'OBSERVADO';
            return (
              <div key={agente.id} className={`relative p-6 rounded-3xl shadow-lg border-2 transition-all duration-300 group hover:-translate-y-2 hover:shadow-2xl flex flex-col overflow-hidden ${isBaneado ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 hover:border-red-300' : 'bg-white border-slate-200/60 hover:border-purple-300'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${isBaneado ? 'from-red-500/5 to-transparent' : 'from-purple-500/5 to-transparent'}`}></div>
                <div className="absolute top-4 right-4 z-10">
                  {isBaneado ? <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-500/30"><FaExclamationTriangle/> Observado</div> : <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"><FaCheckCircle/> Aliado</div>}
                </div>
                <div className="mb-4 pr-28 relative z-10">
                  <h3 className={`text-xl font-black mb-1 ${isBaneado ? 'text-red-800' : 'text-slate-800'}`}>{agente.nombre}</h3>
                  <p className={`text-sm font-bold flex items-center gap-2 ${isBaneado ? 'text-red-600/80' : 'text-purple-600/80'}`}><FaBuilding/> {agente.inmobiliaria || 'Independiente'}</p>
                </div>
                <div className="mb-4 space-y-2 relative z-10">
                  {agente.link && (
                    <a href={getValidUrl(agente.link)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline text-sm font-bold transition-all p-2.5 rounded-xl hover:bg-blue-50 w-full truncate group/link" title={agente.link}><FaLink className="flex-shrink-0 group-hover/link:scale-110 transition-transform"/><span className="truncate">{agente.link}</span><FaExternalLinkAlt className="text-xs opacity-50 ml-auto"/></a>
                  )}
                  {agente.datosAdicionales && (<div className={`text-xs italic p-3.5 rounded-xl border-2 font-semibold ${isBaneado ? 'bg-red-100/70 text-red-800 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>"{agente.datosAdicionales}"</div>)}
                </div>
                <div className="space-y-2.5 mb-4 mt-auto relative z-10">
                  {[agente.celular1, agente.celular2, agente.celular3].filter(Boolean).map((cel: string, idx: number) => (
                    <div key={idx} className={`flex items-center gap-3 text-sm p-3 rounded-xl border-2 w-full transition-all hover:scale-[1.02] ${isBaneado ? 'bg-white border-red-200 hover:border-red-300' : 'bg-gradient-to-r from-slate-50 to-purple-50/30 border-slate-200 hover:border-purple-300'}`}>
                      <FaPhone className="text-slate-400"/><span className={`font-mono font-bold flex-1 ${searchTerm && cel.includes(searchTerm) ? 'text-blue-600 bg-blue-100 px-2 py-0.5 rounded' : 'text-slate-700'}`}>{cel}</span>
                      <a href={`https://wa.me/51${cel}`} target="_blank" className="text-emerald-500 hover:text-emerald-600 hover:scale-125 transition-all p-1"><FaWhatsapp className="text-lg"/></a>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2.5 pt-4 border-t-2 border-slate-200/60 relative z-10">
                  <button onClick={() => handleToggleStatus(agente.id, agente.estado)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isBaneado ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/30 hover:scale-105' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30 hover:scale-105'}`}>{isBaneado ? <><FaCheckCircle/> Quitar Alerta</> : <><FaBan/> Marcar</>}</button>
                  <button onClick={() => handleEliminar(agente.id)} className="px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 hover:scale-110"><FaTrash/></button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL OPTIMIZADO Y COMPACTO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            {/* max-w-2xl para dar espacio horizontal pero formulario compacto */}
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl"><FaUserSecret/></div>
                    <div><h2 className="text-2xl font-black">Registrar Agente</h2></div>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white"><FaTimes className="text-xl"/></button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* FILA 1: Nombre e Inmobiliaria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1.5 font-bold text-slate-700 text-xs uppercase tracking-wider">Nombre Completo *</label>
                            <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:outline-none font-semibold text-slate-700" placeholder="Ej: Carlos Mendoza" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        </div>
                        <div>
                            <label className="block mb-1.5 font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2"><FaBuilding className="text-purple-500"/> Inmobiliaria</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:outline-none font-semibold text-slate-700" placeholder="Ej: Propiedades Prime" value={formData.inmobiliaria} onChange={e => setFormData({...formData, inmobiliaria: e.target.value})} />
                        </div>
                    </div>

                    {/* FILA 2: Celulares (3 columnas) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block mb-1.5 font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1"><FaPhone className="text-emerald-500"/> Celular 1 *</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:outline-none font-mono font-bold text-slate-700" maxLength={9} placeholder="999..." value={formData.celular1} onChange={e => setFormData({...formData, celular1: e.target.value.replace(/\D/g, '').slice(0, 9)})} />
                        </div>
                        <div>
                            <label className="block mb-1.5 font-bold text-slate-700 text-xs uppercase tracking-wider">Celular 2</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:outline-none font-mono font-bold text-slate-700" maxLength={9} placeholder="Opcional" value={formData.celular2} onChange={e => setFormData({...formData, celular2: e.target.value.replace(/\D/g, '').slice(0, 9)})} />
                        </div>
                        <div>
                            <label className="block mb-1.5 font-bold text-slate-700 text-xs uppercase tracking-wider">Celular 3</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:outline-none font-mono font-bold text-slate-700" maxLength={9} placeholder="Opcional" value={formData.celular3} onChange={e => setFormData({...formData, celular3: e.target.value.replace(/\D/g, '').slice(0, 9)})} />
                        </div>
                    </div>

                    {/* FILA 3: Link */}
                    <div>
                        <label className="block mb-1.5 font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2"><FaLink className="text-blue-500"/> Link Perfil</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-400 focus:outline-none font-semibold text-slate-700" placeholder="facebook.com/perfil o sitio web" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                    </div>

                    {/* FILA 4: Notas */}
                    <div>
                        <label className="block mb-1.5 font-bold text-slate-700 text-xs uppercase tracking-wider">Notas Adicionales</label>
                        <textarea className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:outline-none font-semibold text-slate-700 resize-none" rows={2} placeholder="Información relevante..." value={formData.datosAdicionales} onChange={e => setFormData({...formData, datosAdicionales: e.target.value})}></textarea>
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100">{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}