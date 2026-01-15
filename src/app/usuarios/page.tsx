'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { fetchUsuarios, createUsuario, toggleEstadoUsuario, deleteUsuario, getNotificaciones } from '../../services/api';
import { FaUserPlus, FaTrash, FaBan, FaCheck, FaBell, FaExclamationCircle, FaSearch, FaInfoCircle, FaCopy, FaTimes, FaUsers, FaUserShield, FaUserTie, FaCheckCircle } from 'react-icons/fa';

export default function UsuariosPage() {
  const { user } = useAuth();
  
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', rol: 'ASESOR' });
  const [loading, setLoading] = useState(false);
  const [credenciales, setCredenciales] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const users = await fetchUsuarios();
      const notifs = await getNotificaciones();
      setUsuarios(users);
      setNotificaciones(notifs);
    } catch (error) {
      console.error("Error cargando datos");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const cumpleRol = filtroRol === 'TODOS' || u.rol === filtroRol;
    const cumpleBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                           u.email.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleRol && cumpleBusqueda;
  });

  const handleCrear = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const respuesta = await createUsuario(nuevoUsuario);
      setCredenciales(respuesta.credenciales); 
      setNuevoUsuario({ nombre: '', email: '', rol: 'ASESOR' });
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (id: string, estadoActual: boolean) => {
    let motivo = "";
    if (estadoActual) { 
        const input = prompt("⛔ Vas a suspender a este usuario.\nPor favor escribe el motivo:");
        if (input === null) return;
        motivo = input;
    } else {
        if(!confirm("¿Deseas REACTIVAR a este usuario?")) return;
    }
    
    try {
      await toggleEstadoUsuario(id, !estadoActual, motivo);
      cargarDatos();
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  const handleEliminar = async (id: string) => {
    if(!confirm('⚠️ ¿ESTÁS SEGURO? Eliminar es permanente.')) return;
    try { await deleteUsuario(id); cargarDatos(); } catch (error) { alert('Error'); }
  };

  if (user?.rol !== 'ADMIN' && user?.rol !== 'admin') {
    return <div className="p-10 text-center">⛔ Acceso Denegado.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 relative">
      <Navbar />
      <div className="container mx-auto p-8">
        
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Equipo
            </span>
            <FaUsers className="text-3xl text-blue-600"/>
          </h1>
          <p className="text-slate-600 mt-2 font-medium">Administra colaboradores y permisos del sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-6">
                {/* ALERTAS DEL SISTEMA */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-500 to-red-500 p-4">
                        <h3 className="text-white font-black flex items-center gap-2 text-sm uppercase tracking-wider">
                            <FaBell className="text-lg"/> Alertas del Sistema
                        </h3>
                    </div>
                    <div className="p-4">
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {notificaciones.length === 0 && (
                                <div className="text-center py-6">
                                    <FaCheckCircle className="text-4xl text-green-300 mx-auto mb-2"/>
                                    <p className="text-xs text-slate-400 font-medium">Sin novedades pendientes</p>
                                </div>
                            )}
                            {notificaciones.map((notif) => (
                                <div key={notif.id} className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs flex items-start gap-2 hover:bg-red-100 transition-colors">
                                    <FaExclamationCircle className="shrink-0 text-red-500 mt-0.5"/>
                                    <span className="text-red-700 font-medium">{notif.mensaje}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FORMULARIO CREAR USUARIO */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                        <h2 className="text-white font-black flex items-center gap-2 text-sm uppercase tracking-wider">
                            <FaUserPlus className="text-lg"/> Nuevo Colaborador
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Juan Pérez" 
                                    className="input input-bordered w-full bg-slate-50 focus:bg-white focus:border-blue-500 transition-all" 
                                    value={nuevoUsuario.nombre} 
                                    onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Correo Corporativo</label>
                                <input 
                                    type="email" 
                                    placeholder="correo@empresa.com" 
                                    className="input input-bordered w-full bg-slate-50 focus:bg-white focus:border-blue-500 transition-all" 
                                    value={nuevoUsuario.email} 
                                    onChange={e => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Rol en el Sistema</label>
                                <select 
                                    className="select select-bordered w-full bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold" 
                                    value={nuevoUsuario.rol} 
                                    onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                                >
                                    <option value="ASESOR">🎯 Asesor Comercial</option>
                                    <option value="ADMIN">👑 Administrador</option>
                                </select>
                            </div>

                            <button 
                                onClick={handleCrear}
                                disabled={loading} 
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus /> Generar Credenciales
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: TABLA */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* BARRA DE HERRAMIENTAS */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                        
                        <div className="flex flex-wrap gap-2 items-center justify-center xl:justify-start w-full xl:w-auto">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Filtrar:</span>
                            
                            <button 
                                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                                    filtroRol === 'TODOS' 
                                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg scale-105' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
                                }`} 
                                onClick={() => setFiltroRol('TODOS')}
                            >
                                <FaUsers /> Todos
                            </button>

                            <button 
                                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                                    filtroRol === 'ADMIN' 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105' 
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
                                }`} 
                                onClick={() => setFiltroRol('ADMIN')}
                            >
                                <FaUserShield /> Admins
                            </button>

                            <button 
                                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                                    filtroRol === 'ASESOR' 
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105' 
                                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-105'
                                }`} 
                                onClick={() => setFiltroRol('ASESOR')}
                            >
                                <FaUserTie /> Asesores
                            </button>
                        </div>

                        {/* BUSCADOR AJUSTADO */}
                        <div className="relative w-full xl:w-96"> {/* Aumenté ancho en XL a 96 */}
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar colaborador..." 
                                className="input input-bordered w-full pl-12 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-medium truncate" 
                                value={busqueda} 
                                onChange={(e) => setBusqueda(e.target.value)} 
                            />
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-slate-700 font-black uppercase text-xs tracking-wider">Usuario</th>
                                    <th className="text-slate-700 font-black uppercase text-xs tracking-wider">Rol</th>
                                    <th className="text-slate-700 font-black uppercase text-xs tracking-wider">Estado</th>
                                    <th className="text-right text-slate-700 font-black uppercase text-xs tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3">
                                                <FaSearch className="text-5xl text-slate-300"/>
                                                <p className="text-slate-400 font-semibold">No se encontraron resultados</p>
                                                <p className="text-xs text-slate-400">Intenta con otros términos de búsqueda</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {usuariosFiltrados.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                        u.rol === 'ADMIN' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
                                                    }`}>
                                                        {u.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{u.nombre}</div>
                                                        <div className="text-xs text-slate-500">{u.email}</div>
                                                        {!u.activo && u.motivoSuspension && (
                                                            <div className="text-xs text-red-600 mt-1 flex items-center gap-1.5 font-semibold bg-red-50 px-2 py-1 rounded-lg w-fit border border-red-200">
                                                                <FaInfoCircle/> {u.motivoSuspension}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                                    u.rol === 'ADMIN' 
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                                                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                                                }`}>
                                                    {u.rol === 'ADMIN' ? '👑 Admin' : '🎯 Asesor'}
                                                </span>
                                            </td>
                                            <td>
                                                {u.activo ? 
                                                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                        Activo
                                                    </div> : 
                                                    <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                        Suspendido
                                                    </div>
                                                }
                                            </td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <button 
                                                        onClick={() => handleToggleEstado(u.id, u.activo)} 
                                                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-md ${
                                                            u.activo 
                                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' 
                                                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                                        }`}
                                                        title={u.activo ? "Suspender" : "Activar"}
                                                    >
                                                        {u.activo ? <><FaBan/> Suspender</> : <><FaCheck/> Activar</>}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEliminar(u.id)} 
                                                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 hover:scale-110 border border-red-200"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="text-center bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <span className="text-sm font-bold text-slate-600">
                        Mostrando <span className="text-blue-600">{usuariosFiltrados.length}</span> de <span className="text-blue-600">{usuarios.length}</span> usuarios
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL DE CREDENCIALES */}
      {credenciales && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 w-full max-w-md rounded-3xl shadow-2xl border-2 border-blue-500/30 overflow-hidden transform scale-100 transition-all">
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-black text-white flex items-center gap-2">
                                ¡Usuario Creado! 🎉
                            </h2>
                            <p className="text-blue-100 text-sm mt-2 font-medium">
                                Credenciales generadas exitosamente
                            </p>
                        </div>
                        <button 
                            onClick={() => setCredenciales(null)} 
                            className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20 border-none"
                        >
                            <FaTimes className="text-lg"/>
                        </button>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <p className="text-slate-300 font-medium">
                        Entrega estas credenciales a <span className="text-white font-bold">{credenciales.nombre}</span>
                    </p>

                    <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 space-y-4">
                        <div>
                            <div className="text-xs text-blue-400 uppercase font-black tracking-wider mb-2 flex items-center gap-2">
                                📧 Correo Corporativo
                            </div>
                            <div className="text-white font-mono select-all bg-slate-900/50 px-4 py-3 rounded-xl border border-slate-600">
                                {credenciales.email}
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-700"></div>

                        <div>
                            <div className="text-xs text-yellow-400 uppercase font-black tracking-wider mb-2 flex items-center gap-2">
                                🔐 Contraseña Temporal
                            </div>
                            <div className="flex items-center justify-between bg-slate-900/50 px-4 py-3 rounded-xl border border-slate-600">
                                <span className="text-yellow-400 text-2xl font-mono font-black tracking-wider select-all">
                                    {credenciales.passwordTemporal}
                                </span>
                                <button 
                                    className="btn btn-ghost btn-sm text-yellow-400 hover:bg-yellow-400/10 border border-yellow-400/30 hover:scale-110 transition-transform"
                                    onClick={() => {
                                        navigator.clipboard.writeText(credenciales.passwordTemporal);
                                        alert('¡Contraseña copiada al portapapeles!');
                                    }}
                                    title="Copiar"
                                >
                                    <FaCopy className="text-lg"/>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                        <FaExclamationCircle className="text-yellow-400 text-xl shrink-0 mt-0.5"/>
                        <div>
                            <p className="text-yellow-200 text-xs font-bold mb-1">⚠️ IMPORTANTE</p>
                            <p className="text-yellow-100/80 text-xs leading-relaxed">
                                Esta contraseña expira en <span className="font-bold">30 días</span>. El usuario deberá cambiarla al iniciar sesión por primera vez.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setCredenciales(null)} 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        Entendido, Cerrar
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}