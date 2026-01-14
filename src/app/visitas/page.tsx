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
  FaUserTie, FaHome, FaSpinner, FaCheckCircle, FaIdCard, 
  FaMapMarkerAlt, FaEnvelope, FaTimes, FaStickyNote, FaBan, FaCalendarAlt, FaPassport, FaGlobeAmericas
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
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isDetailOpen, setIsDetailOpen] = useState(false); 
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false); 
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); 
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null); 
  
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]); 
  
  const [formData, setFormData] = useState({ hora: '09:00', propiedadId: preSelectedPropiedadId || '', comentarios: '' });
  const [rescheduleData, setRescheduleData] = useState({ fecha: '', hora: '' });
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  // 📝 DATOS FINALIZACIÓN (CON TIPO DE DOCUMENTO)
  const [completionData, setCompletionData] = useState({ 
      resultadoSeguimiento: '', 
      tipoDocumento: 'DNI', 
      dni: '', 
      email: '', 
      direccion: '', 
      ocupacion: '' 
  });

  useEffect(() => {
    if (preSelectedPropiedadId) setFormData(prev => ({ ...prev, propiedadId: preSelectedPropiedadId }));
  }, [preSelectedPropiedadId]);

  const fetchDatos = async () => {
    try {
      const [v, p, c] = await Promise.all([getVisitas(), getPropiedades(), getClientes()]);
      setVisitas(v);
      setPropiedades(p);
      setClientes(c);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDatos(); }, []);

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + increment));
    setCurrentDate(new Date(newDate));
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // --- ACCIONES ---

  const handleVisitaClick = (e: React.MouseEvent, visita: Visita) => {
      e.stopPropagation();
      setSelectedVisita(visita);
      setIsDetailOpen(true); 
  };

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
    } catch (error) { alert('❌ Error al agendar'); }
  };

  const openFinalizeModal = () => {
      if (!selectedVisita) return;
      setCompletionData({
          resultadoSeguimiento: selectedVisita.resultadoSeguimiento || '',
          tipoDocumento: 'DNI',
          dni: selectedVisita.cliente.dni || '',
          email: selectedVisita.cliente.email || '',
          direccion: selectedVisita.cliente.direccion || '',
          ocupacion: selectedVisita.cliente.ocupacion || ''
      });
      setIsDetailOpen(false);
      setIsCompleteModalOpen(true);
  };

  const handleFinalizarVisita = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedVisita) return;
      
      if (completionData.tipoDocumento === 'DNI' && completionData.dni.length !== 8) {
          return alert("⚠️ El DNI debe tener exactamente 8 dígitos.");
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
          alert('✅ Cliente Registrado y Visita Finalizada');
          setIsCompleteModalOpen(false);
          fetchDatos();
      } catch (error) { alert('❌ Error al finalizar'); }
  };

  const handleCancelarVisita = async () => {
      if (!selectedVisita || !motivoCancelacion.trim()) return alert("⚠️ Debes escribir un motivo.");
      try {
          await cancelVisita(selectedVisita.id, motivoCancelacion);
          alert('Visita Cancelada.');
          setIsCancelModalOpen(false);
          setIsDetailOpen(false);
          fetchDatos();
      } catch (error) { alert('Error al cancelar'); }
  };

  const openRescheduleModal = () => {
      if (!selectedVisita) return;
      const fechaObj = new Date(selectedVisita.fechaProgramada);
      const fechaStr = fechaObj.toISOString().split('T')[0];
      const horaStr = fechaObj.toTimeString().slice(0, 5); 
      setRescheduleData({ fecha: fechaStr, hora: horaStr });
      setIsDetailOpen(false);
      setIsRescheduleModalOpen(true);
  };

  const handleReprogramarVisita = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedVisita || !rescheduleData.fecha || !rescheduleData.hora) return;
      try {
          const nuevaFechaISO = `${rescheduleData.fecha}T${rescheduleData.hora}:00`;
          await updateVisita(selectedVisita.id, {
              fechaProgramada: nuevaFechaISO,
              comentariosPrevios: selectedVisita.comentariosPrevios + ` [Reprogramada el ${new Date().toLocaleDateString()}]`
          });
          alert('✅ Visita Reprogramada Correctamente');
          setIsRescheduleModalOpen(false);
          fetchDatos();
      } catch (error) { alert('❌ Error al reprogramar'); }
  };

  // Función para manejar input de documentos (CORREGIDA)
  const handleDocumentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      const tipo = completionData.tipoDocumento;

      // Definir límites
      let limite = 12; 
      if (tipo === 'DNI') limite = 8;
      if (tipo === 'PASAPORTE') limite = 9;

      // Cortar si excede
      if (val.length > limite) val = val.slice(0, limite);

      if (tipo === 'DNI') {
          if (/^\d*$/.test(val)) setCompletionData({...completionData, dni: val});
      } else {
          setCompletionData({...completionData, dni: val});
      }
  };

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
                 className={`text-[10px] px-2.5 py-2 rounded-lg border-l-[3px] shadow-md truncate flex items-center gap-1.5 cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200 font-medium ${v.estado === 'COMPLETADA' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-800 opacity-70' : v.estado === 'CANCELADA' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-800 opacity-60' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-600 text-indigo-900'}`}>
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50"><FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto"/></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-slate-800">
      <Navbar />
      <div className="container mx-auto p-6 max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-3.5 rounded-xl shadow-lg"><FaCalendarPlus size={26}/></div>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent">Calendario de Visitas</h1>
                    {preSelectedClienteId ? (
                         <div className="flex items-center gap-2 text-sm text-green-700 font-bold bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 rounded-lg border border-green-200 mt-1 animate-pulse"><span>Agendando para: {preSelectedClienteNombre}</span></div>
                    ) : <p className="text-slate-500 text-sm mt-1">Gestiona tu agenda mensual</p>}
                </div>
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0 bg-gradient-to-r from-slate-100 to-slate-200 p-3 rounded-full shadow-inner">
                <button onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-slate-700 hover:text-indigo-600"><FaChevronLeft size={16}/></button>
                <div className="text-xl font-bold w-44 text-center select-none"><span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">{MONTHS[currentDate.getMonth()]}</span> <span className="text-slate-500 ml-2">{currentDate.getFullYear()}</span></div>
                <button onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-slate-700 hover:text-indigo-600"><FaChevronRight size={16}/></button>
            </div>
        </div>

        {/* CALENDARIO */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white text-center py-4 font-bold text-sm uppercase tracking-wider">{DAYS.map(d => <div key={d}>{d}</div>)}</div>
            <div className="grid grid-cols-7 bg-slate-100 gap-[1px] border-t-2 border-slate-300">{renderCalendarCells()}</div>
        </div>
      </div>

      {/* MODAL 1: CREAR VISITA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-6 flex justify-between items-center shadow-lg">
                    <h3 className="text-2xl font-bold">Nueva Visita</h3>
                    <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 text-white text-xl">✕</button>
                </div>
                <form onSubmit={handleSaveVisita} className="p-7 space-y-5">
                    {!preSelectedClienteId ? (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg text-sm text-yellow-800"><span className="font-bold">⚠️ Atención:</span> Selecciona un cliente desde "Atención".</div>
                    ) : (
                        <>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200"><label className="text-xs font-bold text-blue-800 uppercase block mb-1">Cliente</label><div className="flex items-center gap-2 text-blue-900 font-bold text-lg"><FaUserTie/> {preSelectedClienteNombre}</div></div>
                            <div className="form-control"><label className="label font-bold text-slate-700">Hora</label><input type="time" className="input input-bordered w-full" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required /></div>
                            <div className="form-control"><label className="label font-bold text-slate-700">Propiedad</label><select className="select select-bordered w-full" value={formData.propiedadId} onChange={e => setFormData({...formData, propiedadId: e.target.value})} required ><option value="">-- Seleccionar --</option>{propiedades.map(p => <option key={p.id} value={p.id}>{p.tipo} - {p.direccion}</option>)}</select></div>
                            <div className="form-control"><label className="label font-bold text-slate-700">Notas</label><textarea className="textarea textarea-bordered h-24" value={formData.comentarios} onChange={e => setFormData({...formData, comentarios: e.target.value})}></textarea></div>
                            <div className="pt-3 flex gap-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn flex-1 btn-ghost">Cancelar</button><button type="submit" className="btn flex-1 bg-indigo-600 text-white hover:bg-indigo-700">Agendar</button></div>
                        </>
                    )}
                </form>
            </div>
        </div>
      )}

      {/* MODAL 2: DETALLE DE VISITA */}
      {isDetailOpen && selectedVisita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn relative">
                <div className="bg-slate-800 text-white p-6 relative">
                    <button onClick={() => setIsDetailOpen(false)} className="absolute top-5 right-5 text-white hover:text-gray-300"><FaTimes size={20}/></button>
                    <h2 className="text-2xl font-bold flex items-center gap-3"><FaClock className="text-yellow-400"/> Ficha de Visita</h2>
                    <p className="text-sm opacity-90 mt-1">{new Date(selectedVisita.fechaProgramada).toLocaleString()}</p>
                </div>
                
                <div className="p-7 space-y-6">
                    <div className="flex gap-4 items-center"><div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><FaHome size={20}/></div><div><h4 className="text-xs font-bold text-slate-400 uppercase">Propiedad</h4><p className="font-bold text-slate-800">{selectedVisita.propiedad.tipo} - {selectedVisita.propiedad.ubicacion}</p></div></div>
                    <div className="flex gap-4 items-center"><div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600"><FaUserTie size={20}/></div><div><h4 className="text-xs font-bold text-slate-400 uppercase">Cliente</h4><p className="font-bold text-slate-800">{selectedVisita.cliente.nombre}</p></div></div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-slate-700"><p className="font-bold mb-1">Notas:</p>"{selectedVisita.comentariosPrevios || 'Sin notas'}"</div>

                    {selectedVisita.estado === 'PENDIENTE' && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            {(() => {
                                const fechaVisita = new Date(selectedVisita.fechaProgramada);
                                const ahora = new Date();
                                const yaPasoLaHora = ahora >= fechaVisita; // Si ya pasó la hora

                                if (yaPasoLaHora) {
                                    return (
                                        <button onClick={openFinalizeModal} className="col-span-2 btn bg-green-600 hover:bg-green-700 text-white border-none font-bold text-lg h-12 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all">
                                            <FaCheckCircle className="mr-2"/> FINALIZAR VISITA
                                        </button>
                                    );
                                } else {
                                    return (
                                        <>
                                            <button onClick={() => setIsCancelModalOpen(true)} className="btn btn-outline border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-bold">
                                                <FaBan className="mr-2"/> Cancelar
                                            </button>
                                            <button onClick={openRescheduleModal} className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none font-bold">
                                                <FaCalendarAlt className="mr-2"/> Reprogramar
                                            </button>
                                        </>
                                    );
                                }
                            })()}
                        </div>
                    )}

                    {selectedVisita.estado !== 'PENDIENTE' && (
                        <div className={`p-4 rounded-xl text-center font-bold border-2 ${selectedVisita.estado === 'COMPLETADA' ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
                            VISITA {selectedVisita.estado}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* MODAL 5: REPROGRAMAR VISITA */}
      {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-scaleIn">
                  <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2"><FaCalendarAlt/> Reprogramar Cita</h3>
                  <form onSubmit={handleReprogramarVisita} className="space-y-4">
                      <div className="form-control">
                          <label className="label font-bold text-slate-600">Nueva Fecha</label>
                          <input type="date" className="input input-bordered w-full" value={rescheduleData.fecha} onChange={e => setRescheduleData({...rescheduleData, fecha: e.target.value})} required/>
                      </div>
                      <div className="form-control">
                          <label className="label font-bold text-slate-600">Nueva Hora</label>
                          <input type="time" className="input input-bordered w-full" value={rescheduleData.hora} onChange={e => setRescheduleData({...rescheduleData, hora: e.target.value})} required/>
                      </div>
                      <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setIsRescheduleModalOpen(false)} className="btn flex-1 btn-ghost">Cancelar</button>
                          <button type="submit" className="btn flex-1 bg-indigo-600 text-white hover:bg-indigo-700">Guardar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL 3: CANCELAR */}
      {isCancelModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border-t-4 border-red-500">
                  <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2"><FaBan/> Cancelar Visita</h3>
                  <p className="text-sm text-gray-600 mb-4">Motivo de cancelación:</p>
                  <textarea className="textarea textarea-bordered w-full h-24 mb-4" placeholder="Ej: Cliente canceló..." value={motivoCancelacion} onChange={e => setMotivoCancelacion(e.target.value)}></textarea>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIsCancelModalOpen(false)} className="btn btn-ghost btn-sm">Volver</button>
                      <button onClick={handleCancelarVisita} className="btn btn-error btn-sm text-white">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL 4: REGISTRO CLIENTE */}
      {isCompleteModalOpen && selectedVisita && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto">
                <div className={`p-6 text-white flex justify-between items-center shadow-xl ${selectedVisita.cliente.tipo !== 'CLIENTE' ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700'}`}>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedVisita.cliente.tipo !== 'CLIENTE' ? '✨ Registro Cliente' : '✅ Finalizar Visita'}</h3>
                      <p className="text-sm opacity-90 mt-1">Datos obligatorios para formalizar</p>
                    </div>
                    <button onClick={() => setIsCompleteModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 text-white text-xl">✕</button>
                </div>
                <form onSubmit={handleFinalizarVisita} className="p-7 space-y-5">
                    
                    {/* SELECCIÓN DE DOCUMENTO */}
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold text-slate-700">Tipo de Documento</span></label>
                        <select 
                            className="select select-bordered w-full focus:ring-2 focus:ring-indigo-500"
                            value={completionData.tipoDocumento}
                            onChange={(e) => {
                                setCompletionData({...completionData, tipoDocumento: e.target.value, dni: ''}); // Limpiar al cambiar
                            }}
                        >
                            <option value="DNI">DNI (8 dígitos)</option>
                            <option value="CE">Carnet de Extranjería (9-12)</option>
                            <option value="PASAPORTE">Pasaporte (6-9)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold text-slate-700 flex items-center gap-2">
                                    {completionData.tipoDocumento === 'DNI' ? <FaIdCard className="text-indigo-600"/> : completionData.tipoDocumento === 'PASAPORTE' ? <FaPassport className="text-indigo-600"/> : <FaGlobeAmericas className="text-indigo-600"/>} 
                                    Nro. Documento
                                </span>
                            </label>
                            <input 
                                type="text" 
                                className="input input-bordered w-full focus:ring-2 focus:ring-indigo-500" 
                                placeholder={completionData.tipoDocumento === 'DNI' ? '12345678' : '...'}
                                value={completionData.dni} 
                                onChange={handleDocumentInput} 
                                maxLength={completionData.tipoDocumento === 'DNI' ? 8 : (completionData.tipoDocumento === 'PASAPORTE' ? 9 : 12)}
                                required
                            />
                         </div>
                         <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-slate-700 flex items-center gap-2"><FaEnvelope className="text-indigo-600"/> Email</span></label>
                            <input type="email" className="input input-bordered w-full" value={completionData.email} onChange={e => setCompletionData({...completionData, email: e.target.value})} required />
                         </div>
                    </div>
                    
                    <div className="form-control"><label className="label"><span className="label-text font-bold text-slate-700 flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-600"/> Dirección</span></label><input type="text" className="input input-bordered w-full" value={completionData.direccion} onChange={e => setCompletionData({...completionData, direccion: e.target.value})} /></div>
                    <div className="form-control"><label className="label"><span className="label-text font-bold text-slate-700 flex items-center gap-2"><FaUserTie className="text-indigo-600"/> Ocupación</span></label><input type="text" className="input input-bordered w-full" value={completionData.ocupacion} onChange={e => setCompletionData({...completionData, ocupacion: e.target.value})} /></div>
                    <div className="form-control"><label className="label"><span className="label-text font-bold text-slate-700 flex items-center gap-2"><FaStickyNote className="text-indigo-600"/> Resultado / Comentarios</span></label><textarea className="textarea textarea-bordered w-full h-24" value={completionData.resultadoSeguimiento} onChange={e => setCompletionData({...completionData, resultadoSeguimiento: e.target.value})} required></textarea></div>
                    
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="btn flex-1 btn-ghost">Cancelar</button>
                        <button type="submit" className="btn flex-1 bg-green-600 text-white hover:bg-green-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}