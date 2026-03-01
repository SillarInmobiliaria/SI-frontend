'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { useInmobiliariaStore } from '../../../../store/useInmobiliariaStore';
import api from '../../../../services/api';

const API_BASE_URL = 'https://sillar-backend.onrender.com/api';

import { 
  FaHome, FaBed, FaBath, FaCar, FaImages, FaSave, FaArrowLeft, FaVideo, 
  FaUserTie, FaGavel, FaLink, FaSearch, FaMapMarkerAlt, 
  FaMagic, FaListUl, FaCheck, FaPercent
} from 'react-icons/fa';

interface FormInputs {
  tipo: string; modalidad: string; ubicacion: string; direccion: string;
  precio: string; moneda: string; area: string; areaConstruida: string;
  habitaciones: string; banos: string; cocheras: string; descripcion: string;
  detalles: string; partidaRegistral: string; partidaAdicional: string;
  partidaCochera: string; partidaDeposito: string; fechaCaptacion: string;
  inicioContrato: string; finContrato: string; tipoContrato: string;
  comision: string; testimonio: boolean; hr: boolean; pu: boolean;
  impuestoPredial: boolean; arbitrios: boolean; copiaLiteral: boolean;
  cri: boolean; reciboAguaLuz: boolean; observaciones: string;
  planos: boolean; certificadoParametros: boolean; 
  certificadoZonificacion: boolean; otros: boolean;
  videoUrl: string; mapaUrl: string; asesor: string;
  tieneMantenimiento: string; mantenimiento: string;
  exclusiva: string; renovable: string;
  link1: string; link2: string; link3: string; link4: string; link5: string;
}

const distritosArequipa = [
    "Alto Selva Alegre", "Arequipa (Centro)", "Cayma", "Cerro Colorado", "Characato", 
    "Chiguata", "Jacobo Hunter", "José Luis Bustamante y Rivero", "La Joya", "Mariano Melgar", 
    "Miraflores", "Mollebaya", "Paucarpata", "Quequeña", "Sabandía", "Sachaca", 
    "Socabaya", "Tiabaya", "Uchumayo", "Vítor", "Yanahuara", "Yura"
];

