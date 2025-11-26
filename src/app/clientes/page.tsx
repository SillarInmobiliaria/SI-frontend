'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createCliente, createInteres } from '../../services/api'; 
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import { 
  FaUser, FaIdCard, FaMapMarkerAlt, FaBirthdayCake, FaSave, 
  FaSearch, FaEye, FaHeart, FaWalking, FaPhone, FaHome, FaEnvelope, FaStickyNote, FaUserTie
} from 'react-icons/fa';

interface FormClienteCompleto {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  propiedadId?: string;
  asesorCliente?: string;
  observaciones?: string;
}

export default function ClientesPage() {
  const { 
    clientes, fetchClientes, 
    propiedades, fetchPropiedades, 
    intereses, fetchIntereses, 
    visitas, fetchVisitas, 
    loading 
  } = useInmobiliariaStore();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, watch } = useForm<FormClienteCompleto>();

  const selectedPropiedadId = watch('propiedadId');
  const propiedadSeleccionada = propiedades.find(p => p.id === selectedPropiedadId);

  useEffect(() => {
    fetchClientes();
    fetchPropiedades();
    fetchIntereses();
    fetchVisitas();
  }, []);

  const onSubmit = async (data: FormClienteCompleto) => {
    try {
      const nuevoCliente = await createCliente({
        nombre: data.nombre,
        dni: data.dni,
        fechaNacimiento: data.fechaNacimiento,
        direccion: data.direccion,
        telefono: data.telefono, 
        email: data.email        
      });

      if (data.propiedadId && nuevoCliente.data) {
        await createInteres({
          clienteId: nuevoCliente.data.id,
          propiedadId: data.propiedadId,
          nota: `Asesor Cliente: ${data.asesorCliente || 'N/A'}. Obs: ${data.observaciones || ''}`
        });
      }

      await fetchClientes();
      setModalOpen(false);
      reset();
      alert('✅ Cliente registrado con éxito');
    } catch (error) {
      alert('❌ Error al registrar');
      console.error(error);
    }
  };

  const handleViewDetail = (cliente: any) => {
    setSelectedCliente(cliente);
    setDetailOpen(true);
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.dni.includes(searchTerm)
  );

  const interesesDelCliente = selectedCliente ? intereses.filter(i => i.clienteId === selectedCliente.id) : [];
  const visitasDelCliente = selectedCliente ? visitas.filter(v => v.clienteId === selectedCliente.id) : [];
  
  const interesPrincipal = interesesDelCliente.length > 0 ? interesesDelCliente[interesesDelCliente.length - 1] : null;
  
  let asesorClienteGuardado = 'No especificado';
  let observacionesGuardadas = '';
  
  if (interesPrincipal?.nota) {
      const partes = interesPrincipal.nota.split('. Obs: ');
      if (partes.length > 0 && partes[0].includes('Asesor Cliente: ')) {
          asesorClienteGuardado = partes[0].replace('Asesor Cliente: ', '');
      } else {
          asesorClienteGuardado = 'No especificado (Formato antiguo)';
      }
      
      if (partes.length > 1) {
          observacionesGuardadas = partes[1];
      } else {
        observacionesGuardadas = interesPrincipal.nota; 
      }
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto p-6 max-w-7xl">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Cartera de Clientes</h1>
            <p className="text-base-content/60 mt-1">Gestiona compradores y sus intereses.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-3.5 text-base-content/40" />
              <input 
                type="text" 
                placeholder="Buscar Cliente..." 
                className="input input-bordered w-full pl-10 bg-base-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
                onClick={() => setModalOpen(true)} 
                className="btn btn-primary"
            >
                + Nuevo
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-base-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th className="py-4 pl-6">Nombre</th>
                  <th>DNI</th>
                  <th>Contacto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={4} className="text-center py-8">Cargando...</td></tr>
                ) : filteredClientes.map((c) => (
                  <tr key={c.id} className="hover:bg-base-200/50">
                    <td className="pl-6 py-4">
                      <div className="font-bold text-base-content text-lg">{c.nombre}</div>
                      <div className="badge badge-success badge-sm">CLIENTE</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 font-mono">
                        <FaIdCard className="text-base-content/40"/> {c.dni}
                      </div>
                    </td>
                    <td>
                        <div className="flex flex-col gap-1 text-sm">
                            <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-error"/> {c.direccion}</span>
                            <span className="flex items-center gap-2"><FaEnvelope className="text-info"/> {c.email || 'Sin email'}</span>
                        </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetail(c)}
                        className="btn btn-sm btn-ghost tooltip"
                        data-tip="Ver Ficha Completa"
                      >
                        <FaEye className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE REGISTRO COMPLETO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-base-100 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                
                <div className="bg-primary text-primary-content p-6 flex justify-between items-center">
                    <h3 className="font-bold text-2xl flex items-center gap-3"><FaUser/> Registrar Nuevo Cliente</h3>
                    <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-base-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* COLUMNA IZQ: DATOS DEL CLIENTE */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-base-content/60 uppercase text-sm border-b border-base-300 pb-2">Datos Personales</h4>
                        <div className="form-control w-full">
                            <label className="label font-bold">Nombre del Cliente Interesado</label>
                            <input {...register('nombre', { required: true })} type="text" className="input input-bordered w-full" placeholder="Ej: María Gómez" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control w-full">
                                <label className="label font-bold">DNI</label>
                                <input {...register('dni', { required: true, minLength: 8, maxLength: 8 })} type="text" className="input input-bordered w-full font-mono" maxLength={8} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }} />
                            </div>
                            <div className="form-control w-full">
                                <label className="label font-bold">Fecha Nacimiento</label>
                                <input {...register('fechaNacimiento', { required: true })} type="date" className="input input-bordered w-full" />
                            </div>
                        </div>
                         <div className="form-control w-full">
                            <label className="label font-bold">Teléfono</label>
                            <input {...register('telefono')} type="text" className="input input-bordered w-full" placeholder="900 000 000" />
                        </div>
                         <div className="form-control w-full">
                            <label className="label font-bold">Email</label>
                            <input {...register('email')} type="email" className="input input-bordered w-full" placeholder="cliente@email.com" />
                        </div>
                        <div className="form-control w-full">
                            <label className="label font-bold">Dirección</label>
                            <input {...register('direccion', { required: true })} type="text" className="input input-bordered w-full" />
                        </div>
                    </div>

                    {/* COLUMNA DER: INTERÉS INMOBILIARIO */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-base-content/60 uppercase text-sm border-b border-base-300 pb-2">Interés Inmobiliario (Opcional)</h4>
                        
                        <div className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm">
                            <div className="form-control w-full mb-4">
                                <label className="label font-bold">Jalar Propiedad</label>
                                <select {...register('propiedadId')} className="select select-bordered w-full">
                                    <option value="">-- Seleccione Propiedad --</option>
                                    {propiedades.map(p => (
                                        <option key={p.id} value={p.id}>{p.direccion}</option>
                                    ))}
                                </select>
                            </div>

                            {/* DETALLES AUTOMÁTICOS DE LA PROPIEDAD */}
                            {propiedadSeleccionada && (
                                <div className="alert alert-info mb-4">
                                    <div className="text-sm space-y-1">
                                        <p><span className="font-bold">Dirección:</span> {propiedadSeleccionada.direccion}</p>
                                        <p><span className="font-bold">Precio:</span> {propiedadSeleccionada.moneda} {propiedadSeleccionada.precio}</p>
                                        <p><span className="font-bold">Operación:</span> {propiedadSeleccionada.modalidad}</p>
                                        <p><span className="font-bold">Tipo:</span> {propiedadSeleccionada.tipo}</p>
                                        <p><span className="font-bold">Asesor Encargado:</span> {propiedadSeleccionada.asesor || 'No asignado'}</p>
                                    </div>
                                </div>
                            )}

                            <div className="form-control w-full mb-2">
                                <label className="label font-bold">Asesor del Cliente</label>
                                <input {...register('asesorCliente')} type="text" className="input input-bordered w-full" placeholder="Quién atiende al cliente" />
                            </div>

                            <div className="form-control w-full">
                                <label className="label font-bold">Observaciones</label>
                                <textarea {...register('observaciones')} className="textarea textarea-bordered w-full h-20" placeholder="Notas sobre el interés..." />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 pt-4 border-t border-base-300 flex justify-end gap-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancelar</button>
                        <button type="submit" className="btn btn-primary px-12"><FaSave className="mr-2"/> Guardar Cliente</button>
                    </div>
                </form>
             </div>
          </div>
        )}

        {/* MODAL DE DETALLE (EL "OJITO") - MEJORADO */}
        {isDetailOpen && selectedCliente && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-base-100 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    
                    {/* Header del Modal */}
                    <div className="bg-neutral text-neutral-content p-6 flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="avatar placeholder">
                                <div className="bg-success text-success-content rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                                    {selectedCliente.nombre.charAt(0)}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{selectedCliente.nombre}</h2>
                                <p className="opacity-80 text-sm flex items-center gap-2 font-mono"><FaIdCard/> {selectedCliente.dni}</p>
                            </div>
                        </div>
                        <button onClick={() => setDetailOpen(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
                    </div>

                    <div className="p-8 space-y-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Datos Personales Completos */}
                            <div className="bg-base-200 p-6 rounded-xl">
                                <h3 className="font-bold uppercase text-sm mb-4 flex items-center gap-2 text-primary">
                                    <FaUser /> Datos Personales
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <FaPhone className="text-success text-xl mt-1"/>
                                        <div>
                                            <p className="text-xs font-bold text-base-content/60 uppercase">Teléfono</p>
                                            <p className="font-semibold text-lg">{selectedCliente.telefono || 'No registrado'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <FaEnvelope className="text-info text-xl mt-1"/>
                                        <div>
                                            <p className="text-xs font-bold text-base-content/60 uppercase">Email</p>
                                            <p className="font-semibold">{selectedCliente.email || 'No registrado'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <FaMapMarkerAlt className="text-error text-xl mt-1"/>
                                        <div>
                                            <p className="text-xs font-bold text-base-content/60 uppercase">Dirección</p>
                                            <p className="font-semibold">{selectedCliente.direccion}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <FaBirthdayCake className="text-warning text-xl mt-1"/>
                                        <div>
                                            <p className="text-xs font-bold text-base-content/60 uppercase">Fecha de Nacimiento</p>
                                            <p className="font-semibold">
                                                {selectedCliente.fechaNacimiento 
                                                  ? new Date(selectedCliente.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                                                  : 'No registrada'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles del Interés Principal */}
                            <div className="bg-base-200 p-6 rounded-xl">
                                <h3 className="font-bold uppercase text-sm mb-4 flex items-center gap-2 text-primary">
                                    <FaHome /> Interés Inmobiliario Principal
                                </h3>
                                {interesPrincipal && interesPrincipal.Propiedad ? (
                                    <div className="space-y-4">
                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <p className="text-xs font-bold text-base-content/60 uppercase mb-2">Propiedad Seleccionada</p>
                                            <p className="font-bold text-lg flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-error"/> {interesPrincipal.Propiedad.direccion}
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="bg-base-100 p-3 rounded-lg">
                                                <p className="text-xs text-base-content/60 font-bold">Precio</p>
                                                <p className="font-bold">{interesPrincipal.Propiedad.moneda} {interesPrincipal.Propiedad.precio}</p>
                                            </div>
                                            <div className="bg-base-100 p-3 rounded-lg">
                                                <p className="text-xs text-base-content/60 font-bold">Operación</p>
                                                <p className="font-bold">{interesPrincipal.Propiedad.modalidad}</p>
                                            </div>
                                            <div className="bg-base-100 p-3 rounded-lg">
                                                <p className="text-xs text-base-content/60 font-bold">Tipo</p>
                                                <p className="font-bold">{interesPrincipal.Propiedad.tipo}</p>
                                            </div>
                                            <div className="bg-base-100 p-3 rounded-lg">
                                                <p className="text-xs text-base-content/60 font-bold">Asesor Prop</p>
                                                <p className="font-bold">{interesPrincipal.Propiedad.asesor || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-base-100 p-4 rounded-lg">
                                            <p className="text-xs font-bold text-base-content/60 uppercase mb-2 flex items-center gap-1"><FaUserTie/> Asesor del Cliente</p>
                                            <p className="font-bold text-lg">{asesorClienteGuardado}</p>
                                        </div>

                                        {observacionesGuardadas && (
                                            <div className="bg-base-100 p-4 rounded-lg">
                                                <p className="text-xs font-bold text-base-content/60 uppercase mb-2 flex items-center gap-1"><FaStickyNote/> Observaciones</p>
                                                <p className="text-sm italic">{observacionesGuardadas}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="alert">
                                        <p className="text-sm">No hay un interés principal registrado.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Historial de Intereses */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FaHeart className="text-error"/> Historial de Intereses ({interesesDelCliente.length})
                            </h3>
                            {interesesDelCliente.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {interesesDelCliente.map((int:any) => (
                                        <div key={int.id} className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold flex items-center gap-2"><FaHome className="text-primary"/> {int.Propiedad?.direccion || 'Propiedad'}</span>
                                                    <span className={`badge ${int.estado === 'Nuevo' ? 'badge-primary' : 'badge-ghost'} badge-sm`}>{int.estado}</span>
                                                </div>
                                                <p className="text-xs text-base-content/60">{new Date(int.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-base-content/60 italic text-sm">No ha registrado intereses aún.</p>}
                        </div>

                        {/* Historial de Visitas */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FaWalking className="text-info"/> Historial de Visitas ({visitasDelCliente.length})
                            </h3>
                            {visitasDelCliente.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {visitasDelCliente.map((vis:any) => (
                                        <div key={vis.id} className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-bold flex items-center gap-2"><FaMapMarkerAlt className="text-error"/> {vis.Propiedad?.direccion}</span>
                                                        <span className="text-xs text-base-content/60">{vis.fecha} - {vis.hora}</span>
                                                    </div>
                                                    <span className={`badge ${vis.resultado === 'Listo para comprar' ? 'badge-success' : 'badge-ghost'} badge-sm`}>
                                                        {vis.resultado}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-base-content/60 italic text-sm">No ha realizado visitas físicas.</p>}
                        </div>

                    </div>

                    <div className="bg-base-200 p-4 flex justify-end border-t border-base-300">
                        <button onClick={() => setDetailOpen(false)} className="btn btn-primary px-6">Cerrar Ficha</button>
                    </div>

                </div>
            </div>
        )}

      </main>
    </div>
  );
}