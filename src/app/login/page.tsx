'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login as loginService } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { FaUserShield, FaLock, FaEnvelope } from 'react-icons/fa';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await loginService(data);
      
      login(res.token, res.usuario);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary text-primary-content rounded-full w-20 h-20 text-4xl shadow-lg ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center">
                <FaUserShield />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Sillar Inmobiliaria</h1>
            <p className="text-slate-500">Acceso al Sistema ERP</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="alert alert-error text-sm py-2 text-white font-bold">{error}</div>}
            
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Correo Corporativo</span></label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400"/>
                <input {...register('email', { required: true })} type="email" placeholder="usuario@sillar.com" className="input input-bordered w-full pl-10" />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Contraseña</span></label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400"/>
                <input {...register('password', { required: true })} type="password" placeholder="••••••••" className="input input-bordered w-full pl-10" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-6 text-lg" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Ingresar al Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}