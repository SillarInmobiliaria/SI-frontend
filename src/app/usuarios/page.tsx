'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import { createUsuario, fetchUsuarios } from '../../services/api'; // Asegúrate de tener esto en api.ts
import { FaUserPlus, FaUsers, FaUserShield, FaUserTie, FaCopy } from 'react-icons/fa';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const { register, handleSubmit, reset } = useForm();
  const [tempPassword, setTempPassword] = useState(''); // Para mostrar la clave generada
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => { loadUsuarios(); }, []);

  const loadUsuarios = async () => {
    try {
        const data = await fetchUsuarios();
        setUsuarios(data);
    } catch (error) {
        console.error('Error cargando usuarios', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
        const res = await createUsuario(data); // El backend devuelve la password temporal
        setTempPassword(res.credenciales.passwordTemporal);
        setNewUserEmail(res.credenciales.email);
        loadUsuarios();
        reset();
        // Mostrar modal de éxito (lo hacemos simple con el estado tempPassword)
        (document.getElementById('modal_success') as HTMLDialogElement).showModal();
    } catch (error) {
        alert('Error al crear usuario. Verifica si el correo ya existe.');
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto p-8 max-w-6xl">
        
        <div className="flex flex-col md:flex-row gap-8">
            
            {/* FORMULARIO DE CREACIÓN */}
            <div className="w-full md:w-1/3">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4"><FaUserPlus className="text-primary"/> Crear Nuevo Usuario</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="form-control">
                                <label className="label font-bold">Nombre Completo</label>
                                <input {...register('nombre', { required: true })} type="text" placeholder="Ej: Juan Perez" className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label font-bold">Correo Corporativo</label>
                                <input {...register('email', { required: true })} type="email" placeholder="juan@sillar.com" className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label font-bold">Rol</label>
                                <select {...register('rol', { required: true })} className="select select-bordered">
                                    <option value="ASESOR">Asesor (Empleado)</option>
                                    <option value="ADMIN">Administrador (Socio)</option>
                                </select>
                            </div>
                            <button className="btn btn-primary w-full mt-4">Generar Credenciales</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* LISTA DE USUARIOS */}
            <div className="w-full md:w-2/3">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4"><FaUsers className="text-secondary"/> Equipo Sillar</h2>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Rol</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((u) => (
                                        <tr key={u.id} className="hover">
                                            <td>
                                                <div className="font-bold">{u.nombre}</div>
                                                <div className="text-xs opacity-50">{u.email}</div>
                                            </td>
                                            <td>
                                                {u.rol === 'ADMIN' 
                                                    ? <span className="badge badge-primary gap-1"><FaUserShield/> Admin</span> 
                                                    : <span className="badge badge-ghost gap-1"><FaUserTie/> Asesor</span>}
                                            </td>
                                            <td>
                                                {u.activo ? <span className="text-success text-xs font-bold">● Activo</span> : <span className="text-error">Inactivo</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* MODAL DE ÉXITO CON CONTRASEÑA TEMPORAL */}
        <dialog id="modal_success" className="modal">
            <div className="modal-box bg-slate-900 text-white border border-slate-700">
                <h3 className="font-bold text-2xl text-success mb-4">¡Usuario Creado! 🎉</h3>
                <p className="py-2">Entrega estas credenciales a tu colaborador.</p>
                
                <div className="bg-slate-800 p-4 rounded-lg mt-4 border border-slate-600">
                    <p className="text-sm text-slate-400 mb-1">Correo:</p>
                    <p className="font-mono text-lg select-all mb-4">{newUserEmail}</p>
                    
                    <p className="text-sm text-slate-400 mb-1">Contraseña Temporal:</p>
                    <div className="flex items-center gap-2">
                        <p className="font-mono text-2xl font-bold text-warning select-all tracking-wider">{tempPassword}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 italic">* El usuario deberá cambiarla al iniciar sesión.</p>
                </div>

                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn btn-primary">Entendido, cerrar</button>
                    </form>
                </div>
            </div>
        </dialog>

      </div>
    </div>
  );
}