'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useInmobiliariaStore } from '../../../store/useInmobiliariaStore';
import { createPropiedad, fetchUsuarios } from '../../../services/api';
import { 
  FaHome, FaImages, FaUserTie, FaSave, FaArrowLeft, 
  FaFileContract, FaCheckSquare, FaGlobe, FaLink, FaUserPlus, FaTrash, FaSearch 
} from 'react-icons/fa';
import Link from 'next/link';

const UBICACIONES = [
  "Arequipa", "Yanahuara", "Cayma", "Cerro Colorado", "Jose Luis Bustamante y Rivero",
  "Sachaca", "Miraflores", "Mariano Melgar", "Paucarpata", "Socabaya", "Jacobo Hunter",
  "Alto Selva Alegre", "Tiabaya", "Uchumayo", "Characato", "Sabandía", "Mollebaya",
  "Yura", "La Joya", "Mollendo", "Camaná", "Mejía", "Pedregal"
];

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const { propietarios, fetchPropietarios } = useInmobiliariaStore();
  const { register, handleSubmit, watch, setValue } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [currentOwnerId, setCurrentOwnerId] = useState("");
  
  // --- ESTADOS PARA EL BUSCADOR DE ASESORES ---
  const [listaAsesores, setListaAsesores] = useState<any[]>([]);
  const [busquedaAsesor, setBusquedaAsesor] = useState('');
  const [asesorSeleccionado, setAsesorSeleccionado] = useState<any>(null);
  const [mostrarListaAsesores, setMostrarListaAsesores] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // --- LÓGICA CONDICIONAL ---
  const tipoSeleccionado = watch('tipo');
  const esDepartamento = tipoSeleccionado === 'Departamento'; 

  useEffect(() => { 
      fetchPropietarios(); 
      cargarAsesores();
  }, []);

  const cargarAsesores = async () => {
      try {
          const users = await fetchUsuarios();
          setListaAsesores(users);
      } catch (error) {
          console.error("Error cargando usuarios");
      }
  };

  const asesoresFiltrados = listaAsesores.filter(u => 
      u.nombre.toLowerCase().includes(busquedaAsesor.toLowerCase()) ||
      u.email.toLowerCase().includes(busquedaAsesor.toLowerCase())
  );

  const handleAddOwner = () => {
    if (currentOwnerId && !selectedOwners.includes(currentOwnerId)) {
      setSelectedOwners([...selectedOwners, currentOwnerId]);
      setCurrentOwnerId(""); 
    }
  };

  const handleRemoveOwner = (id: string) => {
    setSelectedOwners(selectedOwners.filter(ownerId => ownerId !== id));
  };

  const onSubmit = async (data: any) => {
    // 1. VALIDAR PROPIETARIOS
    if (selectedOwners.length === 0) {
      alert("⚠️ Debes asignar al menos un propietario.");
      return;
    }

    // 2. VALIDAR ASESOR (CANDADO DE SEGURIDAD 🔒)
    // Si escribió algo en el buscador...
    if (busquedaAsesor.trim()) {
        // Buscamos si existe EXACTAMENTE ese nombre en la lista (ignorando mayúsculas/minúsculas)
        const existe = listaAsesores.find(a => a.nombre.toLowerCase() === busquedaAsesor.trim().toLowerCase());
        
        // Si no seleccionó a nadie del dropdown Y el texto no coincide con nadie real
        if (!asesorSeleccionado && !existe) {
            alert("⚠️ El asesor escrito NO EXISTE en el sistema.\nPor favor selecciona uno válido de la lista desplegable.");
            return; // ¡DETENEMOS TODO AQUÍ!
        }
    }
    
    setLoading(true);
    try {
      const formData = new FormData();

      // Datos Texto
      formData.append('tipo', data.tipo);
      formData.append('modalidad', data.modalidad);
      formData.append('ubicacion', data.ubicacion);
      formData.append('direccion', data.direccion);
      formData.append('precio', data.precio);
      formData.append('area', data.area);
      formData.append('areaConstruida', data.areaConstruida);
      formData.append('habitaciones', data.habitaciones);
      formData.append('banos', data.banos);
      formData.append('cocheras', data.cocheras);
      formData.append('descripcion', data.descripcion);
      formData.append('distribucion', data.distribucion);

      formData.append('propietarios', JSON.stringify(selectedOwners));

      // Legal
      formData.append('fechaCaptacion', data.fechaCaptacion);
      formData.append('comision', data.comision);
      formData.append('tipoContrato', data.tipoContrato);
      
      // GUARDAR ASESOR VALIDADO
      if (asesorSeleccionado) {
          formData.append('asesor', asesorSeleccionado.nombre);
      } else if (busquedaAsesor) {
          formData.append('asesor', busquedaAsesor); // Aquí ya sabemos que es válido por la validación de arriba
      }
      
      // PARTIDA PRINCIPAL (SIEMPRE SE ENVÍA)
      if(data.partidaRegistral) formData.append('partidaRegistral', data.partidaRegistral);
      
      // SOLO SI ES DEPARTAMENTO SE ENVÍAN ESTOS 3
      if (esDepartamento) {
          if(data.numeroPartida) formData.append('numeroPartida', data.numeroPartida);
          if(data.partidaEstacionamiento) formData.append('partidaEstacionamiento', data.partidaEstacionamiento);
          if(data.partidaDeposito) formData.append('partidaDeposito', data.partidaDeposito);
      }

      if(data.fechaInicioContrato) formData.append('fechaInicioContrato', data.fechaInicioContrato);
      if(data.fechaVencimientoContrato) formData.append('fechaVencimientoContrato', data.fechaVencimientoContrato);

      const links = [data.link1, data.link2, data.link3, data.link4, data.link5].filter(l => l);
      formData.append('plataforma', JSON.stringify(links));

      ['testimonio', 'hr', 'pu', 'impuestoPredial', 'arbitrios', 'copiaLiteral'].forEach(field => {
          formData.append(field, data[field] ? 'true' : 'false');
      });

      // Archivos (Con validación de existencia)
      if(data.fotoPrincipal && data.fotoPrincipal.length > 0) formData.append('fotoPrincipal', data.fotoPrincipal[0]);
      if(data.pdf && data.pdf.length > 0) formData.append('pdf', data.pdf[0]);
      if(data.galeria && data.galeria.length > 0) {
        for (let i = 0; i < data.galeria.length; i++) formData.append('galeria', data.galeria[i]);
      }
      if(data.mapaUrl) formData.append('mapaUrl', data.mapaUrl);
      if(data.videoUrl) formData.append('videoUrl', data.videoUrl);

      await createPropiedad(formData);
      alert('✅ Propiedad creada con éxito');
      router.push('/propiedades');
    } catch (error) {
      console.error(error);
      alert('❌ Error al crear');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-12">
      <Navbar />
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/propiedades" className="btn btn-circle btn-ghost"><FaArrowLeft /></Link>
            <h1 className="text-3xl font-bold text-primary">Ficha de Captación de Inmueble</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* 1. PROPIETARIOS */}
          <div className="card bg-base-100 shadow-xl border-t-4 border-primary">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 mb-4"><FaUserTie className="text-primary"/> Propietarios (Captación)</h2>
              <div className="flex gap-4 items-end">
                <div className="form-control w-full">
                    <label className="label font-bold">Buscar y Seleccionar Propietario</label>
                    <select className="select select-bordered w-full" value={currentOwnerId} onChange={(e) => setCurrentOwnerId(e.target.value)}>
                        <option value="">-- Seleccione --</option>
                        {propietarios.map(p => (<option key={p.id} value={p.id}>{p.nombre} ({p.dni})</option>))}
                    </select>
                </div>
                <button type="button" onClick={handleAddOwner} className="btn btn-primary"><FaUserPlus/> Agregar</button>
              </div>
              <div className="mt-4 space-y-2">
                {selectedOwners.map(id => {
                    const owner = propietarios.find(p => p.id === id);
                    return (
                        <div key={id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                            <span className="font-bold">{owner?.nombre}</span>
                            <button type="button" onClick={() => handleRemoveOwner(id)} className="btn btn-xs btn-error btn-circle text-white"><FaTrash/></button>
                        </div>
                    )
                })}
              </div>
            </div>
          </div>

          {/* 2. DATOS DEL INMUEBLE */}
          <div className="card bg-base-100 shadow-xl border-t-4 border-secondary">
             <div className="card-body">
                <h2 className="card-title mb-4"><FaHome className="text-secondary"/> Datos del Inmueble</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="form-control">
                        <label className="label font-bold">Tipo</label>
                        <select {...register('tipo')} className="select select-bordered">
                            <option value="Casa">Casa</option>
                            <option value="Departamento">Departamento</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Local">Local</option>
                        </select>
                    </div>
                    <div className="form-control"><label className="label font-bold">Categoría</label><select {...register('modalidad')} className="select select-bordered"><option value="Venta">Venta</option><option value="Alquiler">Alquiler</option></select></div>
                    <div className="form-control"><label className="label font-bold">Ubicación</label><select {...register('ubicacion')} className="select select-bordered">{UBICACIONES.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
                </div>
                <div className="form-control mt-4"><label className="label font-bold">Dirección</label><input {...register('direccion')} className="input input-bordered" /></div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="form-control"><label className="label font-bold">Precio ($)</label><input {...register('precio')} type="number" className="input input-bordered" /></div>
                    <div className="form-control"><label className="label font-bold">Área T.</label><input {...register('area')} type="number" className="input input-bordered" /></div>
                    <div className="form-control"><label className="label font-bold">Área C.</label><input {...register('areaConstruida')} type="number" className="input input-bordered" /></div>
                </div>
             </div>
          </div>

           {/* 3. CARACTERÍSTICAS */}
           <div className="card bg-base-100 shadow-xl border-t-4 border-accent">
             <div className="card-body">
               <h2 className="card-title flex items-center gap-2 mb-4">📝 Detalles</h2>
               <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="form-control"><label className="label font-bold text-center">🛏️ Dorm</label><input {...register('habitaciones')} type="number" className="input input-bordered text-center" defaultValue={0} /></div>
                  <div className="form-control"><label className="label font-bold text-center">🚿 Baños</label><input {...register('banos')} type="number" className="input input-bordered text-center" defaultValue={0} /></div>
                  <div className="form-control"><label className="label font-bold text-center">🚗 Coch</label><input {...register('cocheras')} type="number" className="input input-bordered text-center" defaultValue={0} /></div>
               </div>
               <div className="flex flex-col gap-6">
                  <div className="form-control w-full"><label className="label font-bold">Descripción</label><textarea {...register('descripcion')} className="textarea textarea-bordered h-24" /></div>
                  <div className="form-control w-full"><label className="label font-bold">Distribución</label><textarea {...register('distribucion')} className="textarea textarea-bordered h-24" /></div>
               </div>
             </div>
           </div>
          
          {/* 4. GESTIÓN LEGAL */}
          <div className="card bg-base-100 shadow-xl border-t-4 border-info">
              <div className="card-body">
                  <h2 className="card-title mb-4"><FaFileContract className="text-info"/> Datos Legales</h2>
                  
                  {/* SIEMPRE VISIBLE */}
                  <div className="form-control mb-6">
                     <label className="label font-bold">Partida Registral (Principal)</label>
                     <textarea {...register('partidaRegistral')} className="textarea textarea-bordered w-full font-mono h-16" placeholder="N° Partida Principal..." />
                  </div>

                  {/* 👇 SOLO DEPARTAMENTO: 3 CAMPOS EXTRA 👇 */}
                  {esDepartamento && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-fade-in mb-6">
                        <h3 className="text-sm font-bold text-blue-800 mb-3">🏙️ Exclusivo Departamento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label font-bold text-blue-800 text-xs">N° Partida (Adicional)</label>
                                <input {...register('numeroPartida')} type="text" className="input input-bordered bg-white" placeholder="Opcional" />
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-blue-800 text-xs">N° Partida Estacionamiento</label>
                                <input {...register('partidaEstacionamiento')} type="text" className="input input-bordered bg-white" placeholder="Opcional" />
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-blue-800 text-xs">N° Partida Depósito</label>
                                <input {...register('partidaDeposito')} type="text" className="input input-bordered bg-white" placeholder="Opcional" />
                            </div>
                        </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="form-control"><label className="label font-bold">Fecha Captación</label><input {...register('fechaCaptacion')} type="date" className="input input-bordered w-full" defaultValue={today} /></div>
                      <div className="form-control"><label className="label font-bold">Inicio Contrato</label><input {...register('fechaInicioContrato')} type="date" className="input input-bordered w-full" /></div>
                      <div className="form-control"><label className="label font-bold">Vencimiento</label><input {...register('fechaVencimientoContrato')} type="date" className="input input-bordered w-full" /></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="form-control"><label className="label font-bold">Tipo Contrato</label><select {...register('tipoContrato')} className="select select-bordered w-full"><option>Sin Exclusiva</option><option>Con Exclusiva</option></select></div>
                      <div className="form-control">
                          <label className="label font-bold">Comisión (%)</label>
                          <input {...register('comision')} type="number" step="0.1" className="input input-bordered w-full" placeholder="Ej: 3" />
                      </div>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg mb-6">
                      <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><FaCheckSquare/> Docs en Regla</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <label className="cursor-pointer label justify-start gap-2"><input type="checkbox" {...register('testimonio')} className="checkbox checkbox-sm" /> <span className="label-text">Testimonio</span></label>
                         <label className="cursor-pointer label justify-start gap-2"><input type="checkbox" {...register('hr')} className="checkbox checkbox-sm" /> <span className="label-text">HR</span></label>
                         <label className="cursor-pointer label justify-start gap-2"><input type="checkbox" {...register('pu')} className="checkbox checkbox-sm" /> <span className="label-text">PU</span></label>
                         <label className="cursor-pointer label justify-start gap-2"><input type="checkbox" {...register('impuestoPredial')} className="checkbox checkbox-sm" /> <span className="label-text">Predial</span></label>
                         <label className="cursor-pointer label justify-start gap-2"><input type="checkbox" {...register('arbitrios')} className="checkbox checkbox-sm" /> <span className="label-text">Arbitrios</span></label>
                         <label className="cursor-pointer label justify-start gap-2"><input type="checkbox" {...register('copiaLiteral')} className="checkbox checkbox-sm" /> <span className="label-text">Copia Literal</span></label>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="label font-bold flex items-center gap-2"><FaGlobe className="text-info"/> Links</label>
                        {[1,2,3].map(i => (<input key={i} {...register(`link${i}`)} type="text" className="input input-bordered w-full" placeholder={`Link ${i}`} />))}
                      </div>
                      
                      {/* 👇 BUSCADOR DE ASESOR VALIDADO 👇 */}
                      <div className="form-control relative">
                        <label className="label font-bold">Asesor Encargado <span className="text-error">*</span></label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3.5 text-gray-400"/>
                            <input 
                                type="text"
                                className="input input-bordered w-full pl-10"
                                placeholder="Escribe para buscar..."
                                value={busquedaAsesor}
                                onChange={(e) => {
                                    setBusquedaAsesor(e.target.value);
                                    setMostrarListaAsesores(true);
                                    setAsesorSeleccionado(null); // Al editar, se pierde la selección segura
                                }}
                                onFocus={() => setMostrarListaAsesores(true)}
                            />
                        </div>
                        {asesorSeleccionado && <div className="text-xs text-green-600 mt-1 font-bold">✅ Asignado correctamente: {asesorSeleccionado.nombre}</div>}
                        
                        {mostrarListaAsesores && busquedaAsesor && !asesorSeleccionado && (
                            <div className="absolute top-20 z-50 w-full bg-base-100 shadow-xl border rounded-lg max-h-40 overflow-y-auto">
                                {asesoresFiltrados.map((asesor) => (
                                    <div 
                                        key={asesor.id}
                                        className="p-2 hover:bg-base-200 cursor-pointer border-b text-sm"
                                        onClick={() => {
                                            setAsesorSeleccionado(asesor);
                                            setBusquedaAsesor(asesor.nombre);
                                            setMostrarListaAsesores(false);
                                        }}
                                    >
                                        <p className="font-bold">{asesor.nombre}</p>
                                        <p className="text-xs opacity-70">{asesor.email}</p>
                                    </div>
                                ))}
                                {asesoresFiltrados.length === 0 && <div className="p-2 text-center text-xs opacity-50 text-error">No encontrado</div>}
                            </div>
                        )}
                      </div>
                  </div>
              </div>
          </div>

          {/* 5. MULTIMEDIA */}
          <div className="card bg-base-100 shadow-xl border-t-4 border-warning">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 mb-4"><FaImages className="text-warning" /> Multimedia</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label font-bold">Foto Principal</label>
                    <input {...register('fotoPrincipal')} type="file" accept="image/*" className="file-input file-input-bordered file-input-primary w-full" />
                </div>
                
                <div className="form-control">
                    <label className="label font-bold">Galería</label>
                    <input {...register('galeria')} type="file" multiple accept="image/*" className="file-input file-input-bordered file-input-secondary w-full" />
                </div>

                {/* 👇 PDF RECUPERADO 👇 */}
                <div className="form-control md:col-span-2">
                    <label className="label font-bold">Ficha Técnica (PDF)</label>
                    <input {...register('pdf')} type="file" accept=".pdf" className="file-input file-input-bordered file-input-error w-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="form-control"><label className="label font-bold">Video URL</label><input {...register('videoUrl')} type="text" className="input input-bordered w-full" /></div>
                <div className="form-control"><label className="label font-bold">Mapa Iframe</label><input {...register('mapaUrl')} type="text" className="input input-bordered w-full" /></div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6">
            <Link href="/propiedades" className="btn btn-lg btn-ghost">Cancelar</Link>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg px-10"><FaSave/> Guardar Ficha</button>
          </div>
        </form>
      </div>
    </div>
  );
}