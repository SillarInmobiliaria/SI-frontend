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
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token'); 
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://si-backend-56ps.onrender.com';
      
      // Limpiamos la URL para evitar api/api
      const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      const res = await fetch(`${base}/api/feedback`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('✅ Reporte enviado al programador con éxito.');
        setFormData({ tipo: 'SUGERENCIA', asunto: '', descripcion: '' });
        setIsOpen(false);
      } else {
        alert('❌ Error al enviar. Asegúrate de estar logueado.');
      }
    } catch (error) {
      alert('❌ Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante Oculto (Se activa desde el Dashboard o por clic) */}
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
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b-4 border-green-500">
              <div>
                <h3 className="font-mono font-bold text-lg tracking-tighter">DEVELOPER_CONSOLE.EXE</h3>
                <p className="text-[10px] text-green-400 font-mono uppercase">Direct line to programmer</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoría de Sistema</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-mono text-sm focus:border-slate-900 outline-none"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="BUG">🛠️ REPORT_BUG (Error de código)</option>
                  <option value="IDEA">💡 FEATURE_REQUEST (Nueva idea)</option>
                  <option value="SUGERENCIA">💬 GENERAL_FEEDBACK (Sugerencia)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Asunto del Ticket</label>
                <input 
                  type="text"
                  required
                  placeholder="Título breve del problema..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-slate-900 outline-none"
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Logs / Detalles</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe qué pasó o qué necesitas..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-slate-900 outline-none resize-none"
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