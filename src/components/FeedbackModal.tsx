'use client';
import React, { useState } from 'react';

const FeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ tipo: 'ERROR_TECNICO', asunto: '', descripcion: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ Sesión expirada. Por favor, reingresa al sistema.');
      setLoading(false);
      return;
    }

    try {
      // USAMOS LA URL LIMPIA QUE VIMOS FUNCIONAR PARCIALMENTE
      const res = await fetch('https://sillar-backend.onrender.com/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo: formData.tipo,
          asunto: formData.asunto,
          descripcion: formData.descripcion
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ ¡EXITO TOTAL! El programador ha recibido tu ticket.');
        setFormData({ tipo: 'ERROR_TECNICO', asunto: '', descripcion: '' });
        setIsOpen(false);
      } else {
        alert(`❌ Error ${res.status}: ${data.message || 'Fallo de validación'}`);
      }
    } catch (error) {
      alert('❌ Error de red. El servidor está tardando en responder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button id="btn-open-feedback" onClick={() => setIsOpen(true)} className="fixed bottom-24 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl z-50 border-2 border-green-500/50 transition-all active:scale-90">
        <span className="text-xl">💡</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-left">
            <div className="bg-slate-900 p-6 border-b-4 border-green-500">
              <h3 className="font-mono font-bold text-lg text-white">DEVELOPER_CONSOLE.EXE</h3>
              <p className="text-[10px] text-green-400 font-mono uppercase tracking-widest">SILLAR_SUPPORT_ACTIVE</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Prioridad</label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-800" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                  <option value="BUG">🛠️ CRITICAL_BUG</option>
                  <option value="IDEA">💡 FEATURE_IDEA</option>
                  <option value="SUGERENCIA">💬 GENERAL_NOTE</option>
                </select>
              </div>
              <input type="text" required placeholder="Asunto..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-800 outline-none focus:border-slate-900" value={formData.asunto} onChange={(e) => setFormData({...formData, asunto: e.target.value})} />
              <textarea required rows={3} placeholder="Describe el problema detalladamente..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-slate-800 outline-none focus:border-slate-900 resize-none" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-green-400 font-mono font-bold py-4 rounded-xl border-b-4 border-green-600 hover:bg-black">
                {loading ? 'EXECUTING...' : '> SEND_PACKET'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;