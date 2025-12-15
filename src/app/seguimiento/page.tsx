'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { visitaService } from '../../services/visitaService';
import { Visita } from '../../types';
import Navbar from '../../components/Navbar';

export default function SeguimientoPage() {
  const router = useRouter();
  const [historial, setHistorial] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FILTROS ---
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());

  // Modal
  const [visitaEditando, setVisitaEditando] = useState<Visita | null>(null);
  const [nuevoResultado, setNuevoResultado] = useState('');

  const fetchDatos = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const data = await visitaService.obtenerVisitas(token);
      
      const filtradas = data.filter((v: Visita) => {
        const fecha = new Date(v.fechaProgramada);
        
        const esEstadoValido = v.estado === 'COMPLETADA' || v.estado === 'CANCELADA';
        const coincideEstado = filtroEstado === 'TODOS' ? true : v.estado === filtroEstado;
        
        const coincideMes = fecha.getMonth() + 1 === Number(filtroMes);
        const coincideAnio = fecha.getFullYear() === Number(filtroAnio);

        return esEstadoValido && coincideEstado && coincideMes && coincideAnio;
      });

      filtradas.sort((a: Visita, b: Visita) => new Date(b.fechaProgramada).getTime() - new Date(a.fechaProgramada).getTime());
      
      setHistorial(filtradas);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchDatos();
  }, [router, filtroEstado, filtroMes, filtroAnio]);

  const descargarExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:4000/api/visitas/exportar?mes=${filtroMes}&anio=${filtroAnio}&estado=${filtroEstado}`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Error descargando');
      
      const blob = await res.blob();
      const link = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = link;
      a.download = `Seguimiento_${filtroMes}_${filtroAnio}.xlsx`;
      a.click();
    } catch (e) { 
      alert('Error al generar Excel'); 
    }
  };

  const abrirInforme = (visita: Visita) => {
    setVisitaEditando(visita);
    setNuevoResultado(visita.resultadoSeguimiento || '');
    const modal = document.getElementById('modal_informe') as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const guardarInforme = async () => {
    if (!visitaEditando) return;
    try {
      const token = localStorage.getItem('token') || '';
      await visitaService.actualizarVisita(token, visitaEditando.id, { resultadoSeguimiento: nuevoResultado });
      const modal = document.getElementById('modal_informe') as HTMLDialogElement;
      if (modal) modal.close();
      setVisitaEditando(null);
      fetchDatos();
      alert('Informe guardado ✅');
    } catch (e) { 
      alert('Error al guardar'); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto p-4 md:p-8">
        
        {/* HEADER CON FILTROS - MEJORADO */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* TÍTULO Y DESCRIPCIÓN */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📂</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Historial de Seguimiento</h1>
                  <p className="text-slate-500 text-sm">Gestiona resultados y descarga reportes detallados</p>
                </div>
              </div>
            </div>

            {/* FILTROS MEJORADOS */}
            <div className="flex flex-wrap items-end gap-3">
              {/* SELECTOR ESTADO */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Estado</label>
                <select 
                  className="select select-bordered bg-white hover:border-blue-400 focus:border-blue-500 transition-all min-w-[140px]" 
                  value={filtroEstado} 
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="TODOS">Todos</option>
                  <option value="COMPLETADA">✅ Realizadas</option>
                  <option value="CANCELADA">🚫 Canceladas</option>
                </select>
              </div>

              {/* SELECTOR MES */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Mes</label>
                <select 
                  className="select select-bordered bg-white hover:border-blue-400 focus:border-blue-500 transition-all min-w-[120px]"
                  value={filtroMes} 
                  onChange={(e) => setFiltroMes(Number(e.target.value))}
                >
                  {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((m, i) => (
                    <option key={i} value={i+1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* SELECTOR AÑO */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Año</label>
                <select 
                  className="select select-bordered bg-white hover:border-blue-400 focus:border-blue-500 transition-all min-w-[100px]"
                  value={filtroAnio}
                  onChange={(e) => setFiltroAnio(Number(e.target.value))}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              {/* BOTÓN EXCEL MEJORADO */}
              <button 
                onClick={descargarExcel}
                className="btn bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all gap-2"
              >
                <span className="text-lg">📊</span>
                Exportar Excel
              </button>
            </div>
          </div>

          {/* ESTADÍSTICAS RÁPIDAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-xs text-blue-600 font-semibold">Total Visitas</div>
              <div className="text-2xl font-bold text-blue-700">{historial.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="text-xs text-green-600 font-semibold">Realizadas</div>
              <div className="text-2xl font-bold text-green-700">
                {historial.filter(v => v.estado === 'COMPLETADA').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
              <div className="text-xs text-red-600 font-semibold">Canceladas</div>
              <div className="text-2xl font-bold text-red-700">
                {historial.filter(v => v.estado === 'CANCELADA').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-xs text-purple-600 font-semibold">Tasa Éxito</div>
              <div className="text-2xl font-bold text-purple-700">
                {historial.length > 0 
                  ? Math.round((historial.filter(v => v.estado === 'COMPLETADA').length / historial.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE RESULTADOS - MEJORADA */}
        <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <table className="table w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                <th className="text-slate-700 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📅</span>
                    Fecha
                  </div>
                </th>
                <th className="text-slate-700 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">👤</span>
                    Detalle
                  </div>
                </th>
                <th className="text-slate-700 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Estado
                  </div>
                </th>
                <th className="text-slate-700 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">📝</span>
                    Informe
                  </div>
                </th>
                <th className="text-slate-700 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">⚡</span>
                    Acción
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {historial.map((v) => (
                <tr key={v.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-slate-100">
                  <td className="py-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 inline-block">
                      <div className="font-bold text-slate-700 text-sm">
                        {new Date(v.fechaProgramada).toLocaleDateString('es-ES', {day: '2-digit', month: 'short'})}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {new Date(v.fechaProgramada).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="space-y-2">
                      <div className="font-bold text-slate-800 text-base flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {v.cliente.nombre}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-semibold">
                          {v.propiedad.tipo}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-600">📍 {v.propiedad.ubicacion}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md w-fit">
                        <span className="text-xs">👔</span>
                        <span className="text-xs font-semibold text-blue-700">{v.asesor?.nombre}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    {v.estado === 'COMPLETADA' 
                      ? <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md">
                          <span>✓</span> Realizada
                        </div>
                      : <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md">
                          <span>✕</span> Cancelada
                        </div>
                    }
                  </td>
                  <td className="py-4 max-w-xs">
                    {v.resultadoSeguimiento ? (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
                        <p className="text-xs text-slate-700 line-clamp-2 italic">
                          "{v.resultadoSeguimiento}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                        Sin informe registrado
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <button 
                      onClick={() => abrirInforme(v)} 
                      className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all gap-2"
                    >
                      <span>{v.resultadoSeguimiento ? '✏️' : '➕'}</span>
                      {v.resultadoSeguimiento ? 'Editar' : 'Agregar'}
                    </button>
                  </td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-4xl">📭</span>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-600">No hay registros</p>
                        <p className="text-sm text-slate-400">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MEJORADO */}
      <dialog id="modal_informe" className="modal">
        <div className="modal-box max-w-2xl bg-gradient-to-br from-white to-slate-50 border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-slate-800">Informe de Visita</h3>
              <p className="text-sm text-slate-500">Documenta los detalles y resultados</p>
            </div>
          </div>

          {visitaEditando && (
            <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 font-semibold">Cliente:</span>
                  <span className="ml-2 text-slate-700">{visitaEditando.cliente.nombre}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Fecha:</span>
                  <span className="ml-2 text-slate-700">
                    {new Date(visitaEditando.fechaProgramada).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Propiedad:</span>
                  <span className="ml-2 text-slate-700">{visitaEditando.propiedad.tipo}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Ubicación:</span>
                  <span className="ml-2 text-slate-700">{visitaEditando.propiedad.ubicacion}</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-semibold text-slate-700">Observaciones y resultados:</span>
              <span className="label-text-alt text-slate-400">{nuevoResultado.length}/500</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-40 bg-white border-2 border-slate-200 focus:border-blue-400 focus:outline-none transition-all" 
              placeholder="Describe el resultado de la visita, interés del cliente, próximos pasos..."
              value={nuevoResultado} 
              onChange={(e) => setNuevoResultado(e.target.value)}
              maxLength={500}
            ></textarea>
          </div>

          <div className="modal-action flex gap-3">
            <form method="dialog" className="flex gap-3">
              <button className="btn btn-ghost border-2 border-slate-200 hover:bg-slate-50">
                <span>✕</span> Cancelar
              </button>
              <button 
                type="button" 
                onClick={guardarInforme} 
                className="btn bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
              >
                <span>💾</span> Guardar Informe
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}