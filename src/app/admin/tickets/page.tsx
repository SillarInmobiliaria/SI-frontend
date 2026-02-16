'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar'; 
import { FaTerminal, FaBug, FaLightbulb, FaComment, FaCheckCircle, FaClock } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]); 
    const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroActivo, setFiltroActivo] = useState('PENDIENTE'); // Filtro por estado por defecto

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://sillar-backend.onrender.com/api/feedback', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    useEffect(() => {
        if (filtroActivo === 'TODOS') {
            setFilteredTickets(tickets);
        } else {
            setFilteredTickets(tickets.filter(t => t.estado === filtroActivo || t.tipo === filtroActivo));
        }
    }, [filtroActivo, tickets]);

    const finalizarTicket = async (id: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://sillar-backend.onrender.com/api/feedback/${id}/finalizar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('PROTOCOLO FINALIZADO');
                fetchTickets(); // Recargamos la lista
            }
        } catch (error) {
            toast.error('FALLO EN EL SISTEMA');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
            <Navbar />
            <Toaster position="bottom-center" />
            
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6">
                    <FaTerminal className="text-2xl text-green-400" />
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">System_Logs_Manager</h1>
                </div>

                {/* FILTROS DE ESTADO */}
                <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/30 p-2 rounded-2xl border border-slate-700/50 w-fit">
                    {['PENDIENTE', 'FINALIZADO', 'TODOS'].map((f) => (
                        <button key={f} onClick={() => setFiltroActivo(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filtroActivo === f ? 'bg-green-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-700'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="animate-pulse text-green-400 font-mono">Accediendo a la base de datos...</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredTickets.map((t) => (
                            <div key={t.id} className={`p-6 rounded-2xl border transition-all ${t.estado === 'FINALIZADO' ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-800/40 border-slate-700 hover:border-green-500/50'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${t.tipo === 'BUG' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {t.tipo}
                                    </span>
                                    <span className="text-slate-500 text-[10px] font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h2 className={`text-lg font-bold mb-2 ${t.estado === 'FINALIZADO' ? 'line-through text-slate-600' : 'text-white'}`}>{t.asunto}</h2>
                                <p className="text-slate-400 text-sm mb-4 italic">"{t.descripcion}"</p>
                                
                                <div className="mt-4 pt-4 border-t border-slate-700/30 flex justify-between items-center">
                                    <span className={`text-[10px] font-bold ${t.estado === 'FINALIZADO' ? 'text-green-500' : 'text-amber-500'}`}>
                                        ESTADO: {t.estado}
                                    </span>
                                    {t.estado !== 'FINALIZADO' && (
                                        <button 
                                            onClick={() => finalizarTicket(t.id)}
                                            className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase hover:bg-green-500/10 px-3 py-2 rounded-lg transition-colors border border-green-500/30"
                                        >
                                            <FaCheckCircle /> Finalizar Ticket
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}