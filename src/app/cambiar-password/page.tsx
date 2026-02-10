'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { FaLock, FaKey, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

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
          // Si no hay token, forzamos salida al login directamente
          window.location.href = '/login';
          return; 
      }

      // 2. Petición al Backend
      const res = await fetch('https://sillar-backend.onrender.com/api/auth/cambiar-password', {
        method: 'POST',
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
      
      // Limpiamos TODO rastro del usuario
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('usuario');

      // Esto limpia el AuthContext en memoria y evita que te rebote al dashboard
      window.location.href = '/login';

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
      <Navbar />
      
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[85vh] relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            
            {/* Header con icono */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>
              
              <div className="relative z-10">
                <button 
                    onClick={() => router.back()} 
                    className="absolute -top-2 -left-2 flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all text-sm font-medium border border-white/20"
                >
                    <FaArrowLeft /> Volver
                </button>
                
                <div className="text-center mt-8">
                  <div className="inline-flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                      <div className="relative bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center border-4 border-white/30 shadow-xl">
                        <FaLock className="text-4xl" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Cambiar Contraseña</h2>
                  <p className="text-white/90 text-sm">
                    Hola <span className="font-bold">{user?.nombre}</span>, ingresa tu nueva clave personal
                  </p>
                </div>
              </div>
            </div>

            {/* Body con formulario */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
              
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-5">
                <div className="form-control">
                  <label className="label font-bold text-gray-700 text-sm mb-1 flex items-center gap-2">
                    <FaKey className="text-indigo-500"/> Nueva Contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                      type="password" 
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                      placeholder="Mínimo 6 caracteres"
                      value={passwords.nueva}
                      onChange={(e) => setPasswords({...passwords, nueva: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label font-bold text-gray-700 text-sm mb-1 flex items-center gap-2">
                    <FaCheckCircle className="text-indigo-500"/> Confirmar Contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                      type="password" 
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
                      placeholder="Repite la contraseña"
                      value={passwords.confirmar}
                      onChange={(e) => setPasswords({...passwords, confirmar: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <FaKey />
                      <span>Guardar Nueva Contraseña</span>
                    </>
                  )}
                </button>
              </div>

              {/* Footer informativo */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                  🔒 Tu contraseña será encriptada de forma segura
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}