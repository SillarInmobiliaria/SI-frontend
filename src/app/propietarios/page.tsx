'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { useAuth } from '../../context/AuthContext';
import { createPropietario, toggleEstadoPropietario, eliminarPropietario } from '../../services/api';
import { 
  FaUserPlus, FaSearch, FaWhatsapp, FaTrash, FaBan, FaCheck, FaEye, 
  FaUserTie, FaCreditCard, FaStickyNote, FaIdCard, FaEnvelope, FaMapMarkerAlt,
  FaBirthdayCake, FaCalendarAlt
} from 'react-icons/fa';

export default function PropietariosPage() {
  const { propietarios, fetchPropietarios, loading } = useInmobiliariaStore();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProp, setSelectedProp] = useState<any>(null);

  const { register, handleSubmit, reset } = useForm();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchPropietarios(); }, []);

  const handleSuspender = async (id: string, actual: boolean) => {
      if(!confirm(`¿${!actual ? 'Activar' : 'Suspender'}?`)) return;
      try { await toggleEstadoPropietario(id, !actual); fetchPropietarios(); } catch(e){ alert('Error'); }
  };

  const handleEliminar = async (id: string) => {
      if(!confirm('⚠️ ¿Eliminar permanentemente?')) return;
      try { await eliminarPropietario(id); fetchPropietarios(); } catch(e){ alert('Error'); }
  };

  const onSubmit = async (data: any) => {
      setIsSubmitting(true);
      try { await createPropietario(data); fetchPropietarios(); setModalOpen(false); reset(); alert('✅ Guardado'); }
      catch(e){ alert('Error'); } finally { setIsSubmitting(false); }
  };

  const handleNumberInput = (e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); };
  const filtrados = propietarios.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.dni?.includes(busqueda));

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No registrada';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Navbar />
      <div className="container mx-auto p-6 max-w-7xl">
        
        {/* HEADER MEJORADO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/60">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Gestión de Propietarios
              </h1>
              <p className="text-gray-500 font-medium">Base de datos de vendedores</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-80 group">
                  <FaSearch className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o DNI..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400" 
                    value={busqueda} 
                    onChange={e=>setBusqueda(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setModalOpen(true)} 
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <FaUserPlus /> Nuevo
                </button>
            </div>
        </div>

        {/* TABLA MEJORADA */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                        <tr className="border-b-2 border-gray-200">
                          <th className="py-5 pl-8 text-gray-700 uppercase text-xs font-bold tracking-wider">Propietario</th>
                          <th className="text-gray-700 uppercase text-xs font-bold tracking-wider">Contacto</th>
                          <th className="text-gray-700 uppercase text-xs font-bold tracking-wider">Estado</th>
                          <th className="text-center text-gray-700 uppercase text-xs font-bold tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12">
                              <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                                <span className="text-gray-500 font-medium">Cargando propietarios...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filtrados.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12 text-gray-400">
                              No se encontraron propietarios
                            </td>
                          </tr>
                        ) : filtrados.map((p) => (
                            <tr key={p.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-200">
                                <td className="pl-8 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="avatar placeholder">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl w-12 h-12 shadow-md">
                                          <span className="text-lg font-bold">{p.nombre.charAt(0).toUpperCase()}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-bold text-gray-900 text-base mb-1">{p.nombre}</div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono font-medium">
                                              <FaIdCard className="text-gray-500"/> {p.dni}
                                            </span>
                                            {p.banco && (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold">
                                                <FaCreditCard/> {p.banco}
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col gap-2">
                                        <a href={`https://wa.me/51${p.celular1}`} target="_blank" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors">
                                          <FaWhatsapp className="text-lg"/> {p.celular1}
                                        </a>
                                        {p.email && (
                                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <FaEnvelope className="text-gray-400"/> {p.email}
                                          </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                  {p.activo ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-bold text-xs shadow-sm">
                                      <FaCheck/> Activo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-bold text-xs shadow-sm">
                                      <FaBan/> Suspendido
                                    </span>
                                  )}
                                </td>
                                <td>
                                    <div className="flex justify-center gap-2">
                                        <button 
                                          onClick={()=>setSelectedProp(p)} 
                                          className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-200 shadow-sm"
                                          title="Ver detalles"
                                        >
                                          <FaEye/>
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button 
                                                  onClick={()=>handleSuspender(p.id, p.activo)} 
                                                  className={`p-2.5 rounded-lg ${p.activo ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} hover:scale-110 transition-all duration-200 shadow-sm`}
                                                  title={p.activo ? 'Suspender' : 'Activar'}
                                                >
                                                  {p.activo ? <FaBan/> : <FaCheck/>}
                                                </button>
                                                <button 
                                                  onClick={()=>handleEliminar(p.id)} 
                                                  className="p-2.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-200 shadow-sm"
                                                  title="Eliminar"
                                                >
                                                  <FaTrash/>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* MODAL NUEVO */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center">
                      <h3 className="font-bold text-2xl flex items-center gap-3">
                        <FaUserPlus/> Nuevo Propietario
                      </h3>
                      <button onClick={()=>setModalOpen(false)} className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all">
                        ✕
                      </button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-gradient-to-br from-gray-50 to-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="md:col-span-2 pb-3 border-b-2 border-indigo-100 mb-2">
                              <h4 className="text-sm font-bold text-indigo-700 uppercase flex items-center gap-2">
                                <FaUserTie/> Información Personal
                              </h4>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">Nombre Completo *</label>
                              <input {...register('nombre', {required:true})} className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors"/>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">DNI *</label>
                              <input {...register('dni', {required:true, maxLength:8})} className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors" onInput={handleNumberInput} maxLength={8}/>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">Celular 1 *</label>
                              <input {...register('celular1', {required:true, maxLength:9})} className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors" onInput={handleNumberInput} maxLength={9}/>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">Celular 2</label>
                              <input {...register('celular2', {maxLength:9})} className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors" onInput={handleNumberInput} maxLength={9}/>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">Email</label>
                              <input {...register('email')} type="email" className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors"/>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">Dirección</label>
                              <input {...register('direccion')} className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors"/>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">Fecha de Nacimiento *</label>
                              <input {...register('fechaNacimiento', {required:true})} type="date" className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors" defaultValue={today}/>
                            </div>

                            <div className="md:col-span-2 pb-3 border-b-2 border-purple-100 mt-4 mb-2">
                              <h4 className="text-sm font-bold text-purple-700 uppercase flex items-center gap-2">
                                <FaCreditCard/> Información Bancaria (Opcional)
                              </h4>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">Banco</label>
                              <select {...register('banco')} className="select select-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors">
                                <option value="">-- Seleccionar --</option>
                                <option value="BCP">BCP</option>
                                <option value="Interbank">Interbank</option>
                                <option value="BBVA">BBVA</option>
                                <option value="Scotiabank">Scotiabank</option>
                                <option value="Nacion">Banco de la Nación</option>
                              </select>
                            </div>
                            <div className="form-control">
                              <label className="label font-bold text-gray-700 text-sm">N° de Cuenta</label>
                              <input {...register('cuenta')} className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors" onInput={handleNumberInput}/>
                            </div>
                            <div className="form-control md:col-span-2">
                              <label className="label font-bold text-gray-700 text-sm">CCI</label>
                              <input {...register('cci')} className="input input-bordered w-full bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors" onInput={handleNumberInput}/>
                            </div>

                            <div className="md:col-span-2 pb-3 border-b-2 border-blue-100 mt-4 mb-2">
                              <h4 className="text-sm font-bold text-blue-700 uppercase flex items-center gap-2">
                                <FaStickyNote/> Notas Adicionales
                              </h4>
                            </div>
                            <div className="form-control md:col-span-2">
                              <textarea {...register('detalles')} className="textarea textarea-bordered h-24 bg-white border-2 border-gray-200 focus:border-indigo-500 transition-colors" placeholder="Información adicional del propietario..."></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-100">
                          <button type="button" onClick={()=>setModalOpen(false)} className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold transition-colors">
                            Cancelar
                          </button>
                          <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                            {isSubmitting ? 'Guardando...' : 'Guardar Propietario'}
                          </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL DETALLE */}
        {selectedProp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
                <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[95vh] overflow-y-auto">
                    
                    {/* CABECERA */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex gap-5 items-center">
                                <div className="avatar placeholder">
                                    <div className="bg-white/20 backdrop-blur-sm text-white rounded-2xl w-20 h-20 flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-white/30 ring-4 ring-white/10">
                                        {selectedProp.nombre.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">{selectedProp.nombre}</h2>
                                    <div className="flex gap-2.5 flex-wrap">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-mono rounded-lg text-sm shadow-lg">
                                            <FaIdCard/> {selectedProp.dni}
                                        </div>
                                        {selectedProp.activo ? 
                                            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg font-bold text-sm shadow-lg">
                                              <FaCheck/> Activo
                                            </div> : 
                                            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg font-bold text-sm shadow-lg">
                                              <FaBan/> Suspendido
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            <button onClick={()=>setSelectedProp(null)} className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-all shadow-lg">
                              ✕
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* COLUMNA IZQUIERDA */}
                            <div className="space-y-6">
                                {/* INFO PERSONAL */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-5 pb-3 border-b-2 border-blue-100 flex items-center gap-2">
                                      <FaUserTie className="text-blue-500 text-lg"/> Información Personal
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
                                          <p className="text-xs text-blue-700 font-bold uppercase mb-1.5">Nombre Completo</p>
                                          <p className="font-bold text-gray-900 text-lg">{selectedProp.nombre}</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 p-4 rounded-xl border-l-4 border-purple-500 shadow-sm">
                                          <p className="text-xs text-purple-700 font-bold uppercase mb-1.5">DNI</p>
                                          <p className="font-mono font-bold text-gray-900 text-lg">{selectedProp.dni}</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-pink-50 to-pink-100/50 p-4 rounded-xl border-l-4 border-pink-500 shadow-sm">
                                          <p className="text-xs text-pink-700 font-bold uppercase mb-1.5 flex items-center gap-1.5">
                                            <FaBirthdayCake/> Fecha de Nacimiento
                                          </p>
                                          <p className="text-gray-800 font-medium">{formatDate(selectedProp.fechaNacimiento)}</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                                          <p className="text-xs text-emerald-700 font-bold uppercase mb-1.5 flex items-center gap-1.5">
                                            <FaCalendarAlt/> Fecha de Registro
                                          </p>
                                          <p className="text-gray-800 font-medium">{formatDate(selectedProp.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA */}
                            <div className="space-y-6">
                                {/* CONTACTO */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-5 pb-3 border-b-2 border-green-100 flex items-center gap-2">
                                      <FaWhatsapp className="text-green-500 text-lg"/> Información de Contacto
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-green-50 to-green-100/50 p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
                                          <p className="text-xs text-green-700 font-bold uppercase mb-2">Celular Principal</p>
                                          <a href={`https://wa.me/51${selectedProp.celular1}`} target="_blank" className="font-bold text-xl text-green-600 flex items-center gap-2 hover:text-green-700 transition-colors">
                                            <FaWhatsapp className="text-2xl"/> {selectedProp.celular1}
                                          </a>
                                        </div>
                                        <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 p-4 rounded-xl border-l-4 border-teal-500 shadow-sm">
                                          <p className="text-xs text-teal-700 font-bold uppercase mb-1.5">Celular Secundario</p>
                                          <p className="text-gray-800 font-medium text-lg">{selectedProp.celular2 || 'No registrado'}</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
                                          <p className="text-xs text-blue-700 font-bold uppercase mb-1.5 flex items-center gap-1.5">
                                            <FaEnvelope/> Correo Electrónico
                                          </p>
                                          <p className="text-gray-700 break-all">{selectedProp.email || 'No registrado'}</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
                                          <p className="text-xs text-red-700 font-bold uppercase mb-1.5 flex items-center gap-1.5">
                                            <FaMapMarkerAlt/> Dirección
                                          </p>
                                          <p className="text-gray-700">{selectedProp.direccion || 'No registrada'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* FINANCIERO */}
                                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 p-6 rounded-2xl shadow-xl text-white border-2 border-indigo-300">
                                    <h3 className="text-sm font-bold uppercase mb-5 pb-3 border-b-2 border-white/20 flex items-center gap-2">
                                      <FaCreditCard className="text-lg"/> Información Bancaria
                                    </h3>
                                    {selectedProp.banco ? (
                                        <div className="space-y-3">
                                            <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg">
                                              <p className="text-xs font-bold uppercase mb-2 opacity-80">Banco</p>
                                              <p className="font-bold text-xl">{selectedProp.banco}</p>
                                            </div>
                                            <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg">
                                              <p className="text-xs font-bold uppercase mb-2 opacity-80">N° Cuenta</p>
                                              <p className="font-mono text-lg">{selectedProp.cuenta || 'No registrado'}</p>
                                            </div>
                                            <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg">
                                              <p className="text-xs font-bold uppercase mb-2 opacity-80">CCI</p>
                                              <p className="font-mono text-sm">{selectedProp.cci || 'No registrado'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                      <div className="text-center py-8 italic opacity-70 bg-white/5 rounded-xl border border-white/10">
                                        Sin información bancaria registrada
                                      </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}