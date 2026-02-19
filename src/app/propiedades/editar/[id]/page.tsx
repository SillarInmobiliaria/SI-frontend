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
  FaUserTie, FaGavel, FaLink, FaPlus, FaTrash, FaSearch, FaMapMarkerAlt, 
  FaMagic, FaListUl, FaCheckCircle, FaCheck, FaPercent, FaTimes, FaFileUpload 
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
  videoUrl: string; mapaUrl: string; asesor: string;
  tieneMantenimiento: string; mantenimiento: string;
  link1: string; link2: string; link3: string; link4: string; link5: string;
}

const distritosArequipa = [
    "Alto Selva Alegre", "Arequipa (Centro)", "Cayma", "Cerro Colorado", "Characato", 
    "Chiguata", "Jacobo Hunter", "José Luis Bustamante y Rivero", "La Joya", "Mariano Melgar", 
    "Miraflores", "Mollebaya", "Paucarpata", "Quequeña", "Sabandía", "Sachaca", 
    "Socabaya", "Tiabaya", "Uchumayo", "Vítor", "Yanahuara", "Yura"
];

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
  const { propietarios, fetchPropietarios } = useInmobiliariaStore();
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

  useEffect(() => {
    const init = async () => {
        try {
            await fetchPropietarios();
            const token = localStorage.getItem('token');
            const resU = await fetch(`${API_BASE_URL}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } });
            const dataU = await resU.json();
            setAsesoresDB(dataU);

            const { data: p } = await api.get(`/propiedades/${id}`);
            Object.keys(p).forEach(key => setValue(key as any, p[key]));
            setBusquedaUbicacion(p.ubicacion);
            setBusquedaAsesor(p.asesor || '');
            if(p.Propietarios) setPropietariosSeleccionados(p.Propietarios);
            if(p.mantenimiento > 0) setValue('tieneMantenimiento', 'si');
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
        const { Propietarios, propietariosIds, usuarioId, createdAt, updatedAt, fotoPrincipal, galeria, ...datosEnvio } = data as any;
        if (data.tieneMantenimiento === 'no') datosEnvio.mantenimiento = 0;

        await api.put(`/propiedades/${id}`, datosEnvio);
        alert('✅ PROPIEDAD ACTUALIZADA');
        router.push(`/propiedades/${id}`);
    } catch (e) { alert('❌ ERROR AL GUARDAR'); } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <button type="button" onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm"><FaArrowLeft/></button>
                  <h1 className="text-xl font-bold text-indigo-900 uppercase">EDITAR_CAPTACIÓN_V3</h1>
              </div>
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none shadow-md px-8 text-white font-bold text-xs">
                {isSubmitting ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
              </button>
          </div>
      </div>

      <main className="container mx-auto px-6 max-w-5xl mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 1. PROPIETARIOS (FIJOS) */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 font-mono"><FaUserTie className="text-indigo-600"/> 1. PROPIETARIOS (FIJOS)</h3>
                <div className="flex flex-wrap gap-2">
                    {propietariosSeleccionados.map(p => (
                        <div key={p.id} className="badge badge-lg p-4 bg-indigo-50 border-indigo-200 text-indigo-800 font-bold uppercase">{p.nombre}</div>
                    ))}
                </div>
            </div>

            {/* 2. DATOS INMUEBLE */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaHome className="text-indigo-500"/> 2. DATOS INMUEBLE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">TIPO</label>
                        <select {...register('tipo')} className="select select-bordered w-full bg-white"><option value="Casa">Casa</option><option value="Departamento">Departamento</option><option value="Terreno">Terreno</option><option value="Local">Local Comercial</option></select>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">CATEGORÍA</label>
                        <select {...register('modalidad')} className="select select-bordered w-full bg-white"><option value="Venta">Venta</option><option value="Alquiler">Alquiler</option></select>
                    </div>
                    <div className="form-control relative">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">DISTRITO</label>
                        <input type="text" className="input input-bordered w-full bg-white" value={busquedaUbicacion} onChange={(e) => { setBusquedaUbicacion(e.target.value); setMostrarSugerenciasUbi(true); }} onFocus={() => setMostrarSugerenciasUbi(true)}/>
                        {mostrarSugerenciasUbi && (
                            <div className="absolute top-full left-0 w-full bg-white border z-50 max-h-48 overflow-y-auto">
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
                        <div className="flex border rounded-lg overflow-hidden"><select {...register('moneda')} className="bg-gray-100 px-3 font-bold border-r text-xs"><option value="USD">USD</option><option value="PEN">PEN</option></select><input type="number" step="0.01" {...register('precio')} className="input w-full bg-white font-bold"/></div>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Área Total</label><input type="number" {...register('area')} className="input input-bordered w-full bg-white"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Área Const.</label><input type="number" {...register('areaConstruida')} className="input input-bordered w-full bg-white"/></div>
                </div>
            </div>

            {/* 3. DISTRIBUCIÓN */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaBed className="text-orange-500"/> 3. DISTRIBUCIÓN</h3>
                <div className="grid grid-cols-3 gap-6 mb-8 text-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Hab.</label><input type="number" {...register('habitaciones')} className="input input-bordered w-full text-center bg-white"/></div>
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Baños</label><input type="number" {...register('banos')} className="input input-bordered w-full text-center bg-white"/></div>
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Coch.</label><input type="number" {...register('cocheras')} className="input input-bordered w-full text-center bg-white"/></div>
                </div>
                <div className="form-control mb-6">
                    <div className="flex justify-between items-center mb-2"><label className="label font-bold text-gray-700 text-xs uppercase">Descripción Comercial</label>
                    <button type="button" onClick={handleGenerarIA} disabled={generandoIA} className="btn btn-xs bg-indigo-600 text-white border-none px-4 rounded-full">{generandoIA ? '...' : 'IA REDACTAR'}</button></div>
                    <textarea {...register('descripcion')} className="textarea textarea-bordered h-40 bg-white text-sm"></textarea>
                </div>
                <div className="form-control"><label className="label font-bold text-gray-700 text-xs uppercase">Distribución Detallada</label><textarea {...register('detalles')} className="textarea textarea-bordered h-40 bg-white text-sm"></textarea></div>
            </div>

            {/* 4. LEGALES */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaGavel className="text-blue-500"/> 4. DATOS LEGALES</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Partida Registral</label><input {...register('partidaRegistral')} className="input input-bordered w-full bg-white"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Comisión</label><input type="number" step="0.1" {...register('comision')} className="input input-bordered w-full bg-white"/></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {['testimonio', 'hr', 'pu', 'impuestoPredial', 'arbitrios', 'copiaLiteral', 'cri', 'reciboAguaLuz'].map(doc => (
                        <CustomDocCheckbox key={doc} label={doc.toUpperCase()} name={doc} register={register} watch={watch} />
                    ))}
                </div>
            </div>

            {/* 5. LINKS */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaLink className="text-blue-400"/> 5. LINKS EXTERNOS</h3>
                <div className="grid grid-cols-1 gap-3">
                    {[1,2,3,4,5].map(num => <input key={num} {...register(`link${num}` as any)} className="input input-bordered input-sm w-full bg-white text-xs" placeholder={`Link ${num}`}/>)}
                </div>
            </div>

            {/* 6. ASESOR */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaUserTie className="text-indigo-500"/> 6. ASESOR ENCARGADO</h3>
                <div className="form-control relative">
                    <input type="text" className="input input-bordered w-full bg-white text-sm" value={busquedaAsesor} onChange={(e) => { setBusquedaAsesor(e.target.value); setMostrarSugerenciasAsesor(true); }} onFocus={() => setMostrarSugerenciasAsesor(true)}/>
                    {mostrarSugerenciasAsesor && (
                        <div className="absolute top-full left-0 w-full bg-white border z-50 max-h-40 overflow-y-auto">
                            {asesoresDB.filter(a => a.nombre.toLowerCase().includes(busquedaAsesor.toLowerCase())).map(a => (
                                <div key={a.id} className="p-2 hover:bg-indigo-50 cursor-pointer text-xs uppercase font-bold" onClick={() => { setBusquedaAsesor(a.nombre); setValue('asesor', a.nombre); setMostrarSugerenciasAsesor(false); }}>{a.nombre}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaImages className="text-yellow-500"/> 7. MULTIMEDIA (LINKS)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">YouTube URL</label><input {...register('videoUrl')} className="input input-bordered w-full bg-white text-xs"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Maps URL</label><input {...register('mapaUrl')} className="input input-bordered w-full bg-white text-xs"/></div>
                </div>
            </div>

            <div className="flex justify-end pt-10">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none px-16 py-4 h-auto text-xl font-black uppercase shadow-2xl">
                    {isSubmitting ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}