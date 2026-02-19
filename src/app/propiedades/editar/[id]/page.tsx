'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { useInmobiliariaStore } from '../../../../store/useInmobiliariaStore';
import api from '../../../../services/api';
import { 
  FaHome, FaBed, FaBath, FaCar, FaImages, FaSave, FaArrowLeft, FaVideo, 
  FaUserTie, FaGavel, FaLink, FaPlus, FaTrash, FaSearch, FaMapMarkerAlt, 
  FaMagic, FaListUl, FaCheck, FaPercent, FaTimes, FaFileUpload 
} from 'react-icons/fa';

const API_BASE_URL = 'https://sillar-backend.onrender.com/api';

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
  const { register, handleSubmit, watch, setValue } = useForm();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propietariosSeleccionados, setPropietariosSeleccionados] = useState<any[]>([]);
  const [asesoresDB, setAsesoresDB] = useState<any[]>([]);
  const [busquedaAsesor, setBusquedaAsesor] = useState('');
  const [mostrarSugerenciasAsesor, setMostrarSugerenciasAsesor] = useState(false);
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');
  const [mostrarSugerenciasUbi, setMostrarSugerenciasUbi] = useState(false);

  // Estados para Multimedia
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [fotoPrincipalFile, setFotoPrincipalFile] = useState<File | null>(null);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);

  const modalidadActual = watch('modalidad');

  useEffect(() => {
    const cargarDatos = async () => {
        try {
            await fetchPropietarios();
            const token = localStorage.getItem('token');
            
            // 1. Cargar Asesores
            const resAsesores = await fetch(`${API_BASE_URL}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } });
            const dataAsesores = await resAsesores.json();
            setAsesoresDB(dataAsesores);

            // 2. Cargar Datos de la Propiedad
            const { data: p } = await api.get(`/propiedades/${id}`);
            
            // Llenar Formulario
            Object.keys(p).forEach(key => setValue(key, p[key]));
            
            // Sincronizar estados locales
            setBusquedaUbicacion(p.ubicacion);
            setBusquedaAsesor(p.asesor || '');
            if (p.Propietarios) setPropietariosSeleccionados(p.Propietarios);
            if (p.fotoPrincipal) setPreviewMain(p.fotoPrincipal.startsWith('http') ? p.fotoPrincipal : `https://sillar-backend.onrender.com${p.fotoPrincipal}`);
            if (p.galeria) setPreviewGallery(p.galeria.map((img: string) => img.startsWith('http') ? img : `https://sillar-backend.onrender.com${img}`));

            setLoading(false);
        } catch (e) {
            console.error(e);
            alert("Error al cargar la propiedad");
            router.back();
        }
    };
    cargarDatos();
  }, [id]);

  // Handlers Multimedia (Igual que en el de crear)
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

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
        const formData = new FormData();
        
        // Adjuntar campos de texto/booleanos
        Object.keys(data).forEach(key => {
            if (typeof data[key] !== 'object') formData.append(key, data[key]);
        });

        // Adjuntar IDs de propietarios
        propietariosSeleccionados.forEach(p => formData.append('propietariosIds[]', p.id));

        // Adjuntar Archivos si se cambiaron
        if (fotoPrincipalFile) formData.append('fotoPrincipal', fotoPrincipalFile);
        galeriaFiles.forEach(f => formData.append('galeria', f));

        await api.put(`/propiedades/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('✅ Propiedad Actualizada con éxito');
        router.push(`/propiedades/${id}`);
    } catch (e) {
        alert('❌ Error al actualizar');
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
                  <button onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm text-gray-500"><FaArrowLeft/></button>
                  <h1 className="text-xl font-bold text-indigo-900 uppercase">EDITAR_CAPTACIÓN_V3</h1>
              </div>
              <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none shadow-md px-8 text-white font-bold text-xs uppercase">
                {isSubmitting ? 'Actualizando...' : <><FaSave/> ACTUALIZAR</>}
              </button>
          </div>
      </div>

      <main className="container mx-auto px-6 max-w-5xl mt-8">
        <form className="space-y-8">
            
            {/* 1. PROPIETARIOS (Sincronizado) */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 font-mono"><FaUserTie className="text-indigo-600"/> 1. PROPIETARIOS</h3>
                <div className="flex flex-wrap gap-2">
                    {propietariosSeleccionados.map(p => (
                        <div key={p.id} className="badge badge-lg p-4 gap-3 bg-indigo-50 border-indigo-200 text-indigo-800 font-bold uppercase">
                            {p.nombre}
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. DATOS INMUEBLE (Sincronizado) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaHome className="text-indigo-500"/> 2. DATOS INMUEBLE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">TIPO</label>
                        <select {...register('tipo')} className="select select-bordered w-full bg-white"><option value="Casa">Casa</option><option value="Departamento">Departamento</option><option value="Terreno">Terreno</option></select>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">CATEGORÍA</label>
                        <select {...register('modalidad')} className="select select-bordered w-full bg-white"><option value="Venta">Venta</option><option value="Alquiler">Alquiler</option></select>
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">DISTRITO</label>
                        <input type="text" className="input input-bordered w-full bg-white" value={busquedaUbicacion} onChange={(e) => { setBusquedaUbicacion(e.target.value); setMostrarSugerenciasUbi(true); }} />
                        {mostrarSugerenciasUbi && (
                          <div className="absolute bg-white border shadow-lg rounded-lg z-50 w-64 max-h-40 overflow-y-auto mt-16">
                            {distritosArequipa.filter(d => d.toLowerCase().includes(busquedaUbicacion.toLowerCase())).map(d => (
                              <div key={d} className="p-2 hover:bg-gray-100 cursor-pointer text-xs font-bold uppercase" onClick={() => { setBusquedaUbicacion(d); setValue('ubicacion', d); setMostrarSugerenciasUbi(false); }}>{d}</div>
                            ))}
                          </div>
                        )}
                    </div>
                </div>
                <div className="form-control mb-6"><label className="label font-bold text-gray-600 text-[10px] uppercase">Dirección</label><input {...register('direccion')} className="input input-bordered w-full bg-white"/></div>
            </div>

            {/* 3. MULTIMEDIA (Agregado) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaImages className="text-yellow-500"/> 3. MULTIMEDIA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="form-control">
                        <label className="label font-bold text-xs uppercase">Foto Portada</label>
                        <input type="file" accept="image/*" onChange={handleMainPhotoChange} className="file-input file-input-bordered w-full bg-white" />
                        {previewMain && <img src={previewMain} className="mt-4 h-40 w-full object-cover rounded-xl shadow-md" alt="Portada" />}
                    </div>
                    <div className="form-control">
                        <label className="label font-bold text-xs uppercase">Galería</label>
                        <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="file-input file-input-bordered w-full bg-white" />
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {previewGallery.map((src, i) => <img key={i} src={src} className="w-20 h-20 object-cover rounded-lg border shadow-sm" />)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. ASESOR (Agregado) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaUserTie className="text-indigo-500"/> 4. ASESOR ENCARGADO</h3>
                <div className="form-control">
                    <input type="text" className="input input-bordered w-full bg-white" value={busquedaAsesor} onChange={(e) => { setBusquedaAsesor(e.target.value); setMostrarSugerenciasAsesor(true); }} />
                    {mostrarSugerenciasAsesor && (
                        <div className="absolute bg-white border shadow-lg rounded-lg z-50 w-64 max-h-40 overflow-y-auto mt-12">
                            {asesoresDB.filter(a => a.nombre.toLowerCase().includes(busquedaAsesor.toLowerCase())).map(a => (
                                <div key={a.id} className="p-2 hover:bg-gray-100 cursor-pointer text-xs font-bold uppercase" onClick={() => { setBusquedaAsesor(a.nombre); setValue('asesor', a.nombre); setMostrarSugerenciasAsesor(false); }}>{a.nombre}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* BOTÓN FINAL */}
            <div className="flex justify-end pt-10">
                <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none px-16 py-4 h-auto text-xl font-black uppercase shadow-2xl">
                    {isSubmitting ? 'GUARDANDO...' : 'ACTUALIZAR PROPIEDAD'}
                </button>
            </div>

        </form>
      </main>
    </div>
  );
}