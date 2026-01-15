'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion'; // <--- IMPORTADO
import { getRequerimientos, updateEstadoRequerimiento } from '../../services/api';
import { FaClipboardList, FaCheck, FaTrash, FaExclamationCircle, FaFilter, FaClock, FaSpinner, FaCheckCircle, FaBan, FaUser, FaPhone } from 'react-icons/fa';

export default function RequerimientosPage() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('ABIERTO');

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getRequerimientos();
      setReqs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    if(!confirm(`¿Marcar como ${nuevoEstado}?`)) return;
    try {
      await updateEstadoRequerimiento(id, nuevoEstado);
      cargar();
    } catch (e) { alert('Error al actualizar'); }
  };

  const filtrados = reqs.filter(r => filtro === 'TODOS' ? true : r.estado === filtro);
  const totalAbiertos = reqs.filter(r => r.estado === 'ABIERTO').length;
  const totalAtendidos = reqs.filter(r => r.estado === 'ATENDIDO').length;
  const totalDescartados = reqs.filter(r => r.estado === 'DESCARTADO').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 font-sans flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 relative">
          <SidebarAtencion /> 

          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                    <FaClipboardList className="text-white" size={24}/>
                </div>
                <span className="bg-gradient-to-r from-slate-800 to-purple-900 bg-clip-text text-transparent">
                    Buzón de Requerimientos
                </span>
                </h1>
                <p className="text-slate-500 mt-2 ml-[68px] text-sm">Gestiona todas las solicitudes de clientes</p>
            </div>
            
            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Pendientes</div>
                <div className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                    {totalAbiertos}
                    <FaClock className="text-xl"/>
                </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border-2 border-emerald-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Atendidos</div>
                <div className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
                    {totalAtendidos}
                    <FaCheckCircle className="text-xl"/>
                </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-lg border-2 border-red-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">Descartados</div>
                <div className="text-3xl font-bold text-red-600 flex items-center gap-2">
                    {totalDescartados}
                    <FaBan className="text-xl"/>
                </div>
                </div>
            </div>
            </div>

            {/* FILTROS */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5 mb-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-center items-center gap-4">
                <button 
                onClick={() => setFiltro('ABIERTO')} 
                className={`btn font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 px-6 h-12 ${
                    filtro === 'ABIERTO' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none' 
                    : 'bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50'
                }`}
                >
                <FaClock className="text-base"/>
                <span className="ml-2 text-sm">Pendientes</span>
                <span className="ml-2 badge badge-sm bg-blue-200 text-blue-800 border-none font-bold">{totalAbiertos}</span>
                </button>
                
                <button 
                onClick={() => setFiltro('ATENDIDO')} 
                className={`btn font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 px-6 h-12 ${
                    filtro === 'ATENDIDO' 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none' 
                    : 'bg-white text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-50'
                }`}
                >
                <FaCheckCircle className="text-base"/>
                <span className="ml-2 text-sm">Atendidos</span>
                <span className="ml-2 badge badge-sm bg-emerald-200 text-emerald-800 border-none font-bold">{totalAtendidos}</span>
                </button>
                
                <button 
                onClick={() => setFiltro('DESCARTADO')} 
                className={`btn font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 px-6 h-12 ${
                    filtro === 'DESCARTADO' 
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-none' 
                    : 'bg-white text-red-600 border-2 border-red-200 hover:bg-red-50'
                }`}
                >
                <FaBan className="text-base"/>
                <span className="ml-2 text-sm">Descartados</span>
                <span className="ml-2 badge badge-sm bg-red-200 text-red-800 border-none font-bold">{totalDescartados}</span>
                </button>
            </div>
            </div>

            {/* CONTENIDO */}
            {loading ? (
                <div className="text-center py-24 bg-gradient-to-br from-slate-50 to-purple-50 rounded-3xl shadow-xl">
                    <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4"/>
                    <p className="text-slate-600 font-semibold">Cargando requerimientos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrados.map((r) => (
                    <div key={r.id} className={`card bg-white shadow-xl border-l-[6px] hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                    r.prioridad === 'URGENTE' 
                        ? 'border-red-500 ring-2 ring-red-200' 
                        : 'border-indigo-400'
                    }`}>
                    <div className="card-body p-6">
                        {/* HEADER DE LA TARJETA */}
                        <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 rounded-full w-12 h-12 ring-2 ring-purple-200 shadow-md">
                                <span className="text-lg font-bold">{r.Cliente?.nombre?.charAt(0)}</span>
                            </div>
                            </div>
                            <div>
                            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                                {r.Cliente?.nombre}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-1">
                                <FaClock className="text-slate-300"/> {r.fecha}
                            </p>
                            </div>
                        </div>
                        {r.prioridad === 'URGENTE' && (
                            <div className="badge bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-xs px-3 py-3 border-none shadow-lg animate-pulse">
                            <FaExclamationCircle className="mr-1"/> URGENTE
                            </div>
                        )}
                        </div>

                        {/* TELÉFONO */}
                        <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        <FaPhone className="text-slate-400" size={12}/>
                        <span className="font-medium">{r.Cliente?.telefono1}</span>
                        </div>
                        
                        {/* PEDIDO */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl text-slate-700 text-sm my-3 border-2 border-slate-200 shadow-inner">
                        <p className="font-medium leading-relaxed italic">"{r.pedido}"</p>
                        </div>
                        
                        {/* ACCIONES */}
                        {r.estado === 'ABIERTO' ? (
                        <div className="flex gap-3 mt-4">
                            <button 
                            onClick={() => cambiarEstado(r.id, 'ATENDIDO')} 
                            className="btn flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-none gap-2 font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 h-11"
                            >
                            <FaCheck size={14}/> Atendido
                            </button>
                            <button 
                            onClick={() => cambiarEstado(r.id, 'DESCARTADO')} 
                            className="btn flex-1 bg-white text-red-600 border-2 border-red-400 hover:bg-red-500 hover:text-white hover:border-red-600 gap-2 font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 h-11"
                            >
                            <FaTrash size={12}/> Descartar
                            </button>
                        </div>
                        ) : (
                        <div className={`w-full py-3 rounded-xl text-center font-bold text-sm shadow-md border-2 flex items-center justify-center gap-2 ${
                            r.estado === 'ATENDIDO' 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border-emerald-300' 
                            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300'
                        }`}>
                            {r.estado === 'ATENDIDO' ? <FaCheckCircle/> : <FaBan/>}
                            {r.estado}
                        </div>
                        )}
                    </div>
                    </div>
                ))}
                {filtrados.length === 0 && (
                <div className="col-span-3 text-center py-28 bg-gradient-to-br from-slate-50 to-purple-50 rounded-3xl shadow-xl">
                    <div className="bg-white p-6 rounded-2xl inline-block shadow-lg mb-6 border-2 border-slate-200">
                    <FaFilter className="text-6xl text-slate-300"/>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">No hay requerimientos</h3>
                    <p className="text-slate-500">No se encontraron solicitudes en esta sección</p>
                </div>
                )}
                </div>
            )}
          </main>
      </div>
    </div>
  );
}