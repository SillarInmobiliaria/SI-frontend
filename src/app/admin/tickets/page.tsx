'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar'; 
import { FaTerminal, FaBug, FaLightbulb, FaComment, FaCheckCircle, FaClock, FaFilter } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

// Definimos una interfaz para que TypeScript sepa exactamente qué tiene un Ticket
interface Ticket {
    id: string;
    tipo: 'BUG' | 'IDEA' | 'SUGERENCIA';
    asunto: string;
    descripcion: string;
    estado: 'PENDIENTE' | 'FINALIZADO';
    createdAt: string;
}

export default function TicketsPage() {
    // Definimos el estado con la interfaz creada
    const [tickets, setTickets] = useState<Ticket[]>([]); 
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [filtroEstado, setFiltroEstado] = useState('PENDIENTE');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://sillar-backend.onrender.com/api/feedback', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            // Aseguramos que data sea un array antes de guardarlo
            const validData = Array.isArray(data) ? data : [];
            setTickets(validData);
        } catch (error) { 
            console.error("Error cargando tickets", error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    useEffect(() => {
        let temp = [...tickets];
        if (filtroEstado !== 'TODOS') temp = temp.filter(t => t.estado === filtroEstado);
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

    const getIconoTipo = (tipo: string) => {
        switch(tipo) {
            case 'BUG': return <FaBug className="text-red-400" />;
            case 'IDEA': return <FaLightbulb className="text-yellow-400" />;
            case 'SUGERENCIA': return <FaComment className="text-blue-400" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f172a] to-[#1a1f35] text-slate-200">
            <Navbar />
            <Toaster position="bottom-right" toastOptions={{
                style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
            }} />
            
            <div className="container mx-auto p-4 md:p-8">
                <div className="relative mb-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent rounded-2xl blur-xl"></div>
                    <div className="relative flex items-center gap-4 border-b-2 border-green-500/20 pb-6">
                        <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-xl border border-green-500/30">
                            <FaTerminal className="text-green-400 text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                                Admin Log Viewer
                            </h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Gestión de tickets y feedback</p>
                        </div>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="mb-8 bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex flex-wrap items-center gap-8">
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-slate-500 uppercase">Estado</span>
                            <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
                                {['PENDIENTE', 'FINALIZADO', 'TODOS'].map(f => (
                                    <button key={f} onClick={() => setFiltroEstado(f)} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filtroEstado === f ? 'bg-green-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>{f}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-slate-500 uppercase">Categoría</span>
                            <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
                                {['TODOS', 'BUG', 'IDEA', 'SUGERENCIA'].map(f => (
                                    <button key={f} onClick={() => setFiltroTipo(f)} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filtroTipo === f ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>{f}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* LISTADO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredTickets.map((t) => (
                        <div key={t.id} className={`p-6 rounded-2xl border transition-all ${t.estado === 'FINALIZADO' ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-800/60 border-slate-700/50 hover:border-green-500/40'}`}>
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-2">
                                    {getIconoTipo(t.tipo)}
                                    <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide bg-slate-900/50 border border-slate-700">
                                        {t.tipo}
                                    </span>
                                </div>
                                <span className="text-slate-500 text-[10px] font-mono">
                                    {new Date(t.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h2 className={`font-bold text-lg mb-3 ${t.estado === 'FINALIZADO' ? 'line-through text-slate-600' : 'text-white'}`}>{t.asunto}</h2>
                            <p className="text-slate-400 text-sm pl-4 border-l-2 border-green-500/30 italic mb-6">"{t.descripcion}"</p>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-700/30">
                                <span className={`text-xs font-bold uppercase ${t.estado === 'FINALIZADO' ? 'text-green-500' : 'text-amber-500'}`}>{t.estado}</span>
                                {t.estado === 'PENDIENTE' && (
                                    <button onClick={() => finalizarTicket(t.id)} className="text-xs font-black bg-green-500/10 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500 hover:text-slate-900 transition-all">FINALIZAR</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}