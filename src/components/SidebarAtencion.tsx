'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Agregamos FaUserTie para el nuevo módulo
import { FaClipboardList, FaCalendarCheck, FaRoute, FaClipboardCheck, FaUserTie } from 'react-icons/fa';

export default function SidebarAtencion() {
  const pathname = usePathname();

  const getLinkClasses = (path: string, colorClass: string, bgClass: string, borderClass: string) => {
    // Detecta si la ruta actual empieza con el path (para mantener activo sub-rutas si las hubiera)
    const isActive = pathname.startsWith(path);
    
    return `flex items-center gap-4 px-4 py-3 transition-all duration-300 border-l-4 group-hover:px-6 ${
      isActive 
        ? `${bgClass} ${colorClass} ${borderClass}` 
        : `text-slate-400 hover:bg-slate-50 hover:text-slate-600 border-transparent`
    }`;
  };

  return (
    <aside className="sticky top-0 h-[calc(100vh-64px)] w-16 hover:w-64 bg-white border-r border-slate-200 shadow-xl transition-all duration-300 z-30 group flex flex-col py-6 overflow-hidden">
        
        {/* CABECERA */}
        <div className="px-6 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                Centro de Atención
            </span>
        </div>

        {/* 1. INTERESADOS */}
        <Link href="/clientes" className={getLinkClasses('/clientes', 'text-indigo-600', 'bg-indigo-50', 'border-indigo-600')}>
            <div className="min-w-[24px] flex justify-center">
                <FaClipboardList className="text-xl"/>
            </div>
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 origin-left">
                Interesados
            </span>
        </Link>

        {/* 2. CARTERA CLIENTES */}
        <Link href="/cartera" className={getLinkClasses('/cartera', 'text-emerald-600', 'bg-emerald-50', 'border-emerald-600')}>
            <div className="min-w-[24px] flex justify-center">
                <FaUserTie className="text-xl"/>
            </div>
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 origin-left">
                Cartera Clientes
            </span>
        </Link>

        {/* 3. AGENDA VISITAS */}
        <Link href="/visitas" className={getLinkClasses('/visitas', 'text-teal-600', 'bg-teal-50', 'border-teal-600')}>
            <div className="min-w-[24px] flex justify-center">
                <FaCalendarCheck className="text-xl"/>
            </div>
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 origin-left">
                Agenda Visitas
            </span>
        </Link>

        {/* 4. SEGUIMIENTO */}
        <Link href="/seguimiento" className={getLinkClasses('/seguimiento', 'text-pink-600', 'bg-pink-50', 'border-pink-600')}>
            <div className="min-w-[24px] flex justify-center">
                <FaRoute className="text-xl"/>
            </div>
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 origin-left">
                Seguimiento
            </span>
        </Link>

        {/* 5. REQUERIMIENTOS */}
        <Link href="/requerimientos" className={getLinkClasses('/requerimientos', 'text-amber-600', 'bg-amber-50', 'border-amber-600')}>
            <div className="min-w-[24px] flex justify-center">
                <FaClipboardCheck className="text-xl"/>
            </div>
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 origin-left">
                Requerimientos
            </span>
        </Link>
    </aside>
  );
}