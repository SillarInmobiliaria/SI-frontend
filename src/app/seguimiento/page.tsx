'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion';
import { getSeguimientos, updateSeguimiento, createSeguimiento, createRequerimiento } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext'; 
import { useForm } from 'react-hook-form'; 
import { 
  FaRoute, FaCheckCircle, FaClock, FaCommentDots, FaCalendarAlt, FaCheck, 
  FaUndo, FaFilter, FaHandshake, FaSpinner, FaSearch, FaHistory, FaPaperPlane, 
  FaClipboardList, FaCalendarPlus, FaPhone, FaTimes, FaBan, FaBuilding, FaCity, 
  FaRulerCombined, FaDollarSign, FaMoneyBillWave, FaUniversity 
} from 'react-icons/fa';

const DISTRITOS_SUGERIDOS = [
    "Arequipa", "Alto Selva Alegre", "Cayma", "Cerro Colorado", "Characato", 
    "Chiguata", "Jacobo Hunter", "José Luis Bustamante y Rivero", "La Joya", 
    "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata", "Pocsi", 
    "Polobaya", "Quequeña", "Sabandía", "Sachaca", "San Juan de Siguas", 
    "San Juan de Tarucani", "Santa Isabel de Siguas", "Santa Rita de Siguas", 
    "Socabaya", "Tiabaya", "Uchumayo", "Vitor", "Yanahuara", "Yarabamba", "Yura"
];

const BANCOS_PERU = [
    "BCP (Banco de Crédito)", "BBVA", "Interbank", "Scotiabank", "Banco de la Nación", 
    "BanBif", "Pichincha", "GNB", "Banco de Comercio", "Caja Arequipa", "Caja Cusco", "Otro"
];

