'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  FaMagic, FaListUl, FaPercent, FaTimes
} from 'react-icons/fa';

interface FormInputs {
  tipo: string; modalidad: string; ubicacion: string; direccion: string;
  precio: string; moneda: string; area: string; areaConstruida: string;
  habitaciones: string; banos: string; cocheras: string; descripcion: string;
  detalles: string; partidaRegistral: string; partidaAdicional: string;
  partidaCochera: string; partidaDeposito: string; fechaCaptacion: string;
  inicioContrato: string; finContrato: string; tipoContrato: string;
  comision: string; videoUrl: string; mapaUrl: string; asesor: string;
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

export default function EditarPropiedadPage() {
  const router = useRouter();
  const { id } = useParams();
  const { propietarios, fetchPropietarios } = useInmobiliariaStore();
  const { register, handleSubmit, watch, setValue } = useForm<FormInputs>();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);
  
  // Estados para Propietarios
  const [propietariosSeleccionados, setPropietariosSeleccionados] = useState<any[]>([]);
  const [propietarioSelectId, setPropietarioSelectId] = useState('');
  
  // Estados para Asesores y Ubicaciones
  const [asesoresDB, setAsesoresDB] = useState<any[]>([]);
  const [busquedaAsesor, setBusquedaAsesor] = useState('');
  const [mostrarSugerenciasAsesor, setMostrarSugerenciasAsesor] = useState(false);
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');
  const [mostrarSugerenciasUbi, setMostrarSugerenciasUbi] = useState(false);

