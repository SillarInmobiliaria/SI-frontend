'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { visitaService } from '../../services/visitaService';
import { Visita } from '../../types';
import Navbar from '../../components/Navbar';

export default function VisitasPage() {
  const router = useRouter();
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const fetchDatos = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const data = await visitaService.obtenerVisitas(token);
      setVisitas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, [router]);

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const vencidas = visitas.filter(v => {
    const fechaVisita = new Date(v.fechaProgramada);
    return fechaVisita < now && v.estado === 'PENDIENTE';
  });

  const paraHoy = visitas.filter(v => {
    const fechaVisita = new Date(v.fechaProgramada);
    return fechaVisita >= now && isSameDay(fechaVisita, now) && v.estado === 'PENDIENTE';
  });

  const proximas = visitas.filter(v => {
    const fechaVisita = new Date(v.fechaProgramada);
    const hoyFin = new Date(now);
    hoyFin.setHours(23, 59, 59, 999);
    return fechaVisita > hoyFin && v.estado === 'PENDIENTE';
  });

  const procesarVisita = async (id: string, nuevoEstado: 'COMPLETADA' | 'CANCELADA') => {
    const mensaje = nuevoEstado === 'COMPLETADA' 
        ? "¿Confirmas que la visita se realizó? Pasará a Seguimiento."
        : "¿Seguro que quieres CANCELAR esta visita?";
        
    if(!confirm(mensaje)) return;

    try {
        const token = localStorage.getItem('token') || '';
        await visitaService.actualizarVisita(token, id, { estado: nuevoEstado });
        fetchDatos();
    } catch (e) { 
      alert('Error al actualizar'); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-slate-700">Cargando Agenda... 📅</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="container mx-auto p-4 md:p-8">
        {/* HEADER MEJORADO */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📅</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Agenda de Visitas</h1>
                <p className="text-slate-500">Gestiona tus salidas a campo en tiempo real</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/visitas/nueva')}
              className="btn bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all gap-2"
            >
              <span className="text-lg">➕</span>
              Agendar Nueva Visita
            </button>
          </div>

          {/* RESUMEN RÁPIDO */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 text-center">
              <div className="text-3xl font-bold text-red-700">{vencidas.length}</div>
              <div className="text-xs text-red-600 font-semibold mt-1">Vencidas</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 text-center">
              <div className="text-3xl font-bold text-green-700">{paraHoy.length}</div>
              <div className="text-xs text-green-600 font-semibold mt-1">Para Hoy</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 text-center">
              <div className="text-3xl font-bold text-blue-700">{proximas.length}</div>
              <div className="text-xs text-blue-600 font-semibold mt-1">Próximas</div>
            </div>
          </div>
        </div>

        {/* TABLEROS DE VISITAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
          {/* VENCIDAS (ROJO) */}
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h2 className="font-bold text-lg">Vencidas</h2>
                    <p className="text-xs opacity-90">Por regularizar</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="font-bold text-lg">{vencidas.length}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {vencidas.map(v => <CardVisita key={v.id} visita={v} onAction={procesarVisita} tipo="vencida"/>)}
              {vencidas.length === 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm text-slate-500 font-medium">¡Estás al día!</p>
                  <p className="text-xs text-slate-400">No hay visitas vencidas</p>
                </div>
              )}
            </div>
          </div>

          {/* HOY (VERDE) */}
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <h2 className="font-bold text-lg">Próximas de Hoy</h2>
                    <p className="text-xs opacity-90">Programadas para hoy</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="font-bold text-lg">{paraHoy.length}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-200 min-h-[300px]">
              <div className="space-y-3">
                {paraHoy.map(v => <CardVisita key={v.id} visita={v} onAction={procesarVisita} tipo="hoy"/>)}
                {paraHoy.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-6xl mb-4">😴</div>
                    <p className="text-slate-600 font-medium">Nada pendiente</p>
                    <p className="text-xs text-slate-400">para el resto del día</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRÓXIMAS (AZUL) */}
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📆</span>
                  <div>
                    <h2 className="font-bold text-lg">Días Siguientes</h2>
                    <p className="text-xs opacity-90">Programadas futuras</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="font-bold text-lg">{proximas.length}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {proximas.map(v => <CardVisita key={v.id} visita={v} onAction={procesarVisita} tipo="futuro"/>)}
              {proximas.length === 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm text-slate-500 font-medium">Sin visitas programadas</p>
                  <p className="text-xs text-slate-400">para los próximos días</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE DE TARJETA MEJORADO ---
const CardVisita = ({ visita, onAction, tipo }: { visita: Visita, onAction: any, tipo: string }) => {
  const fecha = new Date(visita.fechaProgramada);
  const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dia = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

  let cardStyle = "bg-white/90 backdrop-blur-sm border-l-4 border-blue-400";
  let headerBg = "bg-blue-50";
  
  if (tipo === 'vencida') {
    cardStyle = "bg-gradient-to-br from-red-50 to-rose-50 border-l-4 border-red-500";
    headerBg = "bg-red-100";
  }
  
  if (tipo === 'hoy') {
    cardStyle = "bg-white border-l-4 border-green-500 shadow-lg ring-2 ring-green-200";
    headerBg = "bg-green-50";
  }

  return (
    <div className={`${cardStyle} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group`}>
      {/* HEADER CON HORA Y FECHA */}
      <div className={`${headerBg} px-4 py-3 flex justify-between items-center border-b border-slate-200`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-slate-800">{hora}</div>
          {tipo !== 'hoy' && (
            <div className="text-xs text-slate-500 font-semibold bg-white px-2 py-1 rounded-md">
              {dia}
            </div>
          )}
        </div>
        
        {tipo === 'vencida' && (
          <span className="badge badge-error text-white font-bold text-xs animate-pulse">
            ⚠️ VENCIDA
          </span>
        )}
        
        {tipo === 'hoy' && (
          <span className="badge bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs">
            ⏰ HOY
          </span>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="p-4 space-y-3">
        {/* PROPIEDAD */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏠</span>
            <span className="font-bold text-slate-800 text-base uppercase">{visita.propiedad.tipo}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 ml-7">
            <span>📍</span>
            <span className="truncate">{visita.propiedad.ubicacion}</span>
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        {/* CLIENTE */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">{visita.cliente.nombre.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Cliente</div>
            <div className="text-sm font-bold text-slate-700 truncate">{visita.cliente.nombre}</div>
          </div>
        </div>

        {/* ASESOR */}
        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-xl">👔</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-blue-400 uppercase font-bold">Asesor</div>
            <div className="text-sm font-bold text-blue-700 truncate">
              {visita.asesor?.nombre || 'Yo'}
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => onAction(visita.id, 'COMPLETADA')}
            className="flex-1 btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <span>✅</span> Realizada
          </button>
          <button 
            onClick={() => onAction(visita.id, 'CANCELADA')}
            className="flex-1 btn btn-sm bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <span>🚫</span> Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};