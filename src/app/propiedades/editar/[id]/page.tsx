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
  FaMagic, FaListUl, FaCheckCircle, FaCheck, FaPercent, FaTimes, FaFileUpload 
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
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('');
  const [mostrarSugerenciasUbi, setMostrarSugerenciasUbi] = useState(false);
  const [mostrarSugerenciasAsesor, setMostrarSugerenciasAsesor] = useState(false);

  const modalidadActual = watch('modalidad');

  // 1. CARGAR DATOS EXISTENTES
  useEffect(() => {
    const cargarTodo = async () => {
        try {
            await fetchPropietarios();
            const token = localStorage.getItem('token');
            
            // Cargar Asesores
            const resAsesores = await fetch(`${API_BASE_URL}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } });
            const dataAsesores = await resAsesores.json();
            setAsesoresDB(dataAsesores);

            // Cargar Propiedad
            const { data: p } = await api.get(`/propiedades/${id}`);
            
            // Llenar campos básicos
            Object.keys(p).forEach(key => setValue(key, p[key]));
            
            // Llenar estados especiales
            setBusquedaUbicacion(p.ubicacion);
            setBusquedaAsesor(p.asesor || '');
            if (p.Propietarios) setPropietariosSeleccionados(p.Propietarios);
            
            setLoading(false);
        } catch (e) {
            alert("Error al cargar datos");
            router.back();
        }
    };
    cargarTodo();
  }, [id, fetchPropietarios, setValue, router]);

  const seleccionarDistrito = (d: string) => { 
    setBusquedaUbicacion(d); 
    setValue('ubicacion', d); 
    setMostrarSugerenciasUbi(false); 
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
        // En la edición enviamos JSON directo al PUT que ya tenemos en el controlador
        const body = {
            ...data,
            propietariosIds: propietariosSeleccionados.map(p => p.id)
        };
        await api.put(`/propiedades/${id}`, body);
        alert('✅ Propiedad Actualizada');
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
                  <button type="button" onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm text-gray-500"><FaArrowLeft/></button>
                  <h1 className="text-xl font-bold text-indigo-900 uppercase">EDITAR_CAPTACIÓN_V3</h1>
              </div>
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none shadow-md px-8 text-white gap-2 font-bold text-xs uppercase">
                {isSubmitting ? 'Guardando...' : <><FaSave/> ACTUALIZAR</>}
              </button>
          </div>
      </div>

      <main className="container mx-auto px-6 max-w-5xl mt-8">
        <form className="space-y-8">
            {/* 1. PROPIETARIOS */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 font-mono"><FaUserTie className="text-indigo-600"/> 1. PROPIETARIOS</h3>
                <div className="flex flex-wrap gap-2">
                    {propietariosSeleccionados.map(p => (
                        <div key={p.id} className="badge badge-lg p-4 gap-3 bg-indigo-50 border-indigo-200 text-indigo-800 font-bold uppercase">
                            {p.nombre}
                        </div>
                    ))}
                    <p className="text-[10px] text-gray-400 italic block w-full mt-2">Los propietarios se gestionan desde la ficha original por seguridad.</p>
                </div>
            </div>

            {/* 2. DATOS INMUEBLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaHome className="text-indigo-500"/> 2. DATOS INMUEBLE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">TIPO</label>
                        <select {...register('tipo')} className="select select-bordered w-full bg-white"><option value="Casa">Casa</option><option value="Departamento">Departamento</option><option value="Terreno">Terreno</option><option value="Local">Local Comercial</option></select>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">CATEGORÍA</label>
                        <select {...register('modalidad')} className="select select-bordered w-full bg-white text-sm"><option value="Venta">Venta</option><option value="Alquiler">Alquiler</option></select>
                    </div>
                    <div className="form-control relative">
                        <label className="label font-bold text-gray-600 text-[10px] uppercase">DISTRITO</label>
                        <input type="text" className="input input-bordered w-full bg-white text-sm" value={busquedaUbicacion} onChange={(e) => { setBusquedaUbicacion(e.target.value); setMostrarSugerenciasUbi(true); }} />
                        {mostrarSugerenciasUbi && (
                            <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                                {distritosArequipa.filter(d => d.toLowerCase().includes(busquedaUbicacion.toLowerCase())).map((d, i) => (
                                    <div key={i} className="p-2 hover:bg-indigo-50 cursor-pointer font-bold text-xs uppercase" onClick={() => seleccionarDistrito(d)}>{d}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Precio</label>
                        <div className="flex border rounded-lg overflow-hidden"><select {...register('moneda')} className="bg-gray-100 px-2 font-bold text-xs border-r"><option value="USD">USD</option><option value="PEN">PEN</option></select><input type="number" step="0.01" {...register('precio')} className="input w-full bg-white font-bold"/></div>
                    </div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">ÁREA TOTAL</label><input type="number" step="0.01" {...register('area')} className="input input-bordered w-full bg-white"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">ÁREA CONSTRUIDA</label><input type="number" step="0.01" {...register('areaConstruida')} className="input input-bordered w-full bg-white"/></div>
                </div>
            </div>

            {/* 3. DISTRIBUCIÓN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaBed className="text-orange-500"/> 3. DISTRIBUCIÓN</h3>
                <div className="grid grid-cols-3 gap-6 mb-8 text-center bg-orange-50 p-4 rounded-xl">
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Hab.</label><input type="number" {...register('habitaciones')} className="input input-bordered w-full text-center bg-white"/></div>
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Baños</label><input type="number" {...register('banos')} className="input input-bordered w-full text-center bg-white"/></div>
                    <div className="form-control"><label className="label justify-center font-bold text-gray-600 text-[10px] uppercase">Coch.</label><input type="number" {...register('cocheras')} className="input input-bordered w-full text-center bg-white"/></div>
                </div>
                <div className="form-control mb-6"><label className="label font-bold text-gray-700 text-xs uppercase">Descripción Comercial</label><textarea {...register('descripcion')} className="textarea textarea-bordered h-40 bg-white text-sm"></textarea></div>
            </div>

            {/* 4. DATOS LEGALES */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaGavel className="text-blue-500"/> 4. DATOS LEGALES</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Partida Registral</label><input {...register('partidaRegistral')} className="input input-bordered w-full bg-white"/></div>
                    <div className="form-control"><label className="label font-bold text-gray-600 text-[10px] uppercase">Comisión (%)</label><input type="number" step="0.1" {...register('comision')} className="input input-bordered w-full bg-white font-bold"/></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['testimonio', 'hr', 'pu', 'impuestoPredial', 'arbitrios', 'copiaLiteral', 'cri', 'reciboAguaLuz'].map(doc => (
                        <label key={doc} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer bg-gray-50 hover:bg-white transition-all">
                            <input type="checkbox" {...register(doc)} className="checkbox checkbox-primary checkbox-sm" />
                            <span className="text-[10px] font-bold uppercase">{doc}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* 5. LINKS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaLink className="text-blue-400"/> 5. LINKS EXTERNOS</h3>
                <div className="grid grid-cols-1 gap-3">
                    {[1,2,3,4,5].map(num => (
                        <input key={num} {...register(`link${num}`)} className="input input-bordered input-sm w-full bg-white text-xs" placeholder={`Link ${num}`}/>
                    ))}
                </div>
            </div>

            <p className="text-center text-gray-400 text-xs italic">Para cambiar fotos o subir nuevos PDFs de auditoría, utiliza la vista de detalle de la propiedad.</p>

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