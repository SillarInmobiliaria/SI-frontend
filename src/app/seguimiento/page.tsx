'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getSeguimientos, updateSeguimiento } from '../../services/api'; 
import { FaRoute, FaCheckCircle, FaClock, FaCommentDots, FaCalendarAlt, FaCheck, FaUndo, FaFilter, FaHandshake, FaSpinner } from 'react-icons/fa';

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

  const handleCierreVenta = (clienteNombre: string) => {
    alert(`🎉 MÓDULO DE CIERRE (Próximamente)\n\nAquí se procesará la venta final para: ${clienteNombre}.\nSe generarán contratos y comisiones.`);
  };

  // FUNCIÓN PARA CORREGIR LA FECHA
  const formatearFecha = (fechaString: string) => {
    if (!fechaString) return '--';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-PE', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // --- LÓGICA DE FILTRADO ---
  const dataFiltrada = seguimientos.filter(s => {
    const fechaRegistro = new Date(s.fecha);
    const pasaEstado = filtroEstado === 'TODOS' ? true : s.estado === filtroEstado;
    const mesRegistro = new Date(s.fecha).getUTCMonth(); 
    const anioRegistro = new Date(s.fecha).getUTCFullYear();

    const pasaMes = mesRegistro === Number(filtroMes);
    const pasaAnio = anioRegistro === Number(filtroAnio);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 font-sans text-slate-800">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-7xl">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                <FaRoute className="text-white" size={24}/>
              </div>
              <span className="bg-gradient-to-r from-slate-800 to-pink-900 bg-clip-text text-transparent">
                Historial de Seguimiento
              </span>
            </h1>
            <p className="text-slate-500 mt-2 ml-[68px] text-sm">Gestiona y monitorea todas las actividades del mes</p>
          </div>
          
          {/* ESTADÍSTICAS MEJORADAS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-200">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Mes</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{total}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-lg border-2 border-amber-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-200">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Pendientes</div>
              <div className="text-3xl font-bold text-amber-600 flex items-center gap-2">
                {pendientes}
                <FaClock className="text-xl"/>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border-2 border-emerald-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-200">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Finalizados</div>
              <div className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
                {finalizados}
                <FaCheckCircle className="text-xl"/>
              </div>
            </div>
          </div>
        </div>

        {/* HERRAMIENTAS DE FILTRADO */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5 mb-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                {/* SELECTOR DE FECHA */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                      <FaCalendarAlt size={18}/>
                    </div>
                    <select 
                        value={filtroMes} 
                        onChange={(e) => setFiltroMes(Number(e.target.value))}
                        className="select select-sm bg-white font-bold focus:ring-2 focus:ring-indigo-500 border-2 border-slate-200 w-36 transition-all duration-200"
                    >
                        {meses.map((mes, index) => (
                            <option key={index} value={index}>{mes}</option>
                        ))}
                    </select>
                    <select 
                        value={filtroAnio} 
                        onChange={(e) => setFiltroAnio(Number(e.target.value))}
                        className="select select-sm bg-white font-bold focus:ring-2 focus:ring-indigo-500 border-2 border-slate-200 w-24 transition-all duration-200"
                    >
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                    </select>
                </div>

                {/* FILTROS DE ESTADO */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => setFiltroEstado('TODOS')} 
                        className={`btn font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 px-6 h-12 ${
                            filtroEstado === 'TODOS' 
                                ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white border-none' 
                                : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-sm">Todos</span>
                        <span className="ml-2 badge badge-sm bg-slate-200 text-slate-700 border-none font-bold">{total}</span>
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('PENDIENTE')} 
                        className={`btn font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 px-6 h-12 ${
                            filtroEstado === 'PENDIENTE' 
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-none' 
                                : 'bg-white text-amber-600 border-2 border-amber-200 hover:bg-amber-50'
                        }`}
                    >
                        <FaClock className="text-base"/>
                        <span className="ml-2 text-sm">Pendientes</span>
                        <span className="ml-2 badge badge-sm bg-amber-200 text-amber-800 border-none font-bold">{pendientes}</span>
                    </button>
                    <button 
                        onClick={() => setFiltroEstado('FINALIZADO')} 
                        className={`btn font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 px-6 h-12 ${
                            filtroEstado === 'FINALIZADO' 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none' 
                                : 'bg-white text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-50'
                        }`}
                    >
                        <FaCheckCircle className="text-base"/>
                        <span className="ml-2 text-sm">Finalizados</span>
                        <span className="ml-2 badge badge-sm bg-emerald-200 text-emerald-800 border-none font-bold">{finalizados}</span>
                    </button>
                </div>
            </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
            {loading ? (
                <div className="text-center py-24 bg-gradient-to-br from-slate-50 to-blue-50">
                    <FaSpinner className="animate-spin text-6xl text-indigo-600 mx-auto mb-4"/>
                    <p className="text-slate-600 font-semibold">Cargando seguimientos...</p>
                </div>
            ) : dataFiltrada.length === 0 ? (
                <div className="text-center py-28 bg-gradient-to-br from-slate-50 to-purple-50">
                    <div className="bg-white p-6 rounded-2xl inline-block shadow-lg mb-6 border-2 border-slate-200">
                        <FaFilter className="text-6xl text-slate-300"/>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">Sin movimientos registrados</h3>
                    <p className="text-slate-500">No hay seguimientos en <span className="font-bold text-pink-600">{meses[filtroMes]}</span> de <span className="font-bold">{filtroAnio}</span></p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 text-slate-600 uppercase text-xs font-bold tracking-wider border-b-2 border-slate-200">
                                <th className="pl-8 py-5 text-center">Fecha Registro</th>
                                <th className="text-left">Cliente</th>
                                <th className="text-left">Comentario / Resultado</th>
                                <th className="text-center">Próximo Contacto</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center pr-8">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dataFiltrada.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
                                    <td className="pl-8">
                                        <div className="flex justify-center">
                                            <div className="bg-slate-100 px-4 py-2.5 rounded-lg font-mono text-xs text-slate-600 font-bold border border-slate-200 group-hover:bg-white group-hover:shadow-md transition-all duration-200">
                                                {formatearFecha(item.fecha)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="avatar placeholder">
                                                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-full w-12 h-12 ring-2 ring-indigo-200 shadow-md group-hover:scale-110 transition-transform duration-200">
                                                    <span className="text-lg font-bold">{item.Cliente?.nombre?.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="font-bold text-slate-800 text-base">{item.Cliente?.nombre}</div>
                                                <div className="text-xs text-slate-400 font-medium">{item.Cliente?.telefono1}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="max-w-md px-4">
                                        <div className="flex gap-3 items-start p-4 rounded-xl bg-slate-50 group-hover:bg-white group-hover:shadow-md transition-all duration-200 border border-slate-100">
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <FaCommentDots className="text-indigo-600" size={16}/>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium pt-0.5">
                                                {item.comentario}
                                            </p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex justify-center">
                                            {item.fechaProxima ? (
                                                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm border-2 transition-all duration-200 hover:scale-105 ${
                                                    new Date(item.fechaProxima) < new Date() && item.estado === 'PENDIENTE' 
                                                        ? 'bg-gradient-to-r from-red-100 to-rose-100 border-red-300 text-red-700 animate-pulse' 
                                                        : 'bg-slate-100 border-slate-200 text-slate-600'
                                                }`}>
                                                    <FaCalendarAlt />
                                                    {formatearFecha(item.fechaProxima)}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 italic font-medium">Sin fecha</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex justify-center">
                                            {item.estado === 'PENDIENTE' ? (
                                                <span className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border-2 border-amber-200 shadow-md">
                                                    <FaClock className="mr-2"/> Pendiente
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border-2 border-emerald-200 shadow-md">
                                                    <FaCheckCircle className="mr-2"/> Finalizado
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-center pr-8 py-5">
                                        <div className="flex justify-center items-center gap-4">
                                            
                                            {/* BOTÓN CAMBIAR ESTADO */}
                                            {item.estado === 'PENDIENTE' ? (
                                                <button 
                                                    onClick={() => handleCambiarEstado(item.id, 'PENDIENTE')}
                                                    className="btn btn-circle w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 tooltip flex items-center justify-center"
                                                    data-tip="Marcar como Completado"
                                                >
                                                    <FaCheck size={16}/>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleCambiarEstado(item.id, 'FINALIZADO')}
                                                    className="btn btn-circle w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 hover:from-slate-400 hover:to-slate-500 text-white border-none shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 tooltip flex items-center justify-center"
                                                    data-tip="Reabrir Tarea"
                                                >
                                                    <FaUndo size={14}/>
                                                </button>
                                            )}

                                            {/* BOTÓN CIERRE */}
                                            <button 
                                                onClick={() => handleCierreVenta(item.Cliente?.nombre)}
                                                className="btn h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-none gap-2 font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 px-5"
                                            >
                                                <FaHandshake className="text-lg"/> 
                                                <span className="hidden lg:inline text-sm">Cerrar Venta</span>
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