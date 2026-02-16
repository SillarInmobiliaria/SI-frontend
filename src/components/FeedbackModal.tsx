'use client';
import React, { useState } from 'react';

const FeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ tipo: 'BUG', asunto: '', descripcion: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. OBTENEMOS EL TOKEN EXACTO QUE VIMOS EN TU CAPTURA
    const token = localStorage.getItem('token');

    if (!token) {
      alert('❌ Sesión no encontrada. Por favor, vuelve a iniciar sesión.');
      setLoading(false);
      return;
    }

    try {
      // 2. URL DIRECTA AL BACKEND (Sin variables, para evitar errores)
      const res = await fetch('https://sillar-backend.onrender.com/api/feedback', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ ¡ÉXITO! Reporte enviado al sistema.');
        setFormData({ tipo: 'BUG', asunto: '', descripcion: '' });
        setIsOpen(false);
      } else {
        // Mostramos el error real que lanza el servidor
        alert(`❌ Error: ${data.message || 'El servidor rechazó el token'}`);
      }
    } catch (error) {
      alert('❌ Error de conexión. Revisa tu internet o el estado del servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <button 
        id="btn-open-feedback"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-slate-900 hover:bg-black text-white p-4 rounded-full shadow-2xl z-50 border-2 border-green-500/50 transition-transform active:scale-90"
      >
        <span className="text-xl">💡</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans text-left">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            {/* Header Terminal */}
            <div className="bg-slate-900 p-6 text-white border-b-4 border-green-500 text-left">
              <h3 className="font-mono font-bold text-lg text-white">DEVELOPER_CONSOLE.EXE</h3>
              <p className="text-[10px] text-green-400 font-mono uppercase tracking-widest">Sillar Inmobiliaria - Soporte</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Categoría</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-mono text-sm text-slate-800 outline-none focus:border-slate-900"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="BUG">🛠️ ERROR_TECNICO</option>
                  <option value="IDEA">💡 NUEVA_IDEA</option>
                  <option value="SUGERENCIA">💬 COMENTARIO</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Asunto</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-800 outline-none focus:border-slate-900"
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Mensaje</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-800 resize-none outline-none focus:border-slate-900"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-green-400 font-mono font-bold py-4 rounded-xl border-b-4 border-green-600 hover:bg-black active:translate-y-1 transition-all disabled:bg-slate-400"
              >
                {loading ? 'ENVIANDO...' : '> SEND_TICKET'}
              </button>

              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;