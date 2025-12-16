'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function CambiarPasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [passwords, setPasswords] = useState({
    nueva: '',
    confirmar: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validaciones básicas
    if (passwords.nueva.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    if (passwords.nueva !== passwords.confirmar) {
        setError('Las contraseñas no coinciden.');
        return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) { 
          router.push('/login'); 
          return; 
      }

      // 2. Petición al Backend
      const res = await fetch('http://localhost:4000/api/auth/cambiar-password', {
        method: 'POST', // O PUT, dependiendo de tu backend
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: passwords.nueva })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar contraseña');
      }

      // 3. Éxito
      alert('¡Contraseña actualizada correctamente! Por favor inicia sesión nuevamente.');
      localStorage.removeItem('token'); // Cerramos sesión para forzar re-ingreso
      localStorage.removeItem('user');
      router.push('/login');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      <div className="container mx-auto p-4 flex justify-center items-center h-[80vh]">
        <div className="card w-full max-w-md bg-white shadow-xl">
          <div className="card-body">
            <button 
                onClick={() => router.back()} 
                className="btn btn-sm btn-ghost absolute left-4 top-4"
            >
                ← Volver
            </button>

            <h2 className="card-title text-2xl font-bold text-center justify-center mt-6">
                🔐 Cambiar Contraseña
            </h2>
            <p className="text-center text-slate-500 mb-4">
                Hola <span className="font-bold text-primary">{user?.nombre}</span>. Ingresa tu nueva clave personal.
            </p>

            {error && (
                <div className="alert alert-error text-sm py-2 mb-4 text-white font-bold">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label font-bold text-slate-600">Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="input input-bordered w-full"
                  placeholder="Mínimo 6 caracteres"
                  value={passwords.nueva}
                  onChange={(e) => setPasswords({...passwords, nueva: e.target.value})}
                  required 
                />
              </div>

              <div className="form-control">
                <label className="label font-bold text-slate-600">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  className="input input-bordered w-full"
                  placeholder="Repite la contraseña"
                  value={passwords.confirmar}
                  onChange={(e) => setPasswords({...passwords, confirmar: e.target.value})}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary w-full mt-4 ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}