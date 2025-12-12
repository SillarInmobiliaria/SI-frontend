'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { fetchUsuarios, createUsuario, toggleEstadoUsuario, deleteUsuario, getNotificaciones } from '../../services/api';
import { FaUserPlus, FaTrash, FaBan, FaCheck, FaBell, FaExclamationCircle, FaSearch, FaInfoCircle, FaCopy, FaTimes, FaUsers, FaUserShield, FaUserTie } from 'react-icons/fa';

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
    <div className="min-h-screen bg-base-200 relative">
      <Navbar />
      <div className="container mx-auto p-8">
        
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <FaUserPlus /> Gestión de Equipo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-4">
                        <h3 className="card-title text-sm uppercase text-slate-500 flex items-center gap-2 mb-2">
                            <FaBell /> Alertas del Sistema
                        </h3>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {notificaciones.length === 0 && <p className="text-xs text-gray-400">Sin novedades.</p>}
                            {notificaciones.map((notif) => (
                                <div key={notif.id} className="alert alert-error shadow-sm p-2 text-xs flex justify-start">
                                    <FaExclamationCircle className="shrink-0"/>
                                    <span>{notif.mensaje}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Nuevo Colaborador</h2>
                        <form onSubmit={handleCrear} className="space-y-3">
                            <input type="text" placeholder="Nombre Completo" className="input input-bordered w-full" value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} required />
                            <input type="email" placeholder="Correo Corporativo" className="input input-bordered w-full" value={nuevoUsuario.email} onChange={e => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} required />
                            <select className="select select-bordered w-full" value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}>
                                <option value="ASESOR">Asesor Comercial</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                            <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? 'Creando...' : 'Generar Credenciales'}</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: TABLA */}
            <div className="lg:col-span-2 space-y-4">
                
                {/* 👇 BARRA DE HERRAMIENTAS CORREGIDA (COLORES SÓLIDOS) 👇 */}
                <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-5 rounded-xl shadow-md items-center">
                    
                    <div className="flex flex-wrap gap-2 items-center justify-center xl:justify-start w-full">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-2 tracking-wider">Filtrar por:</span>
                        
                        {/* Botón TODOS */}
                        <button 
                            className={`btn btn-sm md:btn-md gap-2 border-0 transition-all duration-200 ${
                                filtroRol === 'TODOS' 
                                ? 'bg-slate-800 text-white shadow-lg scale-105 hover:bg-slate-900' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`} 
                            onClick={() => setFiltroRol('TODOS')}
                        >
                            <FaUsers /> Todos
                        </button>

                        {/* Botón ADMINS */}
                        <button 
                            className={`btn btn-sm md:btn-md gap-2 border-0 transition-all duration-200 ${
                                filtroRol === 'ADMIN' 
                                ? 'bg-blue-600 text-white shadow-lg scale-105 hover:bg-blue-700' 
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`} 
                            onClick={() => setFiltroRol('ADMIN')}
                        >
                            <FaUserShield /> Admins
                        </button>

                        {/* Botón ASESORES */}
                        <button 
                            className={`btn btn-sm md:btn-md gap-2 border-0 transition-all duration-200 ${
                                filtroRol === 'ASESOR' 
                                ? 'bg-purple-600 text-white shadow-lg scale-105 hover:bg-purple-700' 
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`} 
                            onClick={() => setFiltroRol('ASESOR')}
                        >
                            <FaUserTie /> Asesores
                        </button>
                    </div>

                    <div className="relative w-full xl:w-72">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar nombre o correo..." 
                            className="input input-bordered w-full pl-10 bg-slate-50 focus:bg-white transition-all" 
                            value={busqueda} 
                            onChange={(e) => setBusqueda(e.target.value)} 
                        />
                    </div>
                </div>

                {/* TABLA */}
                <div className="card bg-base-100 shadow-xl overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th>Nombre / Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.length === 0 && (
                                <tr><td colSpan={4} className="text-center text-gray-400 py-10">No se encontraron resultados para tu búsqueda.</td></tr>
                            )}
                            {usuariosFiltrados.map((u) => (
                                <tr key={u.id} className="hover">
                                    <td>
                                        <div className="font-bold text-slate-700">{u.nombre}</div>
                                        <div className="text-xs text-slate-400">{u.email}</div>
                                        {!u.activo && u.motivoSuspension && (
                                            <div className="text-xs text-red-500 mt-1 flex items-center gap-1 font-semibold bg-red-50 p-1 rounded w-fit">
                                                <FaInfoCircle/> {u.motivoSuspension}
                                            </div>
                                        )}
                                    </td>
                                    <td><span className={`badge ${u.rol === 'ADMIN' ? 'badge-primary' : 'badge-ghost border-slate-300 text-slate-500'} badge-sm font-bold`}>{u.rol}</span></td>
                                    <td>
                                        {u.activo ? 
                                            <div className="badge badge-success gap-2 text-white text-xs font-bold shadow-sm">Activo</div> : 
                                            <div className="badge badge-error gap-2 text-white text-xs font-bold shadow-sm">SUSPENDIDO</div>
                                        }
                                    </td>
                                    <td className="flex gap-2 justify-end">
                                        <button 
                                            onClick={() => handleToggleEstado(u.id, u.activo)} 
                                            className={`btn btn-sm ${u.activo ? 'btn-warning btn-outline' : 'btn-success text-white'}`} 
                                            title={u.activo ? "Suspender" : "Activar"}
                                        >
                                            {u.activo ? <><FaBan/> Suspender</> : <><FaCheck/> Activar</>}
                                        </button>
                                        <button onClick={() => handleEliminar(u.id)} className="btn btn-sm btn-ghost text-error hover:bg-red-50"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="text-xs text-center text-gray-400 mt-2">
                    Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
                </div>
            </div>
        </div>
      </div>

      {/* MODAL DE CREDENCIALES */}
      {credenciales && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="card w-full max-w-md bg-slate-900 text-white shadow-2xl border border-slate-700">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <h2 className="card-title text-2xl text-primary">¡Usuario Creado! 🎉</h2>
                        <button onClick={() => setCredenciales(null)} className="btn btn-ghost btn-sm btn-circle text-gray-400">
                            <FaTimes />
                        </button>
                    </div>
                    
                    <p className="text-slate-400 mt-2">
                        Entrega estas credenciales a <b>{credenciales.nombre}</b>.
                    </p>

                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mt-4 space-y-3">
                        <div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Correo Corporativo</div>
                            <div className="text-white font-mono select-all">{credenciales.email}</div>
                        </div>
                        
                        <div className="divider my-0 border-slate-700"></div>

                        <div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Contraseña Temporal</div>
                            <div className="flex items-center justify-between">
                                <span className="text-warning text-xl font-mono font-bold tracking-wider select-all">
                                    {credenciales.passwordTemporal}
                                </span>
                                <button 
                                    className="btn btn-ghost btn-xs text-warning"
                                    onClick={() => navigator.clipboard.writeText(credenciales.passwordTemporal)}
                                    title="Copiar"
                                >
                                    <FaCopy />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="alert alert-warning bg-yellow-900/30 border-yellow-700 text-yellow-200 text-xs mt-4">
                        <FaExclamationCircle />
                        <span>Esta contraseña expira en 30 días. El usuario deberá cambiarla al iniciar sesión.</span>
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button 
                            onClick={() => setCredenciales(null)} 
                            className="btn btn-primary w-full"
                        >
                            Entendido, Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}