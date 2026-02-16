'use client';
import React, { useState } from 'react';

const FeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ tipo: 'SUGERENCIA', asunto: '', descripcion: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Buscamos el token de seguridad
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token'); 
      
      // 2. Configuramos la URL base
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://si-backend-56ps.onrender.com';
      
      // Limpiamos la URL: quitamos "/" al final y nos aseguramos de no duplicar "/api"
      const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const finalUrl = base.includes('/api') ? `${base}/feedback` : `${base}/api/feedback`;

      console.log("Enviando a:", finalUrl); // Para que verifiques en consola

      const res = await fetch(finalUrl, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('✅ Ticket enviado al programador con éxito.');
        setFormData({ tipo: 'SUGERENCIA', asunto: '', descripcion: '' });
        setIsOpen(false);
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.message || 'Asegúrate de estar logueado'}`);
      }
    } catch (error) {
      alert('❌ Error de conexión. Revisa que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante (Con ID para que el Dashboard lo abra) */}
      <button 
        id="btn-open-feedback"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-slate-900 hover:bg-black text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center border-2 border-green-500/50"
      >
        <span className="text-xl">💡</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            {/* Header Estilo Terminal */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b-4 border-green-500">
              <div>
                <h3 className="font-mono font-bold text-lg tracking-tighter text-white">DEVELOPER_CONSOLE.EXE</h3>
                <p className="text-[10px] text-green-400 font-mono uppercase">Direct line to programmer</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoría de Sistema</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-mono text-sm focus:border-slate-900 outline-none text-slate-700"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="BUG">🛠️ REPORT_BUG (Error)</option>
                  <option value="IDEA">💡 FEATURE_REQUEST (Idea)</option>
                  <option value="SUGERENCIA">💬 GENERAL_FEEDBACK</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Asunto del Ticket</label>
                <input 
                  type="text"
                  required
                  placeholder="Título breve..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-slate-900 outline-none text-slate-700"
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Logs / Detalles</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe el problema..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-slate-900 outline-none resize-none text-slate-700"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-green-400 font-mono font-bold py-4 rounded-xl hover:bg-black transition-all border-b-4 border-green-600 active:border-b-0 active:translate-y-1 disabled:bg-slate-300"
              >
                {loading ? 'EXECUTING...' : '> SEND_TICKET'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;