'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form'; 
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useInmobiliariaStore } from '../../../store/useInmobiliariaStore';
import { createPropiedad, getCartera } from '../../../services/api'; 
import imageCompression from 'browser-image-compression';

const API_BASE_URL = 'https://sillar-backend.onrender.com/api';

import { 
  FaHome, FaBed, FaBath, FaCar, 
  FaImages, FaSave, FaArrowLeft, FaVideo, 
  FaUserTie, FaGavel, FaLink, FaPlus, FaTrash, FaSearch,
  FaMapMarkerAlt, FaMagic, FaListUl, 
  FaCheckCircle, FaCheck, FaPercent, FaTimes, FaFileUpload,
  FaShieldAlt, FaTools, FaCalendarAlt, FaBuilding, FaIdCard 
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
  tieneMantenimiento: string; mantenimiento: string; monedaMantenimiento: string;
  tieneVigilancia: string; vigilancia: string; monedaVigilancia: string;
  exclusiva: string; renovable: string; incluyeIgv: string;
  fotoPrincipal: any; galeria: any;
  link1: string; link2: string; link3: string; link4: string; link5: string;
  fechaInicioProyecto: string;
  tiempoEjecucion: string;
  constructoraId: string;
  tipologias: { precio: string; areaConstruida: string; nombre: string; }[];
}

const distritosArequipa = [
    "Alto Selva Alegre", "Arequipa (Centro)", "Cayma", "Cerro Colorado", "Characato", 
    "Chiguata", "Jacobo Hunter", "José Luis Bustamante y Rivero", "La Joya", "Mariano Melgar", 
    "Miraflores", "Mollebaya", "Paucarpata", "Quequeña", "Sabandía", "Sachaca", 
    "Socabaya", "Tiabaya", "Trujillo", "Uchumayo", "Vítor", "Yanahuara", "Yura"
];

