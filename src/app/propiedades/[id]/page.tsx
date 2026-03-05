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
  FaInstagram, FaTiktok, FaGlobe, FaHandshake, FaMoneyBillWave,
  FaChevronLeft, FaChevronRight, FaShieldAlt, FaTools, FaCalendarAlt, FaBuilding, FaTrash, FaKey
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
            const obs = data.observaciones;
            setObservaciones(
              typeof obs === 'string' && obs
                ? (() => { try { return JSON.parse(obs); } catch { return {}; } })()
                : (obs && typeof obs === 'object' ? obs : {})
            );
            setDocumentosUrls(data.documentosUrls || data.documentosurls || {});
            
            setEstadosDocs({
                testimonio: data.testimonio ?? null,
                hr: data.hr ?? null,
                pu: data.pu ?? null,
                impuestoPredial: data.impuestoPredial ?? null,
                arbitrios: data.arbitrios ?? null,
                copiaLiteral: data.copiaLiteral ?? null,
                cri: data.cri ?? null,
                reciboAguaLuz: data.reciboAguaLuz ?? data.reciboagualuz ?? null,
                planos: data.planos ?? null,
                certificadoParametros: data.certificadoParametros ?? null,
                certificadoZonificacion: data.certificadoZonificacion ?? null,
                otros: data.otros ?? null
            });
            setLoading(false);
        } catch (e) { 
            console.error(e);
            setLoading(false); 
        }
    };
    cargar();
  }, [id]);

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

  const handleSubirPdfAuditoria = async (key: string, filesToUpload: FileList) => {
    const formData = new FormData();
    Array.from(filesToUpload).forEach(file => {
        formData.append('files', file);
    });
    formData.append('documentKey', key);
    try {
        const { data } = await api.post(`${BACKEND_URL}/api/propiedades/${id}/upload-pdf`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setDocumentosUrls(data.documentosUrls);
        alert('✅ PDF(s) agregado(s) correctamente.');
    } catch (e) { alert('❌ Error al subir PDF.'); }
  };

  const handleEliminarPdf = async (key: string, idx: number) => {
      if(!confirm('¿Seguro que deseas eliminar este documento?')) return;
      try {
          let actuales = documentosUrls[key];
          if (!Array.isArray(actuales)) actuales = [actuales];
          
          const nuevos = [...actuales];
          nuevos.splice(idx, 1);
          
          const nuevosDocumentosUrls = { ...documentosUrls, [key]: nuevos };
          setDocumentosUrls(nuevosDocumentosUrls);
          
          await api.put(`/propiedades/${id}`, { 
              documentosUrls: nuevosDocumentosUrls,
              documentosurls: nuevosDocumentosUrls
          });
      } catch (e) {
          alert('❌ Error al eliminar PDF.');
      }
  };

  const guardarCambios = async () => {
    setGuardandoObs(true);
    try {
        await api.put(`/propiedades/${id}`, { 
          observaciones: JSON.stringify(observaciones), 
          ...estadosDocs 
        });
        alert('✅ Auditoría actualizada.');
    } catch (e) { alert('❌ Error al guardar.'); }
    finally { setGuardandoObs(false); }
  };

  if (loading || !propiedad) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;

  const esVenta = propiedad.modalidad === 'Venta';
  
  const baseDocs = esVenta ? [
    { key: 'testimonio', label: 'Testimonio' }, { key: 'hr', label: 'Hoja Resumen (HR)' }, { key: 'pu', label: 'Predio Urbano (PU)' },
    { key: 'impuestoPredial', label: 'Impuesto Predial' }, { key: 'arbitrios', label: 'Arbitrios' }, { key: 'copiaLiteral', label: 'Copia Literal' }
  ] : [
    { key: 'impuestoPredial', label: 'Impuesto Predial' }, { key: 'arbitrios', label: 'Arbitrios' }, { key: 'copiaLiteral', label: 'Copia Literal' },
    { key: 'cri', label: 'CRI' }, { key: 'reciboAguaLuz', label: 'Recibos Luz/Agua' }
  ];

  const documentosList = [
      ...baseDocs,
      { key: 'planos', label: 'Planos' },
      { key: 'certificadoParametros', label: 'Certificado de Parámetros' },
      { key: 'certificadoZonificacion', label: 'Cert. Zonificación y Vías' },
      { key: 'otros', label: 'Otros' }
  ];

  const images = [propiedad.fotoPrincipal, ...(propiedad.galeria || [])].filter(Boolean);
  const getFullImageUrl = (path: string) => path?.startsWith('http') ? path : `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  
  const handlePrevImage = () => {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getIconoSemaforo = (estado: boolean | null) => {
    if (estado === true) return <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md" title="OK"><FaCheckCircle className="text-white text-sm"/></div>;
    if (estado === null) return <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-md" title="Pendiente"><FaExclamationCircle className="text-white text-sm"/></div>;
    return <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-md" title="Falta"><FaTimesCircle className="text-white text-sm"/></div>;
  };
  
  const linksDisponibles = [propiedad.link1, propiedad.link2, propiedad.link3, propiedad.link4, propiedad.link5].filter(Boolean);
  const propietarios = propiedad.Propietarios ?? propiedad.propietarios ?? [];
  
  const esTerreno = propiedad.tipo && String(propiedad.tipo).toLowerCase().includes('terreno');
  const esProyecto = propiedad.tipo && String(propiedad.tipo).toLowerCase().includes('proyecto');
  const esDepartamento = propiedad.tipo && (String(propiedad.tipo).toLowerCase().includes('departamento') || String(propiedad.tipo).toLowerCase().includes('duplex'));

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      <div className="relative bg-gray-900 h-[40vh] lg:h-[50vh] w-full overflow-hidden">
          {images.length > 0 && <img src={getFullImageUrl(images[0])} className="w-full h-full object-cover opacity-60 blur-sm scale-105" alt="Banner" crossOrigin="anonymous" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-10 lg:p-16">
              <div className="container mx-auto max-w-7xl">
                  <div className="flex gap-3 mb-6">
                      <span className={`badge badge-lg border-none text-white font-black py-5 px-8 ${propiedad.modalidad === 'Venta' ? 'bg-orange-600' : 'bg-blue-600'}`}>{propiedad.modalidad}</span>
                      <span className="badge badge-lg bg-white/20 backdrop-blur-md border-none text-white py-5 px-8 font-black">{propiedad.tipo}</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4">{propiedad.ubicacion}</h1>
                  <p className="text-white/80 text-2xl flex items-center gap-3 font-black"><FaMapMarkerAlt className="text-orange-400"/> {propiedad.direccion}</p>
              </div>
          </div>
      </div>

      <main className="container mx-auto p-6 max-w-7xl -mt-20 relative z-10 font-black">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {['informacion', 'ubicacion', 'video', 'legal'].map((tab) => (
                        (tab !== 'legal' || isAdmin) && (tab !== 'video' || propiedad.videoUrl) && (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 flex-1 py-3 px-6 rounded-xl font-black transition-all text-sm uppercase justify-center ${activeTab===tab ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:bg-gray-50'}`}>
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
                                    <div className="group h-[450px] rounded-2xl overflow-hidden relative bg-gray-100 border border-gray-200 flex items-center justify-center">
                                        <img src={getFullImageUrl(images[currentImageIndex])} className="w-full h-full object-cover" alt="Gallery" crossOrigin="anonymous"/>
                                        {images.length > 1 && (
                                            <button onClick={handlePrevImage} className="absolute left-4 bg-white/80 hover:bg-white text-indigo-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-95">
                                                <FaChevronLeft className="text-xl"/>
                                            </button>
                                        )}
                                        {images.length > 1 && (
                                            <button onClick={handleNextImage} className="absolute right-4 bg-white/80 hover:bg-white text-indigo-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-95">
                                                <FaChevronRight className="text-xl"/>
                                            </button>
                                        )}
                                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 text-xs font-black rounded-lg backdrop-blur-md">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
                                        {images.map((img:string, idx:number) => (
                                            <img key={idx} src={getFullImageUrl(img)} onClick={() => setCurrentImageIndex(idx)} crossOrigin="anonymous" className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all flex-shrink-0 ${currentImageIndex===idx ? 'border-indigo-600 scale-95 opacity-100' : 'border-transparent hover:border-gray-300 opacity-60 hover:opacity-100'}`}/>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {esProyecto && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 shadow-sm">
                                        <h3 className="text-lg font-black text-indigo-900 mb-6 flex items-center gap-2 uppercase tracking-widest"><FaBuilding className="text-indigo-600"/> Detalles del Proyecto</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
                                            <div className="bg-white p-4 rounded-2xl border border-indigo-200 flex items-center gap-4">
                                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><FaCalendarAlt size={20}/></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">Inicio de Obra</p>
                                                    <p className="font-black text-indigo-900">{propiedad.fechaInicioProyecto || 'Por definir'}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-indigo-200 flex items-center gap-4">
                                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><FaTools size={20}/></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">Ejecución</p>
                                                    <p className="font-black text-indigo-900">{propiedad.tiempoEjecucion || 'No especificado'}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-indigo-200 flex items-center gap-4">
                                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><FaKey size={20}/></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">Fecha Entrega</p>
                                                    <p className="font-black text-indigo-900">{propiedad.fechaEntrega || 'No especificado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Tipologías Disponibles</p>
                                            {propiedad.tipologias && (typeof propiedad.tipologias === 'string' ? JSON.parse(propiedad.tipologias) : propiedad.tipologias).map((t: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                                                    <span className="font-black text-indigo-900 text-sm">{t.nombre}</span>
                                                    <div className="flex gap-6 items-center">
                                                        <span className="text-xs text-gray-400 font-black">{t.areaConstruida} m²</span>
                                                        <span className="font-black text-indigo-600 text-lg">{propiedad.moneda === 'USD' ? '$' : 'S/'} {Number(t.precio).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!esProyecto && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100 text-center">
                                    <div><FaRulerCombined className="mx-auto text-3xl text-emerald-500 mb-2"/><p className="font-black text-xl">{propiedad.area} m²</p><p className="text-xs font-black text-gray-400 uppercase">Total</p></div>
                                    <div><FaBed className="mx-auto text-3xl text-indigo-500 mb-2"/><p className="font-black text-xl">{propiedad.habitaciones || 0}</p><p className="text-xs font-black text-gray-400 uppercase">Hab.</p></div>
                                    <div><FaBath className="mx-auto text-3xl text-sky-500 mb-2"/><p className="font-black text-xl">{propiedad.banos || 0}</p><p className="text-xs font-black text-gray-400 uppercase">Baños</p></div>
                                    <div><FaCar className="mx-auto text-3xl text-orange-500 mb-2"/><p className="font-black text-xl">{propiedad.cocheras || 0}</p><p className="text-xs font-black text-gray-400 uppercase">Coch.</p></div>
                                </div>
                            )}

                            {propiedad.descripcion && (
                                <div><h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-tighter"><FaTag className="text-indigo-500"/> Descripción</h3><p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg font-black">{propiedad.descripcion}</p></div>
                            )}
                            {(propiedad.detalles || propiedad.observaciones) && (
                                <div className="mt-8 pt-6 border-t border-gray-100"><h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-tighter"><FaAlignLeft className="text-purple-600"/> Distribución</h3><div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm"><p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg font-black">{propiedad.detalles || propiedad.observaciones}</p></div></div>
                            )}
                        </div>
                    )}
                    {activeTab === 'ubicacion' && (
                        <div className="animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
                            <h3 className="text-2xl font-black text-gray-800 mb-2">{propiedad.ubicacion}</h3><p className="text-gray-500 text-lg mb-6 font-black">{propiedad.direccion}</p>
                            {propiedad.mapaUrl ? <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-xl border border-gray-200"><iframe src={getCleanMapUrl(propiedad.mapaUrl)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe></div> : <div className="bg-gray-100 w-full h-64 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300"><FaMapMarkerAlt className="text-gray-300 text-5xl mb-2"/><span className="text-gray-400 font-black uppercase">Sin Mapa</span></div>}
                        </div>
                    )}
                    {activeTab === 'video' && propiedad.videoUrl && (
                        <div className="animate-fade-in space-y-4"><h3 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter"><FaYoutube className="text-red-600"/> Recorrido</h3><div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl"><iframe width="100%" height="100%" src={getYoutubeEmbedUrl(propiedad.videoUrl)} frameBorder="0" allowFullScreen></iframe></div></div>
                    )}
                    {activeTab === 'legal' && isAdmin && (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                                <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-tighter"><FaUsers/> Propietarios / Empresas</h3>
                                {propietarios.length > 0 ? (
                                    <div className="space-y-3">
                                        {propietarios.map((p: any) => (
                                            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-indigo-50">
                                                <div className="flex gap-4 items-center">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md ${p.tipoPersona === 'PJ' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                                        {p.tipoPersona === 'PJ' ? <FaBuilding /> : p.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-800 text-lg flex items-center gap-2">
                                                            {p.tipoPersona === 'PJ' && p.empresa ? p.empresa : p.nombre}
                                                            {p.tipoPersona === 'PJ' && <span className="badge badge-sm bg-indigo-100 text-indigo-700 font-bold border-none">PJ</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono font-bold mt-1">
                                                            {p.tipoPersona === 'PJ' && p.ruc ? `RUC: ${p.ruc}` : `DNI: ${p.dni}`}
                                                            {p.tipoPersona === 'PJ' && p.empresa && ` • Rep: ${p.nombre}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a href={`tel:${p.celular1}`} className="btn btn-sm btn-circle bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-md"><FaWhatsapp size={16}/></a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic font-black">Sin registros.</p>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-tighter">
                                    <FaHandshake className="text-blue-600"/> Detalles del Contrato
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Exclusiva</p>
                                        <div className={`badge ${propiedad.exclusiva ? 'badge-success text-white' : 'badge-ghost text-gray-500'} font-black`}>
                                            {propiedad.exclusiva ? 'SÍ' : 'NO'}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Renovable</p>
                                        <div className={`badge ${propiedad.renovable ? 'badge-info text-white' : 'badge-ghost text-gray-500'} font-black`}>
                                            {propiedad.renovable ? 'SÍ' : 'NO'}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">IGV</p>
                                        <div className={`badge ${propiedad.incluyeIgv ? 'badge-secondary text-white' : 'badge-ghost text-gray-500'} font-black`}>
                                            {propiedad.incluyeIgv ? 'SÍ' : 'NO'}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Inicio</p>
                                        <p className="font-black text-gray-800 text-sm">
                                            {propiedad.inicioContrato ? propiedad.inicioContrato.split('-').reverse().join('/') : '-'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Fin</p>
                                        <p className="font-black text-gray-800 text-sm">
                                            {propiedad.finContrato ? propiedad.finContrato.split('-').reverse().join('/') : '-'}
                                        </p>
                                    </div>
                                    
                                    {Number(propiedad.vigilancia) > 0 && (
                                        <div className="col-span-2 md:col-span-5 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-2">
                                            <span className="text-xs text-emerald-700 font-black uppercase tracking-widest flex items-center gap-2">
                                                <FaShieldAlt className="text-emerald-500 text-lg"/> Pago Vigilancia
                                            </span>
                                            <span className="font-black text-emerald-900 text-xl">
                                                {propiedad.monedaVigilancia === 'USD' ? '$' : 'S/'} {Number(propiedad.vigilancia).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}

                                    {(propiedad.modalidad === 'Alquiler' || esDepartamento) && Number(propiedad.mantenimiento) > 0 && (
                                        <div className="col-span-2 md:col-span-5 bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-2">
                                            <span className="text-xs text-blue-700 font-black uppercase tracking-widest flex items-center gap-2">
                                                <FaTools className="text-blue-500 text-lg"/> Mantenimiento Edificio
                                            </span>
                                            <span className="font-black text-blue-900 text-xl">
                                                {propiedad.monedaMantenimiento === 'USD' ? '$' : 'S/'} {Number(propiedad.mantenimiento).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="col-span-2 md:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col text-center">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Partida Principal</p>
                                            <p className="font-black text-gray-800 font-mono">{propiedad.partidaRegistral || '---'}</p>
                                        </div>
                                        {(propiedad.modalidad === 'Alquiler' || esDepartamento) && (
                                            <>
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col text-center">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Partida Cochera</p>
                                                    <p className="font-black text-gray-800 font-mono">{propiedad.partidaCochera || '---'}</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col text-center">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Partida Depósito</p>
                                                    <p className="font-black text-gray-800 font-mono">{propiedad.partidaDeposito || '---'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter"><FaFileContract className="text-emerald-600"/> Auditoría</h3><button onClick={guardarCambios} disabled={guardandoObs} className="btn btn-success text-white btn-sm shadow-lg font-black text-xs">{guardandoObs ? '...' : <><FaSave/> Guardar</>}</button></div>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr className="text-gray-400 uppercase text-[10px]"><th>Estado</th><th>Doc</th><th>Adjunto</th><th>Notas</th></tr>
                                        </thead>
                                        <tbody>
                                            {documentosList.map((doc) => (
                                                <tr key={doc.key} className="hover:bg-gray-50 border-b border-gray-50">
                                                    <td className="text-center cursor-pointer" onClick={() => toggleEstado(doc.key)}>
                                                        {getIconoSemaforo(estadosDocs[doc.key])}
                                                    </td>
                                                    <td className="font-black text-gray-700 text-sm">{doc.label}</td>
                                                    <td>
                                                        <div className="flex flex-col gap-2 items-start">
                                                            {Array.isArray(documentosUrls[doc.key]) && documentosUrls[doc.key].map((url: string, idx: number) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <a href={url.startsWith('http') ? url : `${BACKEND_URL}${url}`} target="_blank" className="btn btn-xs btn-primary text-white" title={`Ver Documento ${idx + 1}`}>
                                                                        <FaEye /> PDF {idx + 1}
                                                                    </a>
                                                                    <button type="button" onClick={() => handleEliminarPdf(doc.key, idx)} className="btn btn-xs btn-error text-white" title="Eliminar PDF">
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            
                                                            {typeof documentosUrls[doc.key] === 'string' && (
                                                                <div className="flex items-center gap-2">
                                                                    <a href={documentosUrls[doc.key].startsWith('http') ? documentosUrls[doc.key] : `${BACKEND_URL}${documentosUrls[doc.key]}`} target="_blank" className="btn btn-xs btn-primary text-white" title="Ver Documento">
                                                                        <FaEye /> PDF
                                                                    </a>
                                                                    <button type="button" onClick={() => handleEliminarPdf(doc.key, 0)} className="btn btn-xs btn-error text-white" title="Eliminar PDF">
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <label className="btn btn-xs btn-outline btn-primary cursor-pointer mt-1" title="Agregar PDF">
                                                                <FaFileUpload className="mr-1"/> {(documentosUrls[doc.key] && documentosUrls[doc.key].length > 0) ? '+ AGREGAR MÁS' : 'SUBIR PDF'}
                                                                <input type="file" accept=".pdf" multiple className="hidden" onChange={(e) => e.target.files && handleSubirPdfAuditoria(doc.key, e.target.files)} />
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <textarea className="textarea textarea-bordered w-full h-10 text-xs font-black" value={observaciones[doc.key] || ''} onChange={(e) => setObservaciones({...observaciones, [doc.key]: e.target.value})}></textarea>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Precio Inmueble</p>
                    {!esProyecto ? (
                        <div className="flex items-baseline gap-1 text-indigo-950 mb-6"><span className="text-5xl font-black tracking-tighter">{propiedad.moneda === 'USD' ? '$' : 'S/'} {Number(propiedad.precio).toLocaleString()}</span></div>
                    ) : (
                        <div className="flex items-baseline gap-1 text-indigo-900 mb-6"><span className="text-4xl font-black tracking-tighter uppercase">PROYECTO</span></div>
                    )}
                    
                    {propietarios.length > 0 && (
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${propietarios[0].tipoPersona === 'PJ' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                                    {propietarios[0].tipoPersona === 'PJ' ? <FaBuilding size={18} /> : <FaUserTie size={18} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[9px] font-black uppercase tracking-tight leading-none mb-1 ${propietarios[0].tipoPersona === 'PJ' ? 'text-indigo-500' : 'text-blue-500'}`}>
                                        {propietarios[0].tipoPersona === 'PJ' ? 'Empresa Titular' : 'Titular'}
                                    </span>
                                    <span className="text-sm font-black text-slate-800 truncate max-w-[180px]" title={propietarios[0].tipoPersona === 'PJ' && propietarios[0].empresa ? propietarios[0].empresa : propietarios[0].nombre}>
                                        {propietarios[0].tipoPersona === 'PJ' && propietarios[0].empresa ? propietarios[0].empresa : propietarios[0].nombre}
                                    </span>
                                </div>
                            </div>
                            <a href={`https://wa.me/51${propietarios[0].celular1}`} target="_blank" rel="noopener noreferrer" className="btn bg-green-600 hover:bg-green-700 text-white border-none w-full font-black gap-2 shadow-xl shadow-green-100 h-14 text-lg transition-all hover:scale-[1.02]"> <FaWhatsapp size={24}/> CONTACTAR </a>
                        </div>
                    )}

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
                    <div className="flex items-center gap-4 mb-4">
                        <div className="avatar placeholder"><div className="bg-indigo-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-xl font-black">{propiedad.asesor?.charAt(0) || 'S'}</div></div>
                        <div><p className="font-black text-gray-800 text-lg leading-tight uppercase tracking-tighter">{propiedad.asesor || 'Sillar Asesor'}</p><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Agente Encargado</p></div>
                    </div>

                    {propiedad.propiedadCompartida && propiedad.agenteExterno && (
                        <div className="mt-4 flex items-center gap-4 p-4 bg-purple-50 border border-purple-100 rounded-2xl animate-fade-in">
                            <div className="avatar placeholder"><div className="bg-purple-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center text-lg font-black">{propiedad.agenteExterno.charAt(0)}</div></div>
                            <div className="flex-1">
                                <p className="font-black text-purple-900 text-sm leading-tight uppercase tracking-tighter">{propiedad.agenteExterno}</p>
                                <p className="text-[9px] text-purple-500 font-black uppercase tracking-widest mt-0.5">Agente Externo</p>
                            </div>
                            {propiedad.porcentajeAgenteExterno && (
                                <div className="text-right">
                                    <span className="text-lg font-black text-purple-700">{propiedad.porcentajeAgenteExterno}%</span>
                                    <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Comisión</p>
                                </div>
                            )}
                        </div>
                    )}

                    {propietarios.length > 1 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Otros Propietarios</p>
                            <div className="space-y-2">
                                {propietarios.slice(1).map((p: any) => (
                                    <p key={p.id} className="font-black text-gray-800 text-sm flex items-center gap-2">
                                        <FaUserTie className="text-gray-400" />
                                        {p.nombre}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center border-t border-gray-50 pt-6">
                        <p className="text-[10px] text-gray-400 font-black uppercase">Ref: PROP-{propiedad.id.slice(0,6).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-300 mt-1 font-black">Registrado: {new Date(propiedad.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}