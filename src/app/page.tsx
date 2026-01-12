'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSeguimientos, getClientes, getVisitas } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

import { 
  FaUsersCog, FaBuilding, FaUserTie, FaClipboardList, FaKey, 
  FaExclamationTriangle, FaCheckCircle, FaClock, FaChartLine, 
  FaCalendarCheck, FaRoute, FaBirthdayCake, FaClipboardCheck, FaTimes, FaMapMarkerAlt
} from 'react-icons/fa';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const notificacionMostrada = useRef(false);

  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';
  const mostrarAlerta = user?.mustChangePassword;

  // --- CÁLCULO DÍAS RESTANTES ---
  let diasRestantes = 30;
  if (user?.createdAt) {
    const fechaCreacion = new Date(user.createdAt);
    const fechaActual = new Date();
    const diferenciaTiempo = fechaActual.getTime() - fechaCreacion.getTime();
    const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));
    diasRestantes = 30 - diasTranscurridos;
  }
  if (diasRestantes < 0) diasRestantes = 0;

  // 👇 FUNCIÓN AUXILIAR PARA SACAR LA HORA (HH:MM)
  const getHora = (fechaIso: string) => {
      if (!fechaIso) return '--:--';
      const date = new Date(fechaIso);
      return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // 👇 LÓGICA DE NOTIFICACIONES
  useEffect(() => {
    if (notificacionMostrada.current) return;
    notificacionMostrada.current = true;

    const verificarRecordatorios = async () => {
        try {
            // 1. Obtener TODOS los datos
            const seguimientos = await getSeguimientos();
            const clientes = await getClientes();
            const visitas = await getVisitas(); 
            
            const objHoy = new Date();
            const objManana = new Date(objHoy);
            objManana.setDate(objHoy.getDate() + 1);

            const hoyStr = objHoy.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const mananaStr = objManana.toLocaleDateString('en-CA');

            // --- FILTROS ---

            // A. Seguimientos (Usamos 'fechaProxima')
            const segHoy = seguimientos.filter((s: any) => s.fechaProxima?.startsWith(hoyStr) && s.estado === 'PENDIENTE');
            const segManana = seguimientos.filter((s: any) => s.fechaProxima?.startsWith(mananaStr) && s.estado === 'PENDIENTE');

            // B. Visitas (CORREGIDO: Usamos 'fechaProgramada')
            // Nota: fechaProgramada es un ISO string completo "2026-01-13T15:00:00"
            const visHoy = visitas.filter((v: any) => v.fechaProgramada?.startsWith(hoyStr) && v.estado !== 'CANCELADA');
            const visManana = visitas.filter((v: any) => v.fechaProgramada?.startsWith(mananaStr) && v.estado !== 'CANCELADA');

            // C. Cumpleaños
            const cumplesHoy = clientes.filter((c: any) => {
                if(!c.fechaNacimiento) return false;
                const fechaNac = new Date(c.fechaNacimiento + 'T12:00:00'); 
                return fechaNac.getDate() === objHoy.getDate() && 
                       fechaNac.getMonth() === objHoy.getMonth();
            });

            // --- SONIDO ---
            if (segHoy.length > 0 || segManana.length > 0 || visHoy.length > 0 || visManana.length > 0 || cumplesHoy.length > 0) {
                playSound();
            }

            // --- MOSTRAR ALERTAS ---

            // 1. Visitas HOY (Prioridad Alta)
            if (visHoy.length > 0) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-teal-600 relative mb-2`}>
                        <button onClick={() => toast.dismiss(t.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5"><FaMapMarkerAlt className="h-10 w-10 text-teal-600 animate-bounce" /></div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-bold text-gray-900">¡Salida de Campo HOY!</p>
                                    <p className="mt-1 text-sm text-gray-500">Tienes <b className="text-teal-700">{visHoy.length} visitas</b> programadas.</p>
                                    {/* 👇 CORREGIDO: Usamos getHora y cliente?.nombre */}
                                    <p className="text-xs text-gray-400 mt-1">
                                        Hora: {getHora(visHoy[0].fechaProgramada)} - {visHoy[0].cliente?.nombre}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200">
                            <button onClick={() => { toast.dismiss(t.id); router.push('/visitas'); }} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-bold text-teal-700 hover:bg-teal-50">Ver</button>
                        </div>
                    </div>
                ), { duration: 10000 });
            }

            // 2. Visitas MAÑANA
            if (visManana.length > 0) {
                setTimeout(() => {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-cyan-400 relative mb-2`}>
                            <button onClick={() => toast.dismiss(t.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5"><FaCalendarCheck className="h-10 w-10 text-cyan-400" /></div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-bold text-gray-900">Visitas para Mañana</p>
                                        <p className="mt-1 text-sm text-gray-500">Prepárate, tienes <b className="text-cyan-600">{visManana.length} visitas</b>.</p>
                                        {/* 👇 CORREGIDO: Usamos getHora y cliente?.nombre */}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Primera: {getHora(visManana[0].fechaProgramada)} - {visManana[0].cliente?.nombre}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-gray-200">
                                <button onClick={() => { toast.dismiss(t.id); router.push('/visitas'); }} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-cyan-600 hover:bg-cyan-50">Ver</button>
                            </div>
                        </div>
                    ), { duration: 8000 });
                }, 500);
            }

            // 3. Seguimientos HOY
            if (segHoy.length > 0) {
                setTimeout(() => {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-red-500 relative mb-2`}>
                            <button onClick={() => toast.dismiss(t.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5"><FaRoute className="h-10 w-10 text-red-500" /></div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-bold text-gray-900">Llamadas para HOY</p>
                                        <p className="mt-1 text-sm text-gray-500">Tienes <b className="text-red-600">{segHoy.length} seguimientos</b> pendientes.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-gray-200">
                                <button onClick={() => { toast.dismiss(t.id); router.push('/seguimiento'); }} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-bold text-red-600 hover:bg-red-50">Ver</button>
                            </div>
                        </div>
                    ), { duration: 9000 });
                }, 1000);
            }

            // 4. Seguimientos MAÑANA
            if (segManana.length > 0) {
                setTimeout(() => {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-yellow-400 relative mb-2`}>
                            <button onClick={() => toast.dismiss(t.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5"><FaRoute className="h-10 w-10 text-yellow-400" /></div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-bold text-gray-900">Llamadas para Mañana</p>
                                        <p className="mt-1 text-sm text-gray-500">Planifica <b className="text-yellow-600">{segManana.length} seguimientos</b>.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-gray-200">
                                <button onClick={() => { toast.dismiss(t.id); router.push('/seguimiento'); }} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-yellow-600 hover:bg-yellow-50">Ver</button>
                            </div>
                        </div>
                    ), { duration: 8000 });
                }, 1500);
            }

            // 5. Cumpleaños
            if (cumplesHoy.length > 0) {
                setTimeout(() => {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-purple-500 relative`}>
                            <button onClick={() => toast.dismiss(t.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5"><FaBirthdayCake className="h-10 w-10 text-purple-500 animate-bounce" /></div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-bold text-gray-900">¡Cumpleaños!</p>
                                        <p className="mt-1 text-sm text-gray-500">Hoy celebra: <b>{cumplesHoy.map((c:any) => c.nombre).join(', ')}</b>.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ), { duration: 12000 });
                }, 2000);
            }

        } catch (error) {
            console.error("Error notificaciones", error);
        }
    };

    const playSound = () => {
        const audio = new Audio('/alert.mp3'); 
        audio.play().catch(e => console.log("Audio bloqueado"));
    };

    verificarRecordatorios();
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="container mx-auto p-8">
        
        {/* --- ENCABEZADO --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-4xl font-bold text-slate-800">
                    Hola, <span className="text-primary">{user?.nombre}</span> 👋
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Panel de Control - {isAdmin ? 'Administración General' : 'Gestión Comercial'}
                </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
                <div className={`badge ${isAdmin ? 'badge-primary' : 'badge-secondary'} badge-lg p-4 font-bold shadow-md`}>
                    {isAdmin ? 'Administrador' : 'Asesor Comercial'}
                </div>
                <button onClick={() => router.push('/cambiar-password')} className="btn btn-sm btn-ghost text-slate-500 gap-2">
                    <FaKey /> Cambiar Contraseña
                </button>
            </div>
        </div>

        {/* --- GRID DE MÓDULOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* 1. AGENDA DE VISITAS */}
            <Link href="/visitas" className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-teal-500 cursor-pointer group hover:-translate-y-1">
                <div className="card-body">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-teal-100 p-3 rounded-full text-teal-600 group-hover:scale-110 transition-transform"><FaCalendarCheck className="text-2xl"/></div>
                        <h2 className="card-title text-slate-700">Agenda Visitas</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Programar salidas, ver pendientes y calendario.</p>
                </div>
            </Link>

            {/* 2. SEGUIMIENTO */}
            <Link href="/seguimiento" className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-pink-500 cursor-pointer group hover:-translate-y-1">
                <div className="card-body">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-pink-100 p-3 rounded-full text-pink-600 group-hover:scale-110 transition-transform"><FaRoute className="text-2xl"/></div>
                        <h2 className="card-title text-slate-700">Seguimiento</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Historial de resultados y cierre de ventas.</p>
                </div>
            </Link>

            {/* 3. PROPIEDADES */}
            <Link href="/propiedades" className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-blue-500 cursor-pointer group hover:-translate-y-1">
                <div className="card-body">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform"><FaBuilding className="text-2xl"/></div>
                        <h2 className="card-title text-slate-700">Propiedades</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Gestionar inventario, precios y disponibilidad.</p>
                </div>
            </Link>

            {/* 4. PROPIETARIOS */}
            <Link href="/propietarios" className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-green-500 cursor-pointer group hover:-translate-y-1">
                <div className="card-body">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:scale-110 transition-transform"><FaUserTie className="text-2xl"/></div>
                        <h2 className="card-title text-slate-700">Propietarios</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Base de datos de dueños y contratos.</p>
                </div>
            </Link>

            {/* 5. MÓDULO DE ATENCIÓN */}
            <Link href="/clientes" className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-purple-500 cursor-pointer group hover:-translate-y-1">
                <div className="card-body">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:scale-110 transition-transform"><FaClipboardList className="text-2xl"/></div>
                        <h2 className="card-title text-slate-700">Atención</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Gestión de interesados y clientes.</p>
                </div>
            </Link>

            {/* 6. NUEVO: MÓDULO DE REQUERIMIENTOS */}
            <Link href="/requerimientos" className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-amber-500 cursor-pointer group hover:-translate-y-1">
                <div className="card-body">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-amber-100 p-3 rounded-full text-amber-600 group-hover:scale-110 transition-transform">
                            <FaClipboardCheck className="text-2xl"/>
                        </div>
                        <h2 className="card-title text-slate-700">Requerimientos</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Buzón de pedidos y necesidades urgentes.</p>
                </div>
            </Link>

            {/* --- SECCIÓN EXCLUSIVA DE ADMIN (OSCURO) --- */}
            {isAdmin && (
                <>
                    {/* 7. USUARIOS */}
                    <Link href="/usuarios" className="card bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-orange-500 cursor-pointer group hover:-translate-y-1 text-white">
                        <div className="card-body">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-orange-500/20 p-3 rounded-full text-orange-400 group-hover:scale-110 transition-transform"><FaUsersCog className="text-2xl"/></div>
                                <h2 className="card-title">Usuarios</h2>
                            </div>
                            <p className="text-slate-400 text-sm">Gestión de accesos, roles y personal.</p>
                        </div>
                    </Link>

                    {/* 8. REPORTES */}
                    <Link href="/admin/dashboard" className="card bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-yellow-500 cursor-pointer group hover:-translate-y-1 text-white">
                        <div className="card-body">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-400 group-hover:scale-110 transition-transform">
                                    <FaChartLine className="text-2xl"/>
                                </div>
                                <h2 className="card-title">Reportes</h2>
                            </div>
                            <p className="text-slate-400 text-sm">Estadísticas, métricas y exportación a Excel.</p>
                        </div>
                    </Link>

                    {/* 9. CUMPLEAÑOS */}
                    <Link href="/admin/cumpleanos" className="card bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-pink-500 cursor-pointer group hover:-translate-y-1 text-white">
                        <div className="card-body">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-pink-500/20 p-3 rounded-full text-pink-400 group-hover:scale-110 transition-transform">
                                    <FaBirthdayCake className="text-2xl"/>
                                </div>
                                <h2 className="card-title">Cumpleaños</h2>
                            </div>
                            <p className="text-slate-400 text-sm">Calendario de clientes y propietarios.</p>
                        </div>
                    </Link>
                </>
            )}

        </div>
      </div>
    </div>
  );
}