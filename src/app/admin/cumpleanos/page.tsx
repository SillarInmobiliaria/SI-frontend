'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { getCumpleanos, downloadExcelCumpleanos } from '../../../services/api';
import { FaBirthdayCake, FaFileExcel, FaWhatsapp, FaUserTie, FaUser, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaDownload } from 'react-icons/fa';

export default function CumpleanosPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ clientes: any[], propietarios: any[] }>({ clientes: [], propietarios: [] });
  
  // Estado del Calendario
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());    
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'CLIENTES' | 'PROPIETARIOS'>('ALL');

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  useEffect(() => {
    cargarDatos();
  }, [selectedMonth]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await getCumpleanos(selectedMonth);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
        const response = await downloadExcelCumpleanos(selectedMonth);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Cumpleanos_${months[selectedMonth-1]}_${selectedYear}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (e) { alert('Error al descargar'); }
  };

  // NAVEGACIÓN
  const handlePrevMonth = () => {
      if (selectedMonth === 1) {
          setSelectedMonth(12);
          setSelectedYear(prev => prev - 1);
      } else {
          setSelectedMonth(prev => prev - 1);
      }
  };

  const handleNextMonth = () => {
      if (selectedMonth === 12) {
          setSelectedMonth(1);
          setSelectedYear(prev => prev + 1);
      } else {
          setSelectedMonth(prev => prev + 1);
      }
  };

  // CÁLCULOS
  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month - 1, 1).getDay(); 

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const startDay = getFirstDayOfMonth(selectedMonth, selectedYear);

  const getCumpleanerosDelDia = (dia: number) => {
      const list: any[] = [];
      if (filterType !== 'PROPIETARIOS') {
          data.clientes.forEach((c: any) => {
              const d = new Date(c.fechaNacimiento).getUTCDate(); 
              if (d === dia) list.push({ ...c, tipo: 'CLIENTE' });
          });
      }
      if (filterType !== 'CLIENTES') {
          data.propietarios.forEach((p: any) => {
              const d = new Date(p.fechaNacimiento).getUTCDate();
              if (d === dia) list.push({ ...p, tipo: 'PROPIETARIO' });
          });
      }
      return list;
  };

  const getLinkWhatsapp = (persona: any) => {
      const nombre = persona.nombre.split(' ')[0];
      const mensaje = `¡Hola ${nombre}! 🎉 Desde Sillar Inmobiliaria queremos desearte un muy feliz cumpleaños. ¡Que pases un día excelente! 🎂`;
      const num = persona.tipo === 'CLIENTE' ? persona.telefono1 : persona.celular1;
      return `https://wa.me/51${num}?text=${encodeURIComponent(mensaje)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* --- HEADER SUPERIOR --- */}
        <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-6">
            <div className="text-center xl:text-left">
                <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center xl:justify-start gap-3 tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-600">
                        Cumpleaños
                    </span>
                    <span className="text-3xl">🎂</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    Agenda de fidelización mensual
                </p>
            </div>

            {/* CONTROL CENTRAL DE MES (Diseño Glass) */}
            <div className="flex items-center bg-white shadow-lg shadow-slate-200/50 rounded-full p-1.5 border border-slate-100">
                <button 
                    onClick={handlePrevMonth} 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-all"
                >
                    <FaChevronLeft/>
                </button>
                
                <div className="px-6 flex flex-col items-center min-w-[180px]">
                    <span className="text-lg font-bold text-slate-800 leading-none">{months[selectedMonth-1]}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedYear}</span>
                </div>
                
                <button 
                    onClick={handleNextMonth} 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-all"
                >
                    <FaChevronRight/>
                </button>
            </div>

            {/* ACCIONES DERECHA */}
            <div className="flex gap-3">
                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
                    <button onClick={() => setFilterType('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'ALL' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Todos</button>
                    <button onClick={() => setFilterType('CLIENTES')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'CLIENTES' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-500'}`}><FaUser className="text-xs"/> Clientes</button>
                    <button onClick={() => setFilterType('PROPIETARIOS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'PROPIETARIOS' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-500'}`}><FaUserTie className="text-xs"/> Prop.</button>
                </div>
                
                <button 
                    onClick={handleDownload} 
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2.5 border-none group relative overflow-hidden"
                    title="Descargar Excel"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <FaFileExcel className="text-xl relative z-10"/>
                    <span className="relative z-10 hidden lg:inline">Descargar</span>
                    <FaDownload className="text-sm relative z-10 group-hover:translate-y-0.5 transition-transform"/>
                </button>
            </div>
        </div>

        {/* --- CALENDARIO MODERNO (GRID CARDS) --- */}
        <div className="bg-transparent"> {/* Fondo transparente para que las cartas floten */}
            
            {/* Cabecera Días */}
            <div className="grid grid-cols-7 mb-4">
                {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map((d, i) => (
                    <div key={d} className={`text-center font-bold text-xs tracking-widest ${i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid Días */}
            <div className="grid grid-cols-7 gap-2 lg:gap-3 auto-rows-fr">
                {/* Espacios vacíos */}
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] lg:min-h-[130px] rounded-2xl bg-slate-100/50 border border-transparent"></div>
                ))}

                {/* Días del mes */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dia = i + 1;
                    const cumpleaneros = getCumpleanerosDelDia(dia);
                    
                    const isToday = 
                        dia === new Date().getDate() && 
                        selectedMonth === (new Date().getMonth() + 1) &&
                        selectedYear === new Date().getFullYear();

                    const hasData = cumpleaneros.length > 0;

                    return (
                        <div 
                            key={dia} 
                            onClick={() => { if(hasData) setSelectedDay(dia); }}
                            className={`
                                relative min-h-[100px] lg:min-h-[130px] p-2 lg:p-3 rounded-2xl border transition-all duration-300 flex flex-col group
                                ${hasData ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200' : 'cursor-default'}
                                ${isToday 
                                    ? 'bg-white border-yellow-400 ring-2 ring-yellow-400/30 shadow-lg shadow-yellow-100 z-10' 
                                    : 'bg-white border-slate-200 shadow-sm'
                                }
                            `}
                        >
                            {/* Número del día */}
                            <div className="flex justify-between items-start">
                                <span className={`text-sm lg:text-base font-bold w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-full 
                                    ${isToday 
                                        ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-md' 
                                        : 'text-slate-500 group-hover:bg-slate-100'
                                    }`}>
                                    {dia}
                                </span>
                                {hasData && (
                                    <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                        {cumpleaneros.length} 🎂
                                    </span>
                                )}
                            </div>

                            {/* Lista de Cumpleañeros (Diseño Pills) */}
                            <div className="mt-2 flex flex-col gap-1.5 overflow-hidden">
                                {cumpleaneros.slice(0, 3).map((p: any, idx) => (
                                    <div key={idx} className={`
                                        text-[10px] lg:text-xs px-2 py-1 rounded-lg font-semibold truncate flex items-center gap-1.5 transition-colors
                                        ${p.tipo === 'CLIENTE' 
                                            ? 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100' 
                                            : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'}
                                    `}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${p.tipo === 'CLIENTE' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                                        {p.nombre.split(' ')[0]}
                                    </div>
                                ))}
                                {cumpleaneros.length > 3 && (
                                    <div className="text-[10px] text-center font-bold text-slate-400 mt-0.5">
                                        + {cumpleaneros.length - 3} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* MODAL DETALLES */}
        {selectedDay !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 border border-white/20">
                    {/* Header Modal */}
                    <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-indigo-300 font-bold uppercase text-xs tracking-widest mb-1">{months[selectedMonth-1]} {selectedYear}</p>
                                <h3 className="font-black text-4xl">Día {selectedDay}</h3>
                                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                                    <FaBirthdayCake className="text-pink-500"/> {getCumpleanerosDelDia(selectedDay).length} personas celebran hoy
                                </p>
                            </div>
                            <button onClick={() => setSelectedDay(null)} className="btn btn-sm btn-circle btn-ghost text-white bg-white/10 hover:bg-white/20 border-none">✕</button>
                        </div>
                    </div>
                    
                    {/* Lista Modal */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50 space-y-3">
                        {getCumpleanerosDelDia(selectedDay).map((p: any, idx) => {
                            const anioNac = new Date(p.fechaNacimiento).getFullYear();
                            const edad = selectedYear - anioNac;
                            
                            return (
                                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner
                                            ${p.tipo === 'CLIENTE' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}
                                        `}>
                                            {p.tipo === 'CLIENTE' ? <FaUser/> : <FaUserTie/>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg leading-tight">{p.nombre}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                                                    ${p.tipo === 'CLIENTE' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}
                                                `}>
                                                    {p.tipo === 'CLIENTE' ? 'Cliente' : 'Propietario'}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">Cumple {edad} años</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <a 
                                        href={getLinkWhatsapp(p)} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle btn-md bg-[#25D366] hover:bg-[#20bd5a] border-none text-white shadow-lg shadow-green-200 hover:scale-110 transition-transform"
                                        title="Enviar saludo por WhatsApp"
                                    >
                                        <FaWhatsapp className="text-2xl"/>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}