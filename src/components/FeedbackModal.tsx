'use client';
import React, { useState } from 'react';

const FeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ tipo: 'BUG', asunto: '', descripcion: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ Tu sesión ha expirado. Por favor, vuelve a entrar al sistema.');
      setLoading(false);
      return;
    }

    try {
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
        alert('✅ ¡EXITO! El programador ha recibido tu reporte.');
        setFormData({ tipo: 'BUG', asunto: '', descripcion: '' });
        setIsOpen(false);
      } else {
        alert(`❌ Error ${res.status}: ${data.message || 'Fallo de validación'}`);
      }
    } catch (error) {
      alert('❌ Error de red. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button id="btn-open-feedback" onClick={() => setIsOpen(true)} className="fixed bottom-24 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl z-50 border-2 border-green-500/50 transition-all hover:scale-110 active:scale-90">
        <span className="text-xl">💡</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans text-left">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            {/* Header con Botón de Salida (X) */}
            <div className="bg-slate-900 p-6 border-b-4 border-green-500 text-white flex justify-between items-center">
              <div>
                <h3 className="font-mono font-bold text-lg text-white">DEVELOPER_CONSOLE.EXE</h3>
                <p className="text-[10px] text-green-400 font-mono uppercase tracking-widest">Soporte Sillar Activo</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-2 bg-white/5 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Categoría</label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-800 outline-none focus:border-slate-900 transition-all" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                  <option value="BUG">🛠️ REPORTAR_ERROR</option>
                  <option value="IDEA">💡 NUEVA_FUNCIONALIDAD</option>
                  <option value="SUGERENCIA">💬 COMENTARIO</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Asunto</label>
                <input type="text" required placeholder="Ej: Error en carga de imágenes" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-800 outline-none focus:border-slate-900" value={formData.asunto} onChange={(e) => setFormData({...formData, asunto: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Descripción</label>
                <textarea required rows={3} placeholder="Explica detalladamente..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-800 outline-none resize-none focus:border-slate-900" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-green-400 font-mono font-bold py-4 rounded-xl border-b-4 border-green-600 hover:bg-black transition-all active:translate-y-1">
                {loading ? 'EJECUTANDO...' : '> ENVIAR_TICKET'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;