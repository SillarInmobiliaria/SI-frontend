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
  FaAlignLeft, FaFileUpload, FaEye, FaExternalLinkAlt 
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

  const toggleEstado = (key: string) => {
      const actual = estadosDocs[key];
      let nuevo = false; 
      if (actual === false) nuevo = true;        
      else if (actual === true) nuevo = null as any; 
      else if (actual === null) nuevo = false;   
      setEstadosDocs({ ...estadosDocs, [key]: nuevo });
  };

  const handleSubirPdfAuditoria = async (key: string, file: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentKey', key);
    
    try {
        const { data } = await api.post(`${BACKEND_URL}/api/propiedades/${id}/upload-pdf`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setDocumentosUrls({ ...documentosUrls, [key]: data.url });
        alert('✅ Archivo PDF subido con éxito.');
    } catch (e) { 
        console.error(e);
        alert('❌ Error al subir PDF.'); 
    }
  };

  const guardarCambios = async () => {
    setGuardandoObs(true);
    try {
        await api.put(`/propiedades/${id}`, { observaciones, ...estadosDocs });
        alert('✅ Auditoría actualizada.');
    } catch (e) { alert('❌ Error al guardar.'); }
    finally { setGuardandoObs(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;
  if (!propiedad) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold uppercase">Error de carga</div>;

  // Lógica de filtrado de documentos por modalidad
  const esVenta = propiedad.modalidad === 'Venta';
  const documentosList = esVenta ? [
    { key: 'testimonio', label: 'Testimonio' },
    { key: 'hr', label: 'Hoja Resumen (HR)' },
    { key: 'pu', label: 'Predio Urbano (PU)' },
    { key: 'impuestoPredial', label: 'Impuesto Predial' },
    { key: 'arbitrios', label: 'Arbitrios' },
    { key: 'copiaLiteral', label: 'Copia Literal' }
  ] : [
    { key: 'impuestoPredial', label: 'Impuesto Predial' },
    { key: 'arbitrios', label: 'Arbitrios Municipales' },
    { key: 'copiaLiteral', label: 'Copia Literal' },
    { key: 'cri', label: 'CRI' },
    { key: 'reciboAguaLuz', label: 'Recibos Luz/Agua' }
  ];

  const images = [propiedad.fotoPrincipal, ...(propiedad.galeria || [])].filter(Boolean);
  const getFullImageUrl = (path: string) => path?.startsWith('http') ? path : `${BACKEND_URL}${path}`;

  const getIcono = (estado: any) => {
      if (estado === true) return <FaCheckCircle className="text-emerald-500 text-2xl"/>;
      if (estado === null) return <FaExclamationCircle className="text-amber-500 text-2xl"/>;
      return <FaTimesCircle className="text-red-500 text-2xl"/>;
  };

  // Filtrar links existentes
  const linksDisponibles = [propiedad.link1, propiedad.link2, propiedad.link3, propiedad.link4, propiedad.link5].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />
      
      {/* Banner Principal */}
      <div className="relative bg-gray-900 h-[40vh] lg:h-[50vh] w-full overflow-hidden">
          {images.length > 0 ? (
              <img src={getFullImageUrl(images[0])} className="w-full h-full object-cover opacity-60 blur-sm scale-105" alt="Propiedad" crossOrigin="anonymous" />
          ) : <div className="w-full h-full bg-gray-800"></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-10 lg:p-16">
              <div className="container mx-auto max-w-7xl">
                  <div className="flex gap-3 mb-6">
                      <span className={`badge badge-lg border-none text-white font-bold py-5 px-8 ${propiedad.modalidad === 'Venta' ? 'bg-orange-600' : 'bg-blue-600'}`}>{propiedad.modalidad}</span>
                      <span className="badge badge-lg bg-white/20 backdrop-blur-md border-none text-white py-5 px-8 font-bold">{propiedad.tipo}</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4 leading-tight">{propiedad.ubicacion}</h1>
                  <p className="text-white/80 text-2xl flex items-center gap-3 font-medium"><FaMapMarkerAlt className="text-orange-400"/> {propiedad.direccion}</p>
              </div>
          </div>
      </div>

      <main className="container mx-auto p-6 max-w-7xl -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Contenido Principal */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('informacion')} className={`flex items-center gap-2 flex-1 py-3 px-6 rounded-xl font-bold transition-all text-sm uppercase justify-center ${activeTab==='informacion' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:bg-gray-50'}`}><FaInfoCircle/> Información</button>
                    <button onClick={() => setActiveTab('ubicacion')} className={`flex items-center gap-2 flex-1 py-3 px-6 rounded-xl font-bold transition-all text-sm uppercase justify-center ${activeTab==='ubicacion' ? 'bg-orange-50 text-orange-700' : 'text-gray-400 hover:bg-gray-50'}`}><FaMap/> Ubicación</button>
                    {propiedad.videoUrl && <button onClick={() => setActiveTab('video')} className={`flex items-center gap-2 flex-1 py-3 px-6 rounded-xl font-bold transition-all text-sm uppercase justify-center ${activeTab==='video' ? 'bg-red-50 text-red-700' : 'text-gray-400 hover:bg-gray-50'}`}><FaPlayCircle/> Video</button>}
                    {isAdmin && <button onClick={() => setActiveTab('legal')} className={`flex items-center gap-2 flex-1 py-3 px-6 rounded-xl font-bold transition-all text-sm uppercase justify-center ${activeTab==='legal' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400 hover:bg-gray-50'}`}><FaFileContract/> Legal</button>}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 min-h-[400px]">
                    {activeTab === 'informacion' && (
                        <div className="space-y-8 animate-fade-in">
                            {images.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="h-[400px] rounded-2xl overflow-hidden relative bg-gray-100 border border-gray-200">
                                        <img src={getFullImageUrl(images[currentImageIndex])} className="w-full h-full object-contain" alt="Gallery preview" crossOrigin="anonymous"/>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {images.map((img:string, idx:number) => (
                                            <img key={idx} src={getFullImageUrl(img)} onClick={() => setCurrentImageIndex(idx)} crossOrigin="anonymous" className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all ${currentImageIndex===idx ? 'border-indigo-600 scale-95' : 'border-transparent hover:border-gray-300'}`}/>
                                        ))}
                                    </div>
                                </div>
                            ) : <div className="text-center py-10 text-gray-400">Sin imágenes</div>}
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100">
                                <div className="text-center"><FaRulerCombined className="mx-auto text-3xl text-emerald-500 mb-2"/><p className="font-black text-xl text-gray-800">{propiedad.area} m²</p><p className="text-xs font-bold text-gray-400 uppercase">Área Total</p></div>
                                <div className="text-center"><FaBed className="mx-auto text-3xl text-indigo-500 mb-2"/><p className="font-black text-xl text-gray-800">{propiedad.habitaciones}</p><p className="text-xs font-bold text-gray-400 uppercase">Habitaciones</p></div>
                                <div className="text-center"><FaBath className="mx-auto text-3xl text-sky-500 mb-2"/><p className="font-black text-xl text-gray-800">{propiedad.banos}</p><p className="text-xs font-bold text-gray-400 uppercase">Baños</p></div>
                                <div className="text-center"><FaCar className="mx-auto text-3xl text-orange-500 mb-2"/><p className="font-black text-xl text-gray-800">{propiedad.cocheras}</p><p className="text-xs font-bold text-gray-400 uppercase">Cocheras</p></div>
                            </div>

                            {propiedad.descripcion && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-tighter"><FaTag className="text-indigo-500"/> Descripción Comercial</h3>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">{propiedad.descripcion}</p>
                                </div>
                            )}

                            {(propiedad.detalles || propiedad.observaciones) && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-tighter"><FaAlignLeft className="text-purple-600"/> Detalles Técnicos y Distribución</h3>
                                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm"><p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">{propiedad.detalles || propiedad.observaciones}</p></div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'legal' && isAdmin && (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-tighter"><FaUsers/> Propietarios Registrados</h3>
                                {propiedad.Propietarios && propiedad.Propietarios.length > 0 ? (
                                    <div className="space-y-3">
                                        {propiedad.Propietarios.map((p: any) => (
                                            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                                                <div><p className="font-bold text-gray-800">{p.nombre}</p><p className="text-sm text-gray-500">DNI: {p.dni}</p></div>
                                                <div className="text-right"><a href={`tel:${p.celular1}`} className="btn btn-sm btn-circle btn-success text-white"><FaWhatsapp/></a></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 italic font-bold">Sin propietarios en base de datos.</p>}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tighter"><FaFileContract className="text-emerald-600"/> Checklist de Auditoría ({propiedad.modalidad})</h3>
                                    <button onClick={guardarCambios} disabled={guardandoObs} className="btn btn-success text-white btn-sm shadow-lg uppercase font-bold text-xs">{guardandoObs ? '...' : <><FaSave/> Guardar Auditoría</>}</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead><tr className="text-gray-400 border-b-2 border-gray-100 uppercase text-[10px]"><th>Estado</th><th>Documento</th><th>Adjunto</th><th>Observaciones</th></tr></thead>
                                        <tbody>
                                            {documentosList.map((doc) => (
                                                <tr key={doc.key} className="hover:bg-gray-50 border-b border-gray-50">
                                                    <td className="text-center cursor-pointer" onClick={() => toggleEstado(doc.key)}>{getIcono(estadosDocs[doc.key])}</td>
                                                    <td className="font-bold text-gray-700 text-sm">{doc.label}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            {documentosUrls[doc.key] ? (
                                                                <a href={`${BACKEND_URL}${documentosUrls[doc.key]}`} target="_blank" className="btn btn-xs btn-outline btn-primary gap-1"><FaEye/> Ver</a>
                                                            ) : (
                                                                <label className="btn btn-xs btn-ghost gap-1 cursor-pointer text-indigo-600 font-bold uppercase">
                                                                    <FaFileUpload/> <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                                                                      const f = e.target.files?.[0];
                                                                      if(f) handleSubirPdfAuditoria(doc.key, f);
                                                                    }} /> Adjuntar
                                                                </label>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td><textarea className={`textarea textarea-bordered w-full h-10 text-xs ${observaciones[doc.key] ? 'bg-yellow-50' : 'bg-white'}`} placeholder="Escribe aquí..." value={observaciones[doc.key] || ''} onChange={(e) => setObservaciones({...observaciones, [doc.key]: e.target.value})}></textarea></td>
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

            {/* Columna Derecha: Sidebar Sticky */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Precio Inmueble</p>
                    <div className="flex items-baseline gap-1 text-indigo-950 mb-6">
                        <span className="text-5xl font-black tracking-tighter">{propiedad.moneda === 'USD' ? '$' : 'S/'} {Number(propiedad.precio).toLocaleString()}</span>
                    </div>
                    
                    {/* Botón Contactar Dueño */}
                    {propiedad.Propietarios && propiedad.Propietarios.length > 0 && (
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-100"><FaUserTie size={18} /></div>
                                <div className="flex flex-col"><span className="text-[9px] text-blue-500 font-black uppercase tracking-tight leading-none mb-1">Titular Propietario</span><span className="text-sm font-black text-slate-800 truncate max-w-[180px]">{propiedad.Propietarios[0].nombre}</span></div>
                            </div>
                            <a href={`https://wa.me/51${propiedad.Propietarios[0].celular1}?text=Hola, te escribo por tu propiedad en ${propiedad.direccion}.`} target="_blank" className="btn bg-green-600 hover:bg-green-700 text-white border-none w-full font-black gap-2 shadow-xl shadow-green-100 h-14 text-lg flex items-center justify-center transition-all hover:scale-[1.02]" rel="noreferrer" > <FaWhatsapp size={24}/> CONTACTAR DUEÑO </a>
                        </div>
                    )}

                    {/* SECCIÓN RECURSOS Y PRESENTACIÓN (LINKS EXTERNOS) */}
                    {linksDisponibles.length > 0 && (
                        <div className="space-y-3 mb-6 pt-4 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recursos y Presentación</p>
                            {linksDisponibles.map((link, idx) => (
                                <a 
                                    key={idx}
                                    href={link.startsWith('http') ? link : `https://${link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-100 transition-all group"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FaLink className="flex-shrink-0 text-indigo-500" />
                                        <span className="text-xs font-bold truncate max-w-[150px]">
                                            {link.includes('sillar') ? 'Ficha Web Sillar' : `Enlace Externo ${idx + 1}`}
                                        </span>
                                    </div>
                                    <FaExternalLinkAlt className="text-[10px] opacity-50 group-hover:opacity-100" />
                                </a>
                            ))}
                        </div>
                    )}

                    <div className="divider my-6"></div>
                    
                    {/* Info Agente Encargado */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="avatar placeholder"><div className="bg-indigo-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-xl font-bold shadow-md">{propiedad.asesor ? propiedad.asesor.charAt(0).toUpperCase() : 'S'}</div></div>
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