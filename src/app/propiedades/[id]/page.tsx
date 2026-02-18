'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { 
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaSave, 
  FaMapMarkerAlt, FaBed, FaBath, FaCar, FaRulerCombined, 
  FaUserTie, FaWhatsapp, FaFileContract, FaTag, FaBuilding,
  FaYoutube, FaFilePdf, FaMap, FaInfoCircle, FaPlayCircle, FaLink, FaUsers,
  FaAlignLeft
} from 'react-icons/fa';

// URL DE TU BACKEND
const BACKEND_URL = 'https://sillar-backend.onrender.com/';

export default function PropiedadDetallePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  const [propiedad, setPropiedad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informacion');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [observaciones, setObservaciones] = useState<any>({});
  const [estadosDocs, setEstadosDocs] = useState<any>({});
  const [guardandoObs, setGuardandoObs] = useState(false);

  useEffect(() => {
    const cargar = async () => {
        if(!id) return;
        try {
            const { data } = await api.get(`/propiedades/${id}`);
            setPropiedad(data);
            setObservaciones(data.observaciones || {});
            setEstadosDocs({
                testimonio: data.testimonio, hr: data.hr, pu: data.pu,
                impuestoPredial: data.impuestoPredial, arbitrios: data.arbitrios,
                copiaLiteral: data.copiaLiteral
            });
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    };
    cargar();
  }, [id]);

  const toggleEstado = (key: string) => {
      const actual = estadosDocs[key];
      let nuevo = false; 
      if (actual === false) nuevo = true;        
      else if (actual === true) nuevo = null as any; 
      else if (actual === null) nuevo = false;   
      setEstadosDocs({ ...estadosDocs, [key]: nuevo });
  };

  const guardarCambios = async () => {
    setGuardandoObs(true);
    try {
        await api.put(`/propiedades/${id}`, { observaciones, ...estadosDocs });
        alert('✅ Datos actualizados.');
    } catch (e) { alert('❌ Error'); }
    finally { setGuardandoObs(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;
  if (!propiedad) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold uppercase">Error de carga</div>;

  const images = [propiedad.fotoPrincipal, ...(propiedad.galeria || [])].filter(Boolean);
  const getFullImageUrl = (path: string) => path?.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  const linksExternos = [propiedad.link1, propiedad.link2, propiedad.link3, propiedad.link4, propiedad.link5].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      
      {/* 1. HERO - MÁS AIRE */}
      <div className="relative bg-gray-900 h-[45vh] lg:h-[55vh] w-full overflow-hidden">
          {images.length > 0 ? (
              <img src={getFullImageUrl(images[0])} className="w-full h-full object-cover opacity-60 blur-sm scale-105" alt="Hero background"/>
          ) : <div className="w-full h-full bg-gray-800"></div>}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end pb-32 lg:pb-40 px-10">
              <div className="container mx-auto max-w-7xl">
                  <div className="flex gap-4 mb-8">
                      <span className={`badge badge-lg border-none text-white font-black py-6 px-10 uppercase text-xs tracking-widest shadow-2xl ${propiedad.modalidad === 'Venta' ? 'bg-orange-600' : 'bg-blue-600'}`}>{propiedad.modalidad}</span>
                      <span className="badge badge-lg bg-white/10 backdrop-blur-2xl border border-white/20 text-white py-6 px-10 font-black uppercase text-xs tracking-widest">{propiedad.tipo}</span>
                  </div>
                  <h1 className="text-4xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none drop-shadow-2xl">{propiedad.ubicacion}</h1>
                  <p className="text-white/80 text-2xl flex items-center gap-4 font-bold uppercase tracking-tighter"><FaMapMarkerAlt className="text-orange-500"/> {propiedad.direccion}</p>
              </div>
          </div>
      </div>

      <main className="container mx-auto p-10 max-w-7xl -mt-28 relative z-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* IZQUIERDA - CONTENIDO */}
            <div className="lg:col-span-2 space-y-12">
                <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-4 flex gap-4 border border-white/50">
                    <button onClick={() => setActiveTab('informacion')} className={`flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab==='informacion' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:bg-gray-50'}`}>Información</button>
                    <button onClick={() => setActiveTab('ubicacion')} className={`flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab==='ubicacion' ? 'bg-orange-500 text-white shadow-xl shadow-orange-100' : 'text-gray-400 hover:bg-gray-50'}`}>Ubicación</button>
                    {isAdmin && <button onClick={() => setActiveTab('legal')} className={`flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab==='legal' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'text-gray-400 hover:bg-gray-50'}`}>Legal</button>}
                </div>

                <div className="bg-white rounded-[50px] shadow-2xl border border-slate-100 p-10 lg:p-16">
                    {activeTab === 'informacion' && (
                        <div className="space-y-16 animate-fade-in">
                            {images.length > 0 ? (
                                <div className="space-y-10">
                                    <div className="h-[500px] rounded-[40px] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                                        <img src={getFullImageUrl(images[currentImageIndex])} className="w-full h-full object-contain p-6" alt="Propiedad"/>
                                    </div>
                                    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                                        {images.map((img:string, idx:number) => (
                                            <img key={idx} src={getFullImageUrl(img)} onClick={() => setCurrentImageIndex(idx)} className={`w-28 h-28 object-cover rounded-3xl cursor-pointer border-4 transition-all duration-300 ${currentImageIndex===idx ? 'border-indigo-600 scale-110 shadow-2xl' : 'border-transparent opacity-50 hover:opacity-100'}`}/>
                                        ))}
                                    </div>
                                </div>
                            ) : <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">Sin imágenes</div>}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-12 border-y border-slate-100">
                                <div className="text-center"><FaRulerCombined className="mx-auto text-4xl text-emerald-500 mb-4"/><p className="font-black text-2xl text-slate-800">{propiedad.area} m²</p><p className="text-[10px] font-black text-slate-400 uppercase">Área Total</p></div>
                                <div className="text-center"><FaBed className="mx-auto text-4xl text-indigo-500 mb-4"/><p className="font-black text-2xl text-slate-800">{propiedad.habitaciones}</p><p className="text-[10px] font-black text-slate-400 uppercase">Dormitorios</p></div>
                                <div className="text-center"><FaBath className="mx-auto text-4xl text-sky-500 mb-4"/><p className="font-black text-2xl text-slate-800">{propiedad.banos}</p><p className="text-[10px] font-black text-slate-400 uppercase">Baños</p></div>
                                <div className="text-center"><FaCar className="mx-auto text-4xl text-orange-500 mb-4"/><p className="font-black text-2xl text-slate-800">{propiedad.cocheras}</p><p className="text-[10px] font-black text-slate-400 uppercase">Cocheras</p></div>
                            </div>

                            {propiedad.descripcion && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Descripción Comercial</h3>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-xl font-medium">{propiedad.descripcion}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* DERECHA - SIDEBAR */}
            <div className="lg:col-span-1 space-y-10">
                <div className="bg-white p-12 rounded-[50px] shadow-2xl shadow-indigo-100 border border-slate-100 sticky top-32">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Precio Inmueble</p>
                    <div className="flex items-baseline gap-2 text-indigo-950 mb-12">
                        <span className="text-6xl font-black tracking-tighter">{propiedad.moneda === 'USD' ? '$' : 'S/'} {Number(propiedad.precio).toLocaleString()}</span>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[40px] border border-blue-100 mb-12">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200"><FaUserTie size={24} /></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Titular Inmueble</span>
                                <span className="text-xl font-black text-slate-900 truncate max-w-[180px]">
                                    {propiedad.Propietarios?.[0]?.nombre || "No asignado"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mb-12">
                        <div className="avatar placeholder"><div className="bg-indigo-600 text-white rounded-[25px] w-20 h-20 flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-100">{propiedad.asesor?.charAt(0).toUpperCase() || 'S'}</div></div>
                        <div>
                            <p className="font-black text-slate-900 text-2xl leading-tight">{propiedad.asesor || 'Asesor Sillar'}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Agente Encargado</p>
                        </div>
                    </div>

                    {propiedad.Propietarios?.[0]?.celular1 && (
                        <a href={`https://wa.me/51${propiedad.Propietarios[0].celular1}`} target="_blank" className="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none w-full font-black gap-4 shadow-2xl shadow-emerald-100 h-20 rounded-[30px] text-xl flex items-center justify-center transition-all hover:-translate-y-2">
                            <FaWhatsapp size={28}/> CONTACTAR DUEÑO
                        </a>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}