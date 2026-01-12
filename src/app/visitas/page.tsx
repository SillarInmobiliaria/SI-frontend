'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    getVisitas, createVisita, updateVisita, cancelVisita, getPropiedades, getClientes 
} from '../../services/api'; 
import { Visita, Propiedad, Cliente } from '../../types';
import Navbar from '../../components/Navbar';
import { 
  FaChevronLeft, FaChevronRight, FaCalendarPlus, FaClock, 
  FaUserTie, FaHome, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaIdCard, FaMapMarkerAlt, FaEnvelope, FaTimes, FaStickyNote, FaBan
} from 'react-icons/fa';

const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const preSelectedClienteId = searchParams.get('clienteId');
  const preSelectedClienteNombre = searchParams.get('clienteNombre');
  const preSelectedPropiedadId = searchParams.get('propiedadId'); 

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // --- MODALES ---
  const [isModalOpen, setIsModalOpen] = useState(false); // Crear
  const [isDetailOpen, setIsDetailOpen] = useState(false); // Ver Detalle
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false); // Finalizar
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // Cancelar
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null); 
  
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]); 
  
  // Forms
  const [formData, setFormData] = useState({ hora: '09:00', propiedadId: preSelectedPropiedadId || '', comentarios: '' });
  
  // Datos Finalización
  const [completionData, setCompletionData] = useState({ resultadoSeguimiento: '', dni: '', email: '', direccion: '', ocupacion: '' });
  
  // Datos Cancelación
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  useEffect(() => {
    if (preSelectedPropiedadId) setFormData(prev => ({ ...prev, propiedadId: preSelectedPropiedadId }));
  }, [preSelectedPropiedadId]);

  const fetchDatos = async () => {
    try {
      const [v, p, c] = await Promise.all([getVisitas(), getPropiedades(), getClientes()]);
      setVisitas(v);
      setPropiedades(p);
      setClientes(c);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + increment));
    setCurrentDate(new Date(newDate));
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // --- ACCIONES ---

  // 1. CLICK EN VISITA -> ABRIR DETALLE (Ficha Técnica)
  const handleVisitaClick = (e: React.MouseEvent, visita: Visita) => {
      e.stopPropagation();
      setSelectedVisita(visita);
      setIsDetailOpen(true); 
  };

  // 2. CREAR VISITA
  const handleSaveVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !preSelectedClienteId) return alert("Error: Falta día o cliente.");

    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDay).padStart(2, '0');
      const fechaISO = `${year}-${month}-${day}T${formData.hora}:00`;

      await createVisita({
        fechaProgramada: fechaISO,
        clienteId: preSelectedClienteId,
        propiedadId: formData.propiedadId,
        comentariosPrevios: formData.comentarios
      });

      alert('✅ Visita Agendada');
      setIsModalOpen(false);
      fetchDatos(); 
      router.replace('/visitas'); 
    } catch (error) {
      alert('❌ Error al agendar');
    }
  };

  // 3. ABRIR MODAL FINALIZAR (Desde el detalle)
  const openFinalizeModal = () => {
      if (!selectedVisita) return;
      setCompletionData({
          resultadoSeguimiento: selectedVisita.resultadoSeguimiento || '',
          dni: selectedVisita.cliente.dni || '',
          email: selectedVisita.cliente.email || '',
          direccion: selectedVisita.cliente.direccion || '',
          ocupacion: selectedVisita.cliente.ocupacion || ''
      });
      setIsDetailOpen(false);
      setIsCompleteModalOpen(true);
  };

  // 4. GUARDAR FINALIZACIÓN
  const handleFinalizarVisita = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedVisita) return;
      const esProspecto = selectedVisita.cliente.tipo !== 'CLIENTE';
      
      if (esProspecto && (!completionData.dni || !completionData.email)) {
          return alert("⚠️ DNI y Email obligatorios para convertir Prospecto a Cliente.");
      }

      try {
          await updateVisita(selectedVisita.id, {
              estado: 'COMPLETADA',
              resultadoSeguimiento: completionData.resultadoSeguimiento,
              dni: completionData.dni,
              email: completionData.email,
              direccion: completionData.direccion,
              ocupacion: completionData.ocupacion
          });
          alert('✅ Visita Finalizada Correctamente');
          setIsCompleteModalOpen(false);
          fetchDatos();
      } catch (error) {
          alert('❌ Error al finalizar');
      }
  };

  // 5. GUARDAR CANCELACIÓN
  const handleCancelarVisita = async () => {
      if (!selectedVisita || !motivoCancelacion.trim()) return alert("⚠️ Debes escribir un motivo.");
      
      try {
          await cancelVisita(selectedVisita.id, motivoCancelacion);
          alert('Visita Cancelada.');
          setIsCancelModalOpen(false);
          setIsDetailOpen(false);
          fetchDatos();
      } catch (error) {
          alert('Error al cancelar');
      }
  };

  // RENDERIZADO CALENDARIO
  const renderCalendarCells = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const totalSlots = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    return totalSlots.map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 min-h-[120px]"></div>;
      
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const visitsForDay = visitas.filter(v => v.fechaProgramada.startsWith(dateString));
      const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

      return (
        <div key={day} onClick={() => { setSelectedDay(day); setIsModalOpen(true); }}
          className={`border border-slate-200 min-h-[120px] p-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group relative flex flex-col gap-1 ${isToday ? 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-400 ring-inset' : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-white'}`}>
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${isToday ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg scale-110' : 'text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'}`}>{day}</span>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-700 hover:scale-125 transform"><FaCalendarPlus size={14}/></button>
          </div>
          <div className="flex flex-col gap-1.5 mt-1 overflow-y-auto max-h-[100px] scrollbar-hide">
            {visitsForDay.map(v => (
               <div key={v.id} onClick={(e) => handleVisitaClick(e, v)}
                 className={`text-[10px] px-2.5 py-2 rounded-lg border-l-[3px] shadow-md truncate flex items-center gap-1.5 cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200 font-medium
                 ${v.estado === 'COMPLETADA' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-800 opacity-70 hover:opacity-85' : 
                   v.estado === 'CANCELADA' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-800 opacity-60 hover:opacity-75' : 
                   'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-600 text-indigo-900 hover:from-indigo-100 hover:to-purple-100'}`}>
                 <span className="font-bold text-[11px]">{new Date(v.fechaProgramada).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                 <span className="truncate">{v.cliente.nombre}</span>
                 {v.estado === 'COMPLETADA' && <FaCheckCircle className="ml-auto text-green-600"/>}
                 {v.estado === 'CANCELADA' && <FaTimes className="ml-auto text-red-600"/>}
               </div>
            ))}
          </div>
        </div>
      );
    });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4"/>
        <p className="text-slate-600 font-medium">Cargando calendario...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-slate-800">
      <Navbar />
      <div className="container mx-auto p-6 max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-3.5 rounded-xl shadow-lg hover:scale-110 transition-transform duration-200">
                  <FaCalendarPlus size={26}/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent">Calendario de Visitas</h1>
                    {preSelectedClienteId ? (
                         <div className="flex items-center gap-2 text-sm text-green-700 font-bold bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 rounded-lg animate-pulse shadow-sm border border-green-200 mt-1">
                            <span>Agendando para: {preSelectedClienteNombre}</span>
                            <span className="text-xs text-slate-500 font-normal">(Selecciona un día)</span>
                         </div>
                    ) : <p className="text-slate-500 text-sm mt-1">Gestiona tu agenda mensual</p>}
                </div>
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0 bg-gradient-to-r from-slate-100 to-slate-200 p-3 rounded-full shadow-inner">
                <button onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-all duration-200 text-slate-700 hover:text-indigo-600 hover:shadow-md">
                  <FaChevronLeft size={16}/>
                </button>
                <div className="text-xl font-bold w-44 text-center select-none">
                  <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">{MONTHS[currentDate.getMonth()]}</span>
                  <span className="text-slate-500 ml-2">{currentDate.getFullYear()}</span>
                </div>
                <button onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-all duration-200 text-slate-700 hover:text-indigo-600 hover:shadow-md">
                  <FaChevronRight size={16}/>
                </button>
            </div>
        </div>

        {/* CALENDARIO */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
            <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white text-center py-4 font-bold text-sm uppercase tracking-wider shadow-lg">
              {DAYS.map(d => <div key={d} className="hover:bg-white/10 transition-colors duration-200 py-1 rounded">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 bg-slate-100 gap-[1px] border-t-2 border-slate-300">{renderCalendarCells()}</div>
        </div>
      </div>

      {/* MODAL 1: CREAR (Solo si hay cliente seleccionado) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-6 flex justify-between items-center shadow-lg">
                    <div>
                      <h3 className="text-2xl font-bold">Nueva Visita</h3>
                      <p className="text-sm opacity-90 mt-1">Agenda una nueva cita</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 text-white text-xl">✕</button>
                </div>
                <form onSubmit={handleSaveVisita} className="p-7 space-y-5">
                    {!preSelectedClienteId ? (
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-lg text-sm text-yellow-800 shadow-sm">
                          <span className="font-bold">⚠️ Atención:</span> Debes seleccionar un cliente desde el módulo "Atención".
                        </div>
                    ) : (
                        <>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                                <label className="text-xs font-bold text-blue-800 uppercase mb-2 block tracking-wide">Cliente Seleccionado</label>
                                <div className="flex items-center gap-3 text-blue-900 font-bold text-lg">
                                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                                    <FaUserTie />
                                  </div>
                                  <span>{preSelectedClienteNombre}</span>
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-slate-700 text-sm">
                                  <span className="flex items-center gap-2"><FaClock className="text-indigo-600"/> Hora de la Visita</span>
                                </label>
                                <input type="time" className="input input-bordered w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-lg font-medium" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required />
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-slate-700 text-sm">
                                  <span className="flex items-center gap-2"><FaHome className="text-indigo-600"/> Propiedad a Visitar</span>
                                </label>
                                <select className="select select-bordered w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-medium" value={formData.propiedadId} onChange={e => setFormData({...formData, propiedadId: e.target.value})} required >
                                    <option value="">-- Seleccionar Propiedad --</option>
                                    {propiedades.map(p => <option key={p.id} value={p.id}>{p.tipo} - {p.direccion}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-slate-700 text-sm">
                                  <span className="flex items-center gap-2"><FaStickyNote className="text-indigo-600"/> Notas Previas (Opcional)</span>
                                </label>
                                <textarea className="textarea textarea-bordered h-28 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" placeholder="Ej. Confirmar horario, llevar documentos..." value={formData.comentarios} onChange={e => setFormData({...formData, comentarios: e.target.value})}></textarea>
                            </div>
                            <div className="pt-3 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn flex-1 btn-ghost hover:bg-slate-100 font-semibold transition-all duration-200">Cancelar</button>
                                <button type="submit" className="btn flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-none font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                                  <FaCalendarPlus className="mr-2"/> Agendar Visita
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
      )}

      {/* MODAL 2: DETALLE DE VISITA (FICHA TÉCNICA) */}
      {isDetailOpen && selectedVisita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn relative">
                <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 shadow-xl">
                    <button onClick={() => setIsDetailOpen(false)} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 text-white">
                      <FaTimes size={18}/>
                    </button>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
                        <FaClock size={24}/>
                      </div>
                      Ficha de Visita
                    </h2>
                    <p className="text-sm opacity-90 mt-2 ml-[60px]">
                      {new Date(selectedVisita.fechaProgramada).toLocaleDateString('es-PE', {weekday: 'long', day: 'numeric', month: 'long'})} - {new Date(selectedVisita.fechaProgramada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                </div>
                
                <div className="p-7 space-y-6">
                    {/* INFO PROPIEDAD */}
                    <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                          <FaHome size={20}/>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Propiedad</h4>
                            <p className="font-bold text-slate-800 text-base">{selectedVisita.propiedad.tipo} - {selectedVisita.propiedad.ubicacion}</p>
                            <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-slate-400" size={12}/>
                              {selectedVisita.propiedad.direccion}
                            </p>
                        </div>
                    </div>

                    {/* INFO CLIENTE */}
                    <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                          <FaUserTie size={20}/>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Cliente</h4>
                            <p className="font-bold text-slate-800 text-base">{selectedVisita.cliente.nombre}</p>
                            <p className="text-sm text-slate-600 mt-1">{selectedVisita.cliente.telefono1}</p>
                        </div>
                    </div>

                    {/* COMENTARIOS */}
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-xl border-l-4 border-yellow-400 text-sm text-slate-700 shadow-sm">
                        <p className="font-bold flex items-center gap-2 mb-2 text-yellow-700 text-base">
                          <FaStickyNote className="text-yellow-600"/> Notas Previas:
                        </p>
                        <p className="italic text-slate-600 leading-relaxed">"{selectedVisita.comentariosPrevios || 'Sin comentarios'}"</p>
                    </div>

                    {/* BOTONES ACCIÓN */}
                    {selectedVisita.estado === 'PENDIENTE' && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            {/* Botón Cancelar */}
                            <button 
                                onClick={() => setIsCancelModalOpen(true)} 
                                className="btn btn-outline border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-600 gap-2 font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                            >
                                <FaBan/> Cancelar Visita
                            </button>

                            {/* LÓGICA DE BOTÓN INTELIGENTE (BLOQUEO POR HORA) */}
                            {(() => {
                                const fechaVisita = new Date(selectedVisita.fechaProgramada);
                                const ahora = new Date();
                                const yaPasoLaHora = ahora > fechaVisita;

                                return (
                                    <button 
                                        onClick={openFinalizeModal} 
                                        disabled={!yaPasoLaHora}
                                        className={`btn gap-2 font-bold shadow-md transition-all duration-200 ${
                                            yaPasoLaHora 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none hover:shadow-lg hover:scale-105' 
                                                : 'bg-gray-200 text-gray-500 border-2 border-gray-300 cursor-not-allowed opacity-60'
                                        }`}
                                        title={!yaPasoLaHora ? `Disponible el ${fechaVisita.toLocaleString()}` : 'Registrar resultado'}
                                    >
                                        <FaCheckCircle size={16}/> 
                                        {!yaPasoLaHora ? 'Aún no es hora' : 'Finalizar Visita'}
                                    </button>
                                );
                            })()}
                        </div>
                    )}

                    {selectedVisita.estado !== 'PENDIENTE' && (
                        <div className={`p-4 rounded-xl text-center font-bold border-2 shadow-md ${
                          selectedVisita.estado === 'COMPLETADA' 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 text-green-700' 
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400 text-red-700'
                        }`}>
                            <div className="flex items-center justify-center gap-2 text-lg">
                              {selectedVisita.estado === 'COMPLETADA' ? <FaCheckCircle size={20}/> : <FaTimes size={20}/>}
                              Visita {selectedVisita.estado}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* MODAL 3: CANCELAR VISITA */}
      {isCancelModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
              <div className="bg-white w-full max-w-md rounded-2xl p-7 animate-scaleIn shadow-2xl border-t-4 border-red-500">
                  <h3 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <FaBan className="text-red-600"/>
                    </div>
                    Cancelar Visita
                  </h3>
                  <p className="text-sm text-gray-600 mb-5 ml-[52px]">Por favor indica el motivo de la cancelación para el historial.</p>
                  <textarea 
                    className="textarea textarea-bordered w-full h-28 mb-5 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none" 
                    placeholder="Ej: Cliente canceló por viaje imprevisto..." 
                    value={motivoCancelacion} 
                    onChange={e => setMotivoCancelacion(e.target.value)} 
                    autoFocus
                  ></textarea>
                  <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setIsCancelModalOpen(false)} 
                        className="btn btn-ghost hover:bg-slate-100 font-semibold transition-all duration-200"
                      >
                        Volver
                      </button>
                      <button 
                        onClick={handleCancelarVisita} 
                        className="btn bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-none font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      >
                        <FaBan className="mr-2"/> Confirmar Cancelación
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL 4: FINALIZAR (Formulario completo) */}
      {isCompleteModalOpen && selectedVisita && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto">
                <div className={`p-6 text-white flex justify-between items-center shadow-xl ${selectedVisita.cliente.tipo !== 'CLIENTE' ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700'}`}>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedVisita.cliente.tipo !== 'CLIENTE' ? '✨ Formalizar Cliente' : '✅ Finalizar Visita'}</h3>
                      <p className="text-sm opacity-90 mt-1">Completa la información requerida</p>
                    </div>
                    <button 
                      onClick={() => setIsCompleteModalOpen(false)} 
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 text-white text-xl"
                    >
                      ✕
                    </button>
                </div>
                <form onSubmit={handleFinalizarVisita} className="p-7 space-y-5">
                    <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <span className="font-bold">💡 Tip:</span> Completa los datos para cerrar el proceso correctamente.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div className="form-control">
                            <label className="label">
                              <span className="label-text font-bold text-slate-700 flex items-center gap-2">
                                <FaIdCard className="text-indigo-600"/> DNI
                              </span>
                            </label>
                            <input 
                              type="text" 
                              className="input input-bordered w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                              placeholder="12345678"
                              value={completionData.dni} 
                              onChange={e => setCompletionData({...completionData, dni: e.target.value})} 
                              required={selectedVisita.cliente.tipo !== 'CLIENTE'} 
                            />
                         </div>
                         <div className="form-control">
                            <label className="label">
                              <span className="label-text font-bold text-slate-700 flex items-center gap-2">
                                <FaEnvelope className="text-indigo-600"/> Email
                              </span>
                            </label>
                            <input 
                              type="email" 
                              className="input input-bordered w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                              placeholder="cliente@email.com"
                              value={completionData.email} 
                              onChange={e => setCompletionData({...completionData, email: e.target.value})} 
                              required={selectedVisita.cliente.tipo !== 'CLIENTE'} 
                            />
                         </div>
                    </div>
                    <div className="form-control">
                        <label className="label">
                          <span className="label-text font-bold text-slate-700 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-indigo-600"/> Dirección
                          </span>
                        </label>
                        <input 
                          type="text" 
                          className="input input-bordered w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                          placeholder="Av. Principal 123, Distrito"
                          value={completionData.direccion} 
                          onChange={e => setCompletionData({...completionData, direccion: e.target.value})} 
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                          <span className="label-text font-bold text-slate-700 flex items-center gap-2">
                            <FaUserTie className="text-indigo-600"/> Ocupación
                          </span>
                        </label>
                        <input 
                          type="text" 
                          className="input input-bordered w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                          placeholder="Ej: Ingeniero, Médico, Empresario..."
                          value={completionData.ocupacion} 
                          onChange={e => setCompletionData({...completionData, ocupacion: e.target.value})} 
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                          <span className="label-text font-bold text-slate-700 flex items-center gap-2">
                            <FaStickyNote className="text-indigo-600"/> Resultado / Comentarios Finales
                          </span>
                        </label>
                        <textarea 
                          className="textarea textarea-bordered w-full h-28 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                          placeholder="Describe el resultado de la visita: interés mostrado, próximos pasos, observaciones..."
                          value={completionData.resultadoSeguimiento} 
                          onChange={e => setCompletionData({...completionData, resultadoSeguimiento: e.target.value})} 
                          required
                        ></textarea>
                    </div>

                    <div className="pt-3 flex gap-4">
                        <button 
                          type="button" 
                          onClick={() => setIsCompleteModalOpen(false)} 
                          className="btn flex-1 btn-ghost hover:bg-slate-100 font-semibold transition-all duration-200"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className="btn flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                          <FaCheckCircle className="mr-2"/> Guardar y Finalizar
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}