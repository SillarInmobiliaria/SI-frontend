'use client';
import { useState, useEffect } from 'react';
import { useForm, WatchObserver } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useInmobiliariaStore } from '../../../store/useInmobiliariaStore';
import { createPropiedad } from '../../../services/api';

const API_BASE_URL = 'https://sillar-backend.onrender.com/api';

import { 
  FaHome, FaDollarSign, FaBed, FaBath, FaCar, 
  FaImages, FaSave, FaArrowLeft, FaVideo, FaFilePdf, 
  FaUserTie, FaGavel, FaLink, FaPlus, FaTrash, FaSearch,
  FaMapMarkerAlt, FaMagic, FaListUl, 
  FaCheckCircle, FaRegCircle, FaCheck, FaCoins 
} from 'react-icons/fa';

// Definición de tipos para evitar los errores de TypeScript que mostraste
interface FormInputs {
  tipo: string;
  modalidad: string;
  ubicacion: string;
  direccion: string;
  precio: string;
  moneda: string;
  area: string;
  areaConstruida: string;
  habitaciones: string;
  banos: string;
  cocheras: string;
  descripcion: string;
  detalles: string;
  partidaRegistral: string;
  partidaAdicional: string;
  partidaCochera: string;
  partidaDeposito: string;
  fechaCaptacion: string;
  inicioContrato: string;
  finContrato: string;
  tipoContrato: string;
  comision: string;
  testimonio: boolean;
  hr: boolean;
  pu: boolean;
  impuestoPredial: boolean;
  arbitrios: boolean;
  copiaLiteral: boolean;
  cri: boolean;
  reciboAguaLuz: boolean;
  observaciones: string;
  videoUrl: string;
  mapaUrl: string;
  asesor: string;
  tieneMantenimiento: string;
  mantenimiento: string;
  fotoPrincipal: any;
  galeria: any;
  fichaTecnica: any;
  link1: string;
  link2: string;
  link3: string;
  link4: string;
  link5: string;
}

const CustomDocCheckbox = ({ label, name, register, watch }: any) => {
    const isChecked = watch(name);
    return (
      <label className={`label cursor-pointer justify-start gap-4 p-4 rounded-xl transition-all border shadow-sm group h-full
          ${isChecked ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-blue-100'}`}>
        <input type="checkbox" {...register(name)} className="hidden" />
        <div className={`w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all
            ${isChecked ? 'border-blue-500 bg-white' : 'border-gray-300 bg-white group-hover:border-blue-300'}`}>
           <FaCheck className={`text-blue-600 text-sm transition-all transform ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
        </div>
        <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-blue-800 font-semibold' : 'text-gray-700'}`}>{label}</span>
      </label>
    );
  };

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const { propietarios, fetchPropietarios } = useInmobiliariaStore();
  const { register, handleSubmit, watch, setValue } = useForm<FormInputs>({
    defaultValues: {
        moneda: 'USD',
        modalidad: 'Venta',
        tieneMantenimiento: 'no'
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);

  const [propietariosSeleccionados, setPropietariosSeleccionados] = useState<any[]>([]);
  const [propietarioSelectId, setPropietarioSelectId] = useState('');

  const [asesoresDB, setAsesoresDB] = useState<any[]>([]);
  const [busquedaAsesor, setBusquedaAsesor] = useState('');
  const [asesorSeleccionado, setAsesorSeleccionado] = useState<any>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);

  const tipoInmueble = watch('tipo');
  const modalidadActual = watch('modalidad');
  const esDepartamento = tipoInmueble === 'Departamento';
  const tieneMantenimientoValue = watch('tieneMantenimiento'); 

  useEffect(() => {
    fetchPropietarios();
    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/usuarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAsesoresDB(data);
        } catch (error) {
            console.error("Error cargando asesores", error);
        }
    };
    fetchUsuarios();
  }, []);

