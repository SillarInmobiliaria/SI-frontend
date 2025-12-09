'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createPropietario } from '../../services/api';
import Navbar from '../../components/Navbar';
import { 
  FaUser, FaIdCard, FaMapMarkerAlt, FaEnvelope, FaSave, 
  FaBuilding, FaCreditCard, FaSearch, FaEye, FaHome, FaBirthdayCake, 
  FaPhone, FaCalendarCheck, FaUserTie, FaStickyNote, FaExternalLinkAlt
} from 'react-icons/fa';
import Link from 'next/link';

interface FormPropietario {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  email: string;
  celular1: string;
  celular2: string;
  asesor: string;
  fechaAlta: string;
  detalles: string;
  banco: string;
  cuenta: string;
  cci: string;
}

export default function PropietariosPage() {
  const { propietarios, fetchPropietarios, propiedades, fetchPropiedades, loading } = useInmobiliariaStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedPropietario, setSelectedPropietario] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm<FormPropietario>();
  const today = new Date().toISOString().split('T')[0];

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
      console.error(error);
      alert('❌ Error al registrar (Verifica que el DNI no esté duplicado)');
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
    ? propiedades.filter(prop => {
        const estaEnArray = prop.Propietarios?.some(owner => owner.id === selectedPropietario.id);
        // @ts-ignore
        const esDuenioDirecto = prop.propietarioId === selectedPropietario.id;
        return estaEnArray || esDuenioDirecto;
    })
    : [];

  // 👇 VALIDACIÓN: Solo permite números
  const handleNumberInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <main className="container mx-auto p-6 max-w-7xl">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Gestión de Propietarios</h1>
            <p className="text-gray-500 mt-1">Base de datos de vendedores y sus inmuebles.</p>
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
            <button onClick={() => setModalOpen(true)} className="btn btn-primary shadow-lg border-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6">+ Nuevo</button>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="py-4 pl-6">Nombre</th>
                  <th>Celular</th>
                  <th>Asesor</th>
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
                    <td><div className="flex items-center gap-2 font-bold text-gray-700"><FaPhone className="text-green-500"/> {p.celular1}</div></td>
                    <td><div className="flex items-center gap-2 text-sm text-gray-600"><FaUserTie className="text-purple-500"/> {p.asesor || 'Sin asignar'}</div></td>
                    <td>
                      <button onClick={() => handleViewDetail(p)} className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-100 tooltip" data-tip="Ver Ficha Completa"><FaEye className="text-lg" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE REGISTRO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                <h3 className="font-bold text-2xl flex items-center gap-3"><FaUser className="text-blue-300"/> Registrar Nuevo Propietario</h3>
                <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20">✕</button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* COLUMNA IZQ */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Información Personal</h4>
                    
                    <div className="form-control w-full">
                        <label className="label font-bold text-gray-700">Nombre Completo</label>
                        <input {...register('nombre', { required: true })} type="text" className="input input-bordered w-full bg-gray-50 focus:bg-white" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control w-full">
                            <label className="label font-bold text-gray-700">DNI (8 dígitos)</label>
                            {/* VALIDACIÓN DNI: MAX 8, SOLO NÚMEROS */}
                            <input {...register('dni', { required: true, minLength: 8, maxLength: 8 })} type="text" className="input input-bordered w-full font-mono" maxLength={8} onInput={handleNumberInput} placeholder="Ej: 12345678" />
                        </div>
                        <div className="form-control w-full">
                            <label className="label font-bold text-gray-700">F. Nacimiento</label>
                            <input {...register('fechaNacimiento', { required: true })} type="date" className="input input-bordered w-full bg-gray-50 focus:bg-white" max={today} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control w-full">
                            <label className="label font-bold text-gray-700">Celular 1 (9 dígitos)</label>
                            {/* VALIDACIÓN CELULAR: MAX 9, SOLO NÚMEROS */}
                            <input {...register('celular1', { required: true, minLength: 9, maxLength: 9 })} type="text" className="input input-bordered w-full" placeholder="999999999" maxLength={9} onInput={handleNumberInput} />
                        </div>
                        <div className="form-control w-full">
                            <label className="label font-bold text-gray-700">Celular 2 (Opcional)</label>
                            <input {...register('celular2')} type="text" className="input input-bordered w-full" placeholder="999999999" maxLength={9} onInput={handleNumberInput} />
                        </div>
                    </div>
                    
                    <div className="form-control w-full"><label className="label font-bold text-gray-700">Dirección</label><input {...register('direccion', { required: true })} type="text" className="input input-bordered w-full pl-10 bg-gray-50 focus:bg-white" /></div>
                    <div className="form-control w-full"><label className="label font-bold text-gray-700">Email</label><input {...register('email')} type="email" className="input input-bordered w-full pl-10 bg-gray-50 focus:bg-white" /></div>
                  </div>
                  
                  {/* COLUMNA DER */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Gestión Interna</h4>
                        <div className="grid grid-cols-2 gap-4"><div className="form-control w-full"><label className="label font-bold text-gray-700">Fecha de Alta</label><input {...register('fechaAlta')} type="date" className="input input-bordered w-full" defaultValue={today} max={today} /></div><div className="form-control w-full"><label className="label font-bold text-gray-700">Asesor (Captador)</label><input {...register('asesor')} type="text" className="input input-bordered w-full" placeholder="Quién trajo al cliente" /></div></div>
                        <div className="form-control w-full"><label className="label font-bold text-gray-700">Detalles / Notas</label><textarea {...register('detalles')} className="textarea textarea-bordered w-full h-20 resize-none" placeholder="Observaciones sobre el propietario..." /></div>
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest border-b border-blue-200 pb-2 mb-4">Datos Bancarios</h4>
                        <div className="form-control w-full"><label className="label font-bold text-blue-900">Banco</label><select {...register('banco')} className="select select-bordered w-full bg-white"><option value="">Seleccione Banco...</option><option value="BCP">BCP</option><option value="Interbank">Interbank</option><option value="BBVA">BBVA</option><option value="Scotiabank">Scotiabank</option><option value="Banco de la Nación">Banco de la Nación</option><option value="Caja Arequipa">Caja Arequipa</option></select></div>
                        <div className="grid grid-cols-2 gap-4"><div className="form-control w-full"><label className="label font-bold text-blue-900">N° Cuenta</label><input {...register('cuenta')} type="text" className="input input-bordered w-full font-mono bg-white" onInput={handleNumberInput} /></div><div className="form-control w-full"><label className="label font-bold text-blue-900">CCI</label><input {...register('cci')} type="text" className="input input-bordered w-full font-mono bg-white" onInput={handleNumberInput} /></div></div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4"><button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost text-gray-500">Cancelar</button><button type="submit" className="btn btn-primary btn-lg px-12 shadow-xl bg-blue-900 border-none hover:bg-blue-800 text-white font-bold flex items-center gap-2"><FaSave /> Guardar Registro</button></div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE DETALLE (EL OJITO) */}
        {isDetailOpen && selectedPropietario && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
             <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                
                {/* HEADER */}
                <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 text-white p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex items-start gap-6">
                            <div className="avatar placeholder shadow-2xl">
                                <div className="bg-gradient-to-br from-orange-400 to-pink-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold border-4 border-white/20">
                                    {selectedPropietario.nombre.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{selectedPropietario.nombre}</h2>
                                <div className="flex flex-wrap gap-3 text-white/90 font-mono text-sm">
                                    <span className="bg-white/20 px-3 py-1 rounded-lg flex items-center gap-2"><FaIdCard/> {selectedPropietario.dni}</span>
                                    <span className="bg-white/20 px-3 py-1 rounded-lg flex items-center gap-2"><FaCalendarCheck/> Alta: {selectedPropietario.fechaAlta || 'No registrada'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setDetailOpen(false)} className="btn btn-circle btn-ghost text-white hover:bg-white/20">✕</button>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-blue-800 font-bold uppercase text-sm border-b pb-3 mb-4 flex items-center gap-2"><FaUser /> Datos de Contacto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                    <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Celular Principal</p><p className="font-bold text-gray-800 text-lg flex items-center gap-2"><FaPhone className="text-green-500"/> {selectedPropietario.celular1}</p></div>
                                    {selectedPropietario.celular2 && <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Celular Secundario</p><p className="font-medium text-gray-700 flex items-center gap-2"><FaPhone className="text-gray-400"/> {selectedPropietario.celular2}</p></div>}
                                    <div className="md:col-span-2"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Email</p><p className="font-medium text-gray-800 flex items-center gap-2"><FaEnvelope className="text-blue-500"/> {selectedPropietario.email || 'No registrado'}</p></div>
                                    <div className="md:col-span-2"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Dirección</p><p className="font-medium text-gray-800 flex items-start gap-2"><FaMapMarkerAlt className="text-red-500 mt-1"/> {selectedPropietario.direccion}</p></div>
                                    <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Fecha de Nacimiento</p><p className="font-medium text-gray-800 flex items-center gap-2"><FaBirthdayCake className="text-pink-500"/> {selectedPropietario.fechaNacimiento}</p></div>
                                </div>
                            </div>
                            {selectedPropietario.detalles && (<div className="mt-4 pt-4 border-t border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase mb-2"><FaStickyNote className="inline mr-1"/> Notas Internas</p><p className="text-sm italic bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800">{selectedPropietario.detalles}</p></div>)}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-purple-800 font-bold uppercase text-sm border-b pb-3 mb-4 flex items-center gap-2"><FaUserTie /> Gestión Interna</h3>
                                <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Asesor Captador</p><p className="font-bold text-purple-900 text-xl">{selectedPropietario.asesor || 'No especificado'}</p></div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-green-700 font-bold uppercase text-sm border-b pb-3 mb-4 flex items-center gap-2"><FaCreditCard /> Información Bancaria</h3>
                                {selectedPropietario.banco ? (
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-green-600 uppercase">Banco</span><span className="font-bold text-green-900 text-lg">{selectedPropietario.banco}</span></div>
                                        <div className="mb-2"><p className="text-xs text-green-600 font-bold uppercase">Cuenta</p><p className="font-mono text-sm bg-white px-2 py-1 rounded border border-green-200 tracking-wide">{selectedPropietario.cuenta}</p></div>
                                        <div><p className="text-xs text-green-600 font-bold uppercase">CCI</p><p className="font-mono text-sm bg-white px-2 py-1 rounded border border-green-200 tracking-wide">{selectedPropietario.cci}</p></div>
                                    </div>
                                ) : (<div className="bg-gray-100 p-4 rounded-lg text-center text-gray-400 italic text-sm">Sin datos bancarios registrados.</div>)}
                            </div>
                        </div>
                    </div>

                    {/* PROPIEDADES EN CARTERA */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-gray-800 font-bold uppercase text-sm border-b pb-3 mb-4 flex items-center gap-2"><FaHome /> Propiedades en Cartera ({propiedadesDelDueño.length})</h3>
                        {propiedadesDelDueño.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {propiedadesDelDueño.map((prop: any) => (
                                    <Link href={`/propiedades/${prop.id}`} key={prop.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><FaBuilding className="text-2xl" /></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{prop.tipo}</p>
                                                <span className="badge badge-sm badge-ghost">{prop.modalidad}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 truncate">{prop.direccion}</p>
                                            <p className="text-sm font-bold text-green-600 mt-1">$ {Number(prop.precio).toLocaleString()}</p>
                                            <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity"><FaExternalLinkAlt className="text-xs text-blue-400"/></div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <FaHome className="text-4xl text-gray-300 mx-auto mb-2"/>
                                <p className="text-gray-400 italic text-sm">Sin inmuebles registrados.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 p-6 flex justify-end border-t border-gray-100"><button onClick={() => setDetailOpen(false)} className="btn btn-primary btn-lg px-8 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-none">Cerrar Ficha</button></div>
             </div>
           </div> 
        )}

      </main>
    </div>
  );
}