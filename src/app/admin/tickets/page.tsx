'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar'; 
import { FaTerminal, FaBug, FaLightbulb, FaComment, FaFilter, FaClock } from 'react-icons/fa';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]); 
    const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroActivo, setFiltroActivo] = useState('TODOS');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('https://sillar-backend.onrender.com/api/feedback', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                const arrayData = Array.isArray(data) ? data : [];
                setTickets(arrayData);
                setFilteredTickets(arrayData);
            } catch (error) {
                console.error("Error cargando tickets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    // Lógica de filtrado
    useEffect(() => {
        if (filtroActivo === 'TODOS') {
            setFilteredTickets(tickets);
        } else {
            setFilteredTickets(tickets.filter(t => t.tipo === filtroActivo));
        }
    }, [filtroActivo, tickets]);

    const stats = {
        total: tickets.length,
        bugs: tickets.filter(t => t.tipo === 'BUG').length,
        ideas: tickets.filter(t => t.tipo === 'IDEA').length,
        sugerencias: tickets.filter(t => t.tipo === 'SUGERENCIA').length
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
            <Navbar />
            
            <div className="container mx-auto p-4 md:p-8">
                {/* HEADER TÉCNICO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-700 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/50">
                            <FaTerminal className="text-2xl text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Developer Logs</h1>
                            <p className="text-xs text-slate-400 font-mono">system_v2.0.4 // root_access_granted</p>
                        </div>
                    </div>

                    {/* STATS RÁPIDAS */}
                    <div className="flex gap-2">
                        <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 text-center">
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Total</p>
                            <p className="text-lg font-black text-white">{stats.total}</p>
                        </div>
                        <div className="bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30 text-center">
                            <p className="text-[10px] uppercase text-red-400 font-bold">Bugs</p>
                            <p className="text-lg font-black text-red-400">{stats.bugs}</p>
                        </div>
                    </div>
                </div>

                {/* BARRA DE FILTROS */}
                <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/30 p-2 rounded-2xl border border-slate-700/50 w-fit">
                    {['TODOS', 'BUG', 'IDEA', 'SUGERENCIA'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltroActivo(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filtroActivo === f 
                                ? 'bg-green-500 text-slate-900 shadow-lg shadow-green-500/20' 
                                : 'hover:bg-slate-700 text-slate-400'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* LISTADO ORDENADO */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                        <p className="text-sm font-mono text-green-400">Sincronizando con la base de datos...</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                        <p className="text-slate-500 font-medium">No se encontraron registros bajo este filtro.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredTickets.map((t) => (
                            <div key={t.id} className="group bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:border-green-500/50 transition-all hover:bg-slate-800/60">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                        t.tipo === 'BUG' ? 'bg-red-500/20 text-red-400' : 
                                        t.tipo === 'IDEA' ? 'bg-amber-500/20 text-amber-400' : 
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {t.tipo === 'BUG' ? <FaBug /> : t.tipo === 'IDEA' ? <FaLightbulb /> : <FaComment />}
                                        {t.tipo}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-mono">
                                        <FaClock /> {new Date(t.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{t.asunto}</h2>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                                    <p className="text-slate-400 text-sm leading-relaxed italic">"{t.descripcion}"</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500 font-mono italic">ID: {t.id.split('-')[0]}...</span>
                                    <button className="text-[10px] font-black text-green-500 uppercase hover:underline">Marcar como leído</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}