  // Estados de Imágenes (Antiguas y Nuevas)
  const [existingMainPhoto, setExistingMainPhoto] = useState<string | null>(null);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  
  const [fotoPrincipalFile, setFotoPrincipalFile] = useState<File | null>(null);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);

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

            // Cargar datos de la propiedad
            const { data: p } = await api.get(`/propiedades/${id}`);
            
            // Llenar campos de texto y números
            const campos = ['tipo', 'modalidad', 'ubicacion', 'direccion', 'precio', 'moneda', 'area', 'areaConstruida', 'habitaciones', 'banos', 'cocheras', 'descripcion', 'detalles', 'partidaRegistral', 'partidaCochera', 'partidaDeposito', 'comision', 'videoUrl', 'mapaUrl', 'asesor', 'link1', 'link2', 'link3', 'link4', 'link5'];
            campos.forEach(key => {
                if (p[key] !== null && p[key] !== undefined) setValue(key as any, p[key]);
            });

            // Formatear Fechas
            if(p.inicioContrato) setValue('inicioContrato', p.inicioContrato.split('T')[0]);
            if(p.finContrato) setValue('finContrato', p.finContrato.split('T')[0]);
            if(p.fechaCaptacion) setValue('fechaCaptacion', p.fechaCaptacion.split('T')[0]);

            // Formatear Radio Buttons
            setValue('exclusiva', p.exclusiva ? 'si' : 'no');
            setValue('renovable', p.renovable ? 'si' : 'no');
            
            if (Number(p.mantenimiento) > 0) {
                setValue('tieneMantenimiento', 'si');
                setValue('mantenimiento', p.mantenimiento);
            } else {
                setValue('tieneMantenimiento', 'no');
            }

            // Setear estados adicionales
            setBusquedaUbicacion(p.ubicacion);
            setBusquedaAsesor(p.asesor || '');
            
            // Llenar Propietarios y Fotos existentes
            if(p.Propietarios || p.propietarios) setPropietariosSeleccionados(p.Propietarios || p.propietarios);
            if(p.fotoPrincipal) setExistingMainPhoto(p.fotoPrincipal);
            if(p.galeria) setExistingGallery(typeof p.galeria === 'string' ? JSON.parse(p.galeria) : p.galeria);
            
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

  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const file = e.target.files[0];
          const compressed = await imageCompression(file, { maxSizeMB: 0.6, maxWidthOrHeight: 1600, useWebWorker: true });
          setFotoPrincipalFile(compressed as File);
          setPreviewMain(URL.createObjectURL(compressed as File));
          setExistingMainPhoto(null); // Ocultar la antigua si suben una nueva
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

  const onSubmit = async (data: FormInputs) => {
    if (propietariosSeleccionados.length === 0) return alert('⚠️ La propiedad debe tener al menos un propietario.');
    setIsSubmitting(true);
    
    try {
        const formData = new FormData();
        
        // 1. Agregar todos los textos
        Object.keys(data).forEach(key => {
            const k = key as keyof FormInputs;
            if (data[k] !== undefined && data[k] !== null && data[k] !== '') {
                formData.append(k, String(data[k]));
            }
        });

        // 2. Lógica de campos especiales
        if (data.tieneMantenimiento === 'no' || modalidadActual !== 'Alquiler') formData.set('mantenimiento', '0');
        formData.set('exclusiva', data.exclusiva === 'si' ? 'true' : 'false');
        formData.set('renovable', data.renovable === 'si' ? 'true' : 'false');

        // 3. Propietarios vinculados
        propietariosSeleccionados.forEach(p => formData.append('propietariosIds[]', p.id));

        // 4. Imágenes antiguas que se mantienen (para que el backend no las borre)
        if (existingMainPhoto) formData.append('existingMainPhoto', existingMainPhoto);
        formData.append('existingGallery', JSON.stringify(existingGallery));

        // 5. Imágenes NUEVAS (Archivos)
        if (fotoPrincipalFile) formData.append('fotoPrincipal', fotoPrincipalFile);
        galeriaFiles.forEach(f => formData.append('galeria', f));

        // Enviar con Fetch directamente para que Multer procese el FormData
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
            
            {/* 1. PROPIETARIOS (EDITABLES) */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 font-mono"><FaUserTie className="text-indigo-600"/> 1. PROPIETARIOS</h3>
                <div className="flex gap-4 items-end mb-4">
                    <div className="form-control flex-1">
                        <select className="select select-bordered w-full bg-white text-sm" value={propietarioSelectId} onChange={(e) => setPropietarioSelectId(e.target.value)}>
                            <option value="">-- Buscar en Base de Datos --</option>
                            {propietarios.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.dni})</option>)}
                        </select>
                    </div>
                    <button type="button" onClick={() => {
                        const propObj = propietarios.find(p => p.id === propietarioSelectId);
                        if (propObj && !propietariosSeleccionados.find(p => p.id === propObj.id)) setPropietariosSeleccionados([...propietariosSeleccionados, propObj]);
                    }} className="btn btn-primary bg-indigo-600 text-white border-none px-6 text-xs uppercase font-bold"><FaPlus/> AGREGAR</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {propietariosSeleccionados.map(p => (
                        <div key={p.id} className="badge badge-lg p-4 gap-3 bg-indigo-50 border-indigo-200 text-indigo-800 font-bold uppercase">
                            {p.nombre} <FaTrash className="cursor-pointer text-red-500 text-xs" onClick={() => setPropietariosSeleccionados(propietariosSeleccionados.filter(x => x.id !== p.id))}/>
                        </div>
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

            {/* 4. DATOS LEGALES (SIN DOCUMENTOS PDF) */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 flex items-center gap-2 text-[10px] uppercase"><FaPercent className="text-blue-500" /> Comisión {modalidadActual === 'Alquiler' ? '(meses)' : '(%)'}</label>
                        <input type="number" step="0.1" {...register('comision')} className="input input-bordered w-full bg-white font-bold text-lg"/>
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
                            {/* Galeria Antigua */}
                            {existingGallery.map((src, i) => (
                                <div key={`old-${i}`} className="relative group">
                                    <img src={src.startsWith('http') ? src : `${BACKEND_URL}${src}`} className="h-20 w-20 object-cover rounded-xl border border-white shadow flex-shrink-0"/>
                                    <button type="button" onClick={() => removerFotoGaleriaAntigua(i)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><FaTimes className="text-[10px]"/></button>
                                </div>
                            ))}
                            {/* Galeria Nueva */}
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