const handleGenerarIA = async () => {
    const datosContexto = {
        tipo: watch('tipo'),
        modalidad: watch('modalidad'),
        ubicacion: watch('ubicacion'),
        direccion: watch('direccion'),
        habitaciones: watch('habitaciones'),
        banos: watch('banos'),
        area: watch('area'),
        precio: watch('precio')
    };

    if (!datosContexto.tipo || !datosContexto.ubicacion) {
        alert("⚠️ Por favor selecciona al menos el TIPO y la UBICACIÓN para que la IA sepa qué escribir.");
        return;
    }

    setGenerandoIA(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/ai/generar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosContexto)
        });

        const data = await res.json();
        setValue('descripcion', data.descripcion);
    } catch (error) {
        console.error("Error IA:", error);
        alert("La IA está despertando en Render. Intenta de nuevo en unos segundos.");
    } finally {
        setGenerandoIA(false);
    }
  };

  const agregarPropietario = () => {
      if (!propietarioSelectId) return;
      const existe = propietariosSeleccionados.find(p => p.id === propietarioSelectId);
      if (existe) return alert('Este propietario ya está agregado.');

      const propObj = propietarios.find(p => p.id === propietarioSelectId);
      if (propObj) {
          setPropietariosSeleccionados([...propietariosSeleccionados, propObj]);
          setPropietarioSelectId('');
      }
  };

  const quitarPropietario = (id: string) => {
      setPropietariosSeleccionados(propietariosSeleccionados.filter(p => p.id !== id));
  };

  const filtrarAsesores = asesoresDB.filter(a => 
      a.nombre.toLowerCase().includes(busquedaAsesor.toLowerCase())
  );

  const seleccionarAsesor = (asesor: any) => {
      setAsesorSeleccionado(asesor);
      setBusquedaAsesor(asesor.nombre);
      setMostrarSugerencias(false);
      setValue('asesor', asesor.nombre);
  };

  const handleMainPhotoChange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
          setPreviewMain(URL.createObjectURL(e.target.files[0]));
      }
  };

  const handleGalleryChange = (e: any) => {
      if (e.target.files) {
          const files = Array.from(e.target.files).map((file: any) => URL.createObjectURL(file));
          setPreviewGallery(files);
      }
  };

  const onSubmit = async (data: FormInputs) => {
    if (propietariosSeleccionados.length === 0) {
        return alert('⚠️ Debes agregar al menos un propietario.');
    }

    setIsSubmitting(true);
    try {
        const formData = new FormData();
        
        // Excluimos archivos y booleanos manuales para tratarlos después
        const excluded = [
            'fotoPrincipal', 'galeria', 'fichaTecnica', 'tieneMantenimiento',
            'testimonio', 'hr', 'pu', 'impuestoPredial', 'arbitrios', 'copiaLiteral',
            'cri', 'reciboAguaLuz'
        ];

        Object.keys(data).forEach(key => {
            const k = key as keyof FormInputs;
            if (!excluded.includes(k)) {
                formData.append(k, String(data[k]));
            }
        });

        if (data.tieneMantenimiento === 'no') {
            formData.set('mantenimiento', '0');
        }

        propietariosSeleccionados.forEach(p => {
            formData.append('propietariosIds[]', p.id);
        });

        if (data.fotoPrincipal?.[0]) formData.append('fotoPrincipal', data.fotoPrincipal[0]);
        if (data.fichaTecnica?.[0]) formData.append('pdf', data.fichaTecnica[0]);
        if (data.galeria && data.galeria.length > 0) {
            for (let i = 0; i < data.galeria.length; i++) {
                formData.append('galeria', data.galeria[i]);
            }
        }

        // Lógica de Documentos (Backend recibe strings 'true'/'false')
        const docs = [
            'testimonio', 'hr', 'pu', 'impuestoPredial', 
            'arbitrios', 'copiaLiteral', 'cri', 'reciboAguaLuz'
        ];
        
        docs.forEach(doc => {
            const val = data[doc as keyof FormInputs];
            formData.append(doc, val ? 'true' : 'false');
        });

        await createPropiedad(formData);
        
        alert('✅ Propiedad registrada con éxito');
        router.push('/propiedades');
    } catch (error) {
        console.error(error);
        alert('❌ Error al registrar. Revisa los datos.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      <Navbar />
      
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <button onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm text-gray-500"><FaArrowLeft/></button>
                  <h1 className="text-xl font-bold text-indigo-900">Ficha de Captación</h1>
              </div>
              <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none shadow-md px-8 text-white gap-2">
                {isSubmitting ? 'Guardando...' : <><FaSave/> Publicar</>}
              </button>
          </div>
      </div>

      <main className="container mx-auto px-6 max-w-5xl mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2">
                    <FaUserTie className="text-indigo-600 text-lg"/> 1. Propietarios (Captación)
                </h3>
                
                <div className="flex gap-4 items-end mb-4">
                    <div className="form-control flex-1">
                        <label className="label font-bold text-gray-600">Buscar Propietario</label>
                        <select 
                            className="select select-bordered w-full bg-white text-gray-700"
                            value={propietarioSelectId}
                            onChange={(e) => setPropietarioSelectId(e.target.value)}
                        >
                            <option value="">-- Seleccione --</option>
                            {propietarios.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre} ({p.dni})</option>
                            ))}
                        </select>
                    </div>
                    <button type="button" onClick={agregarPropietario} className="btn btn-primary bg-indigo-600 text-white border-none"><FaPlus/> Agregar</button>
                </div>

                <div className="space-y-2">
                    {propietariosSeleccionados.length === 0 && <p className="text-sm text-gray-400 italic">No hay propietarios seleccionados.</p>}
                    {propietariosSeleccionados.map((p, index) => (
                        <div key={index} className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <div>
                                <p className="font-bold text-indigo-900">{p.nombre}</p>
                                <p className="text-xs text-indigo-600">DNI: {p.dni} | Cel: {p.celular1}</p>
                            </div>
                            <button type="button" onClick={() => quitarPropietario(p.id)} className="btn btn-ghost btn-sm text-red-500"><FaTrash/></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2">
                    <FaHome className="text-indigo-500 text-lg"/> 2. Datos del Inmueble
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600">Tipo *</label>
                        <select {...register('tipo', {required:true})} className="select select-bordered w-full bg-white text-gray-700">
                            <option value="Casa">Casa</option>
                            <option value="Departamento">Departamento</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Local">Local Comercial</option>
                            <option value="Oficina">Oficina</option>
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-600">Categoría *</label>
                        <select {...register('modalidad', {required:true})} className="select select-bordered w-full bg-white text-gray-700">
                            <option value="Venta">Venta</option>
                            <option value="Alquiler">Alquiler</option>
                            <option value="Anticresis">Anticresis</option>
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-600">Ubicación *</label>
                        <select {...register('ubicacion', {required:true})} className="select select-bordered w-full bg-white text-gray-700">
                            <option value="">-- Seleccione --</option>
                            <option value="Arequipa">Arequipa</option>
                            <option value="Yanahuara">Yanahuara</option>
                            <option value="Cayma">Cayma</option>
                            <option value="Cerro Colorado">Cerro Colorado</option>
                            <option value="Sachaca">Sachaca</option>
                            <option value="JLByR">J.L.B y Rivero</option>
                            <option value="Socabaya">Socabaya</option>
                            <option value="Miraflores">Miraflores</option>
                        </select>
                    </div>
                </div>

                <div className="form-control mb-6">
                    <label className="label font-bold text-gray-600">Dirección Exacta</label>
                    <input {...register('direccion')} className="input input-bordered w-full bg-white text-gray-700"/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 text-sm">Precio (Dólares/Soles) *</label>
                        <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-300">
                            <select 
                                {...register('moneda')} 
                                className="bg-gray-100 px-3 font-bold text-indigo-700 outline-none border-r border-gray-300 text-xs"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="PEN">PEN (S/)</option>
                            </select>
                            <input 
                                type="number" 
                                step="0.01" 
                                {...register('precio', {required:true})} 
                                className="input w-full bg-white font-bold text-lg focus:outline-none border-none text-gray-800"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label font-bold text-gray-600">Área Total (m²)</label>
                        <input type="number" step="0.01" {...register('area')} className="input input-bordered w-full bg-white text-gray-700" placeholder="0.00"/>
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-600">Área Construida (m²)</label>
                        <input type="number" step="0.01" {...register('areaConstruida')} className="input input-bordered w-full bg-white text-gray-700" placeholder="0.00"/>
                    </div>
                </div>

                {esDepartamento && (
                    <div className="form-control bg-blue-50 p-4 rounded-xl border border-blue-100 transition-all mt-6 shadow-sm">
                        <label className="label font-bold text-blue-800 text-sm mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
                            <FaCheckCircle/> ¿Tiene Mantenimiento?
                        </label>
                        
                        <div className="flex gap-4 mb-4 pl-2 justify-around">
                            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all w-full justify-center
                                ${tieneMantenimientoValue === 'si' ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-blue-50'}`}>
                                <input type="radio" value="si" {...register('tieneMantenimiento')} className="hidden" />
                                {tieneMantenimientoValue === 'si' ? <FaCheckCircle className="text-blue-600 text-3xl" /> : <FaRegCircle className="text-gray-300 text-3xl" />}
                                <span className="text-lg font-bold text-blue-900">Sí</span>
                            </label>

                            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all w-full justify-center
                                ${tieneMantenimientoValue === 'no' ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" value="no" {...register('tieneMantenimiento')} className="hidden" />
                                {tieneMantenimientoValue === 'no' ? <FaCheckCircle className="text-gray-600 text-3xl" /> : <FaRegCircle className="text-gray-300 text-3xl" />}
                                <span className="text-lg font-bold text-gray-800">No</span>
                            </label>
                        </div>

                        {tieneMantenimientoValue === 'si' && (
                            <div className="relative animate-in slide-in-from-top-2 pl-2">
                                <span className="absolute left-4 top-3 text-blue-500 font-bold text-lg">S/</span>
                                <input type="number" step="0.01" {...register('mantenimiento')} className="input input-bordered w-full pl-12 bg-white font-bold text-blue-900 text-lg border-blue-300 focus:border-blue-500" placeholder="Monto mensual"/>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2">
                    <FaBed className="text-orange-500 text-lg"/> 3. Detalles y Distribución
                </h3>
                
                <div className="grid grid-cols-3 gap-6 mb-8 text-center bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm">
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 gap-2"><FaBed/> Dormitorios</label><input type="number" {...register('habitaciones')} className="input input-bordered w-full text-center bg-white shadow-sm text-gray-700 font-bold"/></div>
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 gap-2"><FaBath/> Baños</label><input type="number" {...register('banos')} className="input input-bordered w-full text-center bg-white shadow-sm text-gray-700 font-bold"/></div>
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 gap-2"><FaCar/> Cocheras</label><input type="number" {...register('cocheras')} className="input input-bordered w-full text-center bg-white shadow-sm text-gray-700 font-bold"/></div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="form-control">
                        <div className="flex justify-between items-center mb-2">
                            <label className="label font-bold text-gray-700 text-lg flex gap-2 items-center"><FaMagic className="text-purple-500"/> Descripción Comercial</label>
                            <button type="button" onClick={handleGenerarIA} disabled={generandoIA} className={`btn btn-sm border-none gap-2 px-5 rounded-full shadow-md transition-all ${generandoIA ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-105'}`}>
                                <FaMagic className={generandoIA ? "animate-spin" : "text-yellow-300"} />
                                {generandoIA ? "Cocinando..." : "Redactar con IA"}
                            </button>
                        </div>
                        <textarea {...register('descripcion')} className="textarea textarea-bordered h-48 w-full text-base bg-gray-50 focus:bg-white p-4 rounded-xl text-gray-700 shadow-inner" placeholder="Descripción con gancho comercial..."></textarea>
                    </div>
                    
                    <div className="form-control">
                        <label className="label font-bold text-gray-700 text-lg flex gap-2 items-center"><FaListUl className="text-blue-500"/> Distribución Detallada</label>
                        <textarea {...register('detalles')} className="textarea textarea-bordered h-48 w-full text-base bg-gray-50 focus:bg-white p-4 rounded-xl text-gray-700 shadow-inner" placeholder="Piso por piso, acabados y amenidades..."></textarea>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2">
                    <FaGavel className="text-blue-500 text-lg"/> 4. Datos Legales
                </h3>

                <div className="form-control mb-6">
                    <label className="label font-bold text-gray-600">Partida Registral (Principal)</label>
                    <input {...register('partidaRegistral')} className="input input-bordered w-full bg-white font-mono text-gray-700"/>
                </div>

                {esDepartamento && (
                    <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-control"><label className="label font-bold text-gray-600 text-xs uppercase">Partida Adicional</label><input {...register('partidaAdicional')} className="input input-bordered input-sm w-full bg-white text-gray-700"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-600 text-xs uppercase">Partida Cochera</label><input {...register('partidaCochera')} className="input input-bordered input-sm w-full bg-white text-gray-700"/></div>
                        <div className="form-control"><label className="label font-bold text-gray-600 text-xs uppercase">Partida Depósito</label><input {...register('partidaDeposito')} className="input input-bordered input-sm w-full bg-white text-gray-700"/></div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600">Fecha Captación</label><input type="date" {...register('fechaCaptacion')} className="input input-bordered w-full bg-white text-gray-700"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600">Inicio Contrato</label><input type="date" {...register('inicioContrato')} className="input input-bordered w-full bg-white text-gray-700"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600">Vencimiento</label><input type="date" {...register('finContrato')} className="input input-bordered w-full bg-white text-gray-700"/></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="form-control"><label className="label font-bold text-gray-600">Tipo Contrato</label><select {...register('tipoContrato')} className="select select-bordered w-full bg-white text-gray-700"><option value="Sin Exclusiva">Sin Exclusiva</option><option value="Exclusiva">Exclusiva</option></select></div>
                    <div className="form-control"><label className="label font-bold text-gray-600">Comisión (%)</label><input type="number" step="0.1" {...register('comision')} className="input input-bordered w-full bg-white text-gray-700 font-bold"/></div>
                </div>

                {/* CHECKLIST DE DOCUMENTOS (MODIFICADO) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 shadow-inner">
                    <label className="label font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2 text-xs uppercase">
                        <FaFilePdf className="text-gray-500"/> Documentación en Regla
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Se ocultan si es ALQUILER */}
                        {modalidadActual !== 'Alquiler' && (
                            <>
                                <CustomDocCheckbox label="Testimonio" name="testimonio" register={register} watch={watch} />
                                <CustomDocCheckbox label="HR (Hoja Resumen)" name="hr" register={register} watch={watch} />
                                <CustomDocCheckbox label="PU (Predio Urbano)" name="pu" register={register} watch={watch} />
                            </>
                        )}
                        
                        {/* Siempre aparecen con los nombres actualizados */}
                        <CustomDocCheckbox label="Impuesto Predial" name="impuestoPredial" register={register} watch={watch} />
                        <CustomDocCheckbox label="Arbitrios Municipales" name="arbitrios" register={register} watch={watch} />
                        <CustomDocCheckbox label="Copia Literal" name="copiaLiteral" register={register} watch={watch} />

                        {/* Solo aparecen si es ALQUILER */}
                        {modalidadActual === 'Alquiler' && (
                            <>
                                <CustomDocCheckbox label="CRI" name="cri" register={register} watch={watch} />
                                <CustomDocCheckbox label="Recibos de agua y luz" name="reciboAguaLuz" register={register} watch={watch} />
                            </>
                        )}
                    </div>
                </div>

                <div className="form-control">
                    <label className="label font-bold text-gray-600">Observaciones Legales / Notas Adicionales</label>
                    <textarea {...register('observaciones')} className="textarea textarea-bordered h-32 w-full bg-white text-gray-700 shadow-inner" placeholder="Escribe aquí cualquier detalle legal importante o anotaciones adicionales sobre la documentación..."></textarea>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2">
                    <FaLink className="text-blue-400 text-lg"/> 5. Links Externos
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    <input {...register('link1')} className="input input-bordered input-sm w-full bg-white text-gray-700" placeholder="Drive de Fotos/Videos (Principal)"/>
                    <input {...register('link2')} className="input input-bordered input-sm w-full bg-white text-gray-700" placeholder="Enlace adicional 2"/>
                    <input {...register('link3')} className="input input-bordered input-sm w-full bg-white text-gray-700" placeholder="Enlace adicional 3"/>
                    <input {...register('link4')} className="input input-bordered input-sm w-full bg-white text-gray-700" placeholder="Enlace adicional 4"/>
                    <input {...register('link5')} className="input input-bordered input-sm w-full bg-white text-gray-700" placeholder="Enlace adicional 5"/>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2">
                    <FaUserTie className="text-indigo-500 text-lg"/> 6. Asignación
                </h3>
                <div className="form-control relative">
                    <label className="label font-bold text-gray-600 text-sm">Asesor Encargado de la Captación</label>
                    <div className="flex items-center">
                        <FaSearch className="absolute left-3 text-gray-400 z-10"/>
                        <input 
                            type="text" 
                            className="input input-bordered w-full bg-white pl-10 text-gray-700" 
                            placeholder="Empieza a escribir el nombre del asesor..."
                            value={busquedaAsesor}
                            onChange={(e) => {
                                setBusquedaAsesor(e.target.value);
                                setMostrarSugerencias(true);
                            }}
                            onFocus={() => setMostrarSugerencias(true)}
                        />
                    </div>
                    {mostrarSugerencias && busquedaAsesor.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto mt-1 border-t-4 border-indigo-500">
                            {filtrarAsesores.length > 0 ? (
                                filtrarAsesores.map((asesor) => (
                                    <div key={asesor.id} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 flex flex-col" onClick={() => seleccionarAsesor(asesor)}>
                                        <span className="font-bold text-slate-800">{asesor.nombre}</span>
                                        <span className="text-[10px] text-indigo-500 font-bold uppercase">{asesor.rol}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-gray-400 text-sm italic text-center">No hay coincidencias en la base de datos</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2">
                    <FaImages className="text-yellow-500 text-lg"/> 7. Galería Multimedia
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="form-control">
                        <label className="label font-bold text-gray-600">Foto de Portada</label>
                        <input type="file" accept="image/*" {...register('fotoPrincipal')} onChange={handleMainPhotoChange} className="file-input file-input-bordered file-input-primary w-full bg-white shadow-sm" />
                        {previewMain && <img src={previewMain} alt="Portada" className="mt-4 h-48 w-full object-cover rounded-2xl border-4 border-white shadow-lg"/>}
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-600">Álbum de Galería</label>
                        <input type="file" multiple accept="image/*" {...register('galeria')} onChange={handleGalleryChange} className="file-input file-input-bordered w-full bg-white shadow-sm" />
                        {previewGallery.length > 0 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                                {previewGallery.map((src, i) => <img key={i} src={src} className="h-20 w-20 object-cover rounded-xl border border-white shadow-md flex-shrink-0"/>)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-xs uppercase tracking-wider"><FaVideo className="text-red-500"/> Enlace de Video (YouTube)</label><input type="text" {...register('videoUrl')} className="input input-bordered w-full bg-white text-gray-700" placeholder="https://www.youtube.com/watch?v=..."/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-xs uppercase tracking-wider"><FaFilePdf className="text-red-700"/> Documento PDF Externo</label><input type="file" accept="application/pdf" {...register('fichaTecnica')} className="file-input file-input-bordered file-input-sm w-full bg-white"/></div>
                    <div className="form-control md:col-span-2"><label className="label font-bold text-gray-600 text-xs uppercase tracking-wider"><FaMapMarkerAlt className="text-green-600"/> Ubicación en Mapa (Iframe)</label><input type="text" {...register('mapaUrl')} className="input input-bordered w-full bg-white text-gray-700" placeholder="Inserte aquí el iframe de Google Maps..."/></div>
                </div>
            </div>

            <div className="flex justify-end pt-10">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none px-16 py-4 h-auto text-xl font-black uppercase tracking-widest shadow-2xl hover:shadow-indigo-400 hover:-translate-y-2 transition-all duration-300">
                    {isSubmitting ? (
                        <span className="flex items-center gap-3"><span className="loading loading-spinner"></span> Sincronizando...</span>
                    ) : (
                        <span className="flex items-center gap-3"><FaSave/> Publicar Captación</span>
                    )}
                </button>
            </div>

        </form>
      </main>
    </div>
  );
}