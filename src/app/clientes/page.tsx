'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createCliente, createInteres, eliminarCliente, toggleEstadoCliente } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext'; 
import { 
  FaUser, FaSearch, FaEye, FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaTrash, FaBan, FaCheck, FaIdCard, FaRing, FaBriefcase, FaHome, FaStickyNote, FaUserTie,
  FaBirthdayCake, FaCalendarAlt, FaUserPlus
} from 'react-icons/fa';

interface FormClienteCompleto {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  telefono1: string; 
  telefono2?: string; 
  email: string;
  estadoCivil: string;
  ocupacion: string;
  fechaAlta: string;
  propiedadId?: string;
  asesorCliente?: string;
  observaciones?: string;
}

export default function ClientesPage() {
  const { clientes, fetchClientes, propiedades, fetchPropiedades, intereses, fetchIntereses, loading } = useInmobiliariaStore();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<FormClienteCompleto>();
  const selectedPropiedadId = watch('propiedadId');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchClientes();
    fetchPropiedades();
    fetchIntereses();
  }, []);

  const handleEliminar = async (id: string) => {
      if(!confirm('⚠️ ¿Estás seguro de eliminar este cliente?')) return;
      try { await eliminarCliente(id); alert('✅ Eliminado'); fetchClientes(); } 
      catch (e) { alert('❌ Error al eliminar'); }
  };

  const handleSuspender = async (id: string, estadoActual: boolean) => {
      const nuevo = !estadoActual;
      if(!confirm(`¿Deseas ${nuevo ? 'activar' : 'suspender'} este cliente?`)) return;
      try { await toggleEstadoCliente(id, nuevo); fetchClientes(); } 
      catch (e) { alert('❌ Error al cambiar estado'); }
  };

  const handleViewDetail = (c: any) => { 
      setSelectedCliente(c); 
      setDetailOpen(true); 
  };

  const onSubmit = async (data: FormClienteCompleto) => {
    setIsSubmitting(true);
    try {
      const resp = await createCliente({
          nombre: data.nombre,
          dni: data.dni,
          fechaNacimiento: data.fechaNacimiento,
          direccion: data.direccion,
          telefono1: data.telefono1,
          telefono2: data.telefono2,
          email: data.email,
          estadoCivil: data.estadoCivil,
          ocupacion: data.ocupacion,
          fechaAlta: data.fechaAlta,
          activo: undefined,
          usuarioId: undefined
      });

      const nuevoId = (resp as any).data?.id || (resp as any).id; 
      
      if (data.propiedadId && nuevoId) {
        await createInteres({
          clienteId: nuevoId,
          propiedadId: data.propiedadId,
          nota: `Asesor: ${data.asesorCliente || 'N/A'}. Notas: ${data.observaciones || ''}`
        });
      }

      await fetchClientes();
      setModalOpen(false);
      reset();
      alert('✅ Cliente Registrado');
    } catch (error) {
      console.error(error);
      alert('❌ Error al registrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
  };

  const filtered = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.dni?.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No registrada';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  let interesPrincipal = null;
  let asesorClienteGuardado = 'No especificado';
  let observacionesGuardadas = '';

  if (selectedCliente) {
      interesPrincipal = intereses.find(i => i.clienteId === selectedCliente.id);
      if (interesPrincipal?.nota) {
          const partes = interesPrincipal.nota.split('. Notas: ');
          if (partes[0].includes('Asesor: ')) asesorClienteGuardado = partes[0].replace('Asesor: ', '');
          if (partes.length > 1) observacionesGuardadas = partes[1];
          else observacionesGuardadas = interesPrincipal.nota;
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <main className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm">
          <div><h1 className="text-3xl font-bold text-blue-900">Cartera de Clientes</h1><p className="text-gray-500 mt-1">Gestiona a tus compradores potenciales.</p></div>
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative w-full md:w-64"><FaSearch className="absolute left-3 top-3.5 text-gray-400"/><input type="text" placeholder="Buscar..." className="input input-bordered w-full pl-10 bg-gray-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
             <button onClick={() => setModalOpen(true)} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none px-6">+ Nuevo</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                <tr><th className="py-4 pl-6">CLIENTE</th><th>CONTACTO</th><th>ESTADO</th><th className="text-center">ACCIONES</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={4} className="text-center py-8">Cargando...</td></tr> : filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30">
                    <td className="pl-6 py-4"><div className="font-bold text-gray-900 text-lg">{c.nombre}</div><div className="flex items-center gap-2 mt-1"><span className="badge badge-ghost badge-sm font-mono">{c.dni}</span></div></td>
                    <td><div className="flex flex-col gap-1"><span className="flex items-center gap-2 font-bold text-green-600"><FaPhone/> {c.telefono1 || '---'}</span>{c.email && <span className="text-xs text-gray-500">{c.email}</span>}</div></td>
                    <td>{c.activo ? <span className="badge badge-success text-white">Activo</span> : <span className="badge badge-error text-white">Susp.</span>}</td>
                    <td>
                        <div className="flex justify-center gap-2">
                            <button onClick={() => handleViewDetail(c)} className="btn btn-square btn-sm btn-ghost text-blue-500 hover:bg-blue-50"><FaEye /></button>
                            {isAdmin && (
                                <><button onClick={() => handleSuspender(c.id, c.activo)} className={`btn btn-square btn-sm btn-ghost ${c.activo ? 'text-orange-400' : 'text-green-600'}`}>{c.activo ? <FaBan/> : <FaCheck/>}</button>
                                <button onClick={() => handleEliminar(c.id)} className="btn btn-square btn-sm btn-ghost text-red-500"><FaTrash /></button></>
                            )}
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL NUEVO CLIENTE */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
                <div className="bg-indigo-900 text-white p-6 flex justify-between items-center">
                  <h3 className="font-bold text-2xl flex items-center gap-3"><FaUserPlus/> Nuevo Cliente</h3>
                  <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white">✕</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="md:col-span-2 pb-2 border-b mb-2"><h4 className="text-xs font-bold text-gray-500 uppercase flex gap-2"><FaUserTie/> Datos Personales</h4></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Nombre *</label><input {...register('nombre', { required: true })} className="input input-bordered w-full bg-white"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">DNI *</label><input {...register('dni', { required: true, maxLength: 8 })} onInput={handleNumberInput} maxLength={8} className="input input-bordered w-full bg-white"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Celular 1 *</label><input {...register('telefono1', { required: true, maxLength: 9 })} onInput={handleNumberInput} maxLength={9} className="input input-bordered w-full bg-white"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Celular 2</label><input {...register('telefono2', { maxLength: 9 })} onInput={handleNumberInput} maxLength={9} className="input input-bordered w-full bg-white"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Email</label><input {...register('email')} type="email" className="input input-bordered w-full bg-white"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Dirección</label><input {...register('direccion')} className="input input-bordered w-full bg-white"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Nacimiento *</label><input {...register('fechaNacimiento')} type="date" className="input input-bordered w-full bg-white" defaultValue={today}/></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Estado Civil</label><select {...register('estadoCivil')} className="select select-bordered w-full bg-white"><option value="">--</option><option value="Soltero">Soltero</option><option value="Casado">Casado</option><option value="Divorciado">Divorciado</option><option value="Viudo">Viudo</option></select></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Ocupación</label><input {...register('ocupacion')} className="input input-bordered w-full bg-white"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Fecha Alta *</label><input {...register('fechaAlta')} type="date" defaultValue={today} className="input input-bordered w-full bg-white"/></div>

                        <div className="md:col-span-2 pb-2 border-b mt-4 mb-2"><h4 className="text-xs font-bold text-gray-500 uppercase flex gap-2"><FaHome/> Interés (Opcional)</h4></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Propiedad</label><select {...register('propiedadId')} className="select select-bordered w-full bg-white"><option value="">-- Seleccionar --</option>{propiedades.map(p => <option key={p.id} value={p.id}>{p.direccion}</option>)}</select></div>
                        <div className="form-control"><label className="label font-bold text-gray-700">Asesor</label><input {...register('asesorCliente')} className="input input-bordered w-full bg-white"/></div>
                        
                        <div className="md:col-span-2 pb-2 border-b mt-4 mb-2"><h4 className="text-xs font-bold text-gray-500 uppercase flex gap-2"><FaStickyNote/> Observaciones</h4></div>
                        <div className="form-control md:col-span-2"><textarea {...register('observaciones')} className="textarea textarea-bordered h-20 bg-white"></textarea></div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t"><button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost text-gray-500">Cancelar</button><button type="submit" disabled={isSubmitting} className="btn btn-primary px-8 bg-indigo-600 border-none">{isSubmitting?'...':'Guardar'}</button></div>
                </form>
             </div>
          </div>
        )}

        {/* MODAL DETALLE - MEJORADO VISUALMENTE */}
        {isDetailOpen && selectedCliente && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
                <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[95vh] overflow-y-auto">
                    
                    {/* CABECERA PREMIUM */}
                    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex gap-4 items-center">
                                <div className="avatar placeholder">
                                    <div className="bg-white/20 backdrop-blur-sm text-white rounded-2xl w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-2xl border-2 border-white/30">
                                        {selectedCliente.nombre.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-1.5">{selectedCliente.nombre}</h2>
                                    <div className="flex gap-2 flex-wrap">
                                        <div className="badge bg-white/20 backdrop-blur-sm border-white/30 text-white font-mono gap-1 px-2.5 py-2.5 text-xs">
                                            <FaIdCard className="text-xs"/> {selectedCliente.dni}
                                        </div>
                                        {selectedCliente.activo ? (
                                            <div className="badge badge-success gap-1 text-white px-2.5 py-2.5 border-none shadow-lg text-xs">
                                                <FaCheck/> Activo
                                            </div>
                                        ) : (
                                            <div className="badge badge-error gap-1 text-white px-2.5 py-2.5 border-none shadow-lg text-xs">
                                                <FaBan/> Suspendido
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={()=>setDetailOpen(false)} 
                                className="btn btn-sm btn-circle bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-lg"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* CUERPO EN 2 COLUMNAS */}
                    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            
                            {/* COLUMNA IZQUIERDA */}
                            <div className="space-y-5">
                                {/* INFORMACIÓN PERSONAL */}
                                <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                                    <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b-2 border-green-100">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                                            <FaUserTie className="text-base"/>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase">Información Personal</h3>
                                    </div>
                                    <div className="space-y-3.5">
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3.5 rounded-xl border border-green-100">
                                            <p className="text-xs text-green-700 font-bold uppercase mb-1.5 flex items-center gap-1">
                                                <FaUserTie className="text-green-500"/> Nombre Completo
                                            </p>
                                            <p className="font-bold text-gray-900 text-base">{selectedCliente.nombre}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3.5 rounded-xl border border-purple-100">
                                            <p className="text-xs text-purple-700 font-bold uppercase mb-1.5 flex items-center gap-1">
                                                <FaIdCard className="text-purple-500"/> Documento DNI
                                            </p>
                                            <p className="font-mono font-bold text-gray-900 text-base">{selectedCliente.dni}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-3.5 rounded-xl border border-pink-100">
                                            <p className="text-xs text-pink-700 font-bold uppercase mb-1.5 flex items-center gap-1">
                                                <FaBirthdayCake className="text-pink-500"/> Fecha de Nacimiento
                                            </p>
                                            <p className="text-gray-800 font-medium text-sm">{formatDate(selectedCliente.fechaNacimiento)}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3.5 rounded-xl border border-orange-100">
                                            <p className="text-xs text-orange-700 font-bold uppercase mb-1.5 flex items-center gap-1">
                                                <FaCalendarAlt className="text-orange-500"/> Fecha de Alta
                                            </p>
                                            <p className="text-gray-800 font-medium text-sm">{formatDate(selectedCliente.fechaAlta)}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5 rounded-xl border border-blue-100">
                                            <p className="text-xs text-blue-700 font-bold uppercase mb-1.5 flex items-center gap-1">
                                                <FaRing className="text-blue-500"/> Estado Civil
                                            </p>
                                            <p className="text-gray-800 font-medium text-sm">{selectedCliente.estadoCivil || 'No registrado'}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 p-3.5 rounded-xl border border-cyan-100">
                                            <p className="text-xs text-cyan-700 font-bold uppercase mb-1.5 flex items-center gap-1">
                                                <FaBriefcase className="text-cyan-500"/> Ocupación
                                            </p>
                                            <p className="text-gray-800 font-medium text-sm">{selectedCliente.ocupacion || 'No registrada'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* INFORMACIÓN DE CONTACTO */}
                                <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                                    <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b-2 border-blue-100">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                            <FaPhone className="text-base"/>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase">Información de Contacto</h3>
                                    </div>
                                    <div className="space-y-3.5">
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3.5 rounded-xl border border-green-100">
                                            <p className="text-xs text-green-700 font-bold uppercase mb-1.5">Celular Principal</p>
                                            <p className="font-bold text-lg text-green-600 flex items-center gap-2">
                                                <FaPhone className="text-xl"/> {selectedCliente.telefono1}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-3.5 rounded-xl border border-teal-100">
                                            <p className="text-xs text-teal-700 font-bold uppercase mb-1.5">Celular Secundario</p>
                                            <p className="text-gray-800 text-base font-medium">{selectedCliente.telefono2 || 'No registrado'}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3.5 rounded-xl border border-blue-100">
                                            <p className="text-xs text-blue-700 font-bold uppercase mb-1.5">Correo Electrónico</p>
                                            <p className="text-gray-700 flex items-center gap-2 text-xs break-all">
                                                <FaEnvelope className="text-blue-500 flex-shrink-0 text-sm"/> {selectedCliente.email || 'No registrado'}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-3.5 rounded-xl border border-red-100">
                                            <p className="text-xs text-red-700 font-bold uppercase mb-1.5">Dirección</p>
                                            <p className="text-gray-700 flex items-center gap-2 text-xs">
                                                <FaMapMarkerAlt className="text-red-500 flex-shrink-0 text-sm"/> {selectedCliente.direccion || 'No registrada'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA */}
                            <div className="space-y-5">
                                {/* INTERÉS PRINCIPAL */}
                                <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 p-5 rounded-2xl shadow-xl text-white">
                                    <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b-2 border-white/20">
                                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                            <FaHome className="text-base"/>
                                        </div>
                                        <h3 className="text-sm font-bold uppercase">Interés Principal</h3>
                                    </div>
                                    {interesPrincipal && interesPrincipal.Propiedad ? (
                                        <div className="space-y-3.5">
                                            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20">
                                                <p className="text-xs font-bold uppercase mb-1.5 text-white/80">Propiedad</p>
                                                <p className="font-bold text-lg">{interesPrincipal.Propiedad.direccion}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20">
                                                    <p className="text-xs font-bold uppercase mb-1.5 text-white/80">Precio</p>
                                                    <p className="font-bold text-base">{interesPrincipal.Propiedad.moneda} {interesPrincipal.Propiedad.precio}</p>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20">
                                                    <p className="text-xs font-bold uppercase mb-1.5 text-white/80">Operación</p>
                                                    <p className="font-bold text-base">{interesPrincipal.Propiedad.modalidad}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20">
                                                <p className="text-xs font-bold uppercase mb-1.5 text-white/80">Asesor Cliente</p>
                                                <p className="font-bold text-base">{asesorClienteGuardado}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 text-center">
                                            <p className="text-white/70 italic text-base">Sin interés registrado</p>
                                        </div>
                                    )}
                                </div>

                                {/* OBSERVACIONES */}
                                {observacionesGuardadas && (
                                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 rounded-2xl shadow-xl text-white">
                                        <div className="flex items-center gap-2.5 mb-3.5">
                                            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                                <FaStickyNote className="text-base"/>
                                            </div>
                                            <h3 className="text-sm font-bold uppercase">Observaciones</h3>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-sm p-3.5 rounded-xl border border-white/30">
                                            <p className="text-white leading-relaxed text-sm">{observacionesGuardadas}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}