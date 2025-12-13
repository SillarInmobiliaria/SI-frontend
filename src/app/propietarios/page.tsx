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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <div className="container mx-auto p-6 max-w-7xl">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm">
            <div><h1 className="text-3xl font-bold text-blue-900">Gestión de Propietarios</h1><p className="text-gray-500 mt-1">Base de datos de vendedores.</p></div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-64"><FaSearch className="absolute left-3 top-3.5 text-gray-400"/><input type="text" placeholder="Buscar..." className="input input-bordered w-full pl-10 bg-gray-50" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none px-6">+ Nuevo</button>
            </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                        <tr><th className="py-4 pl-6">PROPIETARIO</th><th>CONTACTO</th><th>ESTADO</th><th className="text-center">ACCIONES</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan={4} className="text-center py-8">Cargando...</td></tr> : filtrados.map((p) => (
                            <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="pl-6 py-4">
                                    <div className="font-bold text-gray-900 text-lg">{p.nombre}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="badge badge-ghost badge-sm font-mono text-xs">{p.dni}</span>
                                        {p.banco && <span className="badge badge-warning badge-sm text-xs gap-1"><FaCreditCard/> {p.banco}</span>}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2 font-bold text-green-600"><FaWhatsapp/> {p.celular1}</span>
                                        {p.email && <span className="text-xs text-gray-500 flex items-center gap-1"><FaEnvelope/> {p.email}</span>}
                                    </div>
                                </td>
                                <td>{p.activo ? <span className="badge badge-success text-white font-bold">Activo</span> : <span className="badge badge-error text-white font-bold">Susp.</span>}</td>
                                <td>
                                    <div className="flex justify-center gap-2">
                                        <button onClick={()=>setSelectedProp(p)} className="btn btn-square btn-sm btn-ghost text-blue-600 hover:bg-blue-100"><FaEye/></button>
                                        {isAdmin && (
                                            <>
                                                <button onClick={()=>handleSuspender(p.id, p.activo)} className={`btn btn-square btn-sm btn-ghost ${p.activo?'text-orange-400':'text-green-600'}`}>{p.activo?<FaBan/>:<FaCheck/>}</button>
                                                <button onClick={()=>handleEliminar(p.id)} className="btn btn-square btn-sm btn-ghost text-red-500"><FaTrash/></button>
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

        {/* MODAL NUEVO (Igual de limpio que Clientes) */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
                    <div className="bg-indigo-900 text-white p-6 flex justify-between items-center"><h3 className="font-bold text-2xl flex items-center gap-3"><FaUserPlus/> Nuevo Propietario</h3><button onClick={()=>setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white">✕</button></div>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="md:col-span-2 pb-2 border-b mb-2"><h4 className="text-xs font-bold text-gray-500 uppercase flex gap-2"><FaUserTie/> Personal</h4></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">Nombre *</label><input {...register('nombre', {required:true})} className="input input-bordered w-full bg-white"/></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">DNI *</label><input {...register('dni', {required:true, maxLength:8})} className="input input-bordered w-full bg-white" onInput={handleNumberInput} maxLength={8}/></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">Celular 1 *</label><input {...register('celular1', {required:true, maxLength:9})} className="input input-bordered w-full bg-white" onInput={handleNumberInput} maxLength={9}/></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">Celular 2</label><input {...register('celular2', {maxLength:9})} className="input input-bordered w-full bg-white" onInput={handleNumberInput} maxLength={9}/></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">Email</label><input {...register('email')} type="email" className="input input-bordered w-full bg-white"/></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">Dirección</label><input {...register('direccion')} className="input input-bordered w-full bg-white"/></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">Nacimiento *</label><input {...register('fechaNacimiento', {required:true})} type="date" className="input input-bordered w-full bg-white" defaultValue={today}/></div>

                            <div className="md:col-span-2 pb-2 border-b mt-4 mb-2"><h4 className="text-xs font-bold text-gray-500 uppercase flex gap-2"><FaCreditCard/> Bancario (Opcional)</h4></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">Banco</label><select {...register('banco')} className="select select-bordered w-full bg-white"><option value="">--</option><option value="BCP">BCP</option><option value="Interbank">Interbank</option><option value="BBVA">BBVA</option><option value="Scotiabank">Scotiabank</option><option value="Nacion">Nación</option></select></div>
                            <div className="form-control"><label className="label font-bold text-gray-700">N° Cuenta</label><input {...register('cuenta')} className="input input-bordered w-full bg-white" onInput={handleNumberInput}/></div>
                            <div className="form-control md:col-span-2"><label className="label font-bold text-gray-700">CCI</label><input {...register('cci')} className="input input-bordered w-full bg-white" onInput={handleNumberInput}/></div>

                            <div className="md:col-span-2 pb-2 border-b mt-4 mb-2"><h4 className="text-xs font-bold text-gray-500 uppercase flex gap-2"><FaStickyNote/> Notas</h4></div>
                            <div className="form-control md:col-span-2"><textarea {...register('detalles')} className="textarea textarea-bordered h-20 bg-white"></textarea></div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t"><button type="button" onClick={()=>setModalOpen(false)} className="btn btn-ghost text-gray-500">Cancelar</button><button type="submit" disabled={isSubmitting} className="btn btn-primary px-8 bg-indigo-600 border-none">{isSubmitting?'...':'Guardar'}</button></div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL DETALLE - DISEÑO PREMIUM (AZUL/MORADO) */}
        {selectedProp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
                <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[95vh] overflow-y-auto">
                    
                    {/* CABECERA PREMIUM AZUL */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex gap-4 items-center">
                                <div className="avatar placeholder">
                                    <div className="bg-white/20 backdrop-blur-sm text-white rounded-2xl w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-2xl border-2 border-white/30">
                                        {selectedProp.nombre.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-1.5">{selectedProp.nombre}</h2>
                                    <div className="flex gap-2 flex-wrap">
                                        <div className="badge bg-white/20 backdrop-blur-sm border-white/30 text-white font-mono gap-1 px-2.5 py-2.5 text-xs">
                                            <FaIdCard className="text-xs"/> {selectedProp.dni}
                                        </div>
                                        {selectedProp.activo ? 
                                            <div className="badge badge-success gap-1 text-white px-2.5 py-2.5 border-none shadow-lg text-xs"><FaCheck/> Activo</div> : 
                                            <div className="badge badge-error gap-1 text-white px-2.5 py-2.5 border-none shadow-lg text-xs"><FaBan/> Suspendido</div>
                                        }
                                    </div>
                                </div>
                            </div>
                            <button onClick={()=>setSelectedProp(null)} className="btn btn-sm btn-circle bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-lg">✕</button>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            
                            {/* COLUMNA IZQUIERDA */}
                            <div className="space-y-5">
                                {/* INFO PERSONAL */}
                                <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b-2 border-blue-100 pb-2 flex items-center gap-2"><FaUserTie className="text-blue-500"/> Información Personal</h3>
                                    <div className="space-y-3.5">
                                        <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100"><p className="text-xs text-blue-700 font-bold uppercase mb-1">Nombre</p><p className="font-bold text-gray-900">{selectedProp.nombre}</p></div>
                                        <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100"><p className="text-xs text-purple-700 font-bold uppercase mb-1">DNI</p><p className="font-mono font-bold text-gray-900">{selectedProp.dni}</p></div>
                                        <div className="bg-pink-50 p-3.5 rounded-xl border border-pink-100"><p className="text-xs text-pink-700 font-bold uppercase mb-1">Nacimiento</p><p className="text-gray-800 font-medium">{formatDate(selectedProp.fechaNacimiento)}</p></div>
                                        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100"><p className="text-xs text-emerald-700 font-bold uppercase mb-1">Registro</p><p className="text-gray-800 font-medium">{formatDate(selectedProp.createdAt)}</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA */}
                            <div className="space-y-5">
                                {/* CONTACTO */}
                                <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b-2 border-green-100 pb-2 flex items-center gap-2"><FaWhatsapp className="text-green-500"/> Contacto</h3>
                                    <div className="space-y-3.5">
                                        <div className="bg-green-50 p-3.5 rounded-xl border border-green-100"><p className="text-xs text-green-700 font-bold uppercase mb-1">Celular 1</p><p className="font-bold text-lg text-green-600 flex gap-2"><FaWhatsapp/> {selectedProp.celular1}</p></div>
                                        <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-100"><p className="text-xs text-teal-700 font-bold uppercase mb-1">Celular 2</p><p className="text-gray-800 font-medium">{selectedProp.celular2 || 'No registrado'}</p></div>
                                        <div className="bg-red-50 p-3.5 rounded-xl border border-red-100"><p className="text-xs text-red-700 font-bold uppercase mb-1">Dirección</p><p className="text-gray-700 flex gap-2 text-xs"><FaMapMarkerAlt className="text-red-500"/> {selectedProp.direccion || 'No registrada'}</p></div>
                                    </div>
                                </div>

                                {/* FINANCIERO */}
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-xl text-white">
                                    <h3 className="text-sm font-bold uppercase mb-4 border-b-2 border-white/20 pb-2 flex items-center gap-2"><FaCreditCard/> Financiero</h3>
                                    {selectedProp.banco ? (
                                        <div className="space-y-2">
                                            <div className="bg-white/10 p-3 rounded-lg"><p className="text-xs opacity-70 font-bold">BANCO</p><p className="font-bold text-lg">{selectedProp.banco}</p></div>
                                            <div className="bg-white/10 p-3 rounded-lg"><p className="text-xs opacity-70 font-bold">CUENTA</p><p className="font-mono">{selectedProp.cuenta}</p></div>
                                            <div className="bg-white/10 p-3 rounded-lg"><p className="text-xs opacity-70 font-bold">CCI</p><p className="font-mono text-xs">{selectedProp.cci}</p></div>
                                        </div>
                                    ) : <div className="text-center py-4 italic opacity-70">Sin datos bancarios</div>}
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