// Checkbox simple (sin subida de PDF para edición rápida)
const CustomDocCheckbox = ({ label, name, register, watch }: any) => {
    const isChecked = watch(name);
    return (
        <label className={`label cursor-pointer justify-start gap-4 p-4 rounded-xl transition-all border shadow-sm group w-full
            ${isChecked ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
          <input type="checkbox" {...register(name)} className="hidden" />
          <div className={`w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all
              ${isChecked ? 'border-blue-500 bg-white' : 'border-gray-300 bg-white group-hover:border-blue-300'}`}>
             <FaCheck className={`text-blue-600 text-sm transition-all transform ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
          </div>
          <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-blue-800 font-semibold' : 'text-gray-700'}`}>{label}</span>
        </label>
    );
};

export default function EditarPropiedadPage() {
  const router = useRouter();
  const { id } = useParams();
  const { fetchPropietarios } = useInmobiliariaStore();
  const { register, handleSubmit, watch, setValue } = useForm<FormInputs>();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [propietariosSeleccionados, setPropietariosSeleccionados] = useState<any[]>([]);
  const [asesoresDB, setAsesoresDB] = useState<any[]>([]);
  const [busquedaAsesor, setBusquedaAsesor] = useState('');
  const [mostrarSugerenciasAsesor, setMostrarSugerenciasAsesor] = useState(false);
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');
  const [mostrarSugerenciasUbi, setMostrarSugerenciasUbi] = useState(false);

  const modalidadActual = watch('modalidad');
  const tipoInmueble = watch('tipo', '');
  const tieneMantenimiento = watch('tieneMantenimiento');
  const mostrarDistribucion = !tipoInmueble.toLowerCase().includes('terreno');

  useEffect(() => {
    const init = async () => {
        try {
            await fetchPropietarios();
            const token = localStorage.getItem('token');
            const resU = await fetch(`${API_BASE_URL}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } });
            const dataU = await resU.json();
            setAsesoresDB(dataU);

            const { data: p } = await api.get(`/propiedades/${id}`);
            
            // Cargar datos en el formulario
            Object.keys(p).forEach(key => {
                if(p[key] !== null && p[key] !== undefined) {
                    setValue(key as any, p[key]);
                }
            });

            // Formatear Fechas para el input type="date"
            if(p.inicioContrato) setValue('inicioContrato', p.inicioContrato.split('T')[0]);
            if(p.finContrato) setValue('finContrato', p.finContrato.split('T')[0]);
            if(p.fechaCaptacion) setValue('fechaCaptacion', p.fechaCaptacion.split('T')[0]);

            // Formatear Radio Buttons
            setValue('exclusiva', p.exclusiva ? 'si' : 'no');
            setValue('renovable', p.renovable ? 'si' : 'no');
            setValue('tieneMantenimiento', Number(p.mantenimiento) > 0 ? 'si' : 'no');

            setBusquedaUbicacion(p.ubicacion);
            setBusquedaAsesor(p.asesor || '');
            if(p.Propietarios) setPropietariosSeleccionados(p.Propietarios);
            
            setLoading(false);
        } catch (e) { router.back(); }
    };
    init();
  }, [id]);

  const handleGenerarIA = async () => {
    setGenerandoIA(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/ai/generar`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
            body: JSON.stringify(watch()) 
        });
        const data = await res.json();
        setValue('descripcion', data.descripcion);
    } catch (e) { alert("Error IA."); } finally { setGenerandoIA(false); }
  };

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    try {
        const { ...datosEnvio } = data as any;
        
        // Limpieza de datos antes de enviar
        if (data.tieneMantenimiento === 'no' || modalidadActual !== 'Alquiler') datosEnvio.mantenimiento = 0;
        datosEnvio.exclusiva = data.exclusiva === 'si';
        datosEnvio.renovable = data.renovable === 'si';

        // Evitar sobreescribir archivos e imágenes
        delete datosEnvio.fotoPrincipal;
        delete datosEnvio.galeria;
        delete datosEnvio.documentosUrls;
        delete datosEnvio.documentosurls;
        delete datosEnvio.Propietarios;

        await api.put(`/propiedades/${id}`, datosEnvio);
        alert('✅ PROPIEDAD ACTUALIZADA CON ÉXITO');
        router.push(`/propiedades/${id}`);
    } catch (e) { alert('❌ ERROR AL GUARDAR'); } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      <Navbar />
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <button type="button" onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm text-gray-500"><FaArrowLeft/></button>
                  <h1 className="text-xl font-bold text-indigo-900 uppercase">EDITAR PROPIEDAD</h1>
              </div>
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none shadow-md px-8 text-white font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                {isSubmitting ? 'GUARDANDO...' : <><FaSave className="mr-2"/> GUARDAR CAMBIOS</>}
              </button>
          </div>
      </div>

      <main className="container mx-auto px-6 max-w-5xl mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* 1. PROPIETARIOS (FIJOS) */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 font-mono"><FaUserTie className="text-indigo-600"/> 1. PROPIETARIOS (SOLO LECTURA)</h3>
                <div className="flex flex-wrap gap-2">
                    {propietariosSeleccionados.map(p => (
                        <div key={p.id} className="badge badge-lg p-4 bg-indigo-50 border-indigo-200 text-indigo-800 font-bold uppercase">{p.nombre}</div>
                    ))}
                </div>
            </div>

            {/* 2. DATOS INMUEBLE */}
            <div className="bg-white rounded-xl shadow-sm border p-8 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaHome className="text-indigo-500"/> 2. DATOS INMUEBLE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">TIPO</label>
                        <select {...register('tipo')} className="select select-bordered w-full bg-white">
                            <option value="Casa">Casa</option>
                            <option value="Departamento">Departamento</option>
                            <option value="Duplex">Duplex</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Terreno Urbano">Terreno Urbano</option>
                            <option value="Terreno Agricola">Terreno Agrícola</option>
                            <option value="Terreno Industrial">Terreno Industrial</option>
                            <option value="Local">Local Comercial</option>
                            <option value="Local Industrial">Local Industrial</option>
                            <option value="Oficina">Oficina</option>
                        </select>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">MODALIDAD</label>
                        <select {...register('modalidad')} className="select select-bordered w-full bg-white">
                            <option value="Venta">Venta</option>
                            <option value="Alquiler">Alquiler</option>
                            <option value="Anticresis">Anticresis</option>
                        </select>
                    </div>
                    <div className="form-control relative">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">DISTRITO</label>
                        <input type="text" className="input input-bordered w-full bg-white" value={busquedaUbicacion} onChange={(e) => { setBusquedaUbicacion(e.target.value); setMostrarSugerenciasUbi(true); }} onFocus={() => setMostrarSugerenciasUbi(true)}/>
                        {mostrarSugerenciasUbi && (
                            <div className="absolute top-full left-0 w-full bg-white border z-50 max-h-48 overflow-y-auto mt-1 rounded-b-lg shadow-xl">
                                {distritosArequipa.filter(d => d.toLowerCase().includes(busquedaUbicacion.toLowerCase())).map(d => (
                                    <div key={d} className="p-3 hover:bg-indigo-50 cursor-pointer text-xs uppercase font-bold" onClick={() => { setBusquedaUbicacion(d); setValue('ubicacion', d); setMostrarSugerenciasUbi(false); }}>{d}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="form-control mb-6"><label className="label font-bold text-gray-600 text-[10px] uppercase">Dirección Exacta</label><input {...register('direccion')} className="input input-bordered w-full bg-white"/></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Precio</label>
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <select {...register('moneda')} className="bg-gray-100 px-3 font-bold border-r border-gray-300 text-xs outline-none"><option value="USD">USD</option><option value="PEN">PEN</option></select>
                            <input type="number" step="0.01" {...register('precio')} className="input w-full bg-white font-bold border-none focus:outline-none"/>
                        </div>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Área Total (m²)</label><input type="number" step="0.01" {...register('area')} className="input input-bordered w-full bg-white"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Área Const. (m²)</label><input type="number" step="0.01" {...register('areaConstruida')} className="input input-bordered w-full bg-white"/></div>
                </div>

                {modalidadActual === 'Alquiler' && (
                    <div className="col-span-1 md:col-span-3 bg-blue-50 border border-blue-100 p-4 rounded-xl mt-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="form-control">
                                <label className="label font-bold text-gray-700 text-[10px] uppercase">¿Tiene Mantenimiento?</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('tieneMantenimiento')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">Sí</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('tieneMantenimiento')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">No</span></label>
                                </div>
                            </div>
                            {tieneMantenimiento === 'si' && (
                                <div className="form-control flex-1">
                                    <label className="label font-bold text-gray-700 text-[10px] uppercase">Costo de Mantenimiento (S/)</label>
                                    <input type="number" step="0.01" {...register('mantenimiento')} className="input input-bordered w-full bg-white font-bold"/>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. DISTRIBUCIÓN */}
            <div className="bg-white rounded-xl shadow-sm border p-8 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaBed className="text-orange-500"/> 3. DISTRIBUCIÓN</h3>
                
                {mostrarDistribucion && (
                    <div className="grid grid-cols-3 gap-6 mb-8 text-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Habitaciones</label><input type="number" {...register('habitaciones')} className="input input-bordered w-full text-center bg-white font-bold text-lg"/></div>
                        <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Baños</label><input type="number" {...register('banos')} className="input input-bordered w-full text-center bg-white font-bold text-lg"/></div>
                        <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Cocheras</label><input type="number" {...register('cocheras')} className="input input-bordered w-full text-center bg-white font-bold text-lg"/></div>
                    </div>
                )}
                
                <div className="form-control mb-6">
                    <div className="flex justify-between items-center mb-2"><label className="label font-bold text-gray-700 text-xs uppercase"><FaMagic className="text-purple-500 inline mr-2"/> Descripción Marketing</label>
                    <button type="button" onClick={handleGenerarIA} disabled={generandoIA} className="btn btn-xs bg-indigo-600 text-white border-none px-4 rounded-full">{generandoIA ? '...' : 'IA REDACTAR'}</button></div>
                    <textarea {...register('descripcion')} className="textarea textarea-bordered h-40 bg-white text-sm leading-relaxed"></textarea>
                </div>
                <div className="form-control"><label className="label font-bold text-gray-700 text-xs uppercase"><FaListUl className="text-blue-500 inline mr-2"/> Distribución Detallada</label><textarea {...register('detalles')} className="textarea textarea-bordered h-40 bg-white text-sm leading-relaxed"></textarea></div>
            </div>

            {/* 4. DATOS LEGALES */}
            <div className="bg-white rounded-xl shadow-sm border p-8 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaGavel className="text-blue-500"/> 4. DATOS LEGALES</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Partida Registral (Principal)</label><input {...register('partidaRegistral')} className="input input-bordered w-full bg-white font-mono text-sm"/></div>
                    {modalidadActual === 'Alquiler' && (
                        <>
                            <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Partida Cochera</label><input {...register('partidaCochera')} className="input input-bordered w-full bg-white font-mono text-sm"/></div>
                            <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Partida Depósito</label><input {...register('partidaDeposito')} className="input input-bordered w-full bg-white font-mono text-sm"/></div>
                        </>
                    )}
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8">
                    <label className="label font-bold text-indigo-900 mb-4 border-b border-indigo-200 pb-2 text-[10px] uppercase tracking-widest">Detalles del Contrato</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="form-control">
                            <label className="label font-bold text-gray-700 text-[10px] uppercase">¿ES EXCLUSIVA?</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('exclusiva')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">Sí</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('exclusiva')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">No</span></label>
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-gray-700 text-[10px] uppercase">¿ES RENOVABLE?</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('renovable')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">Sí</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('renovable')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">No</span></label>
                            </div>
                        </div>
                        <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Inicio de Contrato</label><input type="date" {...register('inicioContrato')} className="input input-bordered w-full bg-white text-sm"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Fin de Contrato</label><input type="date" {...register('finContrato')} className="input input-bordered w-full bg-white text-sm"/></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 flex items-center gap-2 text-[10px] uppercase"><FaPercent className="text-blue-500" /> Comisión {modalidadActual === 'Alquiler' ? '(meses)' : '(%)'}</label>
                        <input type="number" step="0.1" {...register('comision')} className="input input-bordered w-full bg-white font-bold text-lg"/>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
                    <label className="label font-bold text-gray-700 mb-4 border-b pb-2 text-[10px] uppercase tracking-widest">Documentación en Regla</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {['testimonio', 'hr', 'pu', 'impuestoPredial', 'arbitrios', 'copiaLiteral', 'cri', 'reciboAguaLuz', 'planos', 'certificadoParametros', 'certificadoZonificacion', 'otros'].map(doc => {
                            if (modalidadActual !== 'Venta' && ['testimonio', 'hr', 'pu'].includes(doc)) return null;
                            if (modalidadActual === 'Venta' && ['cri', 'reciboAguaLuz'].includes(doc)) return null;
                            
                            const labels: any = {
                                hr: 'HR (Hoja Resumen)', pu: 'PU (Predio Urbano)', impuestoPredial: 'Impuesto Predial', 
                                arbitrios: 'Arbitrios Municipales', copiaLiteral: 'Copia Literal', reciboAguaLuz: 'Recibos Luz/Agua',
                                certificadoParametros: 'Cert. Parámetros', certificadoZonificacion: 'Cert. Zonificación'
                            };

                            return <CustomDocCheckbox key={doc} label={labels[doc] || doc.charAt(0).toUpperCase() + doc.slice(1)} name={doc} register={register} watch={watch} />
                        })}
                    </div>
                </div>
            </div>

            {/* 5. LINKS */}
            <div className="bg-white rounded-xl shadow-sm border p-8 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 tracking-wide"><FaLink className="text-blue-400"/> 5. LINKS EXTERNOS</h3>
                <div className="grid grid-cols-1 gap-3">
                    {[1,2,3,4,5].map(num => <input key={num} {...register(`link${num}` as any)} className="input input-bordered input-sm w-full bg-white text-xs" placeholder={`Link ${num}`}/>)}
                </div>
            </div>

            {/* 6. ASESOR */}
            <div className="bg-white rounded-xl shadow-sm border p-8 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 tracking-wide"><FaUserTie className="text-indigo-500"/> 6. ASESOR ENCARGADO</h3>
                <div className="form-control relative">
                    <div className="flex items-center"><FaSearch className="absolute left-3 text-gray-400 z-10 text-xs"/><input type="text" className="input input-bordered w-full bg-white pl-10 text-sm" value={busquedaAsesor} onChange={(e) => { setBusquedaAsesor(e.target.value); setMostrarSugerenciasAsesor(true); }} onFocus={() => setMostrarSugerenciasAsesor(true)}/></div>
                    {mostrarSugerenciasAsesor && busquedaAsesor.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border z-50 max-h-40 overflow-y-auto mt-1 rounded-b-lg shadow-xl">
                            {asesoresDB.filter(a => a.nombre.toLowerCase().includes(busquedaAsesor.toLowerCase())).map(a => (
                                <div key={a.id} className="p-3 hover:bg-indigo-50 cursor-pointer text-xs uppercase font-bold" onClick={() => { setBusquedaAsesor(a.nombre); setValue('asesor', a.nombre); setMostrarSugerenciasAsesor(false); }}>{a.nombre}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 7. MULTIMEDIA */}
            <div className="bg-white rounded-xl shadow-sm border p-8 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 tracking-wide"><FaVideo className="text-red-500"/> 7. MULTIMEDIA (LINKS)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">YouTube URL</label><input {...register('videoUrl')} className="input input-bordered w-full bg-white text-xs font-mono" placeholder="https://..."/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase"><FaMapMarkerAlt className="inline mr-1 text-green-500"/> Maps URL (Iframe)</label><input {...register('mapaUrl')} className="input input-bordered w-full bg-white text-xs font-mono" placeholder="src..."/></div>
                </div>
            </div>

            <div className="flex justify-end pt-10">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none px-16 py-4 h-auto text-xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform active:scale-95">
                    {isSubmitting ? <span className="flex items-center gap-2"><span className="loading loading-spinner"></span> GUARDANDO...</span> : <><FaSave className="mr-2"/> GUARDAR CAMBIOS</>}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}