'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar'; 
import { FaTerminal, FaBug, FaLightbulb, FaComment, FaCheckCircle, FaClock, FaFilter } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]); 
    const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados de filtros
    const [filtroEstado, setFiltroEstado] = useState('PENDIENTE');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://sillar-backend.onrender.com/api/feedback', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, []);

    // Lógica de filtrado Combinado
    useEffect(() => {
        let temp = [...tickets];
        // Filtrar por Estado
        if (filtroEstado !== 'TODOS') temp = temp.filter(t => t.estado === filtroEstado);
        // Filtrar por Tipo
        if (filtroTipo !== 'TODOS') temp = temp.filter(t => t.tipo === filtroTipo);
        
        setFilteredTickets(temp);
    }, [filtroEstado, filtroTipo, tickets]);

    const finalizarTicket = async (id: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://sillar-backend.onrender.com/api/feedback/${id}/finalizar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('REGISTRO COMPLETADO');
                fetchTickets();
            }
        } catch (error) { toast.error('ERROR'); }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            <Navbar />
            <Toaster position="bottom-right" />
            
            <div className="container mx-auto p-4 md:p-8">
                {/* HEADER */}
                <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6">
                    <FaTerminal className="text-green-400 text-xl" />
                    <h1 className="text-xl font-black uppercase tracking-tighter">Admin_Log_Viewer</h1>
                </div>

                {/* DOBLE FILTRO BAR */}
                <div className="flex flex-wrap items-center gap-6 mb-8 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                    {/* Por Estado */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">Estado</span>
                        <div className="flex bg-black/20 p-1 rounded-xl">
                            {['PENDIENTE', 'FINALIZADO', 'TODOS'].map(f => (
                                <button key={f} onClick={() => setFiltroEstado(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${filtroEstado === f ? 'bg-green-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>{f}</button>
                            ))}
                        </div>
                    </div>

                    {/* Por Tipo */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">Categoría</span>
                        <div className="flex bg-black/20 p-1 rounded-xl">
                            {['TODOS', 'BUG', 'IDEA', 'SUGERENCIA'].map(f => (
                                <button key={f} onClick={() => setFiltroTipo(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${filtroTipo === f ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>{f}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* LISTADO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredTickets.map((t) => (
                        <div key={t.id} className={`p-6 rounded-2xl border transition-all ${t.estado === 'FINALIZADO' ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-800/40 border-slate-700 hover:border-green-500/50'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${t.tipo === 'BUG' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{t.tipo}</span>
                                <span className="text-slate-500 text-[10px] font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h2 className={`font-bold mb-2 ${t.estado === 'FINALIZADO' ? 'line-through text-slate-600' : 'text-white'}`}>{t.asunto}</h2>
                            <p className="text-slate-400 text-sm mb-6">"{t.descripcion}"</p>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-slate-700/30">
                                <span className={`text-[10px] font-bold ${t.estado === 'FINALIZADO' ? 'text-green-500' : 'text-amber-500'}`}>{t.estado}</span>
                                {t.estado === 'PENDIENTE' && (
                                    <button onClick={() => finalizarTicket(t.id)} className="flex items-center gap-2 text-[10px] font-black text-green-500 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-slate-900 transition-all">
                                        <FaCheckCircle /> FINALIZAR
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}