'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; 
import { FaHome, FaUserTie, FaBuilding, FaClipboardList, FaUsersCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth(); 

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-4 sm:px-8">
      
      {/* --- LOGO --- */}
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl text-blue-900 font-bold flex items-center gap-2">
          🏠 Sillar Inmobiliaria
        </Link>
      </div>

      {/* --- MENÚ DE NAVEGACIÓN --- */}
      <div className="flex-none gap-2">
        {/* Solo mostramos el menú si hay usuario logueado */}
        {user && (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral-focus text-neutral-content rounded-full w-10 border border-slate-300">
                {/* Mostramos la inicial del usuario */}
                <span className="text-xl font-bold text-slate-700">{user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}</span>
              </div>
            </label>
            
            <ul tabIndex={0} className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-64 border border-gray-200 z-50">
              
              {/* Info del Usuario */}
              <li className="menu-title px-4 py-2 border-b border-gray-100 mb-2">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-800 text-base">{user.nombre}</span>
                  <span className="badge badge-sm badge-primary">{user.rol}</span>
                  <span className="text-xs text-gray-400 font-normal">{user.email}</span>
                </div>
              </li>

              {/* Enlaces Rápidos */}
              <li><Link href="/"><FaHome className="text-blue-500"/> Inicio</Link></li>
              
              {/* Opciones de Admin */}
              {user.rol === 'ADMIN' && (
                <li><Link href="/usuarios"><FaUsersCog className="text-orange-500"/> Gestión Usuarios</Link></li>
              )}

              <div className="divider my-1"></div>

              <li>
                <button onClick={logout} className="text-error font-bold hover:bg-error/10">
                  <FaSignOutAlt /> Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}