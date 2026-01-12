'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getSeguimientos, updateSeguimiento } from '../../services/api'; 
import { FaRoute, FaCheckCircle, FaClock, FaCommentDots, FaCalendarAlt, FaCheck, FaUndo, FaFilter, FaHandshake } from 'react-icons/fa';

export default function SeguimientoPage() {
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTROS ---
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); 
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth()); 
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await getSeguimientos();
      setSeguimientos(data);
    } catch (error) {
      console.error("Error cargando seguimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'PENDIENTE' ? 'FINALIZADO' : 'PENDIENTE';
    try {
      await updateSeguimiento(id, { estado: nuevoEstado });
      cargarDatos(); 
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  // 👇 NUEVA FUNCIÓN: Solo muestra alerta por ahora
  const handleCierreVenta = (clienteNombre: string) => {
    alert(`🎉 MÓDULO DE CIERRE (Próximamente)\n\nAquí se procesará la venta final para: ${clienteNombre}.\nSe generarán contratos y comisiones.`);
  };

  // --- LÓGICA DE FILTRADO ---
  const dataFiltrada = seguimientos.filter(s => {
    const fechaRegistro = new Date(s.fecha);
    const pasaEstado = filtroEstado === 'TODOS' ? true : s.estado === filtroEstado;
    const pasaMes = fechaRegistro.getMonth() === Number(filtroMes);
    const pasaAnio = fechaRegistro.getFullYear() === Number(filtroAnio);
    return pasaEstado && pasaMes && pasaAnio;
  });

  const total = dataFiltrada.length;
  const pendientes = dataFiltrada.filter(s => s.estado === 'PENDIENTE').length;
  const finalizados = dataFiltrada.filter(s => s.estado === 'FINALIZADO').length;

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-7xl">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FaRoute className="text-pink-500"/> Historial de Seguimiento
            </h1>
            <p className="text-slate-500 mt-1">Actividades del mes seleccionado.</p>
          </div>
          
          <div className="flex gap-4">
             <div className="stats shadow-sm bg-white border border-gray-100">
                <div className="stat place-items-center px-6">
                  <div className="stat-title text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Mes</div>
                  <div className="stat-value text-slate-700 text-2xl">{total}</div>
                </div>
                <div className="stat place-items-center border-l border-slate-100 px-6">
                  <div className="stat-title text-[10px] font-bold text-warning uppercase tracking-wider">Pendientes</div>
                  <div className="stat-value text-warning text-2xl">{pendientes}</div>
                </div>
                <div className="stat place-items-center border-l border-slate-100 px-6">
                  <div className="stat-title text-[10px] font-bold text-success uppercase tracking-wider">Finalizados</div>
                  <div className="stat-value text-success text-2xl">{finalizados}</div>
                </div>
             </div>
          </div>
        </div>

        {/* HERRAMIENTAS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <FaCalendarAlt className="text-gray-400 ml-2"/>
                    <select 
                        value={filtroMes} 
                        onChange={(e) => setFiltroMes(Number(e.target.value))}
                        className="select select-sm select-ghost bg-transparent font-bold focus:bg-white w-32"
                    >
                        {meses.map((mes, index) => (
                            <option key={index} value={index}>{mes}</option>
                        ))}
                    </select>
                    <select 
                        value={filtroAnio} 
                        onChange={(e) => setFiltroAnio(Number(e.target.value))}
                        className="select select-sm select-ghost bg-transparent font-bold focus:bg-white w-24"
                    >
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                    </select>
                </div>

                <div className="join shadow-sm border border-gray-200 rounded-lg">
                    <button onClick={() => setFiltroEstado('TODOS')} className={`join-item btn btn-sm ${filtroEstado === 'TODOS' ? 'btn-neutral text-white' : 'btn-ghost bg-white'}`}>Todos</button>
                    <button onClick={() => setFiltroEstado('PENDIENTE')} className={`join-item btn btn-sm ${filtroEstado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'btn-ghost bg-white'}`}>⏳ Pendientes</button>
                    <button onClick={() => setFiltroEstado('FINALIZADO')} className={`join-item btn btn-sm ${filtroEstado === 'FINALIZADO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'btn-ghost bg-white'}`}>✅ Finalizados</button>
                </div>
            </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {loading ? (
                <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
            ) : dataFiltrada.length === 0 ? (
                <div className="text-center py-24 bg-slate-50">
                    <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
                        <FaFilter className="text-4xl text-slate-200"/>
                    </div>
                    <h3 className="text-lg font-bold text-slate-600">Sin movimientos</h3>
                    <p className="text-slate-400 text-sm">No hay seguimientos registrados en {meses[filtroMes]} de {filtroAnio}.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100">
                                <th className="pl-6 py-4">Fecha Reg.</th>
                                <th>Cliente</th>
                                <th>Comentario / Resultado</th>
                                <th>Próx. Contacto</th>
                                <th>Estado</th>
                                <th className="text-center pr-6">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {dataFiltrada.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="pl-6 font-mono text-xs text-slate-500 font-medium">
                                        {new Date(item.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-slate-100 text-slate-600 rounded-full w-9 h-9 ring-1 ring-slate-200">
                                                    <span className="text-sm font-bold">{item.Cliente?.nombre?.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 text-sm">{item.Cliente?.nombre}</div>
                                                <div className="text-xs text-slate-400">{item.Cliente?.telefono1}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="max-w-xs">
                                        <div className="flex gap-3 items-start p-2 rounded-lg group-hover:bg-white transition-colors">
                                            <FaCommentDots className="text-slate-300 mt-1 flex-shrink-0"/>
                                            <p className="text-sm text-slate-600 leading-snug">
                                                {item.comentario}
                                            </p>
                                        </div>
                                    </td>
                                    <td>
                                        {item.fechaProxima ? (
                                            <div className={`badge ${new Date(item.fechaProxima) < new Date() && item.estado === 'PENDIENTE' ? 'badge-error text-white' : 'badge-ghost text-slate-500 bg-slate-100'} gap-2 text-xs font-medium`}>
                                                <FaCalendarAlt />
                                                {new Date(item.fechaProxima).toLocaleDateString()}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300 italic">--</span>
                                        )}
                                    </td>
                                    <td>
                                        {item.estado === 'PENDIENTE' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                ⏳ Pendiente
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                ✅ Finalizado
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-center pr-6">
                                        <div className="flex justify-center items-center gap-2">
                                            
                                            {/* BOTÓN 1: ESTADO RÁPIDO */}
                                            {item.estado === 'PENDIENTE' ? (
                                                <button 
                                                    onClick={() => handleCambiarEstado(item.id, 'PENDIENTE')}
                                                    className="btn btn-sm btn-circle btn-ghost text-emerald-500 hover:bg-emerald-50 tooltip"
                                                    data-tip="Completar Tarea"
                                                >
                                                    <FaCheck />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleCambiarEstado(item.id, 'FINALIZADO')}
                                                    className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:bg-slate-100 tooltip"
                                                    data-tip="Reabrir Tarea"
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}

                                            {/* BOTÓN 2: CIERRE (NUEVO) */}
                                            <button 
                                                onClick={() => handleCierreVenta(item.Cliente?.nombre)}
                                                className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none gap-2 font-normal shadow-sm hover:shadow-md transition-all"
                                            >
                                                <FaHandshake className="text-lg"/> 
                                                <span className="hidden lg:inline text-xs">Cierre</span>
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}