'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import { getCierres } from '../../../services/api';
import Link from 'next/link';
import { FaArrowLeft, FaFileContract, FaKey, FaCheckCircle, FaSearch } from 'react-icons/fa';

export default function HistorialPage() {
    const [cierres, setCierres] = useState<any[]>([]);
    const [filtro, setFiltro] = useState<'TODOS' | 'VENTA' | 'ALQUILER'>('TODOS');
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await getCierres();
                if(Array.isArray(data)) {
                    // Ordenar por fecha más reciente
                    const ordenados = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setCierres(ordenados);
                }
            } catch (error) {
                console.error("Error al cargar historial", error);
            }
        };
        cargarDatos();
    }, []);

    // Filtrar datos
    const datosFiltrados = cierres.filter(c => {
        const coincideTipo = filtro === 'TODOS' || c.tipoOperacion === filtro;
        const textoBusqueda = `${c.clienteNombre || ''} ${c.propiedadDireccion || ''}`.toLowerCase();
        const coincideBusqueda = textoBusqueda.includes(busqueda.toLowerCase());
        return coincideTipo && coincideBusqueda;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            <main className="container mx-auto p-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/cierre">
                            <button className="btn btn-circle btn-ghost"><FaArrowLeft/></button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800">Historial de Cierres</h1>
                            <p className="text-slate-500">Registro histórico de todas las operaciones.</p>
                        </div>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setFiltro('TODOS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'TODOS' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Todos</button>
                        <button onClick={() => setFiltro('ALQUILER')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filtro === 'ALQUILER' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}><FaFileContract/> Alquileres</button>
                        <button onClick={() => setFiltro('VENTA')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filtro === 'VENTA' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}><FaKey/> Ventas</button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar cliente o propiedad..." 
                            className="input input-bordered w-full pl-10"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-3.5 text-slate-400"/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-xs">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Cliente</th>
                                    <th>Propiedad</th>
                                    <th>Monto Final</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-slate-400">
                                            No se encontraron operaciones con ese criterio.
                                        </td>
                                    </tr>
                                ) : (
                                    datosFiltrados.map((cierre) => (
                                        <tr key={cierre.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-none">
                                            <td className="font-mono text-xs">{cierre.fechaCierre || '-'}</td>
                                            <td>
                                                <span className={`badge badge-sm font-bold text-white border-none ${cierre.tipoOperacion === 'ALQUILER' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                                    {cierre.tipoOperacion}
                                                </span>
                                            </td>
                                            <td className="font-bold text-slate-700">{cierre.clienteNombre || 'Sin Nombre'}</td>
                                            <td className="text-xs text-slate-500 max-w-xs truncate" title={cierre.propiedadDireccion}>
                                                {cierre.propiedadDireccion || 'Sin Dirección'}
                                            </td>
                                            <td className="font-mono font-bold text-slate-700">
                                                {cierre.tipoOperacion === 'ALQUILER' 
                                                    ? `${cierre.moneda === 'PEN' ? 'S/' : '$'} ${cierre.montoRenta}`
                                                    : `$ ${cierre.montoVenta}`
                                                }
                                            </td>
                                            <td>
                                                <div className="badge badge-success badge-outline gap-1 font-bold text-xs">
                                                    <FaCheckCircle/> Cerrado
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}