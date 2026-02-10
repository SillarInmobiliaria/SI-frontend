'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FaCalendarAlt, FaCalendarDay, FaCalendarWeek, FaHome, FaFileExcel } from 'react-icons/fa';

const API_URL = 'https://sillar-backend.onrender.com/api'; 

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE FILTRO ---
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'ANUAL' | 'MENSUAL' | 'SEMANAL'>('ANUAL');
  
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]); 
  
  const availableYears = [2024, 2025, 2026]; 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        // Petición al Backend real
        const res = await fetch(`${API_URL}/admin/dashboard/stats?year=${year}&mode=${viewMode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error al cargar datos');
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [year, viewMode, router]);

  // --- LÓGICA DE DESCARGA ---
  const descargarExcel = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/dashboard/exportar?year=${year}&mode=${viewMode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Error al descargar el archivo");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_General_${viewMode}_${year}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) { 
        alert('No se pudo descargar el reporte. Intenta nuevamente.'); 
      }
  };

  const toggleFiltro = (metric: string) => {
    if (filtrosActivos.includes(metric)) {
        setFiltrosActivos(prev => prev.filter(f => f !== metric));
    } else {
        setFiltrosActivos(prev => [...prev, metric]);
    }
  };

  const isVisible = (metric: string) => filtrosActivos.length === 0 || filtrosActivos.includes(metric);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-500"></div>
      <p className="font-bold text-xl text-slate-700">Cargando métricas... 📊</p>
    </div>
  </div>;

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div className="flex items-center gap-4">
            <Link href="/">
                <button className="btn bg-white border border-slate-200 text-slate-500 hover:bg-white hover:text-blue-600 hover:border-blue-300 shadow-sm rounded-2xl h-14 w-14 flex items-center justify-center transition-all duration-300 group">
                    <FaHome size={24} className="group-hover:scale-110 transition-transform"/>
                </button>
            </Link>
            
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel Administrativo</h1>
                <p className="text-slate-600 mt-1 font-medium">Reportes y métricas de rendimiento.</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="appearance-none bg-white border border-slate-200 text-slate-700 font-bold py-3 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-slate-300"
            >
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <button onClick={descargarExcel} className="btn bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-none gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold h-[46px] px-6 rounded-xl flex items-center">
            <FaFileExcel size={18} /> Descargar Reporte
          </button>
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <CardResumen 
          titulo="Propiedades" valor={data?.totales?.propiedades} icono="🏠" color="bg-gradient-to-br from-blue-500 to-blue-600"
          active={isVisible('propiedades')} onClick={() => toggleFiltro('propiedades')}
        />
        <CardResumen 
          titulo="Propietarios" valor={data?.totales?.propietarios} icono="👔" color="bg-gradient-to-br from-emerald-500 to-emerald-600" 
          active={isVisible('propietarios')} onClick={() => toggleFiltro('propietarios')}
        />
        <CardResumen 
          titulo="Clientes Nuevos" valor={data?.totales?.clientes} icono="👥" color="bg-gradient-to-br from-purple-500 to-purple-600"
          active={isVisible('clientes')} onClick={() => toggleFiltro('clientes')}
        />
        <CardResumen 
          titulo="Visitas Hechas" valor={data?.totales?.visitas} icono="📅" color="bg-gradient-to-br from-orange-500 to-orange-600"
          active={isVisible('visitas')} onClick={() => toggleFiltro('visitas')}
        />
      </div>

      {/* SECCIÓN GRÁFICA */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 h-[500px] flex flex-col backdrop-blur-sm">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="text-3xl">📈</span>
                <div className="flex flex-col">
                    <span>Tendencia {viewMode === 'ANUAL' ? 'Anual' : viewMode === 'MENSUAL' ? 'Mensual' : 'Semanal'}</span>
                    {filtrosActivos.length > 0 && <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-full font-bold mt-1 w-fit">🔍 Comparando {filtrosActivos.length} métricas</span>}
                </div>
            </h2>
            
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                <button 
                    onClick={() => setViewMode('ANUAL')} 
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'ANUAL' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                        : 'bg-transparent text-slate-600 hover:bg-white hover:shadow-md'
                    }`}
                >
                    <FaCalendarAlt className="text-base"/> Anual
                </button>
                <button 
                    onClick={() => setViewMode('MENSUAL')} 
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'MENSUAL' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                        : 'bg-transparent text-slate-600 hover:bg-white hover:shadow-md'
                    }`}
                >
                    <FaCalendarDay className="text-base"/> Mensual
                </button>
                <button 
                    onClick={() => setViewMode('SEMANAL')} 
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'SEMANAL' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                        : 'bg-transparent text-slate-600 hover:bg-white hover:shadow-md'
                    }`}
                >
                    <FaCalendarWeek className="text-base"/> Semanal
                </button>
            </div>
        </div>
        
        <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.grafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorProp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorCli" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorOwner" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                </defs>
                
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36}/>
                
                {isVisible('propiedades') && (
                    <Area type="monotone" dataKey="propiedades" name="Propiedades" stroke="#3b82f6" fill="url(#colorProp)" strokeWidth={3} animationDuration={1000} />
                )}
                {isVisible('clientes') && (
                    <Area type="monotone" dataKey="clientes" name="Clientes" stroke="#a855f7" fill="url(#colorCli)" strokeWidth={3} animationDuration={1000} />
                )}
                {isVisible('propietarios') && (
                    <Area type="monotone" dataKey="propietarios" name="Propietarios" stroke="#10b981" fill="url(#colorOwner)" strokeWidth={3} animationDuration={1000} />
                )}
                {isVisible('visitas') && (
                    <Area type="monotone" dataKey="visitas" name="Visitas" stroke="#f97316" fill="url(#colorVis)" strokeWidth={3} animationDuration={1000} />
                )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const CardResumen = ({ titulo, valor, icono, color, onClick, active }: any) => (
  <div 
    onClick={onClick}
    className={`
        relative p-6 rounded-2xl shadow-md border cursor-pointer transition-all duration-300 select-none overflow-hidden group
        ${active 
          ? 'bg-white border-slate-200 opacity-100 scale-100 ring-2 ring-blue-400 ring-offset-2' 
          : 'bg-slate-50 border-slate-200 opacity-60 scale-95 hover:opacity-80 grayscale'
        }
        hover:scale-[1.03] hover:shadow-xl
    `}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{titulo}</p>
          <p className="text-5xl font-black text-slate-900 mt-1 bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text">{valor || 0}</p>
        </div>
        <div className={`p-5 rounded-2xl text-white text-3xl shadow-xl ${color} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {icono}
        </div>
    </div>
    <div className="relative mt-4 pt-3 border-t border-slate-200">
        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition-colors ${
          active 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-sm' 
            : 'bg-slate-200 text-slate-500'
        }`}>
            {active ? '✓ Visible' : '○ Oculto'}
        </span>
    </div>
  </div>
);