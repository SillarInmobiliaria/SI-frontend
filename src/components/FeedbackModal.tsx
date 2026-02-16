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
      const token = localStorage.getItem('token'); 
      
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://si-backend-56ps.onrender.com';
      if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);

      const res = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ ¡Gracias! Tu mensaje ha sido enviado con éxito.');
        setFormData({ tipo: 'SUGERENCIA', asunto: '', descripcion: '' });
        setIsOpen(false);
      } else {
        alert(`❌ Error del servidor: ${data.message || 'No se pudo enviar'}`);
      }
    } catch (error) {
      console.error('Error enviando feedback:', error);
      alert('❌ Error de conexión. Verifica tu internet o el estado del servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante - Posicionado arriba de la IA */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center border-2 border-white"
        title="Buzón de Ideas y Errores"
      >
        <span className="text-2xl">💡</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center font-bold">
              <div className="flex items-center gap-2">
                <span>📩</span> 
                <span className="tracking-tight uppercase text-sm">Buzón de Mejoras Sillar</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-blue-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Categoría</label>
                <select 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="SUGERENCIA">💬 Sugerencia</option>
                  <option value="IDEA">💡 Idea nueva</option>
                  <option value="BUG">🛠️ Reportar un error</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Asunto</label>
                <input 
                  type="text"
                  required
                  placeholder="¿Sobre qué quieres escribir?"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition-all text-gray-700"
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mensaje Detallado</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Explícame tu idea o el error encontrado..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition-all text-gray-700 resize-none"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all transform active:scale-95 disabled:bg-gray-300 shadow-lg shadow-blue-200"
              >
                {loading ? (
                   <span className="flex items-center justify-center gap-2">
                     <span className="animate-spin text-xl">⏳</span> ENVIANDO...
                   </span>
                ) : 'ENVIAR AL EQUIPO TÉCNICO'}
              </button>

              <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-tighter">
                🔒 Tu reporte será revisado por administración
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;