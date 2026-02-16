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
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                }
            }} />
            
            <div className="container mx-auto p-4 md:p-8">
                {/* HEADER CON DISEÑO MEJORADO */}
                <div className="relative mb-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent rounded-2xl blur-xl"></div>
                    <div className="relative flex items-center gap-4 border-b-2 border-green-500/20 pb-6">
                        <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-xl border border-green-500/30 shadow-lg shadow-green-500/10">
                            <FaTerminal className="text-green-400 text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                                Admin Log Viewer
                            </h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Sistema de gestión de tickets y feedback</p>
                        </div>
                        <div className="ml-auto hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-mono text-slate-400">{filteredTickets.length} registros</span>
                        </div>
                    </div>
                </div>

                {/* FILTROS CON DISEÑO PREMIUM */}
                <div className="mb-8 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <FaFilter className="text-slate-400 text-sm" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtros Avanzados</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-8">
                        {/* Filtro Estado */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                <FaClock className="text-amber-500 text-[10px]" />
                                Estado
                            </span>
                            <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50 shadow-inner">
                                {['PENDIENTE', 'FINALIZADO', 'TODOS'].map(f => (
                                    <button 
                                        key={f} 
                                        onClick={() => setFiltroEstado(f)} 
                                        className={`
                                            px-4 py-2 rounded-lg text-xs font-black transition-all duration-300
                                            ${filtroEstado === f 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-slate-900 shadow-lg shadow-green-500/30 scale-105' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }
                                        `}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filtro Tipo */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                <FaComment className="text-blue-500 text-[10px]" />
                                Categoría
                            </span>
                            <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50 shadow-inner gap-1">
                                {['TODOS', 'BUG', 'IDEA', 'SUGERENCIA'].map(f => (
                                    <button 
                                        key={f} 
                                        onClick={() => setFiltroTipo(f)} 
                                        className={`
                                            px-4 py-2 rounded-lg text-xs font-black transition-all duration-300
                                            ${filtroTipo === f 
                                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }
                                        `}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* LISTADO CON DISEÑO MEJORADO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredTickets.map((t, idx) => (
                        <div 
                            key={t.id} 
                            className={`
                                group relative p-6 rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1
                                ${t.estado === 'FINALIZADO' 
                                    ? 'bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-slate-800 opacity-60' 
                                    : 'bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-slate-700/50 hover:border-green-500/40 hover:shadow-2xl hover:shadow-green-500/10'
                                }
                            `}
                            style={{
                                animationDelay: `${idx * 50}ms`
                            }}
                        >
                            {/* Efecto de brillo en hover */}
                            {t.estado === 'PENDIENTE' && (
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            )}
                            
                            <div className="relative z-10">
                                {/* Header del Ticket */}
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center gap-2">
                                        {getIconoTipo(t.tipo)}
                                        <span className={`
                                            px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide
                                            ${t.tipo === 'BUG' 
                                                ? 'bg-gradient-to-r from-red-500/20 to-rose-500/10 text-red-400 border border-red-500/20' 
                                                : t.tipo === 'IDEA'
                                                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border border-yellow-500/20'
                                                : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-blue-400 border border-blue-500/20'
                                            }
                                        `}>
                                            {t.tipo}
                                        </span>
                                    </div>
                                    <span className="text-slate-500 text-[10px] font-mono bg-slate-900/50 px-2 py-1 rounded-md">
                                        {new Date(t.createdAt).toLocaleDateString('es-ES', { 
                                            day: '2-digit', 
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                {/* Contenido del Ticket */}
                                <h2 className={`
                                    font-bold text-lg mb-3 leading-tight
                                    ${t.estado === 'FINALIZADO' 
                                        ? 'line-through text-slate-600' 
                                        : 'text-white group-hover:text-green-300 transition-colors'
                                    }
                                `}>
                                    {t.asunto}
                                </h2>
                                
                                <div className="relative mb-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500/50 to-transparent rounded-full"></div>
                                    <p className="text-slate-400 text-sm pl-4 leading-relaxed italic">
                                        "{t.descripcion}"
                                    </p>
                                </div>
                                
                                {/* Footer del Ticket */}
                                <div className="flex justify-between items-center pt-4 border-t border-slate-700/30">
                                    <div className="flex items-center gap-2">
                                        {t.estado === 'FINALIZADO' ? (
                                            <FaCheckCircle className="text-green-500 text-sm" />
                                        ) : (
                                            <FaClock className="text-amber-500 text-sm animate-pulse" />
                                        )}
                                        <span className={`
                                            text-xs font-bold uppercase tracking-wide
                                            ${t.estado === 'FINALIZADO' ? 'text-green-500' : 'text-amber-500'}
                                        `}>
                                            {t.estado}
                                        </span>
                                    </div>
                                    
                                    {t.estado === 'PENDIENTE' && (
                                        <button 
                                            onClick={() => finalizarTicket(t.id)} 
                                            className="
                                                group/btn flex items-center gap-2 text-xs font-black 
                                                bg-gradient-to-r from-green-500/10 to-emerald-500/5
                                                text-green-400 border border-green-500/30 
                                                px-4 py-2 rounded-lg 
                                                hover:from-green-500 hover:to-emerald-500 hover:text-slate-900 
                                                hover:shadow-lg hover:shadow-green-500/30
                                                transition-all duration-300 hover:scale-105
                                            "
                                        >
                                            <FaCheckCircle className="group-hover/btn:rotate-12 transition-transform" />
                                            FINALIZAR
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mensaje cuando no hay tickets */}
                {filteredTickets.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4">
                            <FaTerminal className="text-slate-600 text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-500 mb-2">No hay tickets disponibles</h3>
                        <p className="text-slate-600 text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                [class*="grid"] > div {
                    animation: fadeInUp 0.6s ease-out backwards;
                }
            `}</style>
        </div>
    );
}