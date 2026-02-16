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
      const token = localStorage.getItem('token'); // Ajusta según donde guardes tu token
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('¡Gracias! Tu mensaje fue enviado con éxito.');
        setFormData({ tipo: 'SUGERENCIA', asunto: '', descripcion: '' });
        setIsOpen(false);
      }
    } catch (error) {
      alert('Error al enviar el mensaje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante del Buzón */}
    <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center"
        title="Buzón de Ideas y Errores"
    >
        <span className="text-2xl">💡</span>
    </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <span>📩</span> Buzón de Sillar
              </h3>
              <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Tipo de reporte</label>
                <select 
                  className="w-full border-b-2 border-gray-100 p-2 focus:border-blue-500 outline-none transition-all"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="SUGERENCIA">💬 Sugerencia</option>
                  <option value="IDEA">💡 Idea nueva</option>
                  <option value="BUG">🛠️ Reportar un error</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Asunto</label>
                <input 
                  type="text"
                  required
                  placeholder="¿De qué se trata?"
                  className="w-full border-b-2 border-gray-100 p-2 focus:border-blue-500 outline-none transition-all"
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Cuéntame más detalles..."
                  className="w-full border-2 border-gray-100 rounded-lg p-2 mt-1 focus:border-blue-500 outline-none transition-all"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;