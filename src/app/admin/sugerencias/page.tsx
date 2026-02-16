'use client';
import React, { useEffect, useState } from 'react';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const cargarFeedbacks = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('https://si-backend-56ps.onrender.com/api/feedback', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFeedbacks(data);
    };
    cargarFeedbacks();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">📋 Bandeja de Sugerencias y Bugs</h1>
      <div className="grid gap-4">
        {feedbacks.map((f: any) => (
          <div key={f.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${f.tipo === 'BUG' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {f.tipo}
              </span>
              <span className="text-gray-400 text-xs">{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="font-bold text-gray-800">{f.asunto}</h3>
            <p className="text-gray-600 text-sm mt-2">{f.descripcion}</p>
            <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] text-gray-400 uppercase font-bold">
              Enviado por: {f.Usuario?.nombre || 'Usuario Desconocido'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedback;