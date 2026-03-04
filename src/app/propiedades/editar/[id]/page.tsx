'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { useInmobiliariaStore } from '../../../../store/useInmobiliariaStore';
import api from '../../../../services/api';
import imageCompression from 'browser-image-compression';

const API_BASE_URL = 'https://sillar-backend.onrender.com/api';
const BACKEND_URL = 'https://sillar-backend.onrender.com';

import { 
  FaHome, FaBed, FaBath, FaCar, FaImages, FaSave, FaArrowLeft, FaVideo, 
  FaUserTie, FaGavel, FaLink, FaPlus, FaTrash, FaSearch, FaMapMarkerAlt, 
  FaMagic, FaListUl, FaPercent, FaTimes, FaShieldAlt, FaTools,
  FaCalendarAlt, FaBuilding, FaKey, FaIdCard
} from 'react-icons/fa';

interface FormInputs {
  tipo: string; modalidad: string; ubicacion: string; direccion: string;
  precio: string; moneda: string; area: string; areaConstruida: string;
  habitaciones: string; banos: string; cocheras: string; descripcion: string;
  detalles: string; partidaRegistral: string; partidaAdicional: string;
  partidaCochera: string; partidaDeposito: string; fechaCaptacion: string;
  inicioContrato: string; finContrato: string; tipoContrato: string;
  comision: string; videoUrl: string; mapaUrl: string; asesor: string;
  
  tieneMantenimiento: string; mantenimiento: string; monedaMantenimiento: string;
  tieneVigilancia: string; vigilancia: string; monedaVigilancia: string;
  incluyeIgv: string;
  
  exclusiva: string; renovable: string;
  link1: string; link2: string; link3: string; link4: string; link5: string;
  
  fechaInicioProyecto: string;
  tiempoEjecucion: string;
  fechaEntrega: string; 
  tipologias: { precio: string; areaConstruida: string; nombre: string; }[];
}

const distritosArequipa = [
    "Alto Selva Alegre", "Arequipa (Centro)", "Camaná", "Cayma", "Cerro Colorado", "Characato", 
    "Chiguata", "Chivay", "Cusco", "Ilo", "Jacobo Hunter", "José Luis Bustamante y Rivero", "Juliaca", "La Joya", "Lima", "Mariano Melgar", 
    "Miraflores", "Mollebaya", "Mollendo", "Moquegua", "Paucarpata", "Quequeña", "Sabandía", "Sachaca", 
    "Socabaya", "Tiabaya", "Trujillo", "Uchumayo", "Vítor", "Yanahuara", "Yura"
];

// --- LISTA PARA EL AUTOCOMPLETADO DE TIPO ---
const tiposPropiedad = [
    "Casa", "Departamento", "Duplex", "Terreno Urbano", "Terreno Agrícola", 
    "Terreno Industrial", "Local Comercial", "Local Industrial", "Oficina",
    "Proyecto Casas", "Proyecto Departamentos", "Proyecto Duplex", 
    "Proyecto Terrenos", "Proyecto Locales"
];

