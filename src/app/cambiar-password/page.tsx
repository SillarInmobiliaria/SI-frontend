'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { cambiarPassword } from '../../services/api';
import { FaLock, FaKey, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link'; // Para el botón de volver

export default function CambiarPasswordPage() {
  const { user, logout } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    if (!user) return;
    setLoading(true);
    try {
        await cambiarPassword({ 
            userId: user.id, 
            nuevaPassword: data.password 
        });
        alert('✅ Contraseña actualizada. Inicia sesión de nuevo.');
        logout(); 
    } catch (error) {
        alert('❌ Error al actualizar contraseña');
    } finally {
        setLoading(false);
    }
  };

  const password = watch("password");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl">
        <div className="card-body">
            
            {/* Botón para volver si te arrepientes */}
            <Link href="/dashboard" className="btn btn-ghost btn-sm w-fit mb-2 gap-2">
                <FaArrowLeft /> Volver al Dashboard
            </Link>

            <h2 className="text-2xl font-bold text-center mb-2">🔐 Cambiar Contraseña</h2>
            <p className="text-center text-slate-500 mb-6">
                Hola <b>{user?.nombre}</b>. Ingresa tu nueva clave personal.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-control">
                    <label className="label font-bold">Nueva Contraseña</label>
                    <div className="relative">
                        <FaKey className="absolute left-3 top-3.5 text-gray-400"/>
                        <input 
                            {...register('password', { required: true, minLength: 6 })} 
                            type="password" 
                            className="input input-bordered w-full pl-10" 
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    {errors.password && <span className="text-error text-xs mt-1">Mínimo 6 caracteres</span>}
                </div>

                <div className="form-control">
                    <label className="label font-bold">Confirmar Contraseña</label>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-3.5 text-gray-400"/>
                        <input 
                            {...register('confirmPassword', { 
                                required: true, 
                                validate: (val) => val === password || "Las contraseñas no coinciden"
                            })} 
                            type="password" 
                            className="input input-bordered w-full pl-10" 
                            placeholder="Repite la contraseña"
                        />
                    </div>
                    {errors.confirmPassword && <span className="text-error text-xs mt-1">{errors.confirmPassword.message as string}</span>}
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full mt-6">
                    {loading ? 'Actualizando...' : 'Confirmar Cambio'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}