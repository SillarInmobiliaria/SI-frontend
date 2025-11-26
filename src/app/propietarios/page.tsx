'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createPropietario } from '../../services/api';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import { 
  FaUser, FaIdCard, FaMapMarkerAlt, FaEnvelope, FaSave, 
  FaBuilding, FaCreditCard, FaSearch, FaEye, FaHome, FaBirthdayCake 
} from 'react-icons/fa';

interface FormPropietario {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  email: string;
  banco: string;
  cuenta: string;
  cci: string;
}

export default function PropietariosPage() {
  const { propietarios, fetchPropietarios, propiedades, fetchPropiedades, loading } = useInmobiliariaStore();
  const [isModalOpen, setModalOpen] = useState(false);
  
  // Estado para el modal de "Ver Detalle"
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedPropietario, setSelectedPropietario] = useState<any>(null);

  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm<FormPropietario>();

  useEffect(() => {
    fetchPropietarios();
    fetchPropiedades(); 
  }, []);

  const onSubmit = async (data: FormPropietario) => {
    try {
      await createPropietario(data);
      await fetchPropietarios();
      setModalOpen(false);
      reset();
      alert('✅ Propietario registrado con éxito');
    } catch (error) {
      alert('❌ Error al registrar');
    }
  };

  const handleViewDetail = (propietario: any) => {
    setSelectedPropietario(propietario);
    setDetailOpen(true);
  };

  const filteredPropietarios = propietarios.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.dni.includes(searchTerm)
  );

  const propiedadesDelDueño = selectedPropietario 
    ? propiedades.filter(prop => prop.propietarioId === selectedPropietario.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <main className="container mx-auto p-6 max-w-7xl">
        
        {/* CABECERA CON BUSCADOR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Gestión de Propietarios</h1>
            <p className="text-gray-500 mt-1">Administra la información de tus clientes vendedores.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por Nombre o DNI..." 
                className="input input-bordered w-full pl-10 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              onClick={() => setModalOpen(true)} 
              className="btn btn-primary shadow-lg border-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6"
            >
              + Nuevo
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="py-4 pl-6">Nombre</th>
                  <th>Documento</th>
                  <th>Contacto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8">Cargando datos...</td></tr>
                ) : filteredPropietarios.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No se encontraron propietarios.</td></tr>
                ) : filteredPropietarios.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="pl-6 py-4">
                      <div className="font-bold text-gray-900 text-lg">{p.nombre}</div>
                      <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">PROPIETARIO</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-lg w-fit border border-gray-200">
                        <FaIdCard className="text-gray-400"/> {p.dni}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm flex items-center gap-2 text-gray-600">
                          <FaEnvelope className="text-blue-400 text-xs"/> {p.email || 'Sin correo'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-red-400 text-xs"/> {p.direccion}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetail(p)}
                        className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-100 tooltip"
                        data-tip="Ver información completa"
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

        {/* --- MODAL DE REGISTRO (ANCHO Y COMPLETO) --- */}
        {/* Usamos un div manual para el modal en lugar del componente <Modal> para tener control total del ancho */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
              
              {/* Encabezado */}
              <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                <h3 className="font-bold text-2xl flex items-center gap-3">
                  <FaUser className="text-blue-300"/> Registrar Nuevo Propietario
                </h3>
                <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20">✕</button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* COLUMNA IZQ: DATOS PERSONALES */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Información Personal</h4>
                    
                    <div className="form-control w-full">
                      <label className="label font-bold text-gray-700">Nombre Completo</label>
                      <input {...register('nombre', { required: true })} type="text" className="input input-bordered w-full bg-gray-50 focus:bg-white" placeholder="Ej: Juan Pérez" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control w-full">
                            <label className="label font-bold text-gray-700">DNI</label>
                            <div className="relative">
                                <FaIdCard className="absolute left-3 top-3.5 text-gray-400" />
                                <input 
                                    {...register('dni', { required: true, minLength: 8, maxLength: 8 })} 
                                    type="text" 
                                    className="input input-bordered w-full pl-10 font-mono bg-gray-50 focus:bg-white" 
                                    maxLength={8}
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }}
                                />
                            </div>
                        </div>
                        <div className="form-control w-full">
                            <label className="label font-bold text-gray-700">Nacimiento</label>
                            <input {...register('fechaNacimiento', { required: true })} type="date" className="input input-bordered w-full bg-gray-50 focus:bg-white" />
                        </div>
                    </div>

                    <div className="form-control w-full">
                      <label className="label font-bold text-gray-700">Dirección</label>
                      <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                          <input {...register('direccion', { required: true })} type="text" className="input input-bordered w-full pl-10 bg-gray-50 focus:bg-white" placeholder="Av. Ejército 123" />
                      </div>
                    </div>
                    
                    <div className="form-control w-full">
                      <label className="label font-bold text-gray-700">Correo Electrónico</label>
                      <div className="relative">
                          <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                          <input {...register('email')} type="email" className="input input-bordered w-full pl-10 bg-gray-50 focus:bg-white" placeholder="juan@gmail.com" />
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA DER: DATOS BANCARIOS */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Datos Financieros</h4>
                    
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <div className="form-control w-full mb-4">
                          <label className="label font-bold text-blue-900">Banco</label>
                          <select {...register('banco')} className="select select-bordered w-full bg-white">
                            <option value="">Seleccione Banco...</option>
                            <option value="BCP">BCP</option>
                            <option value="Interbank">Interbank</option>
                            <option value="BBVA">BBVA</option>
                            <option value="Scotiabank">Scotiabank</option>
                            <option value="Banco de la Nación">Banco de la Nación</option>
                            <option value="Caja Arequipa">Caja Arequipa</option>
                          </select>
                        </div>

                        <div className="form-control w-full mb-4">
                          <label className="label font-bold text-blue-900">Número de Cuenta</label>
                          <div className="relative">
                              <FaCreditCard className="absolute left-3 top-3.5 text-blue-300" />
                              <input {...register('cuenta')} type="text" className="input input-bordered w-full pl-10 font-mono bg-white" placeholder="000-00000000-00" />
                          </div>
                        </div>

                        <div className="form-control w-full">
                          <label className="label font-bold text-blue-900">Código Interbancario (CCI)</label>
                          <input {...register('cci')} type="text" className="input input-bordered w-full font-mono bg-white" placeholder="002-000-000000000000-00" />
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2 text-xs text-gray-400 mt-2 p-2">
                      <FaUser className="mt-0.5"/>
                      <span>Estos datos se utilizarán exclusivamente para procesar los pagos.</span>
                    </div>
                  </div>

                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                    <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost text-gray-500">Cancelar</button>
                    <button type="submit" className="btn btn-primary btn-lg px-12 shadow-xl bg-blue-900 border-none hover:bg-blue-800 text-white font-bold flex items-center gap-2">
                      <FaSave /> Guardar Registro
                    </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* --- MODAL DE DETALLE (VER INFO) --- */}
        {isDetailOpen && selectedPropietario && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                
                <div className="bg-gray-800 text-white p-6 flex justify-between items-start">
                   <div>
                      <h2 className="text-2xl font-bold">{selectedPropietario.nombre}</h2>
                      <p className="opacity-80 flex items-center gap-2 mt-1 text-sm"><FaIdCard/> {selectedPropietario.dni}</p>
                   </div>
                   <button onClick={() => setDetailOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20">✕</button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div>
                        <h3 className="text-blue-800 font-bold uppercase text-sm border-b pb-2 mb-3">Datos de Contacto</h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                            <li className="flex items-center gap-3"><FaEnvelope className="text-gray-400"/> {selectedPropietario.email || 'No registrado'}</li>
                            <li className="flex items-center gap-3"><FaMapMarkerAlt className="text-gray-400"/> {selectedPropietario.direccion}</li>
                            <li className="flex items-center gap-3"><FaBirthdayCake className="text-gray-400"/> {selectedPropietario.fechaNacimiento}</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-green-700 font-bold uppercase text-sm border-b pb-2 mb-3">Información Bancaria</h3>
                        {selectedPropietario.banco ? (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <p className="font-bold text-green-800 mb-1">{selectedPropietario.banco}</p>
                                <p className="font-mono text-xs text-gray-600 mb-1">Cta: {selectedPropietario.cuenta}</p>
                                <p className="font-mono text-xs text-gray-600">CCI: {selectedPropietario.cci}</p>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-sm">Sin datos bancarios.</p>
                        )}
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-purple-800 font-bold uppercase text-sm border-b pb-2 mb-3">Propiedades en Cartera ({propiedadesDelDueño.length})</h3>
                        
                        {propiedadesDelDueño.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {propiedadesDelDueño.map((prop: any) => (
                                    <div key={prop.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                                        <div className="bg-purple-100 p-2 rounded text-purple-600"><FaHome/></div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{prop.tipo} en {prop.ubicacion}</p>
                                            <p className="text-xs text-gray-500">{prop.direccion}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-sm">Este propietario no tiene inmuebles registrados aún.</p>
                        )}
                    </div>

                </div>

                <div className="bg-gray-50 p-4 flex justify-end">
                    <button onClick={() => setDetailOpen(false)} className="btn btn-ghost text-gray-600">Cerrar</button>
                </div>

             </div>
           </div> 
        )}

      </main>
    </div>
  );
}