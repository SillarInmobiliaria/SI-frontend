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
  FaChartLine, FaCalendarCheck, FaRoute, FaBirthdayCake, FaMapMarkerAlt,
  FaTimes, FaUserSecret, FaHome, FaHandshake, FaArrowRight, FaShieldAlt
} from 'react-icons/fa';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const notificacionMostrada = useRef(false);
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  // --- CONFIGURACIÓN DE MÓDULOS (Para mantener el código limpio) ---
  const modulos = [
    {
      title: "Centro de Atención",
      path: "/clientes",
      icon: FaClipboardList,
      desc: "Gestión Integral: Clientes, Agenda y Seguimiento",
      color: "text-indigo-600",
      bgIcon: "bg-indigo-100",
      border: "border-indigo-500",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      title: "Propiedades",
      path: "/propiedades",
      icon: FaBuilding,
      desc: "Gestionar inventario, precios y disponibilidad",
      color: "text-blue-600",
      bgIcon: "bg-blue-100",
      border: "border-blue-500",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Captaciones",
      path: "/captacion", // Ojo: en tu código era /captacion, revisa si es singular o plural
      icon: FaHome,
      desc: "Registro de nuevas propiedades potenciales",
      color: "text-cyan-600",
      bgIcon: "bg-cyan-100",
      border: "border-cyan-500",
      gradient: "from-cyan-500 to-teal-500"
    },
    {
      title: "Propietarios",
      path: "/propietarios",
      icon: FaUserTie,
      desc: "Base de datos de dueños y contratos",
      color: "text-emerald-600",
      bgIcon: "bg-emerald-100",
      border: "border-emerald-500",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      title: "Agentes",
      path: "/agentes",
      icon: FaUserSecret,
      desc: "Directorio de colegas y lista negra",
      color: "text-purple-600",
      bgIcon: "bg-purple-100",
      border: "border-purple-500",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      title: "Cierre / Ventas",
      path: "/cierre", // Revisa si es /cierre o /cierres
      icon: FaHandshake,
      desc: "Contratos, alquileres y ventas finales",
      color: "text-green-700",
      bgIcon: "bg-green-100",
      border: "border-green-600",
      gradient: "from-green-600 to-emerald-700"
    },
    // --- ADMIN ONLY ---
    {
      title: "Usuarios",
      path: "/usuarios",
      icon: FaUsersCog,
      desc: "Gestión de accesos, roles y personal",
      color: "text-orange-600",
      bgIcon: "bg-orange-100",
      border: "border-orange-500",
      gradient: "from-orange-500 to-red-500",
      adminOnly: true
    },
    {
      title: "Reportes",
      path: "/admin/dashboard",
      icon: FaChartLine,
      desc: "Estadísticas, métricas y exportación Excel",
      color: "text-amber-600",
      bgIcon: "bg-amber-100",
      border: "border-amber-500",
      gradient: "from-amber-500 to-yellow-500",
      adminOnly: true
    },
    {
      title: "Cumpleaños",
      path: "/admin/cumpleanos",
      icon: FaBirthdayCake,
      desc: "Calendario de fidelización de clientes",
      color: "text-pink-600",
      bgIcon: "bg-pink-100",
      border: "border-pink-500",
      gradient: "from-pink-500 to-rose-500",
      adminOnly: true
    }
  ];

  // --- LÓGICA DE FECHAS ---
  const getHora = (fechaIso: string) => {
      if (!fechaIso) return '--:--';
      const date = new Date(fechaIso);
      return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });
  };

  const getFechaPeru = (date: Date = new Date()) => {
      return date.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  };

  // --- LÓGICA DE NOTIFICACIONES (Igual a tu código) ---
  useEffect(() => {
    if (notificacionMostrada.current) return;
    notificacionMostrada.current = true;

    const verificarRecordatorios = async () => {
        try {
            const seguimientos = await getSeguimientos();
            const clientes = await getClientes();
            const visitas = await getVisitas(); 
            
            const ahora = new Date(); 
            const hoyStr = getFechaPeru(ahora); 
            const mananaObj = new Date(ahora);
            mananaObj.setDate(ahora.getDate() + 1);
            const mananaStr = getFechaPeru(mananaObj); 

            // Filtros Seguimientos
            const todosSeguimientos = seguimientos.sort((a:any, b:any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            const ultimosSeguimientosMap = new Map();
            todosSeguimientos.forEach((s: any) => {
                if (!ultimosSeguimientosMap.has(s.clienteId)) {
                    ultimosSeguimientosMap.set(s.clienteId, s);
                }
            });
            const ultimosSeguimientos = Array.from(ultimosSeguimientosMap.values());

            const segHoy = ultimosSeguimientos.filter((s: any) => {
                if (!s.fechaProxima || s.estado !== 'PENDIENTE') return false;
                const fechaItemPura = s.fechaProxima.split('T')[0];
                return fechaItemPura === hoyStr;
            });

            const segManana = ultimosSeguimientos.filter((s: any) => {
                if (!s.fechaProxima || s.estado !== 'PENDIENTE') return false;
                const fechaItemPura = s.fechaProxima.split('T')[0];
                return fechaItemPura === mananaStr;
            });

            // Filtros Visitas
            const visHoy = visitas.filter((v: any) => {
                if (v.estado === 'CANCELADA') return false;
                const fechaVisitaObj = new Date(v.fechaProgramada);
                const fechaVisitaPeru = getFechaPeru(fechaVisitaObj);
                return fechaVisitaPeru === hoyStr && fechaVisitaObj > ahora; 
            });

            const visManana = visitas.filter((v: any) => {
                if (v.estado === 'CANCELADA') return false;
                const fechaVisitaPeru = getFechaPeru(new Date(v.fechaProgramada));
                return fechaVisitaPeru === mananaStr;
            });

            const cumplesHoy = clientes.filter((c: any) => {
                if(!c.fechaNacimiento) return false;
                const fechaNac = new Date(c.fechaNacimiento + 'T12:00:00'); 
                const hoyObj = new Date();
                return fechaNac.getDate() === hoyObj.getDate() && fechaNac.getMonth() === hoyObj.getMonth();
            });

            if (segHoy.length > 0 || segManana.length > 0 || visHoy.length > 0 || visManana.length > 0 || cumplesHoy.length > 0) {
                const audio = new Audio('/alert.mp3'); 
                audio.play().catch(e => console.log("Audio bloqueado"));
            }

            // TOASTS...
            if (visHoy.length > 0) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-teal-600 relative mb-2`}>
                        <button onClick={() => toast.dismiss(t.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5"><FaMapMarkerAlt className="h-10 w-10 text-teal-600 animate-bounce" /></div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-bold text-gray-900">¡Salida de Campo HOY!</p>
                                    <p className="mt-1 text-sm text-gray-500">Tienes <b className="text-teal-700">{visHoy.length} visitas</b> pendientes.</p>
                                    <p className="text-xs text-gray-400 mt-1">Próxima: {getHora(visHoy[0].fechaProgramada)} - {visHoy[0].cliente?.nombre}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200">
                            <button onClick={() => { toast.dismiss(t.id); router.push('/visitas'); }} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-bold text-teal-700 hover:bg-teal-50">Ver</button>
                        </div>
                    </div>
                ), { duration: 10000 });
            }
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

    verificarRecordatorios();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* FONDO ANIMADO (Blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-3xl mix-blend-multiply filter animate-blob"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto p-6 md:p-10 relative z-10">
        
        {/* --- ENCABEZADO DE BIENVENIDA (Glassmorphism) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden group">
            {/* Brillo al hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
            
            <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                    <span className="text-slate-800">Hola, </span>
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {user?.nombre?.split(' ')[0]}
                    </span>
                    <span className="ml-3 inline-block animate-wave origin-[70%_70%]">👋</span>
                </h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium mt-2">
                    <FaShieldAlt className={`text-lg ${isAdmin ? 'text-purple-500' : 'text-blue-500'}`}/>
                    {isAdmin ? 'Panel de Administración Global' : 'Panel de Gestión Comercial'}
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                    onClick={() => router.push('/cambiar-password')} 
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200 font-semibold group/btn"
                >
                    <div className="p-1.5 bg-slate-100 rounded-lg group-hover/btn:bg-indigo-100 transition-colors">
                        <FaKey className="text-sm"/>
                    </div>
                    <span>Seguridad</span>
                </button>
                <div className={`px-6 py-3 ${isAdmin ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2`}>
                    {isAdmin ? '👑 Administrador' : '🎯 Asesor'}
                </div>
            </div>
        </div>

        {/* --- GRID DE MÓDULOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modulos.map((mod, idx) => {
                // Si es solo para admin y el usuario no lo es, no renderizar
                if (mod.adminOnly && !isAdmin) return null;

                return (
                    <Link href={mod.path} key={idx} className="group relative">
                        <div className={`h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden hover:bg-white/90`}>
                            
                            {/* Borde superior de color */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${mod.gradient}`}></div>
                            
                            {/* Fondo decorativo hover */}
                            <div className={`absolute -right-12 -top-12 w-32 h-32 ${mod.bgIcon} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3.5 rounded-xl ${mod.bgIcon} ${mod.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                        <mod.icon className="text-2xl" />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-300">
                                        <FaArrowRight className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-300"/>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-indigo-900 transition-colors">
                                    {mod.title}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    {mod.desc}
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>

      </div>
    </div>
  );
}