'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { useInmobiliariaStore } from '../../../../store/useInmobiliariaStore';
import api from '../../../../services/api';

const API_BASE_URL = 'https://sillar-backend.onrender.com/api';

import { 
  FaHome, FaBed, FaBath, FaCar, 
  FaImages, FaSave, FaArrowLeft, FaVideo, 
  FaUserTie, FaGavel, FaLink, FaPlus, FaTrash, FaSearch,
  FaMapMarkerAlt, FaMagic, FaListUl, 
  FaCheckCircle, FaCheck, FaPercent, FaTimes, FaFileUpload 
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
  fotoPrincipal: any; galeria: any;
  link1: string; link2: string; link3: string; link4: string; link5: string;
}

const distritosArequipa = [
    "Alto Selva Alegre", "Arequipa (Centro)", "Cayma", "Cerro Colorado", "Characato", 
    "Chiguata", "Jacobo Hunter", "José Luis Bustamante y Rivero", "La Joya", "Mariano Melgar", 
    "Miraflores", "Mollebaya", "Paucarpata", "Quequeña", "Sabandía", "Sachaca", 
    "Socabaya", "Tiabaya", "Uchumayo", "Vítor", "Yanahuara", "Yura"
];

const CustomDocCheckbox = ({ label, name, register, watch, onFileChange, pdfFiles }: any) => {
    const isChecked = watch(name);
    const selectedFile = pdfFiles[name]; 
    return (
      <div className="flex flex-col gap-2 h-full">
        <label className={`label cursor-pointer justify-start gap-4 p-4 rounded-xl transition-all border shadow-sm group w-full
            ${isChecked ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
          <input type="checkbox" {...register(name)} className="hidden" />
          <div className={`w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all
              ${isChecked ? 'border-blue-500 bg-white' : 'border-gray-300 bg-white group-hover:border-blue-300'}`}>
             <FaCheck className={`text-blue-600 text-sm transition-all transform ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
          </div>
          <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-blue-800 font-semibold' : 'text-gray-700'}`}>{label}</span>
        </label>
        {isChecked && (
            <div className="animate-in fade-in slide-in-from-top-1">
                <label className={`flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors ${selectedFile ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-blue-300 hover:bg-blue-50'}`}>
                    {selectedFile ? <FaCheckCircle className="text-emerald-500 text-xs"/> : <FaFileUpload className="text-blue-500 text-xs"/>}
                    <span className={`text-[10px] font-bold uppercase truncate max-w-[150px] ${selectedFile ? (selectedFile.name || 'PDF Cargado') : 'Subir PDF'}`}>
                        {selectedFile ? (selectedFile.name || 'PDF Cargado') : 'Subir PDF'}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => onFileChange(name, e.target.files?.[0])} />
                </label>
            </div>
        )}
      </div>
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
  const [propietarioSelectId, setPropietarioSelectId] = useState('');
  const [asesoresDB, setAsesoresDB] = useState<any[]>([]);
  const [busquedaAsesor, setBusquedaAsesor] = useState('');
  const [mostrarSugerenciasAsesor, setMostrarSugerenciasAsesor] = useState(false);
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');
  const [mostrarSugerenciasUbi, setMostrarSugerenciasUbi] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<Record<string, File>>({});

  const [fotoPrincipalFile, setFotoPrincipalFile] = useState<File | null>(null);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);

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
            
            Object.keys(p).forEach(key => {
                if(key !== 'fotoPrincipal' && key !== 'galeria') setValue(key as any, p[key]);
            });

            setBusquedaUbicacion(p.ubicacion);
            setBusquedaAsesor(p.asesor || '');
            if(p.Propietarios) setPropietariosSeleccionados(p.Propietarios);
            if(p.mantenimiento > 0) setValue('tieneMantenimiento', 'si');
            
            if(p.fotoPrincipal) setPreviewMain(p.fotoPrincipal.startsWith('http') ? p.fotoPrincipal : `https://sillar-backend.onrender.com${p.fotoPrincipal}`);
            if(p.galeria) setPreviewGallery(p.galeria.map((g:string) => g.startsWith('http') ? g : `https://sillar-backend.onrender.com${g}`));

            setLoading(false);
        } catch (e) { router.back(); }
    };
    init();
  }, [id]);

  const handleGenerarIA = async () => {
    const context = { tipo: watch('tipo'), modalidad: watch('modalidad'), ubicacion: watch('ubicacion'), direccion: watch('direccion'), habitaciones: watch('habitaciones'), banos: watch('banos'), area: watch('area'), precio: watch('precio') };
    setGenerandoIA(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/ai/generar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(context) });
        const data = await res.json();
        setValue('descripcion', data.descripcion);
    } catch (e) { alert("Error IA."); } finally { setGenerandoIA(false); }
  };

  const handleMainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setFotoPrincipalFile(e.target.files[0]);
          setPreviewMain(URL.createObjectURL(e.target.files[0]));
      }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const filesArray = Array.from(e.target.files);
          setGaleriaFiles([...galeriaFiles, ...filesArray]);
          const newPreviews = filesArray.map(f => URL.createObjectURL(f));
          setPreviewGallery([...previewGallery, ...newPreviews]);
      }
  };

  const handlePdfFile = (name: string, file?: File) => { if (file) setPdfFiles(prev => ({ ...prev, [name]: file })); };
  const removerFotoGaleria = (idx: number) => {
      setGaleriaFiles(galeriaFiles.filter((_, i) => i !== idx));
      setPreviewGallery(previewGallery.filter((_, i) => i !== idx));
  };

  const seleccionarDistrito = (d: string) => { setBusquedaUbicacion(d); setValue('ubicacion', d); setMostrarSugerenciasUbi(false); };
  const seleccionarAsesor = (a: any) => { setBusquedaAsesor(a.nombre); setValue('asesor', a.nombre); setMostrarSugerenciasAsesor(false); };

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    try {
        const formData = new FormData();
        const docs = ['testimonio', 'hr', 'pu', 'impuestoPredial', 'arbitrios', 'copiaLiteral', 'cri', 'reciboAguaLuz'];
        
        // CAMPOS QUE NO SE TOCAN O VAN POR SEPARADO
        const excluded = ['fotoPrincipal', 'galeria', 'tieneMantenimiento', 'Propietarios', 'propietariosIds', 'usuarioId', 'createdAt', 'updatedAt', ...docs];
        
        Object.keys(data).forEach(key => {
            const k = key as keyof FormInputs;
            if (!excluded.includes(k) && data[k] !== undefined && data[k] !== null) {
                formData.append(k, String(data[k]));
            }
        });

        if (data.tieneMantenimiento === 'no') formData.set('mantenimiento', '0');
        
        // MULTIMEDIA: Solo si hay archivos nuevos
        if (fotoPrincipalFile) formData.append('fotoPrincipal', fotoPrincipalFile);
        if (galeriaFiles.length > 0) {
            galeriaFiles.forEach(f => formData.append('galeria', f));
        }
        
        // DOCUMENTOS Y PDFS
        docs.forEach(doc => {
            formData.append(doc, data[doc as keyof FormInputs] ? 'true' : 'false');
            if (pdfFiles[doc]) formData.append(`file_${doc}`, pdfFiles[doc]);
        });

        // IMPORTANTE: MANTENER PROPIETARIOS FIJOS EN EL BACKEND
        // No los adjuntamos al formData para que el controlador no intente procesarlos y falle

        await api.put(`/propiedades/${id}`, formData, { 
            headers: { 'Content-Type': 'multipart/form-data' } 
        });

        alert('✅ Cambios guardados correctamente');
        router.push(`/propiedades/${id}`);
    } catch (e: any) { 
        console.error(e);
        alert('❌ Error técnico al guardar.'); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      <Navbar />
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <button type="button" onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm text-gray-500"><FaArrowLeft/></button>
                  <h1 className="text-xl font-bold text-indigo-900 uppercase">EDITAR_CAPTACIÓN_V3</h1>
              </div>
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none shadow-md px-8 text-white gap-2 font-bold text-xs uppercase">
                {isSubmitting ? 'Guardando...' : <><FaSave/> GUARDAR CAMBIOS</>}
              </button>
          </div>
      </div>

      <main className="container mx-auto px-6 max-w-5xl mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 1. PROPIETARIOS (SÓLO VISTA) */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 font-mono"><FaUserTie className="text-indigo-600"/> 1. PROPIETARIOS (SÓLO LECTURA)</h3>
                <div className="flex flex-wrap gap-2">
                    {propietariosSeleccionados.map(p => (
                        <div key={p.id} className="badge badge-lg p-4 gap-3 bg-indigo-50 border-indigo-200 text-indigo-800 font-bold uppercase">
                            {p.nombre} ({p.dni})
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. DATOS INMUEBLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaHome className="text-indigo-500"/> 2. DATOS INMUEBLE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">TIPO *</label>
                        <select {...register('tipo', {required:true})} className="select select-bordered w-full bg-white"><option value="Casa">Casa</option><option value="Departamento">Departamento</option><option value="Terreno">Terreno</option><option value="Local">Local Comercial</option><option value="Oficina">Oficina</option></select>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">CATEGORÍA *</label>
                        <select {...register('modalidad', {required:true})} className="select select-bordered w-full bg-white text-sm"><option value="Venta">Venta</option><option value="Alquiler">Alquiler</option><option value="Anticresis">Anticresis</option></select>
                    </div>
                    <div className="form-control relative">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">DISTRITO (BUSCADOR) *</label>
                        <div className="flex items-center">
                            <FaSearch className="absolute left-3 text-gray-400 z-10 text-xs"/>
                            <input type="text" className="input input-bordered w-full bg-white pl-9 text-sm" placeholder="Cayma..." value={busquedaUbicacion} onChange={(e) => { setBusquedaUbicacion(e.target.value); setMostrarSugerenciasUbi(true); }} onFocus={() => setMostrarSugerenciasUbi(true)}/>
                        </div>
                        {mostrarSugerenciasUbi && busquedaUbicacion.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto mt-1">
                                {distritosArequipa.filter(d => d.toLowerCase().includes(busquedaUbicacion.toLowerCase())).map((d, i) => (
                                    <div key={i} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 font-bold text-slate-700 text-xs uppercase" onClick={() => seleccionarDistrito(d)}>{d}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-control mb-6"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-wide">Dirección Exacta</label><input {...register('direccion')} className="input input-bordered w-full bg-white"/></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-wide">Precio *</label>
                        <div className="flex shadow-sm rounded-lg overflow-hidden border border-gray-300">
                            <select {...register('moneda')} className="bg-gray-100 px-3 font-bold text-indigo-700 outline-none border-r border-gray-300 text-xs"><option value="USD">USD ($)</option><option value="PEN">PEN (S/)</option></select>
                            <input type="number" step="0.01" {...register('precio', {required:true})} className="input w-full bg-white font-bold text-lg focus:outline-none border-none text-gray-800" placeholder="0.00"/>
                        </div>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">ÁREA TOTAL (m²)</label><input type="number" step="0.01" {...register('area')} className="input input-bordered w-full bg-white" placeholder="0.00"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">ÁREA CONSTRUIDA (m²)</label><input type="number" step="0.01" {...register('areaConstruida')} className="input input-bordered w-full bg-white" placeholder="0.00"/></div>
                </div>
            </div>

            {/* 3. DISTRIBUCIÓN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaBed className="text-orange-500"/> 3. DISTRIBUCIÓN</h3>
                <div className="grid grid-cols-3 gap-6 mb-8 text-center bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm font-bold">
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase"><FaBed/> Dormitorios</label><input type="number" {...register('habitaciones')} className="input input-bordered w-full text-center bg-white text-gray-800"/></div>
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase"><FaBath/> Baños</label><input type="number" {...register('banos')} className="input input-bordered w-full text-center bg-white text-gray-800"/></div>
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase"><FaCar/> Cocheras</label><input type="number" {...register('cocheras')} className="input input-bordered w-full text-center bg-white text-gray-800"/></div>
                </div>
                <div className="form-control mb-8">
                    <div className="flex justify-between items-center mb-2"><label className="label font-bold text-gray-700 text-xs uppercase"><FaMagic className="text-purple-500"/> Descripción Marketing</label>
                    <button type="button" onClick={handleGenerarIA} disabled={generandoIA} className={`btn btn-sm border-none gap-2 px-5 rounded-full shadow-md transition-all ${generandoIA ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold'}`}><FaMagic className={generandoIA ? "animate-spin" : ""} /> IA REDACTAR</button></div>
                    <textarea {...register('descripcion')} className="textarea textarea-bordered h-40 bg-gray-50 focus:bg-white text-sm leading-relaxed" placeholder="Descripción captadora..."></textarea>
                </div>
                <div className="form-control"><label className="label font-bold text-gray-700 text-xs uppercase"><FaListUl className="text-blue-500 mr-2"/> Distribución Detallada</label><textarea {...register('detalles')} className="textarea textarea-bordered h-40 bg-gray-50 focus:bg-white text-sm" placeholder="Detalle piso por piso..."></textarea></div>
            </div>

            {/* 4. DATOS LEGALES */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaGavel className="text-blue-500"/> 4. DATOS LEGALES</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Partida Registral (Principal)</label><input {...register('partidaRegistral')} className="input input-bordered w-full bg-white font-mono"/></div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 flex items-center gap-2 text-[10px] uppercase"><FaPercent className="text-blue-500" /> Comisión {modalidadActual === 'Alquiler' ? '(meses)' : '(%)'}</label>
                        <div className="relative">
                            <input type="number" step="0.1" {...register('comision')} className="input input-bordered w-full bg-white font-bold text-lg" placeholder={modalidadActual === 'Alquiler' ? "1" : "5"}/>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px] uppercase">{modalidadActual === 'Alquiler' ? 'mes(es)' : '%'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 shadow-inner">
                    <label className="label font-bold text-gray-700 mb-4 border-b pb-2 text-[10px] uppercase tracking-widest">Documentación en Regla</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-bold">
                        {modalidadActual === 'Venta' && (
                            <>
                                <CustomDocCheckbox label="Testimonio" name="testimonio" register={register} watch={watch} onFileChange={handlePdfFile} pdfFiles={pdfFiles} />
                                <CustomDocCheckbox label="HR (Hoja Resumen)" name="hr" register={register} watch={watch} onFileChange={handlePdfFile} pdfFiles={pdfFiles} />
                                <CustomDocCheckbox label="PU (Predio Urbano)" name="pu" register={register} watch={watch} onFileChange={handlePdfFile} pdfFiles={pdfFiles} />
                            </>
                        )}
                        <CustomDocCheckbox label="Impuesto Predial" name="impuestoPredial" register={register} watch={watch} onFileChange={handlePdfFile} pdfFiles={pdfFiles} />
                        <CustomDocCheckbox label="Arbitrios Municipales" name="arbitrios" register={register} watch={watch} onFileChange={handlePdfFile} pdfFiles={pdfFiles} />
                        <CustomDocCheckbox label="Copia Literal" name="copiaLiteral" register={register} watch={watch} onFileChange={handlePdfFile} pdfFiles={pdfFiles} />
                        {(modalidadActual === 'Alquiler' || modalidadActual === 'Anticresis') && (
                            <>
                                <CustomDocCheckbox label="CRI" name="cri" register={register} watch={watch} onFileChange={handlePdfFile} pdfFiles={pdfFiles} />
                                <CustomDocCheckbox label="Recibos Luz/Agua" name="reciboAguaLuz" register={register} watch={watch} onFileChange={handlePdfFile} pdfFiles={pdfFiles} />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. LINKS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 uppercase tracking-wide"><FaLink className="text-blue-400"/> 5. LINKS EXTERNOS (MÁX 5)</h3>
                <div className="grid grid-cols-1 gap-3">
                    {[1,2,3,4,5].map(num => (
                        <input key={num} {...register(`link${num}` as keyof FormInputs)} className="input input-bordered input-sm w-full bg-white text-sm font-medium" placeholder={`Link ${num}: Drive, Drone, etc.`}/>
                    ))}
                </div>
            </div>

            {/* 6. ASESOR */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 uppercase tracking-wide"><FaUserTie className="text-indigo-500"/> 6. ASESOR ENCARGADO</h3>
                <div className="form-control relative">
                    <div className="flex items-center"><FaSearch className="absolute left-3 text-gray-400 z-10 text-xs"/><input type="text" className="input input-bordered w-full bg-white pl-10 text-sm" placeholder="Buscar asesor..." value={busquedaAsesor} onChange={(e) => { setBusquedaAsesor(e.target.value); setMostrarSugerenciasAsesor(true); }} onFocus={() => setMostrarSugerenciasAsesor(true)}/></div>
                    {mostrarSugerenciasAsesor && busquedaAsesor.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border-x border-b border-indigo-500 rounded-b-lg shadow-2xl z-50 max-h-48 overflow-y-auto">
                            {asesoresDB.filter(a => a.nombre.toLowerCase().includes(busquedaAsesor.toLowerCase())).map((asesor) => (<div key={asesor.id} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 flex flex-col" onClick={() => seleccionarAsesor(asesor)}><span className="font-bold text-slate-800 text-xs uppercase">{asesor.nombre}</span></div>))}
                        </div>
                    )}
                </div>
            </div>

            {/* 7. MULTIMEDIA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 uppercase tracking-wide"><FaImages className="text-yellow-500"/> 7. MULTIMEDIA Y MAPA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 font-bold uppercase tracking-tight">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase tracking-widest">Foto Portada</label>
                        <input type="file" accept="image/*" onChange={handleMainPhotoChange} className="file-input file-input-bordered file-input-primary w-full bg-white shadow-sm h-10" />
                        {previewMain && (
                            <div className="relative mt-4">
                                <img src={previewMain} alt="Portada" className="h-48 w-full object-cover rounded-2xl border-4 border-white shadow-xl"/>
                                <button type="button" onClick={() => {setFotoPrincipalFile(null); setPreviewMain(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all"><FaTimes/></button>
                            </div>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase tracking-widest">Galería (Máx 30)</label>
                        <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="file-input file-input-bordered w-full bg-white shadow-sm h-10" />
                        <div className="mt-4 flex flex-wrap gap-3">
                            {previewGallery.map((src, i) => (
                                <div key={i} className="relative group">
                                    <img src={src} className="h-20 w-20 object-cover rounded-xl border border-white shadow flex-shrink-0"/>
                                    <button type="button" onClick={() => removerFotoGaleria(i)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><FaTimes className="text-[10px]"/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-widest"><FaVideo className="text-red-500 mr-2"/> YouTube</label><input {...register('videoUrl')} className="input input-bordered w-full bg-white text-xs font-mono" placeholder="https://..."/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-widest"><FaMapMarkerAlt className="text-green-600 mr-2"/> Google Maps URL</label><input {...register('mapaUrl')} className="input input-bordered w-full bg-white text-xs font-mono" placeholder="src iframe..."/></div>
                </div>
            </div>

            <div className="flex justify-end pt-10">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none px-16 py-4 h-auto text-xl font-black uppercase tracking-widest shadow-2xl hover:shadow-indigo-400 hover:-translate-y-2 transition-all active:scale-95">
                    {isSubmitting ? <span className="flex items-center gap-3"><span className="loading loading-spinner"></span> ACTUALIZANDO...</span> : <span className="flex items-center gap-3"><FaSave/> GUARDAR CAMBIOS</span>}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}