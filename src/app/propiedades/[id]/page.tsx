'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { 
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaSave, 
  FaMapMarkerAlt, FaBed, FaBath, FaCar, FaRulerCombined, 
  FaUserTie, FaWhatsapp, FaFileContract, FaTag, 
  FaYoutube, FaMap, FaInfoCircle, FaPlayCircle, FaLink, FaUsers,
  FaAlignLeft, FaFileUpload, FaEye, FaExternalLinkAlt,
  FaInstagram, FaTiktok, FaGlobe
} from 'react-icons/fa';

const BACKEND_URL = 'https://sillar-backend.onrender.com';

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
  const [documentosUrls, setDocumentosUrls] = useState<any>({});

  useEffect(() => {
    const cargar = async () => {
        if(!id) return;
        try {
            const { data } = await api.get(`/propiedades/${id}`);
            setPropiedad(data);
            setObservaciones(data.observaciones || {});
            setDocumentosUrls(data.documentosUrls || {});
            setEstadosDocs({
                testimonio: data.testimonio,
                hr: data.hr,
                pu: data.pu,
                impuestoPredial: data.impuestoPredial,
                arbitrios: data.arbitrios,
                copiaLiteral: data.copiaLiteral,
                cri: data.cri,
                reciboAguaLuz: data.reciboAguaLuz
            });
            setLoading(false);
        } catch (e) { 
            console.error(e);
            setLoading(false); 
        }
    };
    cargar();
  }, [id]);

  // --- FUNCIÓN PARA IDENTIFICAR PLATAFORMAS ---
  const getLinkConfig = (url: string) => {
    const link = url.toLowerCase();
    if (link.includes('sillarinmobiliaria.pe')) {
        return { label: 'Sillar Inmobiliaria', icon: <FaGlobe className="text-blue-600"/>, color: 'bg-blue-50 border-blue-100 text-blue-700' };
    }
    if (link.includes('instagram.com')) {
        return { label: 'Instagram', icon: <FaInstagram className="text-pink-600"/>, color: 'bg-pink-50 border-pink-100 text-pink-700' };
    }
    if (link.includes('tiktok.com')) {
        return { label: 'TikTok', icon: <FaTiktok className="text-black"/>, color: 'bg-gray-100 border-gray-200 text-gray-900' };
    }
    if (link.includes('urbania.pe')) {
        return { label: 'Urbania', icon: <FaLink className="text-red-600"/>, color: 'bg-red-50 border-red-100 text-red-700' };
    }
    return { label: 'Enlace Externo', icon: <FaExternalLinkAlt className="text-indigo-500"/>, color: 'bg-indigo-50 border-indigo-100 text-indigo-700' };
  };

  const getCleanMapUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('<iframe')) {
        const match = url.match(/src="([^"]+)"/);
        return match ? match[1] : '';
    }
    return url;
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('embed/')) return url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const toggleEstado = (key: string) => {
      const actual = estadosDocs[key];
      let nuevo = (actual === false) ? true : (actual === true) ? null : false;
      setEstadosDocs({ ...estadosDocs, [key]: nuevo });
  };

  const handleSubirPdfAuditoria = async (key: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentKey', key);
    try {
        const { data } = await api.post(`${BACKEND_URL}/api/propiedades/${id}/upload-pdf`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setDocumentosUrls({ ...documentosUrls, [key]: data.url });
        alert('✅ PDF subido.');
    } catch (e) { alert('❌ Error.'); }
  };

  const guardarCambios = async () => {
    setGuardandoObs(true);
    try {
        await api.put(`/propiedades/${id}`, { observaciones, ...estadosDocs });
        alert('✅ Auditoría actualizada.');
    } catch (e) { alert('❌ Error al guardar.'); }
    finally { setGuardandoObs(false); }
  };

  if (loading || !propiedad) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;

  const esVenta = propiedad.modalidad === 'Venta';
  const documentosList = esVenta ? [
    { key: 'testimonio', label: 'Testimonio' }, { key: 'hr', label: 'Hoja Resumen (HR)' }, { key: 'pu', label: 'Predio Urbano (PU)' },
    { key: 'impuestoPredial', label: 'Impuesto Predial' }, { key: 'arbitrios', label: 'Arbitrios' }, { key: 'copiaLiteral', label: 'Copia Literal' }
  ] : [
    { key: 'impuestoPredial', label: 'Impuesto Predial' }, { key: 'arbitrios', label: 'Arbitrios' }, { key: 'copiaLiteral', label: 'Copia Literal' },
    { key: 'cri', label: 'CRI' }, { key: 'reciboAguaLuz', label: 'Recibos Luz/Agua' }
  ];

  const images = [propiedad.fotoPrincipal, ...(propiedad.galeria || [])].filter(Boolean);
  const getFullImageUrl = (path: string) => path?.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  const getIcono = (estado: any) => estado === true ? <FaCheckCircle className="text-emerald-500 text-2xl"/> : estado === null ? <FaExclamationCircle className="text-amber-500 text-2xl"/> : <FaTimesCircle className="text-red-500 text-2xl"/>;
  const linksDisponibles = [propiedad.link1, propiedad.link2, propiedad.link3, propiedad.link4, propiedad.link5].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <div className="relative bg-gray-900 h-[40vh] lg:h-[50vh] w-full overflow-hidden">
          {images.length > 0 && <img src={getFullImageUrl(images[0])} className="w-full h-full object-cover opacity-60 blur-sm scale-105" alt="Banner" crossOrigin="anonymous" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-10 lg:p-16">
              <div className="container mx-auto max-w-7xl">
                  <div className="flex gap-3 mb-6">
                      <span className={`badge badge-lg border-none text-white font-bold py-5 px-8 ${propiedad.modalidad === 'Venta' ? 'bg-orange-600' : 'bg-blue-600'}`}>{propiedad.modalidad}</span>
                      <span className="badge badge-lg bg-white/20 backdrop-blur-md border-none text-white py-5 px-8 font-bold">{propiedad.tipo}</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4">{propiedad.ubicacion}</h1>
                  <p className="text-white/80 text-2xl flex items-center gap-3 font-medium"><FaMapMarkerAlt className="text-orange-400"/> {propiedad.direccion}</p>
              </div>
          </div>
      </div>

      <main className="container mx-auto p-6 max-w-7xl -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {['informacion', 'ubicacion', 'video', 'legal'].map((tab) => (
                        (tab !== 'legal' || isAdmin) && (tab !== 'video' || propiedad.videoUrl) && (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 flex-1 py-3 px-6 rounded-xl font-bold transition-all text-sm uppercase justify-center ${activeTab===tab ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:bg-gray-50'}`}>
                                {tab === 'informacion' ? <FaInfoCircle/> : tab === 'ubicacion' ? <FaMap/> : tab === 'video' ? <FaPlayCircle/> : <FaFileContract/>} {tab}
                            </button>
                        )
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 min-h-[400px]">
                    {activeTab === 'informacion' && (
                        <div className="space-y-8 animate-fade-in">
                            {images.length > 0 && (
                                <div className="space-y-4">
                                    <div className="h-[450px] rounded-2xl overflow-hidden relative bg-gray-100 border border-gray-200">
                                        <img src={getFullImageUrl(images[currentImageIndex])} className="w-full h-full object-contain" alt="Gallery" crossOrigin="anonymous"/>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {images.map((img:string, idx:number) => (
                                            <img key={idx} src={getFullImageUrl(img)} onClick={() => setCurrentImageIndex(idx)} crossOrigin="anonymous" className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all ${currentImageIndex===idx ? 'border-indigo-600 scale-95' : 'border-transparent hover:border-gray-300'}`}/>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100 text-center">
                                <div><FaRulerCombined className="mx-auto text-3xl text-emerald-500 mb-2"/><p className="font-black text-xl">{propiedad.area} m²</p><p className="text-xs font-bold text-gray-400 uppercase">Total</p></div>
                                <div><FaBed className="mx-auto text-3xl text-indigo-500 mb-2"/><p className="font-black text-xl">{propiedad.habitaciones}</p><p className="text-xs font-bold text-gray-400 uppercase">Hab.</p></div>
                                <div><FaBath className="mx-auto text-3xl text-sky-500 mb-2"/><p className="font-black text-xl">{propiedad.banos}</p><p className="text-xs font-bold text-gray-400 uppercase">Baños</p></div>
                                <div><FaCar className="mx-auto text-3xl text-orange-500 mb-2"/><p className="font-black text-xl">{propiedad.cocheras}</p><p className="text-xs font-bold text-gray-400 uppercase">Coch.</p></div>
                            </div>
                            {propiedad.descripcion && (
                                <div><h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-tighter"><FaTag className="text-indigo-500"/> Descripción</h3><p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">{propiedad.descripcion}</p></div>
                            )}
                            {(propiedad.detalles || propiedad.observaciones) && (
                                <div className="mt-8 pt-6 border-t border-gray-100"><h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-tighter"><FaAlignLeft className="text-purple-600"/> Distribución</h3><div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm"><p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">{propiedad.detalles || propiedad.observaciones}</p></div></div>
                            )}
                        </div>
                    )}
                    {activeTab === 'ubicacion' && (
                        <div className="animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{propiedad.ubicacion}</h3><p className="text-gray-500 text-lg mb-6">{propiedad.direccion}</p>
                            {propiedad.mapaUrl ? <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-xl border border-gray-200"><iframe src={getCleanMapUrl(propiedad.mapaUrl)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe></div> : <div className="bg-gray-100 w-full h-64 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300"><FaMapMarkerAlt className="text-gray-300 text-5xl mb-2"/><span className="text-gray-400 font-bold uppercase">Sin Mapa</span></div>}
                        </div>
                    )}
                    {activeTab === 'video' && propiedad.videoUrl && (
                        <div className="animate-fade-in space-y-4"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tighter"><FaYoutube className="text-red-600"/> Recorrido</h3><div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl"><iframe width="100%" height="100%" src={getYoutubeEmbedUrl(propiedad.videoUrl)} frameBorder="0" allowFullScreen></iframe></div></div>
                    )}
                    {activeTab === 'legal' && isAdmin && (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100"><h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-tighter"><FaUsers/> Propietarios</h3>{propiedad.Propietarios?.length > 0 ? <div className="space-y-3">{propiedad.Propietarios.map((p: any) => (<div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"><div><p className="font-bold text-gray-800">{p.nombre}</p><p className="text-sm text-gray-500">DNI: {p.dni}</p></div><a href={`tel:${p.celular1}`} className="btn btn-sm btn-circle btn-success text-white"><FaWhatsapp/></a></div>))}</div> : <p className="text-gray-500 italic">Sin registros.</p>}</div>
                            <div>
                                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tighter"><FaFileContract className="text-emerald-600"/> Auditoría</h3><button onClick={guardarCambios} disabled={guardandoObs} className="btn btn-success text-white btn-sm shadow-lg font-bold text-xs">{guardandoObs ? '...' : <><FaSave/> Guardar</>}</button></div>
                                <div className="overflow-x-auto"><table className="table w-full"><thead><tr className="text-gray-400 uppercase text-[10px]"><th>Estado</th><th>Doc</th><th>Adjunto</th><th>Notas</th></tr></thead><tbody>{documentosList.map((doc) => (<tr key={doc.key} className="hover:bg-gray-50 border-b border-gray-50"><td className="text-center cursor-pointer" onClick={() => toggleEstado(doc.key)}>{getIcono(estadosDocs[doc.key])}</td><td className="font-bold text-gray-700 text-sm">{doc.label}</td><td>{documentosUrls[doc.key] ? <a href={`${BACKEND_URL}${documentosUrls[doc.key]}`} target="_blank" className="btn btn-xs btn-outline btn-primary"><FaEye/></a> : <label className="btn btn-xs btn-ghost text-indigo-600"><FaFileUpload/><input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleSubirPdfAuditoria(doc.key, e.target.files[0])} /></label>}</td><td><textarea className="textarea textarea-bordered w-full h-10 text-xs" value={observaciones[doc.key] || ''} onChange={(e) => setObservaciones({...observaciones, [doc.key]: e.target.value})}></textarea></td></tr>))}</tbody></table></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Precio Inmueble</p>
                    <div className="flex items-baseline gap-1 text-indigo-950 mb-6"><span className="text-5xl font-black tracking-tighter">{propiedad.moneda === 'USD' ? '$' : 'S/'} {Number(propiedad.precio).toLocaleString()}</span></div>
                    
                    {propiedad.Propietarios?.length > 0 && (
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100"><div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white"><FaUserTie size={18} /></div><div className="flex flex-col"><span className="text-[9px] text-blue-500 font-black uppercase tracking-tight leading-none mb-1">Titular</span><span className="text-sm font-black text-slate-800 truncate max-w-[180px]">{propiedad.Propietarios[0].nombre}</span></div></div>
                            <a href={`https://wa.me/51${propiedad.Propietarios[0].celular1}`} target="_blank" className="btn bg-green-600 hover:bg-green-700 text-white border-none w-full font-black gap-2 shadow-xl shadow-green-100 h-14 text-lg transition-all hover:scale-[1.02]"> <FaWhatsapp size={24}/> CONTACTAR </a>
                        </div>
                    )}

                    {/* --- BOTONES DE ENLACES INTELIGENTES --- */}
                    {linksDisponibles.length > 0 && (
                        <div className="space-y-3 mb-6 pt-4 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recursos y Presentación</p>
                            {linksDisponibles.map((link, idx) => {
                                const config = getLinkConfig(link);
                                return (
                                    <a key={idx} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all group shadow-sm hover:shadow-md ${config.color}`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {config.icon}
                                            <span className="text-xs font-black uppercase tracking-tight truncate">{config.label}</span>
                                        </div>
                                        <FaExternalLinkAlt className="text-[10px] opacity-40 group-hover:opacity-100" />
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    <div className="divider my-6"></div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="avatar placeholder"><div className="bg-indigo-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-xl font-bold">{propiedad.asesor?.charAt(0) || 'S'}</div></div>
                        <div><p className="font-bold text-gray-800 text-lg leading-tight uppercase tracking-tighter">{propiedad.asesor || 'Sillar Asesor'}</p><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Agente Encargado</p></div>
                    </div>
                    <div className="mt-8 text-center border-t border-gray-50 pt-6">
                        <p className="text-[10px] text-gray-400 font-black uppercase">Ref: PROP-{propiedad.id.slice(0,6).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-300 mt-1 font-bold">Registrado: {new Date(propiedad.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}