'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getRequerimientos, updateEstadoRequerimiento } from '../../services/api';
import { FaClipboardList, FaCheck, FaTrash, FaExclamationCircle, FaFilter, FaClock } from 'react-icons/fa';

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

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto p-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <FaClipboardList className="text-purple-600"/> Buzón de Requerimientos
          </h1>
          <div className="join bg-white shadow-sm">
             <button onClick={() => setFiltro('ABIERTO')} className={`join-item btn btn-sm ${filtro === 'ABIERTO' ? 'btn-neutral' : 'btn-ghost'}`}>Pendientes</button>
             <button onClick={() => setFiltro('ATENDIDO')} className={`join-item btn btn-sm ${filtro === 'ATENDIDO' ? 'btn-success text-white' : 'btn-ghost'}`}>Atendidos</button>
             <button onClick={() => setFiltro('DESCARTADO')} className={`join-item btn btn-sm ${filtro === 'DESCARTADO' ? 'btn-error text-white' : 'btn-ghost'}`}>Descartados</button>
          </div>
        </div>

        {loading ? (
            <div className="text-center py-10"><span className="loading loading-spinner text-primary"></span></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((r) => (
                <div key={r.id} className={`card bg-white shadow-md border-l-8 ${r.prioridad === 'URGENTE' ? 'border-red-500' : 'border-blue-300'} hover:shadow-lg transition-all`}>
                <div className="card-body p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{r.Cliente?.nombre}</h3>
                            <p className="text-xs text-slate-400">{r.fecha} • {r.Cliente?.telefono1}</p>
                        </div>
                        {r.prioridad === 'URGENTE' && <span className="badge badge-error text-white font-bold text-xs">URGENTE</span>}
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg text-slate-700 italic text-sm my-3 border border-slate-100">
                    "{r.pedido}"
                    </div>
                    
                    {r.estado === 'ABIERTO' ? (
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => cambiarEstado(r.id, 'ATENDIDO')} className="btn btn-sm btn-success text-white flex-1 gap-2"><FaCheck/> Atendido</button>
                        <button onClick={() => cambiarEstado(r.id, 'DESCARTADO')} className="btn btn-sm btn-outline btn-error flex-1 gap-2"><FaTrash/> Descartar</button>
                    </div>
                    ) : (
                    <div className={`badge ${r.estado === 'ATENDIDO' ? 'badge-success' : 'badge-error'} text-white w-full py-3 font-bold`}>
                        {r.estado}
                    </div>
                    )}
                </div>
                </div>
            ))}
            {filtrados.length === 0 && <p className="text-center col-span-3 text-gray-400 py-10">No hay requerimientos en esta sección.</p>}
            </div>
        )}
      </div>
    </div>
  );
}