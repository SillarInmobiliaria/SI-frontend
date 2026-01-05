'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { visitaService } from '../../services/visitaService';
import { Visita } from '../../types';
import Navbar from '../../components/Navbar';
import { 
  FaChevronLeft, FaChevronRight, FaCalendarPlus, FaClock, 
  FaUserTie, FaHome, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaIdCard, FaMapMarkerAlt, FaEnvelope
} from 'react-icons/fa';

const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Datos que vienen desde el módulo Clientes
  const preSelectedClienteId = searchParams.get('clienteId');
  const preSelectedClienteNombre = searchParams.get('clienteNombre');
  const preSelectedPropiedadId = searchParams.get('propiedadId'); 

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // --- MODALES ---
  const [isModalOpen, setIsModalOpen] = useState(false); // Crear Visita
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false); // Finalizar Visita
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null); 
  
  const [propiedades, setPropiedades] = useState<any[]>([]);
  
  // Formulario: Crear Visita
  const [formData, setFormData] = useState({
    hora: '09:00',
    propiedadId: preSelectedPropiedadId || '', 
    comentarios: ''
  });

  // Formulario: Finalizar Visita (Datos del Cliente)
  const [completionData, setCompletionData] = useState({
      resultadoSeguimiento: '',
      dni: '',
      email: '',
      direccion: '',
      ocupacion: ''
  });

  // Efecto para pre-seleccionar propiedad si cambia la URL
  useEffect(() => {
    if (preSelectedPropiedadId) {
        setFormData(prev => ({ ...prev, propiedadId: preSelectedPropiedadId }));
    }
  }, [preSelectedPropiedadId]);

  const fetchDatos = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const dataVisitas = await visitaService.obtenerVisitas(token);
      setVisitas(dataVisitas);

      const resProps = await fetch('http://localhost:4000/api/propiedades', { headers: { 'Authorization': `Bearer ${token}` } });
      const dataProps = await resProps.json();
      setPropiedades(Array.isArray(dataProps) ? dataProps : dataProps.data || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + increment));
    setCurrentDate(new Date(newDate));
  };

  // CLICK EN UNA VISITA EXISTENTE (Para Finalizarla)
  const handleVisitaClick = (e: React.MouseEvent, visita: Visita) => {
      e.stopPropagation(); // Evitar click en el día
      setSelectedVisita(visita);
      
      // Carga los datos que YA tenga el cliente
      setCompletionData({
          resultadoSeguimiento: visita.resultadoSeguimiento || '',
          dni: visita.cliente.dni || '', // Si ya tenía DNI, lo pone
          email: visita.cliente.email || '', // Si ya tenía email, lo pone
          direccion: visita.cliente.direccion || '',
          ocupacion: visita.cliente.ocupacion || ''
      });
      
      setIsCompleteModalOpen(true);
  };

  const handleFinalizarVisita = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedVisita) return;

      const esProspecto = selectedVisita.cliente.tipo !== 'CLIENTE';

      // Validación estricta solo si es Prospecto
      if (esProspecto) {
          if (!completionData.dni || !completionData.email) {
              alert("⚠️ Para convertir al interesado en Cliente, DNI y Email son obligatorios.");
              return;
          }
      }

      try {
          const token = localStorage.getItem('token') || '';
          
          await visitaService.actualizarVisita(token, selectedVisita.id, {
              estado: 'COMPLETADA',
              resultadoSeguimiento: completionData.resultadoSeguimiento,
              // Enviamos los datos nuevos o corregidos del cliente
              dni: completionData.dni,
              email: completionData.email,
              direccion: completionData.direccion,
              ocupacion: completionData.ocupacion
          });

          alert(esProspecto ? '🎉 ¡Felicidades! Nuevo Cliente Registrado.' : '✅ Visita registrada correctamente.');
          
          setIsCompleteModalOpen(false);
          fetchDatos();

      } catch (error) {
          console.error(error);
          alert('❌ Error al finalizar la visita.');
      }
  };

  const renderCalendarCells = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const totalSlots = [...blanks, ...days];

    return totalSlots.map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="bg-slate-50 border border-slate-100 min-h-[120px]"></div>;

      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const visitsForDay = visitas.filter(v => v.fechaProgramada.startsWith(dateString));

      const isToday = 
        day === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() && 
        currentDate.getFullYear() === new Date().getFullYear();

      return (
        <div 
          key={day} 
          onClick={() => handleDayClick(day)}
          className={`
            border border-slate-200 min-h-[120px] p-2 transition-all hover:bg-blue-50 cursor-pointer group relative flex flex-col gap-1
            ${isToday ? 'bg-blue-50/50' : 'bg-white'}
          `}
        >
          <div className="flex justify-between items-start">
            <span className={`
              text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
              ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-300' : 'text-slate-500 group-hover:text-blue-600'}
            `}>
              {day}
            </span>
            <button className="opacity-0 group-hover:opacity-100 text-blue-500 hover:bg-blue-200 p-1 rounded-full transition-opacity">
               <FaCalendarPlus size={12}/>
            </button>
          </div>

          <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[100px] scrollbar-hide">
            {visitsForDay.map(v => (
               <div 
                 key={v.id}
                 className={`
                    text-[10px] px-2 py-1.5 rounded-md border-l-4 shadow-sm truncate flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform
                    ${v.estado === 'COMPLETADA' ? 'bg-green-50 border-green-500 text-green-800 opacity-70' : 
                      v.estado === 'CANCELADA' ? 'bg-red-50 border-red-500 text-red-800 opacity-50' : 
                      'bg-indigo-50 border-indigo-500 text-indigo-800'}
                 `}
                 title="Click para gestionar visita"
                 onClick={(e) => handleVisitaClick(e, v)}
               >
                 <span className="font-bold">{new Date(v.fechaProgramada).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                 <span className="truncate">{v.cliente.nombre}</span>
                 {v.estado === 'COMPLETADA' && <FaCheckCircle className="ml-auto text-green-600"/>}
               </div>
            ))}
          </div>
        </div>
      );
    });
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleSaveVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;

    if (!preSelectedClienteId) {
        alert("⚠️ Por favor, selecciona un cliente desde el módulo 'Clientes' para agendar.");
        return;
    }

    try {
      const token = localStorage.getItem('token') || '';
      
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDay).padStart(2, '0');
      const fechaISO = `${year}-${month}-${day}T${formData.hora}:00`;

      await visitaService.crearVisita(token, {
        fechaProgramada: fechaISO,
        clienteId: preSelectedClienteId,
        propiedadId: formData.propiedadId,
        comentariosPrevios: formData.comentarios,
        asesorId: undefined 
      });

      alert('✅ Visita Agendada Correctamente');
      setIsModalOpen(false);
      fetchDatos(); 
      router.replace('/visitas');

    } catch (error) {
      console.error(error);
      alert('❌ Error al agendar');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-7xl">
        
        {/* HEADER DEL CALENDARIO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white p-3 rounded-lg shadow-lg">
                    <FaCalendarPlus size={24}/>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Calendario de Visitas</h1>
                    {preSelectedClienteId ? (
                         <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md animate-pulse">
                            <span>Agendando para: {preSelectedClienteNombre}</span>
                            <span className="text-xs text-slate-400 font-normal">(Selecciona un día)</span>
                         </div>
                    ) : (
                        <p className="text-slate-500 text-sm">Gestiona tu agenda mensual</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 mt-4 md:mt-0 bg-slate-100 p-2 rounded-full">
                <button onClick={() => changeMonth(-1)} className="btn btn-circle btn-sm btn-ghost hover:bg-white hover:shadow-md">
                    <FaChevronLeft/>
                </button>
                <div className="text-xl font-bold w-40 text-center select-none">
                    {MONTHS[currentDate.getMonth()]} <span className="text-slate-500">{currentDate.getFullYear()}</span>
                </div>
                <button onClick={() => changeMonth(1)} className="btn btn-circle btn-sm btn-ghost hover:bg-white hover:shadow-md">
                    <FaChevronRight/>
                </button>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 bg-indigo-900 text-white text-center py-3 font-bold text-sm uppercase tracking-wider">
                {DAYS.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 bg-slate-200 gap-px border-t border-slate-200">
                {renderCalendarCells()}
            </div>
        </div>

      </div>

      {/* MODAL 1: NUEVA VISITA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
                <div className="bg-indigo-600 text-white p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">Nueva Visita</h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-mono">
                            {selectedDay} de {MONTHS[currentDate.getMonth()]}
                        </span>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white text-lg">✕</button>
                </div>

                <form onSubmit={handleSaveVisita} className="p-6 space-y-5">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Cliente</label>
                        {preSelectedClienteId ? (
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-lg">
                                <FaUserTie /> {preSelectedClienteNombre}
                            </div>
                        ) : (
                            <div className="text-amber-600 text-sm italic">
                                ⚠️ No hay cliente seleccionado. Ve a "Clientes".
                            </div>
                        )}
                    </div>

                    <div className="form-control">
                        <label className="label font-bold text-slate-700">Hora</label>
                        <div className="relative">
                            <FaClock className="absolute left-3 top-3.5 text-slate-400"/>
                            <input type="time" className="input input-bordered w-full pl-10" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label font-bold text-slate-700">Propiedad</label>
                        <div className="relative">
                            <FaHome className="absolute left-3 top-3.5 text-slate-400"/>
                            <select className="select select-bordered w-full pl-10" value={formData.propiedadId} onChange={e => setFormData({...formData, propiedadId: e.target.value})} required >
                                <option value="">-- Seleccionar --</option>
                                {propiedades.map(p => (
                                    <option key={p.id} value={p.id}>{p.tipo} - {p.direccion} {p.id === preSelectedPropiedadId ? ' (Interés)' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label font-bold text-slate-700">Notas</label>
                        <textarea className="textarea textarea-bordered h-24 resize-none" placeholder="Ej. Confirmar..." value={formData.comentarios} onChange={e => setFormData({...formData, comentarios: e.target.value})}></textarea>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn flex-1 btn-ghost">Cancelar</button>
                        <button type="submit" disabled={!preSelectedClienteId} className="btn flex-1 btn-primary bg-indigo-600 border-none">Agendar Visita</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL 2: FINALIZAR VISITA / DATOS DEL CLIENTE */}
      {isCompleteModalOpen && selectedVisita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-zoom-in max-h-[90vh] overflow-y-auto">
                <div className={`p-5 text-white flex justify-between items-center ${selectedVisita.cliente.tipo !== 'CLIENTE' ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-gradient-to-r from-green-600 to-emerald-700'}`}>
                    <div className="flex items-center gap-3">
                        {selectedVisita.cliente.tipo !== 'CLIENTE' ? <FaUserTie className="text-2xl"/> : <FaCheckCircle className="text-2xl"/>}
                        <div>
                            <h3 className="text-lg font-bold">
                                {selectedVisita.cliente.tipo !== 'CLIENTE' ? 'Formalizar Cliente' : 'Finalizar Visita'}
                            </h3>
                            <p className="text-xs opacity-90">{selectedVisita.cliente.nombre}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsCompleteModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white text-lg">✕</button>
                </div>

                <form onSubmit={handleFinalizarVisita} className="p-6 space-y-6">
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p><strong>Propiedad:</strong> {selectedVisita.propiedad.tipo} - {selectedVisita.propiedad.direccion}</p>
                        <p><strong>Fecha:</strong> {new Date(selectedVisita.fechaProgramada).toLocaleString()}</p>
                    </div>

                    {/* DATOS DEL CLIENTE (PRE-LLENADOS si existen) */}
                    <div className={`p-4 rounded-xl border ${selectedVisita.cliente.tipo !== 'CLIENTE' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                        <h4 className="font-bold mb-3 text-sm flex items-center gap-2">
                            {selectedVisita.cliente.tipo !== 'CLIENTE' ? <><FaExclamationTriangle/> Completa estos datos</> : <><FaUserTie/> Datos del Cliente</>}
                        </h4>
                        
                        <div className="space-y-3">
                            <div className="form-control">
                                <label className="text-xs font-bold mb-1">DNI {selectedVisita.cliente.tipo !== 'CLIENTE' && '*'}</label>
                                <div className="relative">
                                    <FaIdCard className="absolute left-3 top-2.5 text-gray-400"/>
                                    <input type="text" maxLength={8} className="input input-sm input-bordered w-full pl-9" value={completionData.dni} onChange={e => setCompletionData({...completionData, dni: e.target.value})} required={selectedVisita.cliente.tipo !== 'CLIENTE'} />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="text-xs font-bold mb-1">Email {selectedVisita.cliente.tipo !== 'CLIENTE' && '*'}</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-2.5 text-gray-400"/>
                                    <input type="email" className="input input-sm input-bordered w-full pl-9" value={completionData.email} onChange={e => setCompletionData({...completionData, email: e.target.value})} required={selectedVisita.cliente.tipo !== 'CLIENTE'} />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="text-xs font-bold mb-1">Dirección</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-2.5 text-gray-400"/>
                                    <input type="text" className="input input-sm input-bordered w-full pl-9" value={completionData.direccion} onChange={e => setCompletionData({...completionData, direccion: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="text-xs font-bold mb-1">Ocupación</label>
                                <input type="text" className="input input-sm input-bordered w-full" value={completionData.ocupacion} onChange={e => setCompletionData({...completionData, ocupacion: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label font-bold text-slate-700">Resultado / Comentarios Finales</label>
                        <textarea className="textarea textarea-bordered h-24 resize-none" placeholder="Resultado..." value={completionData.resultadoSeguimiento} onChange={e => setCompletionData({...completionData, resultadoSeguimiento: e.target.value})} required></textarea>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="btn flex-1 btn-ghost">Cancelar</button>
                        <button type="submit" className={`btn flex-1 border-none text-white ${selectedVisita.cliente.tipo !== 'CLIENTE' ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-green-600 hover:bg-green-700'}`}>
                            {selectedVisita.cliente.tipo !== 'CLIENTE' ? 'Convertir y Finalizar' : 'Finalizar Visita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}