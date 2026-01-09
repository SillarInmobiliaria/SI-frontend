'use client';
// 🟢 CORRECCIÓN IMPORTANTE:
// Estamos en la raíz "src/app/", así que para salir a "src/" usamos "../"
// Y tu carpeta se llama "context" (singular), no "contexts".

import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaUsersCog, FaBuilding, FaUserTie, FaClipboardList, FaKey, 
  FaExclamationTriangle, FaCheckCircle, FaClock, FaChartLine, 
  FaCalendarCheck, FaRoute, FaBirthdayCake 
} from 'react-icons/fa';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';
  const mostrarAlerta = user?.mustChangePassword;

  // --- CÁLCULO REAL DE DÍAS RESTANTES ---
  let diasRestantes = 30;
  
  if (user?.createdAt) {
    const fechaCreacion = new Date(user.createdAt);
    const fechaActual = new Date();
    const diferenciaTiempo = fechaActual.getTime() - fechaCreacion.getTime();
    const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));
    diasRestantes = 30 - diasTranscurridos;
  }
  if (diasRestantes < 0) diasRestantes = 0;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
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
                <button 
                    onClick={() => router.push('/cambiar-password')}
                    className="btn btn-sm btn-ghost text-slate-500 gap-2"
                >
                    <FaKey /> Cambiar Contraseña
                </button>
            </div>
        </div>

        {/* --- ALERTAS DE SEGURIDAD --- */}
        {mostrarAlerta ? (
            <div className="alert alert-warning shadow-lg mb-8 border-l-8 border-yellow-600">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-yellow-900 font-bold text-lg">
                        <FaExclamationTriangle />
                        <h3>¡Acción Requerida!</h3>
                    </div>
                    <div className="text-yellow-800">
                        Estás usando una contraseña temporal. Cambiala antes de que expire.
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-yellow-100/50 p-2 rounded-lg">
                    <FaClock className="text-2xl text-yellow-700"/>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-yellow-700 uppercase">Tiempo Restante</span>
                        <span className={`text-2xl font-black leading-none ${diasRestantes < 5 ? 'text-red-600' : 'text-yellow-900'}`}>
                            {diasRestantes} días
                        </span>
                    </div>
                </div>
                <button onClick={() => router.push('/cambiar-password')} className="btn btn-active btn-warning text-yellow-900 font-bold">
                    Cambiar Ahora
                </button>
            </div>
        ) : (
            <div className="alert alert-success shadow-sm mb-8 bg-green-50 border border-green-200">
                <FaCheckCircle className="text-green-500"/>
                <span className="text-green-700 text-sm font-semibold">Tu cuenta está segura y activa.</span>
            </div>
        )}

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

            {/* --- SECCIÓN EXCLUSIVA DE ADMIN (OSCURO) --- */}
            {isAdmin && (
                <>
                    {/* 6. USUARIOS */}
                    <Link href="/usuarios" className="card bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 border-orange-500 cursor-pointer group hover:-translate-y-1 text-white">
                        <div className="card-body">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-orange-500/20 p-3 rounded-full text-orange-400 group-hover:scale-110 transition-transform"><FaUsersCog className="text-2xl"/></div>
                                <h2 className="card-title">Usuarios</h2>
                            </div>
                            <p className="text-slate-400 text-sm">Gestión de accesos, roles y personal.</p>
                        </div>
                    </Link>

                    {/* 7. REPORTES */}
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

                    {/* 8. CUMPLEAÑOS */}
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