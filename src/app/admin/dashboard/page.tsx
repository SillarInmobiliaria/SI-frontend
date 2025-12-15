'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API_URL = 'http://localhost:4000/api'; 

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null);
  const availableYears = [2024, 2025, 2026]; 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        const res = await fetch(`${API_URL}/admin/dashboard/stats?year=${year}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error al cargar datos');
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [year, router]);

  const descargarExcel = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/dashboard/exportar`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_General_${year}.xlsx`;
        a.click();
      } catch (e) { alert('Error al descargar'); }
  };

  const toggleFiltro = (metric: string) => {
    if (filtroActivo === metric) setFiltroActivo(null);
    else setFiltroActivo(metric);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Cargando métricas... 📊</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel Administrativo</h1>
          <p className="text-slate-500">Métricas del año {year}. Haz clic en las tarjetas para filtrar.</p>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="select select-bordered select-sm bg-white"
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={descargarExcel} className="btn btn-success text-white btn-sm gap-2 shadow">
            📥 Excel
          </button>
        </div>
      </div>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <CardResumen 
          titulo="Propiedades" valor={data?.totales?.propiedades} icono="🏠" color="bg-blue-500"
          active={!filtroActivo || filtroActivo === 'propiedades'} onClick={() => toggleFiltro('propiedades')}
        />
        <CardResumen 
          titulo="Propietarios" valor={data?.totales?.propietarios} icono="👔" color="bg-emerald-500" 
          active={!filtroActivo || filtroActivo === 'propietarios'} onClick={() => toggleFiltro('propietarios')}
        />
        <CardResumen 
          titulo="Clientes Nuevos" valor={data?.totales?.clientes} icono="👥" color="bg-purple-500"
          active={!filtroActivo || filtroActivo === 'clientes'} onClick={() => toggleFiltro('clientes')}
        />
        {/* NUEVA TARJETA DE VISITAS */}
        <CardResumen 
          titulo="Visitas Hechas" valor={data?.totales?.visitas} icono="📅" color="bg-orange-500"
          active={!filtroActivo || filtroActivo === 'visitas'} onClick={() => toggleFiltro('visitas')}
        />
      </div>

      {/* GRÁFICA */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-[450px]">
        <h2 className="text-xl font-bold text-slate-700 mb-6">
            📈 Tendencia Anual ({year})
            {filtroActivo && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Filtro Activo</span>}
        </h2>
        
        <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={data?.grafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorCli" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorOwner" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
              </defs>
              
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '10px' }} />
              <Legend verticalAlign="top" height={36}/>
              
              {(!filtroActivo || filtroActivo === 'propiedades') && (
                  <Area type="monotone" dataKey="propiedades" name="Propiedades" stroke="#3b82f6" fill="url(#colorProp)" strokeWidth={3} />
              )}
              {(!filtroActivo || filtroActivo === 'clientes') && (
                  <Area type="monotone" dataKey="clientes" name="Clientes" stroke="#a855f7" fill="url(#colorCli)" strokeWidth={3} />
              )}
              {(!filtroActivo || filtroActivo === 'propietarios') && (
                  <Area type="monotone" dataKey="propietarios" name="Propietarios" stroke="#10b981" fill="url(#colorOwner)" strokeWidth={3} />
              )}
              {/* NUEVA LÍNEA DE VISITAS */}
              {(!filtroActivo || filtroActivo === 'visitas') && (
                  <Area type="monotone" dataKey="visitas" name="Visitas" stroke="#f97316" fill="url(#colorVis)" strokeWidth={3} />
              )}
            </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const CardResumen = ({ titulo, valor, icono, color, onClick, active }: any) => (
  <div 
    onClick={onClick}
    className={`
        relative p-6 rounded-xl shadow-sm border-l-4 cursor-pointer transition-all duration-300
        ${active ? 'bg-white opacity-100 scale-100 ring-2 ring-offset-1 ring-blue-100' : 'bg-slate-100 opacity-50 scale-95 grayscale'}
        hover:scale-[1.02]
    `}
  >
    <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase">{titulo}</p>
          <p className="text-4xl font-bold text-slate-800 mt-1">{valor || 0}</p>
        </div>
        <div className={`p-4 rounded-full text-white text-2xl shadow-lg ${color}`}>
          {icono}
        </div>
    </div>
    <div className="mt-2 text-right">
        <span className="text-[10px] text-gray-400 font-bold uppercase">{active ? 'Mostrando' : 'Oculto'}</span>
    </div>
  </div>
);