export default function SeguimientoPage() {
  const router = useRouter();
  const { user } = useAuth(); 
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTROS ---
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); 
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth()); 
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  // --- MODALES ---
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [clientHistory, setClientHistory] = useState<any[]>([]); 
  
  // 📝 ESTADOS DEL CHAT
  const [newComment, setNewComment] = useState(''); 
  const [nextContactDate, setNextContactDate] = useState(''); 

  // --- NUEVO: FORMULARIO REQUERIMIENTO COMPLETO ---
  const [isReqOpen, setReqOpen] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  
  // Multi-select Zonas
  const [zonasQuery, setZonasQuery] = useState('');
  const [zonasSelected, setZonasSelected] = useState<string[]>([]);
  const [showZonasSuggestions, setShowZonasSuggestions] = useState(false);
  
  // Watchers para UI Reactiva
  const reqTipo = watch('reqTipo');
  const reqFormaPago = watch('reqFormaPago');
  const reqPrioridad = watch('reqPrioridad'); // <--- AHORA ESCUCHAMOS LA PRIORIDAD

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await getSeguimientos();
      const sorted = data.sort((a:any, b:any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setSeguimientos(sorted);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleCambiarEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'PENDIENTE' ? 'FINALIZADO' : 'PENDIENTE';
    try { await updateSeguimiento(id, { estado: nuevoEstado }); cargarDatos(); } 
    catch (error) { alert('Error al actualizar'); }
  };

  const handleCierreVenta = (clienteNombre: string) => {
    alert(`🎉 INICIANDO CIERRE DE VENTA\n\nCliente: ${clienteNombre}`);
  };

  const formatearFecha = (fechaString: string) => {
    if (!fechaString) return '--';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-PE', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getISOFechaPeru = (fechaStr: string) => {
      if (!fechaStr) return new Date().toISOString();
      const [anio, mes, dia] = fechaStr.split('-').map(Number);
      const fecha = new Date(anio, mes - 1, dia, 12, 0, 0); 
      return fecha.toISOString();
  };

  // --- LÓGICA DE ZONAS ---
  const filteredDistritos = useMemo(() => {
      if (!zonasQuery) return [];
      const search = zonasQuery.toLowerCase();
      return DISTRITOS_SUGERIDOS.filter(d => d.toLowerCase().includes(search) && !zonasSelected.includes(d));
  }, [zonasQuery, zonasSelected]);

  const handleAddZona = (zona: string) => { const nuevasZonas = [...zonasSelected, zona]; setZonasSelected(nuevasZonas); setValue('reqZonas', nuevasZonas.join(', ')); setZonasQuery(''); setShowZonasSuggestions(false); };
  const handleRemoveZona = (zona: string) => { const nuevasZonas = zonasSelected.filter(z => z !== zona); setZonasSelected(nuevasZonas); setValue('reqZonas', nuevasZonas.join(', ')); };

  // --- LÓGICA FILTRADO ---
  const dataFiltrada = useMemo(() => {
    const filtradosBasicos = seguimientos.filter(s => {
      const texto = searchTerm.toLowerCase();
      const coincideTexto = s.Cliente?.nombre?.toLowerCase().includes(texto) || s.comentario?.toLowerCase().includes(texto);
      if (searchTerm !== '' && !coincideTexto) return false;
      const mesRegistro = new Date(s.fecha).getUTCMonth(); 
      const anioRegistro = new Date(s.fecha).getUTCFullYear();
      return mesRegistro === Number(filtroMes) && anioRegistro === Number(filtroAnio);
    });

    const unicosPorCliente = new Map();
    filtradosBasicos.forEach(item => {
        if (!unicosPorCliente.has(item.clienteId)) {
            unicosPorCliente.set(item.clienteId, item);
        }
    });

    const listaUnica = Array.from(unicosPorCliente.values());
    if (filtroEstado === 'TODOS') return listaUnica;
    return listaUnica.filter(s => s.estado === filtroEstado);

  }, [seguimientos, searchTerm, filtroEstado, filtroMes, filtroAnio]);

  const total = dataFiltrada.length;
  const pendientes = dataFiltrada.filter(s => s.estado === 'PENDIENTE').length;
  const finalizados = dataFiltrada.filter(s => s.estado === 'FINALIZADO').length;
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const handleOpenHistory = (item: any) => {
      setSelectedItem(item);
      const historial = seguimientos.filter(s => s.clienteId === item.clienteId);
      setClientHistory(historial.sort((a:any, b:any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
      
      const hoy = new Date().toISOString().split('T')[0];
      setNextContactDate(hoy);
      
      setHistoryOpen(true);
      setNewComment('');
  };

  const handleAddComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newComment.trim() || !selectedItem) return;

      try {
          const itemsPendientes = clientHistory.filter(h => h.estado === 'PENDIENTE');
          for (const item of itemsPendientes) {
              await updateSeguimiento(item.id, { estado: 'FINALIZADO' });
          }

          const fechaProxISO = nextContactDate ? getISOFechaPeru(nextContactDate) : new Date().toISOString();

          await createSeguimiento({
              clienteId: selectedItem.clienteId,
              usuarioId: user?.id,
              fecha: new Date().toISOString(),
              comentario: newComment,
              estado: 'PENDIENTE',
              fechaProxima: fechaProxISO
          });
          
          alert("✅ Nuevo seguimiento registrado");
          setNewComment('');
          setHistoryOpen(false); 
          cargarDatos(); 
          
      } catch (error) { console.error(error); }
  };

  const handleGoToVisitas = () => {
      if(!selectedItem) return;
      router.push(`/visitas?clienteId=${selectedItem.clienteId}&clienteNombre=${encodeURIComponent(selectedItem.Cliente.nombre)}`);
  };

  // --- CREAR REQUERIMIENTO COMPLETO ---
  const handleOpenReqModal = () => {
      if(!selectedItem) return;
      setReqOpen(true);
      // Resetear el formulario y zonas
      setZonasSelected([]);
      setZonasQuery('');
      reset({ 
          reqTipo: 'COMPRA', 
          reqPrioridad: 'NORMAL', 
          reqFormaPago: 'FINANCIADO',
          reqAreaMin: '', reqAreaMax: '', 
          reqPresupuestoMin: '', reqPresupuestoMax: '',
          reqComentarios: ''
      });
  };

  const handleCreateRequerimiento = async (data: any) => {
      if(!selectedItem) return;
      
      // Si eligió DESCARTADO, pedimos confirmación extra por si acaso
      if (data.reqPrioridad === 'DESCARTADO' && !confirm("⚠️ ¿Marcar este cliente como DESCARTADO?\nEsto indicará que el requerimiento no es viable.")) return;

      try {
          const zonasFinales = zonasSelected.length > 0 ? zonasSelected.join(', ') : data.reqZonas;
          
          let detallePedido = "";
          // Si es descartado, el pedido es simple
          if (data.reqPrioridad === 'DESCARTADO') {
              detallePedido = `[DESCARTADO] Motivo/Intento: ${data.reqTipo} en ${zonasFinales || 'zonas'}. ${data.reqComentarios || ''}`;
          } else {
              detallePedido = `Busca: ${data.reqTipo} en ${zonasFinales || 'Zonas varias'}. Área: ${data.reqAreaMin || 0} - ${data.reqAreaMax || 'Max'} m². Presupuesto: ${data.reqPresupuestoMin || 0} - ${data.reqPresupuestoMax || 'Max'}. Notas: ${data.reqComentarios || ''}`;
              if (data.reqTipo === 'COMPRA') {
                  detallePedido += `\n Pago: ${data.reqFormaPago}.`;
                  if (data.reqFormaPago !== 'CONTADO') detallePedido += ` Banco: ${data.reqBanco || 'Por definir'}`;
              }
          }

          // 1. Crear el requerimiento
          // NOTA: Si es DESCARTADO, pasamos el estado 'DESCARTADO' al backend. Si no, dejamos que el backend ponga 'PENDIENTE'
          await createRequerimiento({
              clienteId: selectedItem.clienteId,
              fecha: new Date().toISOString(),
              pedido: detallePedido,
              prioridad: data.reqPrioridad === 'DESCARTADO' ? 'NORMAL' : data.reqPrioridad, // Guardamos prioridad normal para no romper enum si no existe 'DESCARTADO' en prioridad
              estado: data.reqPrioridad === 'DESCARTADO' ? 'DESCARTADO' : 'PENDIENTE', // Aquí sí mandamos el estado
              usuarioId: user?.id
          });

          // 2. CERRAR el seguimiento actual
          await updateSeguimiento(selectedItem.id, { 
              estado: 'FINALIZADO',
              comentario: data.reqPrioridad === 'DESCARTADO' 
                  ? `[SISTEMA]: Cliente DESCARTADO por requerimiento no viable.` 
                  : `[SISTEMA]: Seguimiento convertido a REQUERIMIENTO.`
          });

          alert(data.reqPrioridad === 'DESCARTADO' ? "⛔ Cliente marcado como DESCARTADO." : "✅ Requerimiento creado exitosamente.");
          setReqOpen(false);
          setHistoryOpen(false);
          cargarDatos();
      } catch (error) { 
          console.error(error);
          alert("Error al procesar"); 
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 relative">
          <SidebarAtencion /> 

          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            {/* ENCABEZADO Y KPIs */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                    <FaRoute className="text-white" size={24}/>
                </div>
                <span className="bg-gradient-to-r from-slate-800 to-pink-900 bg-clip-text text-transparent">Seguimiento</span>
                </h1>
                <p className="text-slate-500 mt-2 ml-[68px] text-sm">Gestiona y monitorea todas las actividades.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-4 text-center"><div className="text-xs font-bold text-slate-400 uppercase">Total Clientes</div><div className="text-3xl font-bold text-slate-800">{total}</div></div>
                <div className="bg-white rounded-xl shadow-lg border-b-4 border-amber-400 p-4 text-center"><div className="text-xs font-bold text-amber-600 uppercase">Pendientes</div><div className="text-3xl font-bold text-amber-500">{pendientes}</div></div>
                <div className="bg-white rounded-xl shadow-lg border-b-4 border-emerald-500 p-4 text-center"><div className="text-xs font-bold text-emerald-600 uppercase">Finalizados</div><div className="text-3xl font-bold text-emerald-500">{finalizados}</div></div>
            </div>
            </div>

            {/* BARRA HERRAMIENTAS */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5 mb-6 flex flex-col xl:flex-row justify-between items-center gap-5 sticky top-4 z-20 backdrop-blur-xl bg-white/90">
                <div className="relative w-full xl:w-96"><FaSearch className="absolute left-4 top-3.5 text-slate-400"/><input type="text" placeholder="Buscar cliente..." className="input input-bordered w-full pl-11 rounded-xl bg-slate-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl"><FaCalendarAlt className="text-slate-400 ml-2"/><select value={filtroMes} onChange={(e) => setFiltroMes(Number(e.target.value))} className="bg-transparent font-bold text-sm outline-none">{meses.map((m, i) => <option key={i} value={i}>{m}</option>)}</select><select value={filtroAnio} onChange={(e) => setFiltroAnio(Number(e.target.value))} className="bg-transparent font-bold text-sm outline-none"><option value={2025}>2025</option><option value={2026}>2026</option></select></div>
                    <div className="join shadow-sm border border-slate-200 rounded-xl">{['TODOS', 'PENDIENTE', 'FINALIZADO'].map(st => (<button key={st} onClick={() => setFiltroEstado(st)} className={`join-item btn btn-sm font-bold ${filtroEstado === st ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}>{st === 'PENDIENTE' ? 'Pendientes' : st === 'FINALIZADO' ? 'Listos' : 'Todos'}</button>))}</div>
                </div>
            </div>

            {/* TABLA UNIFICADA */}
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden">
                {loading ? <div className="text-center py-20"><FaSpinner className="animate-spin text-4xl text-pink-500 mx-auto"/></div> : 
                dataFiltrada.length === 0 ? <div className="text-center py-20 text-slate-400 font-bold">Sin registros</div> : 
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead><tr className="bg-slate-100 text-slate-500 uppercase text-xs font-bold"><th className="pl-8 text-center">Último Mov.</th><th>Cliente</th><th>Última Nota</th><th className="text-center">Próximo</th><th className="text-center">Estado</th><th className="text-center pr-8">Acciones</th></tr></thead>
                        <tbody>
                            {dataFiltrada.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="pl-8 text-center"><div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">{formatearFecha(item.fecha)}</div></td>
                                    <td><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">{item.Cliente?.nombre?.charAt(0)}</div><div><div className="font-bold text-slate-800">{item.Cliente?.nombre}</div><div className="text-xs text-slate-400">{item.Cliente?.telefono1}</div></div></div></td>
                                    <td className="max-w-xs"><p className="text-sm text-slate-600 italic truncate">{item.comentario}</p></td>
                                    <td className="text-center">{item.fechaProxima ? <span className={`text-xs font-bold px-2 py-1 rounded ${new Date(item.fechaProxima) < new Date() && item.estado === 'PENDIENTE' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{formatearFecha(item.fechaProxima)}</span> : '--'}</td>
                                    <td className="text-center"><span className={`badge border-none font-bold ${item.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.estado}</span></td>
                                    <td className="text-center pr-8">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleOpenHistory(item)} className="btn btn-sm btn-circle btn-ghost text-slate-500 tooltip" data-tip="Ver Historial"><FaHistory/></button>
                                            <button onClick={() => handleCambiarEstado(item.id, item.estado)} className="btn btn-sm btn-circle btn-ghost text-emerald-600 tooltip" data-tip="Marcar Finalizado"><FaCheck/></button>
                                            <button onClick={() => handleCierreVenta(item.Cliente?.nombre)} className="btn btn-sm bg-indigo-600 text-white border-none gap-2 px-3 shadow-md hover:bg-indigo-700"><FaHandshake/> Cierre</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                }
            </div>

            {/* MODAL HISTORIAL (CON CHAT Y FECHA) */}
            {isHistoryOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
                        <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
                            <div className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold">{selectedItem.Cliente.nombre.charAt(0)}</div>
                                <div><h2 className="text-xl font-bold">{selectedItem.Cliente.nombre}</h2><span className="text-xs opacity-70 flex gap-2 items-center"><FaPhone/> {selectedItem.Cliente.telefono1}</span></div>
                            </div>
                            <button onClick={() => setHistoryOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
                            <div className="flex gap-3 mb-6">
                                <button onClick={handleOpenReqModal} className="btn flex-1 bg-white text-amber-600 border-amber-200 hover:bg-amber-50 shadow-sm"><FaClipboardList/> Convertir a Requerimiento</button>
                                <button onClick={handleGoToVisitas} className="btn flex-1 bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 shadow-sm"><FaCalendarPlus/> Agendar Visita</button>
                            </div>

                            {/* TIMELINE */}
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 ml-2">Historial de Conversación</h4>
                            <div className="space-y-6 relative pl-4 border-l-2 border-slate-200 ml-2 pb-4">
                                {clientHistory.map((h, i) => (
                                    <div key={h.id} className="relative">
                                        <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${h.estado === 'PENDIENTE' ? 'bg-amber-400 ring-2 ring-amber-100' : 'bg-emerald-500'}`}></div>
                                        <div className="text-xs font-bold text-slate-400 mb-1 flex justify-between items-center">
                                            <span>{new Date(h.fecha).toLocaleDateString()}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${h.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{h.estado}</span>
                                        </div>
                                        <div className={`p-3 rounded-lg border shadow-sm text-sm ${h.estado === 'PENDIENTE' ? 'bg-white border-amber-200 text-slate-800' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>{h.comentario}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CHAT INPUT */}
                        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">📅 Próximo Contacto:</span>
                                <input 
                                    type="date" 
                                    className="input input-xs input-bordered bg-slate-50 font-bold text-slate-600"
                                    value={nextContactDate}
                                    onChange={(e) => setNextContactDate(e.target.value)}
                                />
                            </div>
                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <input type="text" className="input input-bordered w-full bg-slate-50" placeholder="Escribe el resultado..." value={newComment} onChange={(e) => setNewComment(e.target.value)}/>
                                <button type="submit" className="btn btn-primary bg-pink-600 border-none hover:bg-pink-700"><FaPaperPlane/></button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REQUERIMIENTO COMPLETO */}
            {isReqOpen && selectedItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-amber-500 p-4 text-white font-bold flex justify-between items-center">
                            <div className="flex items-center gap-2"><FaClipboardList/> Nuevo Requerimiento Completo</div>
                            <button onClick={()=>setReqOpen(false)} className="hover:bg-white/20 p-2 rounded-full"><FaTimes/></button>
                        </div>
                        <form onSubmit={handleSubmit(handleCreateRequerimiento)} className="p-6 space-y-4">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control"><label className="label font-bold text-slate-700 text-xs">Tipo Operación</label><select {...register('reqTipo')} className="select select-bordered select-sm w-full"><option value="COMPRA">Compra</option><option value="ALQUILER">Alquiler</option></select></div>
                                
                                {/* 🔴 PRIORIDAD CON BOTONES (NORMAL, URGENTE, DESCARTADO) */}
                                <div className="form-control">
                                    <label className="label font-bold text-slate-700 text-xs">Prioridad / Estado</label>
                                    <div className="flex gap-2">
                                        <label className={`cursor-pointer border rounded-lg px-3 py-2 flex-1 text-center text-xs font-bold transition-all ${reqPrioridad === 'NORMAL' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'text-slate-400 border-slate-100 hover:bg-slate-50'}`}>
                                            <input type="radio" {...register('reqPrioridad')} value="NORMAL" className="hidden"/> Normal
                                        </label>
                                        <label className={`cursor-pointer border rounded-lg px-3 py-2 flex-1 text-center text-xs font-bold transition-all ${reqPrioridad === 'URGENTE' ? 'bg-red-100 text-red-700 border-red-200' : 'text-slate-400 border-slate-100 hover:bg-red-50'}`}>
                                            <input type="radio" {...register('reqPrioridad')} value="URGENTE" className="hidden"/> Urgente
                                        </label>
                                        <label className={`cursor-pointer border rounded-lg px-3 py-2 flex-1 text-center text-xs font-bold transition-all ${reqPrioridad === 'DESCARTADO' ? 'bg-gray-800 text-white border-gray-900 shadow-md' : 'text-slate-400 border-slate-100 hover:bg-gray-100 hover:text-gray-600'}`}>
                                            <input type="radio" {...register('reqPrioridad')} value="DESCARTADO" className="hidden"/> Descartar
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-control relative">
                                <label className="label font-bold text-slate-700 text-xs">Zonas / Distritos</label>
                                <div className="w-full px-3 py-2 border rounded-lg flex flex-wrap gap-1 min-h-[40px]">
                                    {zonasSelected.map(z => (<span key={z} className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">{z} <FaTimes className="cursor-pointer" onClick={() => handleRemoveZona(z)}/></span>))}
                                    <input className="flex-1 outline-none text-sm bg-transparent min-w-[100px]" placeholder="Escribe..." value={zonasQuery} onChange={(e) => { setZonasQuery(e.target.value); setShowZonasSuggestions(true); }}/>
                                </div>
                                {showZonasSuggestions && zonasQuery && filteredDistritos.length > 0 && (<div className="absolute z-50 w-full bg-white border shadow-lg mt-1 max-h-32 overflow-y-auto rounded-lg">{filteredDistritos.map(d => (<div key={d} onClick={() => handleAddZona(d)} className="p-2 hover:bg-amber-50 cursor-pointer text-xs">{d}</div>))}</div>)}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="form-control"><label className="label font-bold text-slate-700 text-xs">Área (m²)</label><div className="flex gap-1"><input {...register('reqAreaMin')} className="input input-bordered input-sm w-full" placeholder="Min"/><input {...register('reqAreaMax')} className="input input-bordered input-sm w-full" placeholder="Max"/></div></div>
                                <div className="form-control"><label className="label font-bold text-slate-700 text-xs">Presupuesto</label><div className="flex gap-1"><input {...register('reqPresupuestoMin')} className="input input-bordered input-sm w-full" placeholder="Min"/><input {...register('reqPresupuestoMax')} className="input input-bordered input-sm w-full" placeholder="Max"/></div></div>
                            </div>

                            {reqTipo === 'COMPRA' && (
                                <div className="bg-slate-50 p-3 rounded-lg border">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="form-control"><label className="label font-bold text-slate-700 text-xs">Forma Pago</label><select {...register('reqFormaPago')} className="select select-bordered select-sm w-full"><option value="FINANCIADO">Financiamiento Bancario</option><option value="CONTADO">Contado</option><option value="MIXTO">Mixto</option></select></div>
                                        {(reqFormaPago === 'FINANCIADO' || reqFormaPago === 'MIXTO') && (
                                            <div className="form-control"><label className="label font-bold text-slate-700 text-xs">Banco</label><select {...register('reqBanco')} className="select select-bordered select-sm w-full"><option value="">Selecciona...</option>{BANCOS_PERU.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="form-control"><label className="label font-bold text-slate-700 text-xs">Comentarios</label><textarea {...register('reqComentarios')} className="textarea textarea-bordered h-20 text-sm" placeholder="Detalles..."></textarea></div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setReqOpen(false)} className="btn btn-sm btn-ghost">Cancelar</button>
                                <button type="submit" className={`btn btn-sm text-white ${reqPrioridad === 'DESCARTADO' ? 'btn-error' : 'btn-warning'}`}>
                                    {reqPrioridad === 'DESCARTADO' ? 'Descartar y Cerrar' : 'Guardar Requerimiento'}
                                </button>
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