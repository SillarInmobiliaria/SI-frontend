'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { visitaService } from '../../../services/visitaService';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';

export default function NuevaVisitaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  const [clientes, setClientes] = useState<any[]>([]);
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    clienteId: '',
    propiedadId: '',
    asesorId: '', 
    fecha: '',
    hora: '',
    comentariosPrevios: ''
  });

  useEffect(() => {
    const cargarDatos = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const promises = [
          fetch('http://localhost:4000/api/clientes', { headers }),
          fetch('http://localhost:4000/api/propiedades', { headers })
        ];

        if (isAdmin) {
          promises.push(fetch('http://localhost:4000/api/usuarios', { headers }));
        }

        const responses = await Promise.all(promises);
        
        if (responses[0].ok && responses[1].ok) {
          const dataCli = await responses[0].json();
          const dataProp = await responses[1].json();
          setClientes(Array.isArray(dataCli) ? dataCli : dataCli.data || []);
          setPropiedades(Array.isArray(dataProp) ? dataProp : dataProp.data || []);
        }

        if (isAdmin && responses[2] && responses[2].ok) {
          const dataUsu = await responses[2].json();
          setUsuarios(Array.isArray(dataUsu) ? dataUsu : dataUsu.data || []);
        }

      } catch (error) {
        console.error("Error cargando listas", error);
      }
    };
    
    if (user) {
      cargarDatos();
    }
  }, [router, user, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token') || '';
      const fechaCombinada = new Date(`${formData.fecha}T${formData.hora}:00`);

      await visitaService.crearVisita(token, {
        fechaProgramada: fechaCombinada,
        clienteId: formData.clienteId,
        propiedadId: formData.propiedadId,
        asesorId: formData.asesorId, 
        comentariosPrevios: formData.comentariosPrevios
      });

      alert('¡Visita agendada correctamente!');
      router.push('/visitas');

    } catch (error) {
      alert('Error al crear la visita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="container mx-auto p-4 md:p-8 max-w-3xl">
        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📅</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Agendar Nueva Visita</h1>
              <p className="text-slate-500 text-sm">Completa los datos para programar una visita</p>
            </div>
          </div>
        </div>

        {/* AYUDA RÁPIDA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-xl mb-6 shadow-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Consejos antes de empezar</h4>
              <ul className="text-sm text-blue-700 space-y-1.5">
                <li>• Verifica que la fecha y hora estén disponibles</li>
                <li>• Agrega comentarios relevantes para preparar mejor la visita</li>
                <li>• Los campos marcados con <span className="text-red-600 font-bold">*</span> son obligatorios</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECCIÓN: INFORMACIÓN DEL CLIENTE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <h3 className="font-bold text-slate-700 text-lg">Información del Cliente</h3>
              </div>

              {/* CLIENTE */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-slate-600">Cliente</span>
                  <span className="label-text-alt text-red-500">* Requerido</span>
                </label>
                <select 
                  className="select select-bordered w-full bg-white hover:border-blue-400 focus:border-blue-500 transition-all"
                  value={formData.clienteId}
                  onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                  required
                >
                  <option value="">-- Selecciona un Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.dni ? `- ${c.dni}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            {/* SECCIÓN: DETALLES DE LA PROPIEDAD */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏠</span>
                </div>
                <h3 className="font-bold text-slate-700 text-lg">Detalles de la Propiedad</h3>
              </div>

              {/* PROPIEDAD */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-slate-600">Propiedad a Visitar</span>
                  <span className="label-text-alt text-red-500">* Requerido</span>
                </label>
                <select 
                  className="select select-bordered w-full bg-white hover:border-blue-400 focus:border-blue-500 transition-all"
                  value={formData.propiedadId}
                  onChange={(e) => setFormData({...formData, propiedadId: e.target.value})}
                  required
                >
                  <option value="">-- Selecciona una Propiedad --</option>
                  {propiedades.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.tipo} en {p.ubicacion} ({p.moneda} {p.precio})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ASIGNACIÓN DE ASESOR (SOLO ADMIN) */}
            {isAdmin && (
              <>
                <div className="border-t border-slate-200"></div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-lg text-white">👑</span>
                    </div>
                    <h3 className="font-bold text-blue-800 text-lg">Asignar Asesor (Solo Admin)</h3>
                  </div>
                  
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-blue-700">Asesor Responsable</span>
                    </label>
                    <select 
                      className="select select-bordered w-full bg-white"
                      value={formData.asesorId}
                      onChange={(e) => setFormData({...formData, asesorId: e.target.value})}
                    >
                      <option value="">-- Asignarme a mí mismo --</option>
                      {usuarios.map(u => (
                        <option key={u.id} value={u.id}>
                          👤 {u.nombre}
                        </option>
                      ))}
                    </select>
                    <label className="label">
                      <span className="label-text-alt text-blue-600">
                        💡 Si lo dejas vacío, la visita se agendará a tu nombre
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-slate-200"></div>

            {/* SECCIÓN: FECHA Y HORA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⏰</span>
                </div>
                <h3 className="font-bold text-slate-700 text-lg">Fecha y Hora</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FECHA */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-slate-600">Fecha</span>
                    <span className="label-text-alt text-red-500">* Requerido</span>
                  </label>
                  <input 
                    type="date" 
                    className="input input-bordered w-full bg-white hover:border-blue-400 focus:border-blue-500 transition-all"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    required
                  />
                </div>

                {/* HORA */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-slate-600">Hora</span>
                    <span className="label-text-alt text-red-500">* Requerido</span>
                  </label>
                  <input 
                    type="time" 
                    className="input input-bordered w-full bg-white hover:border-blue-400 focus:border-blue-500 transition-all"
                    value={formData.hora}
                    onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            {/* --- SECCIÓN CORREGIDA: COMENTARIOS --- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📝</span>
                </div>
                <h3 className="font-bold text-slate-700 text-lg">Comentarios y Observaciones</h3>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-slate-600">Notas Adicionales</span>
                  <span className="label-text-alt text-slate-400">Opcional</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-32 w-full bg-white hover:border-blue-400 focus:border-blue-500 transition-all resize-none text-slate-700"
                  placeholder="Escribe aquí detalles relevantes sobre la visita, preferencias del cliente o instrucciones de llegada..."
                  value={formData.comentariosPrevios}
                  onChange={(e) => setFormData({...formData, comentariosPrevios: e.target.value})}
                  maxLength={500}
                ></textarea>
                <label className="label">
                  <span className="label-text-alt text-slate-400">
                    {formData.comentariosPrevios.length}/500 caracteres
                  </span>
                </label>
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="btn btn-ghost border-2 border-slate-200 hover:bg-slate-50 transition-all"
              >
                <span>✕</span> Cancelar
              </button>
              <button 
                type="submit" 
                className="btn bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Guardar Visita
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}