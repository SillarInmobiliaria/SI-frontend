'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSeguimientos, getClientes, getVisitas } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

import { 
  FaUsersCog, FaBuilding, FaUserTie, FaClipboardList, FaKey, 
  FaChartLine, FaCalendarCheck, FaRoute, FaBirthdayCake, FaMapMarkerAlt,
  FaTimes, FaUserSecret, FaHome, FaHandshake, FaArrowRight, FaShieldAlt,
  FaExclamationTriangle, FaTerminal
} from 'react-icons/fa';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const notificacionMostrada = useRef(false);
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  // --- LÓGICA DE CONTADOR DE SEGURIDAD ---
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  useEffect(() => {
    if (user) console.log("Datos de usuario para alerta:", { creado: user.createdAt, cambiado: user.passwordChanged });

    if (user?.createdAt && user?.passwordChanged !== true) {
      const calcularDias = () => {
        const fechaCreacion = new Date(user.createdAt);
        const hoy = new Date();
        const diffInMs = hoy.getTime() - fechaCreacion.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const restantes = 30 - diffInDays;
        setDiasRestantes(restantes > 0 ? restantes : 0);
        setMostrarAlerta(true);
      };
      calcularDias();
    }
  }, [user]);

  // --- CONFIGURACIÓN DE MÓDULOS ---
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
      path: "/captacion",
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
      path: "/cierre",
      icon: FaHandshake,
      desc: "Contratos, alquileres y ventas finales",
      color: "text-green-700",
      bgIcon: "bg-green-100",
      border: "border-green-600",
      gradient: "from-green-600 to-emerald-700"
    },
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
    },
    {
      title: "Buzón Developer",
      path: "/admin/tickets",
      icon: FaTerminal,
      desc: "Revisar logs, errores y sugerencias técnicas del sistema",
      color: "text-green-400",
      bgIcon: "bg-slate-800",
      border: "border-slate-900",
      gradient: "from-slate-800 to-black",
      isDeveloper: true 
    }
  ];

  const getFechaPeru = (date: Date = new Date()) => {
      return date.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  };

  useEffect(() => {
    if (notificacionMostrada.current) return;
    notificacionMostrada.current = true;

    const verificarRecordatorios = async () => {
        try {
            const [seguimientos, clientes, visitas] = await Promise.all([
              getSeguimientos().catch(() => []), 
              getClientes().catch(() => []),
              getVisitas().catch(() => [])
            ]);
            
            const hoyStr = getFechaPeru(); 
            const visHoy = visitas.filter((v: any) => v.fechaProgramada && getFechaPeru(new Date(v.fechaProgramada)) === hoyStr && v.estado !== 'CANCELADA');
            
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
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200">
                            <button onClick={() => { toast.dismiss(t.id); router.push('/visitas'); }} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-bold text-teal-700 hover:bg-teal-50">Ver</button>
                        </div>
                    </div>
                ), { duration: 10000 });
            }
        } catch (error) { console.error("Error notificaciones", error); }
    };

    verificarRecordatorios();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto p-6 md:p-10 relative z-10">
        
        {mostrarAlerta && diasRestantes !== null && (
          <div className={`mb-8 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between border-2 transition-all shadow-xl ${ (diasRestantes || 0) <= 5 ? 'bg-red-50 border-red-200 text-red-700 animate-pulse' : 'bg-amber-50 border-amber-200 text-amber-800' }`}>
            <div className="flex items-center gap-5 mb-4 md:mb-0">
              <div className={`p-4 rounded-2xl ${(diasRestantes || 0) <= 5 ? 'bg-red-100' : 'bg-amber-100'}`}>
                <FaExclamationTriangle className="text-2xl" />
              </div>
              <div>
                <p className="font-black text-xl uppercase tracking-tight">Acceso Temporal</p>
                <p className="font-medium opacity-90">Hola <b>{user?.nombre}</b>, debes cambiar tu contraseña. Te quedan <span className="bg-white px-3 py-1 rounded-lg mx-2 font-bold shadow-sm text-indigo-600">{diasRestantes} días</span> para la suspensión.</p>
              </div>
            </div>
            <button onClick={() => router.push('/cambiar-password')} className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${ (diasRestantes || 0) <= 5 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-500 text-white hover:bg-amber-600' }`}>
              Cambiar Ahora
            </button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                    <span className="text-slate-800">Hola, </span>
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.nombre?.split(' ')[0]}</span>
                    <span className="ml-3 inline-block animate-wave">👋</span>
                </h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium mt-2">
                  <FaShieldAlt className={`text-lg ${isAdmin ? 'text-purple-500' : 'text-blue-500'}`}/>
                  {isAdmin ? 'Panel de Administración Global' : 'Panel de Gestión Comercial'}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={() => router.push('/cambiar-password')} className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300 shadow-sm border border-slate-200 font-semibold">
                    <FaKey className="text-sm text-slate-400"/><span className="text-sm">Seguridad</span>
                </button>
                <div className={`px-6 py-3 ${isAdmin ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 text-sm`}>
                    {isAdmin ? '👑 Administrador' : '🎯 Asesor'}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modulos.map((mod: any, idx) => {
                if (mod.adminOnly && !isAdmin) return null;
                const isDev = mod.isDeveloper;

                return (
                    <div 
                      key={idx} 
                      className="group relative cursor-pointer h-full"
                      onClick={() => isDev ? router.push(mod.path) : router.push(mod.path)}
                    >
                        <div className={`h-full rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden 
                          ${isDev ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white/70 backdrop-blur-md border-white/60 hover:bg-white/90 text-slate-800'}`}>
                            
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${mod.gradient}`}></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3.5 rounded-xl ${mod.bgIcon} ${mod.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                        <mod.icon className="text-2xl" />
                                    </div>
                                    <FaArrowRight className={`transition-all ${isDev ? 'text-green-400' : 'text-slate-300'}`}/>
                                </div>
                                <h2 className="text-xl font-bold mb-1 uppercase tracking-tighter">{mod.title}</h2>
                                <p className="text-sm opacity-70 leading-relaxed">{mod.desc}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}