// --- COMPONENTE CHECKBOX MODIFICADO PARA MULTIPLES PDFS ---
const CustomDocCheckbox = ({ label, name, register, watch, onFileChange, onFileRemove, pdfFiles, notasDocs, setNotasDocs }: any) => {
    const isChecked = watch(name);
    const selectedFiles = pdfFiles[name] || []; 
    
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
            <div className="animate-in fade-in slide-in-from-top-1 flex flex-col gap-2">
                <div className={`flex flex-col gap-2 px-4 py-3 border border-dashed rounded-lg transition-colors ${selectedFiles.length > 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-blue-300 hover:bg-blue-50'}`}>
                    
                    {/* Lista de archivos ya subidos */}
                    {selectedFiles.map((file: File, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-emerald-100 shadow-sm">
                            <span className="text-[10px] font-bold uppercase truncate max-w-[120px] text-emerald-700 flex items-center gap-1">
                                <FaCheckCircle className="text-emerald-500 text-xs flex-shrink-0"/> {file.name}
                            </span>
                            <button type="button" onClick={() => onFileRemove(name, idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all" title="Quitar PDF">
                                <FaTimes className="text-xs" />
                            </button>
                        </div>
                    ))}

                    <label className="flex items-center justify-center gap-2 cursor-pointer w-full py-1.5 mt-1 border border-blue-200 border-dashed rounded bg-blue-50/50 hover:bg-blue-100 transition-colors">
                        <FaPlus className="text-blue-600 text-xs"/> <FaFileUpload className="text-blue-500 text-xs"/>
                        <span className="text-[10px] font-bold uppercase text-blue-600">Agregar PDF</span>
                        <input type="file" multiple accept=".pdf" className="hidden" onChange={(e) => {
                            if (e.target.files) {
                                Array.from(e.target.files).forEach(file => onFileChange(name, file));
                            }
                        }} />
                    </label>
                </div>
                <textarea 
                    className="textarea textarea-bordered w-full text-xs p-2 h-14 leading-tight resize-none" 
                    placeholder="Notas / Comentarios..."
                    value={notasDocs[name] || ''}
                    onChange={(e) => setNotasDocs({...notasDocs, [name]: e.target.value})}
                ></textarea>
            </div>
        )}
      </div>
    );
};

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const { propietarios, fetchPropietarios } = useInmobiliariaStore();
  
  const { register, handleSubmit, watch, setValue, control } = useForm<FormInputs>({
    defaultValues: { 
        moneda: 'USD', 
        monedaMantenimiento: 'PEN',
        monedaVigilancia: 'PEN',
        modalidad: 'Venta', 
        tipo: 'Casa', 
        tieneMantenimiento: 'no',
        tieneVigilancia: 'no',
        exclusiva: 'no',
        renovable: 'no',
        incluyeIgv: 'no',
        tipologias: [{ precio: '', areaConstruida: '', nombre: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tipologias" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [propietariosSeleccionados, setPropietariosSeleccionados] = useState<any[]>([]);
  
  const [busquedaPropietario, setBusquedaPropietario] = useState('');
  const [mostrarSugerenciasProp, setMostrarSugerenciasProp] = useState(false);
  
  const [asesoresDB, setAsesoresDB] = useState<any[]>([]);
  const [constructorasDB, setConstructorasDB] = useState<any[]>([]);
  const [busquedaAsesor, setBusquedaAsesor] = useState('');
  const [busquedaConstructora, setBusquedaConstructora] = useState('');
  const [mostrarSugerenciasAsesor, setMostrarSugerenciasAsesor] = useState(false);
  const [mostrarSugerenciasConstructora, setMostrarSugerenciasConstructora] = useState(false);
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');
  const [mostrarSugerenciasUbi, setMostrarSugerenciasUbi] = useState(false);
  
  const [pdfFiles, setPdfFiles] = useState<Record<string, File[]>>({});
  const [notasDocs, setNotasDocs] = useState<Record<string, string>>({});

  const [fotoPrincipalFile, setFotoPrincipalFile] = useState<File | null>(null);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);

  const modalidadActual = watch('modalidad', 'Venta');
  const tipoInmueble = watch('tipo', 'Casa');
  const tieneMantenimiento = watch('tieneMantenimiento', 'no');
  const tieneVigilancia = watch('tieneVigilancia', 'no');

  const esProyecto = tipoInmueble === 'Proyecto';
  const mostrarDistribucion = !tipoInmueble.toLowerCase().includes('terreno') && !esProyecto;

  const esDepartamento = tipoInmueble === 'Departamento' || tipoInmueble === 'Duplex';

  useEffect(() => {
    fetchPropietarios();
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const resAsesores = await fetch(`${API_BASE_URL}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } });
            const dataAsesores = await resAsesores.json();
            setAsesoresDB(dataAsesores);

            const resCartera = await getCartera();
            setConstructorasDB(resCartera.filter((c: any) => c.tipoPersona === 'PJ'));
        } catch (error) { console.error(error); }
    };
    fetchData();
  }, [fetchPropietarios]);

  const handleGenerarIA = async () => {
    const context = { tipo: watch('tipo'), modalidad: watch('modalidad'), ubicacion: watch('ubicacion'), direccion: watch('direccion'), habitaciones: watch('habitaciones'), banos: watch('banos'), area: watch('area'), precio: watch('precio') };
    if (!context.tipo || !context.ubicacion) return alert("⚠️ Selecciona TIPO y DISTRITO.");
    setGenerandoIA(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/ai/generar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(context) });
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
      }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const filesArray = Array.from(e.target.files);
          if (galeriaFiles.length + filesArray.length > 30) return alert("⚠️ Máximo 30 fotos.");
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

  const handlePdfFile = (name: string, file?: File) => { 
      if (file) {
          setPdfFiles(prev => {
              const prevFiles = prev[name] || [];
              return { ...prev, [name]: [...prevFiles, file] };
          });
      }
  };

  const handleRemovePdf = (name: string, indexToRemove: number) => { 
      setPdfFiles(prev => { 
          const currentFiles = prev[name] || [];
          const newFiles = currentFiles.filter((_, idx) => idx !== indexToRemove);
          
          if (newFiles.length === 0) {
              const newObj = { ...prev };
              delete newObj[name];
              return newObj;
          }
          return { ...prev, [name]: newFiles }; 
      }); 
  };

  const removerFotoGaleria = (idx: number) => { setGaleriaFiles(galeriaFiles.filter((_, i) => i !== idx)); setPreviewGallery(previewGallery.filter((_, i) => i !== idx)); };
  const seleccionarDistrito = (d: string) => { setBusquedaUbicacion(d); setValue('ubicacion', d); setMostrarSugerenciasUbi(false); };
  const seleccionarAsesor = (a: any) => { setBusquedaAsesor(a.nombre); setValue('asesor', a.nombre); setMostrarSugerenciasAsesor(false); };
  const seleccionarConstructora = (c: any) => { setBusquedaConstructora(c.empresa); setValue('constructoraId', c.id); setMostrarSugerenciasConstructora(false); };

  const seleccionarPropietario = (propObj: any) => {
      if (!propietariosSeleccionados.find(p => p.id === propObj.id)) {
          setPropietariosSeleccionados([...propietariosSeleccionados, propObj]);
      }
      setBusquedaPropietario('');
      setMostrarSugerenciasProp(false);
  };

  const onSubmit = async (data: FormInputs) => {
    if (propietariosSeleccionados.length === 0) return alert('⚠️ Agrega un propietario.');
    setIsSubmitting(true);
    try {
        const formData = new FormData();
        const docs = ['testimonio', 'hr', 'pu', 'impuestoPredial', 'arbitrios', 'copiaLiteral', 'cri', 'reciboAguaLuz', 'planos', 'certificadoParametros', 'certificadoZonificacion', 'otros'];
        const excluded = ['fotoPrincipal', 'galeria', 'tieneMantenimiento', 'tieneVigilancia', 'incluyeIgv', 'observaciones', 'tipologias', ...docs];
        
        Object.keys(data).forEach(key => {
            const k = key as keyof FormInputs;
            if (!excluded.includes(k) && data[k] !== undefined && data[k] !== '') {
                formData.append(k, String(data[k]));
            }
        });

        if (esProyecto) formData.append('tipologias', JSON.stringify(data.tipologias));

        formData.set('incluyeIgv', data.incluyeIgv === 'si' ? 'true' : 'false');
        
        if (data.tieneMantenimiento === 'si') { 
            formData.set('mantenimiento', String(data.mantenimiento)); 
            formData.set('monedaMantenimiento', data.monedaMantenimiento); 
        } else {
            formData.set('mantenimiento', '0');
        }

        if (data.tieneVigilancia === 'si') { 
            formData.set('vigilancia', String(data.vigilancia)); 
            formData.set('monedaVigilancia', data.monedaVigilancia); 
        } else {
            formData.set('vigilancia', '0');
        }

        formData.set('observaciones', JSON.stringify(notasDocs));
        // CORRECCIÓN TYPESCRIPT
        propietariosSeleccionados.forEach((p: any) => formData.append('propietariosIds[]', p.id));
        if (fotoPrincipalFile) formData.append('fotoPrincipal', fotoPrincipalFile);
        galeriaFiles.forEach(f => formData.append('galeria', f));
        
        docs.forEach(doc => {
            formData.append(doc, data[doc as keyof FormInputs] ? 'true' : 'false');
            if (pdfFiles[doc] && pdfFiles[doc].length > 0) {
                pdfFiles[doc].forEach(file => {
                    formData.append(`file_${doc}`, file);
                });
            }
        });

        await createPropiedad(formData);
        alert('✅ Propiedad Publicada con éxito');
        router.push('/propiedades');
    } catch (e) { alert('❌ Error al publicar.'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      <Navbar />
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <button type="button" onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm text-gray-500"><FaArrowLeft/></button>
                  <h1 className="text-xl font-bold text-indigo-900 uppercase">CAPTACIÓN DE PROPIEDAD</h1>
              </div>
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none shadow-md px-8 text-white gap-2 font-bold text-xs uppercase">
                {isSubmitting ? 'Guardando...' : <><FaSave/> PUBLICAR</>}
              </button>
          </div>
      </div>

      <main className="container mx-auto px-6 max-w-5xl mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
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
                    {/* CORRECCIÓN TYPESCRIPT: (p: any) */}
                    {propietariosSeleccionados.map((p: any) => (
                        <div key={p.id} className={`badge badge-lg p-4 gap-3 font-bold uppercase ${p.tipoPersona === 'PJ' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                            {p.tipoPersona === 'PJ' ? <FaBuilding /> : <FaUserTie />}
                            {p.tipoPersona === 'PJ' && p.empresa ? p.empresa : p.nombre} 
                            {/* CORRECCIÓN TYPESCRIPT: (x: any) */}
                            <FaTrash className="cursor-pointer text-red-500 text-xs hover:scale-125 transition-transform" onClick={() => setPropietariosSeleccionados(propietariosSeleccionados.filter((x: any) => x.id !== p.id))}/>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. DATOS INMUEBLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaHome className="text-indigo-500"/> 2. DATOS INMUEBLE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">TIPO *</label>
                        <select {...register('tipo', {required:true})} className="select select-bordered w-full bg-white">
                            <option value="Casa">Casa</option>
                            <option value="Departamento">Departamento</option>
                            <option value="Duplex">Duplex</option>
                            <option value="Terreno Urbano">Terreno Urbano</option>
                            <option value="Terreno Agricola">Terreno Agrícola</option>
                            <option value="Terreno Industrial">Terreno Industrial</option>
                            <option value="Local">Local Comercial</option>
                            <option value="Local Industrial">Local Industrial</option>
                            <option value="Oficina">Oficina</option>
                            <option value="Proyecto">Proyecto</option>
                        </select>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">MODALIDAD *</label>
                        <select {...register('modalidad', {required:true})} className="select select-bordered w-full bg-white text-sm">
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
                            <input type="text" className="input input-bordered w-full bg-white pl-9 text-sm" placeholder="Buscar distrito..." value={busquedaUbicacion} onChange={(e) => { setBusquedaUbicacion(e.target.value); setMostrarSugerenciasUbi(true); }} onFocus={() => setMostrarSugerenciasUbi(true)}/>
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
                            <div className="form-control relative"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-wide"><FaBuilding className="mr-1"/> Constructora (PJ)</label>
                                <div className="flex items-center"><FaSearch className="absolute left-3 text-gray-400 z-10 text-xs"/><input type="text" className="input input-bordered w-full bg-white pl-10 text-sm" placeholder="Buscar empresa..." value={busquedaConstructora} onChange={(e) => { setBusquedaConstructora(e.target.value); setMostrarSugerenciasConstructora(true); }} onFocus={() => setMostrarSugerenciasConstructora(true)}/></div>
                                {mostrarSugerenciasConstructora && busquedaConstructora.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto mt-1 font-bold text-xs uppercase">
                                        {constructorasDB.filter(c => c.empresa.toLowerCase().includes(busquedaConstructora.toLowerCase())).map((c) => (
                                            <div key={c.id} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 flex flex-col" onClick={() => seleccionarConstructora(c)}><span className="font-bold text-indigo-700 text-xs uppercase">{c.empresa}</span><span className="text-[10px] text-gray-400">RUC: {c.ruc}</span></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-wide">Precio *</label><div className="flex shadow-sm rounded-lg overflow-hidden border border-gray-300"><select {...register('moneda')} className="bg-gray-100 px-3 font-bold text-indigo-700 outline-none border-r border-gray-300 text-xs"><option value="USD">USD ($)</option><option value="PEN">PEN (S/)</option></select><input type="number" step="0.01" {...register('precio')} className="input w-full bg-white font-bold text-lg focus:outline-none border-none text-gray-800" placeholder="0.00"/></div></div>
                        <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">ÁREA TOTAL (m²)</label><input type="number" step="0.01" {...register('area')} className="input input-bordered w-full bg-white" placeholder="0.00"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">ÁREA CONSTRUIDA (m²)</label><input type="number" step="0.01" {...register('areaConstruida')} className="input input-bordered w-full bg-white" placeholder="0.00"/></div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {!esProyecto && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                            <div className="form-control">
                                <label className="label font-bold text-emerald-800 text-[10px] uppercase"><FaShieldAlt className="mr-1"/> ¿Pago de Vigilancia?</label>
                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('tieneVigilancia')} className="radio radio-success radio-sm" /><span className="text-xs font-bold">Sí</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('tieneVigilancia')} className="radio radio-success radio-sm" /><span className="text-xs font-bold">No</span></label>
                                </div>
                                {tieneVigilancia === 'si' && (<div className="flex shadow-sm rounded-lg overflow-hidden border border-emerald-200"><select {...register('monedaVigilancia')} className="bg-white px-3 font-bold text-emerald-700 outline-none border-r border-emerald-200 text-xs"><option value="PEN">S/</option><option value="USD">$</option></select><input type="number" step="0.01" {...register('vigilancia')} className="input w-full bg-white font-bold focus:outline-none border-none text-gray-800 h-10" placeholder="Monto Mensual"/></div>)}
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
                                {tieneMantenimiento === 'si' && (<div className="flex shadow-sm rounded-lg overflow-hidden border border-blue-200"><select {...register('monedaMantenimiento')} className="bg-white px-3 font-bold text-blue-700 outline-none border-r border-blue-200 text-xs"><option value="PEN">S/</option><option value="USD">$</option></select><input type="number" step="0.01" {...register('mantenimiento')} className="input w-full bg-white font-bold focus:outline-none border-none text-gray-800 h-10" placeholder="Monto Mensual"/></div>)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. DISTRIBUCIÓN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaBed className="text-orange-500"/> 3. DISTRIBUCIÓN</h3>
                
                {mostrarDistribucion && (
                    <div className="grid grid-cols-3 gap-6 mb-8 text-center bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm font-bold">
                        <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase"><FaBed/> Dormitorios</label><input type="number" {...register('habitaciones')} className="input input-bordered w-full text-center bg-white text-gray-800"/></div>
                        <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase"><FaBath/> Baños</label><input type="number" {...register('banos')} className="input input-bordered w-full text-center bg-white text-gray-800"/></div>
                        <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase"><FaCar/> Cocheras</label><input type="number" {...register('cocheras')} className="input input-bordered w-full text-center bg-white text-gray-800"/></div>
                    </div>
                )}

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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className={`form-control ${(modalidadActual === 'Alquiler' || esDepartamento) ? 'md:col-span-1' : 'md:col-span-3'}`}>
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">
                            Partida Registral (Principal)
                        </label>
                        <input
                          {...register('partidaRegistral')}
                          className="input input-bordered w-full bg-white font-mono"
                        />
                    </div>

                    {(modalidadActual === 'Alquiler' || esDepartamento) && (
                        <>
                            <div className="form-control">
                                <label className="label font-bold text-gray-600 text-[10px] uppercase">
                                    Partida Cochera (Opcional)
                                </label>
                                <input
                                  {...register('partidaCochera')}
                                  className="input input-bordered w-full bg-white font-mono"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-gray-600 text-[10px] uppercase">
                                    Partida Depósito (Opcional)
                                </label>
                                <input
                                  {...register('partidaDeposito')}
                                  className="input input-bordered w-full bg-white font-mono"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8">
                    <label className="label font-bold text-indigo-900 mb-4 border-b border-indigo-200 pb-2 text-[10px] uppercase tracking-widest">Detalles del Contrato</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="form-control">
                            <label className="label font-bold text-gray-700 text-[10px] uppercase">EXCLUSIVA</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('exclusiva')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">Sí</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('exclusiva')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">No</span></label>
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-gray-700 text-[10px] uppercase">RENOVABLE</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('renovable')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">Sí</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('renovable')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">No</span></label>
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-gray-600 text-[10px] uppercase">Inicio de Contrato</label>
                            <input type="date" {...register('inicioContrato')} className="input input-bordered w-full bg-white text-sm"/>
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-gray-600 text-[10px] uppercase">Fin de Contrato</label>
                            <input type="date" {...register('finContrato')} className="input input-bordered w-full bg-white text-sm"/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 flex items-center gap-2 text-[10px] uppercase"><FaPercent className="text-blue-500" /> Comisión {modalidadActual === 'Alquiler' ? '(meses)' : '(%)'}</label>
                        <div className="relative">
                            <input type="number" step="0.1" {...register('comision')} className="input input-bordered w-full bg-white font-bold text-lg" placeholder={modalidadActual === 'Alquiler' ? "1" : "5"}/>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px] uppercase">{modalidadActual === 'Alquiler' ? 'mes(es)' : '%'}</span>
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-700 text-[10px] uppercase">¿INCLUYE IGV (18%)?</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="si" {...register('incluyeIgv')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">Sí</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="no" {...register('incluyeIgv')} className="radio radio-primary radio-sm" /><span className="text-xs font-bold">No</span></label>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 shadow-inner">
                    <label className="label font-bold text-gray-700 mb-4 border-b pb-2 text-[10px] uppercase tracking-widest">Documentación en Regla</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-bold">
                        {(modalidadActual === 'Venta' || modalidadActual === 'Pre Venta') && (
                            <>
                                <CustomDocCheckbox label="Testimonio" name="testimonio" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                                <CustomDocCheckbox label="HR (Hoja Resumen)" name="hr" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                                <CustomDocCheckbox label="PU (Predio Urbano)" name="pu" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                            </>
                        )}
                        <CustomDocCheckbox label="Impuesto Predial" name="impuestoPredial" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                        <CustomDocCheckbox label="Arbitrios Municipales" name="arbitrios" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                        <CustomDocCheckbox label="Copia Literal" name="copiaLiteral" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                        
                        {(modalidadActual === 'Alquiler' || modalidadActual === 'Anticresis') && (
                            <>
                                <CustomDocCheckbox label="CRI" name="cri" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                                <CustomDocCheckbox label="Recibos Luz/Agua" name="reciboAguaLuz" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                            </>
                        )}

                        <CustomDocCheckbox label="Planos" name="planos" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                        <CustomDocCheckbox label="Certificado de Parámetros" name="certificadoParametros" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                        <CustomDocCheckbox label="Certificado de Zonificación y Vías" name="certificadoZonificacion" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />
                        <CustomDocCheckbox label="Otros" name="otros" register={register} watch={watch} onFileChange={handlePdfFile} onFileRemove={handleRemovePdf} pdfFiles={pdfFiles} notasDocs={notasDocs} setNotasDocs={setNotasDocs} />

                    </div>
                </div>
            </div>

            {/* 5. LINKS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 tracking-wide"><FaLink className="text-blue-400"/> 5. LINKS EXTERNOS (MÁX 5)</h3>
                <div className="grid grid-cols-1 gap-3">
                    {[1,2,3,4,5].map(num => (
                        <input key={num} {...register(`link${num}` as keyof FormInputs)} className="input input-bordered input-sm w-full bg-white text-sm font-medium" placeholder={`Link ${num}: Drive, Drone, etc.`}/>
                    ))}
                </div>
            </div>

            {/* 6. ASESOR */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 tracking-wide"><FaUserTie className="text-indigo-500"/> 6. ASESOR ENCARGADO</h3>
                <div className="form-control relative">
                    <div className="flex items-center"><FaSearch className="absolute left-3 text-gray-400 z-10 text-xs"/><input type="text" className="input input-bordered w-full bg-white pl-10 text-sm" placeholder="Buscar asesor..." value={busquedaAsesor} onChange={(e) => { setBusquedaAsesor(e.target.value); setMostrarSugerenciasAsesor(true); }} onFocus={() => setMostrarSugerenciasAsesor(true)}/></div>
                    {mostrarSugerenciasAsesor && busquedaAsesor.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border-x border-b border-indigo-500 rounded-b-lg shadow-2xl z-50 max-h-48 overflow-y-auto mt-1">
                            {asesoresDB.filter(a => a.nombre.toLowerCase().includes(busquedaAsesor.toLowerCase())).map((asesor) => (<div key={asesor.id} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 flex flex-col" onClick={() => seleccionarAsesor(asesor)}><span className="font-bold text-slate-800 text-xs uppercase">{asesor.nombre}</span></div>))}
                        </div>
                    )}
                </div>
            </div>

            {/* 7. MULTIMEDIA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2 tracking-wide"><FaImages className="text-yellow-500"/> 7. MULTIMEDIA Y MAPA</h3>
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
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-widest"><FaVideo className="text-red-500 mr-2"/> YouTube URL</label><input {...register('videoUrl')} className="input input-bordered w-full bg-white text-xs font-mono" placeholder="https://..."/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase tracking-widest"><FaMapMarkerAlt className="text-green-600 mr-2"/> Google Maps URL</label><input {...register('mapaUrl')} className="input input-bordered w-full bg-white text-xs font-mono" placeholder="src iframe..."/></div>
                </div>
            </div>

            <div className="flex justify-end pt-10">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none px-16 py-4 h-auto text-xl font-black uppercase tracking-widest shadow-2xl hover:shadow-indigo-400 hover:-translate-y-2 transition-all active:scale-95">
                    {isSubmitting ? <span className="flex items-center gap-3"><span className="loading loading-spinner"></span> GUARDANDO...</span> : <span className="flex items-center gap-3"><FaSave/> PUBLICAR</span>}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}