export default function EditarPropiedadPage() {
  const router = useRouter();
  const { id } = useParams();
  const { propietarios, fetchPropietarios } = useInmobiliariaStore();
  const { register, handleSubmit, watch, setValue, control } = useForm<FormInputs>();

  const { fields, append, remove } = useFieldArray({ control, name: "tipologias" });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);
  
  const [propietariosSeleccionados, setPropietariosSeleccionados] = useState<any[]>([]);
  
  // ESTADOS PARA BUSCADOR PROPIETARIO
  const [busquedaPropietario, setBusquedaPropietario] = useState('');
  const [mostrarSugerenciasProp, setMostrarSugerenciasProp] = useState(false);
  
  const [asesoresDB, setAsesoresDB] = useState<any[]>([]);
  const [busquedaAsesor, setBusquedaAsesor] = useState('');
  const [mostrarSugerenciasAsesor, setMostrarSugerenciasAsesor] = useState(false);
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');
  const [mostrarSugerenciasUbi, setMostrarSugerenciasUbi] = useState(false);

  const [existingMainPhoto, setExistingMainPhoto] = useState<string | null>(null);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  
  const [fotoPrincipalFile, setFotoPrincipalFile] = useState<File | null>(null);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);

  const modalidadActual = watch('modalidad');
  const tipoInmueble = watch('tipo', '');
  const tieneMantenimiento = watch('tieneMantenimiento');
  const tieneVigilancia = watch('tieneVigilancia');
  
  // LÓGICA DINÁMICA: Detecta cualquier texto que contenga "proyecto", "terreno", "departamento", etc.
  const esProyecto = tipoInmueble && String(tipoInmueble).toLowerCase().includes('proyecto');
  const mostrarDistribucion = tipoInmueble && !String(tipoInmueble).toLowerCase().includes('terreno') && !esProyecto;
  const esDepartamento = tipoInmueble && (String(tipoInmueble).toLowerCase().includes('departamento') || String(tipoInmueble).toLowerCase().includes('duplex'));

  useEffect(() => {
    const init = async () => {
        try {
            await fetchPropietarios();
            const token = localStorage.getItem('token');
            const resU = await fetch(`${API_BASE_URL}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } });
            const dataU = await resU.json();
            setAsesoresDB(dataU);

            const { data: p } = await api.get(`/propiedades/${id}`);
            
            const campos = ['tipo', 'modalidad', 'ubicacion', 'direccion', 'precio', 'moneda', 'area', 'areaConstruida', 'habitaciones', 'banos', 'cocheras', 'descripcion', 'detalles', 'partidaRegistral', 'partidaCochera', 'partidaDeposito', 'comision', 'videoUrl', 'mapaUrl', 'asesor', 'link1', 'link2', 'link3', 'link4', 'link5', 'tiempoEjecucion', 'fechaEntrega'];
            campos.forEach(key => {
                if (p[key] !== null && p[key] !== undefined) setValue(key as any, p[key]);
            });

            if(p.inicioContrato) setValue('inicioContrato', p.inicioContrato.split('T')[0]);
            if(p.finContrato) setValue('finContrato', p.finContrato.split('T')[0]);
            if(p.fechaCaptacion) setValue('fechaCaptacion', p.fechaCaptacion.split('T')[0]);
            if(p.fechaInicioProyecto) setValue('fechaInicioProyecto', p.fechaInicioProyecto.split('T')[0]);

            setValue('exclusiva', p.exclusiva ? 'si' : 'no');
            setValue('renovable', p.renovable ? 'si' : 'no');
            setValue('incluyeIgv', p.incluyeIgv ? 'si' : 'no');
            
            // CARGAR MANTENIMIENTO Y VIGILANCIA
            if (Number(p.mantenimiento) > 0) {
                setValue('tieneMantenimiento', 'si');
                setValue('mantenimiento', p.mantenimiento);
            } else {
                setValue('tieneMantenimiento', 'no');
            }
            setValue('monedaMantenimiento', p.monedaMantenimiento || 'PEN');

            if (Number(p.vigilancia) > 0) {
                setValue('tieneVigilancia', 'si');
                setValue('vigilancia', p.vigilancia);
            } else {
                setValue('tieneVigilancia', 'no');
            }
            setValue('monedaVigilancia', p.monedaVigilancia || 'PEN');

            // CARGAR TIPOLOGÍAS
            if (p.tipologias) {
                const tipoArr = typeof p.tipologias === 'string' ? JSON.parse(p.tipologias) : p.tipologias;
                setValue('tipologias', tipoArr);
            } else {
                setValue('tipologias', [{ precio: '', areaConstruida: '', nombre: '' }]);
            }

            setBusquedaUbicacion(p.ubicacion);
            setBusquedaAsesor(p.asesor || '');
            
            if(p.Propietarios || p.propietarios) setPropietariosSeleccionados(p.Propietarios || p.propietarios);
            if(p.fotoPrincipal) setExistingMainPhoto(p.fotoPrincipal);
            if(p.galeria) setExistingGallery(typeof p.galeria === 'string' ? JSON.parse(p.galeria) : p.galeria);
            
            setLoading(false);
        } catch (e) { router.back(); }
    };
    init();
  }, [id, fetchPropietarios, setValue, router]);

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

  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const file = e.target.files[0];
          const compressed = await imageCompression(file, { maxSizeMB: 0.6, maxWidthOrHeight: 1600, useWebWorker: true });
          setFotoPrincipalFile(compressed as File);
          setPreviewMain(URL.createObjectURL(compressed as File));
          setExistingMainPhoto(null);
      }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const filesArray = Array.from(e.target.files);
          if (existingGallery.length + galeriaFiles.length + filesArray.length > 30) return alert("⚠️ Máximo 30 fotos en total.");

          const compressedFiles: File[] = [];
          for (const file of filesArray) {
              const compressed = await imageCompression(file, { maxSizeMB: 0.6, maxWidthOrHeight: 1600, useWebWorker: true });
              compressedFiles.push(compressed as File);
          }

          const newPreviews = compressedFiles.map(f => URL.createObjectURL(f));
          setGaleriaFiles(prev => [...prev, ...compressedFiles]);
          setPreviewGallery(prev => [...prev, ...newPreviews]);
      }
  };

  const removerFotoGaleriaNueva = (idx: number) => {
      setGaleriaFiles(galeriaFiles.filter((_, i) => i !== idx));
      setPreviewGallery(previewGallery.filter((_, i) => i !== idx));
  };

  const removerFotoGaleriaAntigua = (idx: number) => {
      setExistingGallery(existingGallery.filter((_, i) => i !== idx));
  };

  const seleccionarDistrito = (d: string) => { setBusquedaUbicacion(d); setValue('ubicacion', d); setMostrarSugerenciasUbi(false); };
  const seleccionarAsesor = (a: any) => { setBusquedaAsesor(a.nombre); setValue('asesor', a.nombre); setMostrarSugerenciasAsesor(false); };

  const seleccionarPropietario = (propObj: any) => {
      if (!propietariosSeleccionados.find(p => p.id === propObj.id)) {
          setPropietariosSeleccionados([...propietariosSeleccionados, propObj]);
      }
      setBusquedaPropietario('');
      setMostrarSugerenciasProp(false);
  };

  const onSubmit = async (data: FormInputs) => {
    if (propietariosSeleccionados.length === 0) return alert('⚠️ La propiedad debe tener al menos un propietario.');
    if (!data.tipo) return alert('⚠️ Por favor, ingresa o selecciona un Tipo de Propiedad.');

    setIsSubmitting(true);
    
    try {
        const formData = new FormData();
        
        Object.keys(data).forEach(key => {
            const k = key as keyof FormInputs;
            if (data[k] !== undefined && data[k] !== null && data[k] !== '' && k !== 'tipologias') {
                formData.append(k, String(data[k]));
            }
        });

        // SOLO SE AGREGA LA TIPOLOGÍA. FECHA ENTREGA YA SE ENVIÓ EN EL BUCLE AUTOMÁTICO
        if (esProyecto) {
            formData.append('tipologias', JSON.stringify(data.tipologias));
        }

        formData.set('incluyeIgv', data.incluyeIgv === 'si' ? 'true' : 'false');
        formData.set('exclusiva', data.exclusiva === 'si' ? 'true' : 'false');
        formData.set('renovable', data.renovable === 'si' ? 'true' : 'false');

        if (data.tieneMantenimiento === 'no' || (modalidadActual !== 'Alquiler' && !esDepartamento)) {
            formData.set('mantenimiento', '0');
        } else {
            formData.set('mantenimiento', String(data.mantenimiento));
            formData.set('monedaMantenimiento', data.monedaMantenimiento);
        }

        if (data.tieneVigilancia === 'no' || esProyecto) {
            formData.set('vigilancia', '0');
        } else {
            formData.set('vigilancia', String(data.vigilancia));
            formData.set('monedaVigilancia', data.monedaVigilancia);
        }

        propietariosSeleccionados.forEach((p: any) => formData.append('propietariosIds[]', p.id));

        if (existingMainPhoto) formData.append('existingMainPhoto', existingMainPhoto);
        formData.append('existingGallery', JSON.stringify(existingGallery));

        if (fotoPrincipalFile) formData.append('fotoPrincipal', fotoPrincipalFile);
        galeriaFiles.forEach(f => formData.append('galeria', f));

        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/propiedades/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!res.ok) throw new Error('Error en el servidor');

        alert('✅ PROPIEDAD ACTUALIZADA CON ÉXITO');
        router.push(`/propiedades/${id}`);
    } catch (e) { 
        console.error(e);
        alert('❌ ERROR AL GUARDAR. Revisa la consola.'); 
    } finally { 
        setIsSubmitting(false); 
    }
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
            
            {/* 1. PROPIETARIOS */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 font-mono"><FaUserTie className="text-indigo-600"/> 1. PROPIETARIOS / EMPRESAS</h3>
                
                <div className="form-control relative mb-4">
                    <div className="flex items-center">
                        <FaSearch className="absolute left-3 text-gray-400 z-10 text-xs"/>
                        <input 
                            type="text" 
                            className="input input-bordered w-full bg-white pl-9 text-sm font-bold text-indigo-800" 
                            placeholder="Buscar por Nombre, Empresa o DNI/RUC..." 
                            value={busquedaPropietario} 
                            onChange={(e) => { 
                                setBusquedaPropietario(e.target.value); 
                                setMostrarSugerenciasProp(true); 
                            }} 
                            onFocus={() => setMostrarSugerenciasProp(true)}
                        />
                    </div>

                    {mostrarSugerenciasProp && busquedaPropietario.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-2xl z-50 max-h-60 overflow-y-auto mt-1">
                            {propietarios
                                .filter((p: any) => 
                                    p.nombre.toLowerCase().includes(busquedaPropietario.toLowerCase()) || 
                                    p.dni.includes(busquedaPropietario) || 
                                    (p.empresa && p.empresa.toLowerCase().includes(busquedaPropietario.toLowerCase())) ||
                                    (p.ruc && p.ruc.includes(busquedaPropietario))
                                )
                                .map((p: any) => (
                                    <div 
                                        key={p.id} 
                                        className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 flex items-center justify-between group" 
                                        onClick={() => seleccionarPropietario(p)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-xs uppercase flex items-center gap-2">
                                                {p.tipoPersona === 'PJ' ? <FaBuilding className="text-indigo-400" /> : <FaUserTie className="text-blue-400" />}
                                                {p.nombre}
                                            </span>
                                            {p.tipoPersona === 'PJ' && p.empresa && (
                                                <span className="text-[10px] text-indigo-600 font-bold ml-5">{p.empresa}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {p.tipoPersona === 'PJ' ? (
                                                <span className="badge badge-sm bg-indigo-100 text-indigo-700 font-bold border-none">PJ</span>
                                            ) : (
                                                <span className="badge badge-sm bg-blue-100 text-blue-700 font-bold border-none">PN</span>
                                            )}
                                            <span className="text-[10px] text-gray-500 font-mono mt-1">ID: {p.tipoPersona === 'PJ' && p.ruc ? p.ruc : p.dni}</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {propietariosSeleccionados.map((p: any) => (
                        <div key={p.id} className={`badge badge-lg p-4 gap-3 font-bold uppercase ${p.tipoPersona === 'PJ' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                            {p.tipoPersona === 'PJ' ? <FaBuilding /> : <FaUserTie />}
                            {p.tipoPersona === 'PJ' && p.empresa ? p.empresa : p.nombre} 
                            <FaTrash className="cursor-pointer text-red-500 text-xs hover:scale-125 transition-transform" onClick={() => setPropietariosSeleccionados(propietariosSeleccionados.filter((x: any) => x.id !== p.id))}/>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. DATOS INMUEBLE */}
            <div className="bg-white rounded-xl shadow-sm border p-8 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaHome className="text-indigo-500"/> 2. DATOS INMUEBLE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">TIPO *</label>
                        <input 
                            list="tipos-propiedad-edit" 
                            {...register('tipo', {required:true})} 
                            className="input input-bordered w-full bg-white font-semibold text-sm" 
                            placeholder="Buscar tipo..."
                            autoComplete="off"
                        />
                        <datalist id="tipos-propiedad-edit">
                            {tiposPropiedad.map((t, index) => (
                                <option key={index} value={t} />
                            ))}
                        </datalist>
                    </div>

                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">MODALIDAD *</label>
                        <select {...register('modalidad', {required:true})} className="select select-bordered w-full bg-white">
                            <option value="Venta">Venta</option>
                            <option value="Alquiler">Alquiler</option>
                            <option value="Anticresis">Anticresis</option>
                            <option value="Pre Venta">Pre Venta</option>
                        </select>
                    </div>
                    <div className="form-control relative">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">DISTRITO *</label>
                        <div className="flex items-center">
                            <FaSearch className="absolute left-3 text-gray-400 z-10 text-xs"/>
                            <input type="text" className="input input-bordered w-full bg-white pl-9 text-sm" value={busquedaUbicacion} onChange={(e) => { setBusquedaUbicacion(e.target.value); setMostrarSugerenciasUbi(true); }} onFocus={() => setMostrarSugerenciasUbi(true)}/>
                        </div>
                        {mostrarSugerenciasUbi && busquedaUbicacion.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border z-50 max-h-48 overflow-y-auto mt-1 rounded-b-lg shadow-xl">
                                {distritosArequipa.filter(d => d.toLowerCase().includes(busquedaUbicacion.toLowerCase())).map((d, i) => (
                                    <div key={i} className="p-3 hover:bg-indigo-50 cursor-pointer text-xs uppercase font-bold" onClick={() => { setBusquedaUbicacion(d); setValue('ubicacion', d); setMostrarSugerenciasUbi(false); }}>{d}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="form-control mb-6"><label className="label font-bold text-gray-600 text-[10px] uppercase">Dirección Exacta</label><input {...register('direccion')} className="input input-bordered w-full bg-white"/></div>
                
                {esProyecto ? (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-inner">
                            <div className="flex justify-between items-center mb-4">
                                <label className="label font-black text-indigo-900 text-[10px] uppercase tracking-widest">Precios y Tipologías</label>
                                <button type="button" onClick={() => append({ precio: '', areaConstruida: '', nombre: '' })} className="btn btn-xs btn-primary gap-1"><FaPlus/> Añadir Tipología</button>
                            </div>
                            <div className="space-y-3 font-bold">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-center bg-white p-3 rounded-xl border shadow-sm">
                                        <div className="flex-1"><input type="number" step="0.01" {...register(`tipologias.${index}.precio` as const)} placeholder="Precio" className="input input-sm input-bordered w-full bg-white text-gray-800 font-bold" /></div>
                                        <div className="flex-1"><input type="number" step="0.01" {...register(`tipologias.${index}.areaConstruida` as const)} placeholder="Área Const. m²" className="input input-sm input-bordered w-full bg-white" /></div>
                                        <div className="flex-[1.5]"><input type="text" {...register(`tipologias.${index}.nombre` as const)} placeholder="Tipología (Ej: 3 Dorm + Terraza)" className="input input-sm input-bordered w-full bg-white font-medium" /></div>
                                        {fields.length > 1 && (
                                            <button type="button" onClick={() => remove(index)} className="btn btn-square btn-ghost btn-sm text-red-500"><FaTrash/></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-wide"><FaCalendarAlt className="mr-1"/> Fecha de Inicio</label><input type="date" {...register('fechaInicioProyecto')} className="input input-bordered w-full bg-white"/></div>
                            <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-wide">Tiempo Ejecución</label><input type="text" {...register('tiempoEjecucion')} placeholder="Ej: 18 meses" className="input input-bordered w-full bg-white"/></div>
                            <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-wide"><FaKey className="mr-1"/> Fecha Entrega</label><input type="text" {...register('fechaEntrega')} placeholder="Ej: Diciembre 2026" className="input input-bordered w-full bg-white"/></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Precio</label>
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <select {...register('moneda')} className="bg-gray-100 px-3 font-bold border-r border-gray-300 text-xs outline-none"><option value="USD">USD</option><option value="PEN">PEN</option></select>
                                <input type="number" step="0.01" {...register('precio')} className="input w-full bg-white font-bold border-none focus:outline-none"/>
                            </div>
                        </div>
                        <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Área Total (m²)</label><input type="number" step="0.01" {...register('area')} className="input input-bordered w-full bg-white"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Área Const. (m²)</label><input type="number" step="0.01" {...register('areaConstruida')} className="input input-bordered w-full bg-white"/></div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {!esProyecto && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                            <div className="form-control">
                                <label className="label font-bold text-emerald-800 text-[10px] uppercase"><FaShieldAlt className="mr-1"/> ¿Pago de Vigilancia?</label>
                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('tieneVigilancia')} className="radio radio-success radio-sm" /><span className="text-xs font-bold text-emerald-800">Sí</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('tieneVigilancia')} className="radio radio-success radio-sm" /><span className="text-xs font-bold text-emerald-800">No</span></label>
                                </div>
                                {tieneVigilancia === 'si' && (
                                    <div className="flex shadow-sm rounded-lg overflow-hidden border border-emerald-200">
                                        <select {...register('monedaVigilancia')} className="bg-white px-3 font-bold text-emerald-700 outline-none border-r border-emerald-200 text-xs">
                                            <option value="PEN">S/</option>
                                            <option value="USD">$</option>
                                        </select>
                                        <input type="number" step="0.01" {...register('vigilancia')} className="input w-full bg-white font-bold focus:outline-none border-none text-gray-800 h-10" placeholder="Monto Mensual"/>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(modalidadActual === 'Alquiler' || esDepartamento) && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                            <div className="form-control">
                                <label className="label font-bold text-blue-800 text-[10px] uppercase"><FaTools className="mr-1"/> ¿Mantenimiento Edificio/Condominio?</label>
                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('tieneMantenimiento')} className="radio radio-info radio-sm" /><span className="text-xs font-bold text-blue-800">Sí</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('tieneMantenimiento')} className="radio radio-info radio-sm" /><span className="text-xs font-bold text-blue-800">No</span></label>
                                </div>
                                {tieneMantenimiento === 'si' && (
                                    <div className="flex shadow-sm rounded-lg overflow-hidden border border-blue-200">
                                        <select {...register('monedaMantenimiento')} className="bg-white px-3 font-bold text-blue-700 outline-none border-r border-blue-200 text-xs">
                                            <option value="PEN">S/</option>
                                            <option value="USD">$</option>
                                        </select>
                                        <input type="number" step="0.01" {...register('mantenimiento')} className="input w-full bg-white font-bold focus:outline-none border-none text-gray-800 h-10" placeholder="Monto Mensual"/>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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
                    <div className={`form-control ${modalidadActual === 'Alquiler' || esDepartamento ? 'md:col-span-1' : 'md:col-span-3'}`}>
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">Partida Registral (Principal)</label>
                        <input {...register('partidaRegistral')} className="input input-bordered w-full bg-white font-mono text-sm"/>
                    </div>
                    {(modalidadActual === 'Alquiler' || esDepartamento) && (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 flex items-center gap-2 text-[10px] uppercase"><FaPercent className="text-blue-500" /> Comisión {modalidadActual === 'Alquiler' ? '(meses)' : '(%)'}</label>
                        <input type="number" step="0.1" {...register('comision')} className="input input-bordered w-full bg-white font-bold text-lg"/>
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-700 text-[10px] uppercase">¿INCLUYE IGV (18%)?</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('incluyeIgv')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">Sí</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('incluyeIgv')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">No</span></label>
                        </div>
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

            {/* 7. MULTIMEDIA (FOTOS Y VIDEOS) */}
            <div className="bg-white rounded-xl shadow-sm border p-8 border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 tracking-wide"><FaImages className="text-yellow-500"/> 7. MULTIMEDIA Y MAPA</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 font-bold uppercase tracking-tight border-b border-gray-100 pb-8">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase tracking-widest">Cambiar Foto Portada</label>
                        <input type="file" accept="image/*" onChange={handleMainPhotoChange} className="file-input file-input-bordered file-input-primary w-full bg-white shadow-sm h-10" />
                        
                        {/* Muestra foto antigua o nueva */}
                        {existingMainPhoto && !previewMain && (
                            <div className="relative mt-4">
                                <img src={existingMainPhoto.startsWith('http') ? existingMainPhoto : `${BACKEND_URL}${existingMainPhoto}`} alt="Portada Antigua" className="h-48 w-full object-cover rounded-2xl border-4 border-white shadow-xl"/>
                                <button type="button" onClick={() => setExistingMainPhoto(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all"><FaTimes/></button>
                            </div>
                        )}
                        {previewMain && (
                            <div className="relative mt-4">
                                <img src={previewMain} alt="Portada Nueva" className="h-48 w-full object-cover rounded-2xl border-4 border-emerald-400 shadow-xl"/>
                                <button type="button" onClick={() => {setFotoPrincipalFile(null); setPreviewMain(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all"><FaTimes/></button>
                            </div>
                        )}
                    </div>
                    
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase tracking-widest">Agregar Fotos Galería</label>
                        <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="file-input file-input-bordered w-full bg-white shadow-sm h-10" />
                        
                        <div className="mt-4 flex flex-wrap gap-3">
                            {existingGallery.map((src, i) => (
                                <div key={`old-${i}`} className="relative group">
                                    <img src={src.startsWith('http') ? src : `${BACKEND_URL}${src}`} className="h-20 w-20 object-cover rounded-xl border border-white shadow flex-shrink-0"/>
                                    <button type="button" onClick={() => removerFotoGaleriaAntigua(i)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><FaTimes className="text-[10px]"/></button>
                                </div>
                            ))}
                            {previewGallery.map((src, i) => (
                                <div key={`new-${i}`} className="relative group">
                                    <img src={src} className="h-20 w-20 object-cover rounded-xl border-2 border-emerald-400 shadow flex-shrink-0"/>
                                    <button type="button" onClick={() => removerFotoGaleriaNueva(i)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><FaTimes className="text-[10px]"/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase"><FaVideo className="inline mr-1 text-red-500"/> YouTube URL</label><input {...register('videoUrl')} className="input input-bordered w-full bg-white text-xs font-mono" placeholder="https://..."/></div>
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