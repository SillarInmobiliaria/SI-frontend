'use client';
import React, { useState } from 'react';

const FeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ tipo: 'BUG', asunto: '', descripcion: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. INTENTAMOS TODAS LAS FORMAS DE OBTENER EL TOKEN
      const token = 
        localStorage.getItem('token') || 
        localStorage.getItem('auth_token') || 
        JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;

      if (!token) {
        alert('❌ Error: No se encontró tu sesión. Por favor, cierra sesión y vuelve a entrar.');
        setLoading(false);
        return;
      }

      // 2. CONFIGURACIÓN DE URL (CORREGIDA)
      const apiUrl = 'https://sillar-backend.onrender.com/api';

      const res = await fetch(`${apiUrl}/feedback`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Enviamos la llave al servidor
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('✅ ¡Ticket enviado con éxito! Ya puedes revisarlo en el panel.');
        setFormData({ tipo: 'BUG', asunto: '', descripcion: '' });
        setIsOpen(false);
      } else {
        const errorData = await res.json();
        alert(`❌ Error del servidor: ${errorData.message || 'Autorización fallida'}`);
      }
    } catch (error) {
      alert('❌ Error de conexión. El servidor no responde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante con ID para el Dashboard */}
      <button 
        id="btn-open-feedback"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-slate-900 hover:bg-black text-white p-4 rounded-full shadow-2xl transition-all z-50 border-2 border-green-500/50"
      >
        <span className="text-xl">💡</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-6 text-white border-b-4 border-green-500">
              <h3 className="font-mono font-bold text-lg text-white">DEVELOPER_CONSOLE.EXE</h3>
              <p className="text-[10px] text-green-400 font-mono uppercase tracking-widest">Canal Directo - Sillar Inmobiliaria</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Tipo de Reporte</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-mono text-sm text-slate-700"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="BUG">🛠️ ERROR_TECNICO</option>
                  <option value="IDEA">💡 NUEVA_FUNCIONALIDAD</option>
                  <option value="SUGERENCIA">💬 COMENTARIO_GENERAL</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Asunto</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-700 focus:border-slate-900 outline-none"
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Detalles</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-700 resize-none focus:border-slate-900 outline-none"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-green-400 font-mono font-bold py-4 rounded-xl border-b-4 border-green-600 active:border-b-0 active:translate-y-1"
              >
                {loading ? 'EXECUTING...' : '> SEND_REPORT'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;