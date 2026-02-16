'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar'; 
import { FaTerminal, FaBug, FaLightbulb, FaComment } from 'react-icons/fa';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchTickets();
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-mono">
            <Navbar />
            <div className="container mx-auto p-8">
                <div className="flex items-center gap-4 mb-8 border-b-2 border-green-500 pb-4 text-green-400">
                    <FaTerminal className="text-3xl" />
                    <h1 className="text-3xl font-bold uppercase tracking-tighter">Buzón_Developer_Logs</h1>
                </div>

                {loading ? (
                    <p className="animate-pulse text-green-400">Iniciando protocolo de lectura...</p>
                ) : tickets.length === 0 ? (
                    <p className="text-slate-500 italic">No se encontraron registros en el servidor.</p>
                ) : (
                    <div className="grid gap-4">
                        {tickets.map((t) => (
                            <div key={t.id} className="bg-slate-800 border border-slate-700 p-6 rounded-xl hover:border-green-500 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded text-[10px] font-bold ${
                                        t.tipo === 'BUG' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {t.tipo}
                                    </span>
                                    <span className="text-slate-500 text-[10px]">{new Date(t.createdAt).toLocaleString()}</span>
                                </div>
                                <h2 className="text-xl font-bold text-green-400 mb-2">{t.asunto}</h2>
                                <p className="text-slate-300 text-sm leading-relaxed font-sans">{t.descripcion}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}