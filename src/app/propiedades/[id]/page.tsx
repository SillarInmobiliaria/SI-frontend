'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useInmobiliariaStore } from '../../../store/useInmobiliariaStore';
import { 
  FaBed, FaBath, FaCar, FaRulerCombined, FaMapMarkerAlt, 
  FaWhatsapp, FaHome, FaDollarSign, FaFilePdf, FaShareAlt, 
  FaPlayCircle, FaImages, FaBuilding, FaInfoCircle, FaFileContract, 
  FaCheckCircle, FaTimesCircle, FaGlobe, FaExternalLinkAlt, FaCalendarAlt, 
  FaPercent, FaUserTie, FaEye, FaIdCard, FaUser, FaPhone, FaEnvelope, 
  FaBirthdayCake, FaStickyNote, FaCreditCard,
  FaCalendarCheck
} from 'react-icons/fa';

const BACKEND_URL = 'http://localhost:4000/';

export default function PropiedadDetallePage() {
  const { id } = useParams();
  const { propiedades, fetchPropiedades } = useInmobiliariaStore();
  const [activeTab, setActiveTab] = useState('informacion');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Estado para el modal de detalle del propietario
  const [selectedOwner, setSelectedOwner] = useState<any>(null);

  const propiedad = propiedades.find(p => p.id === id);

  useEffect(() => {
    if (propiedades.length === 0) fetchPropiedades();
  }, []);

  const images = propiedad ? [
    propiedad.fotoPrincipal,
    ...(propiedad.galeria || [])
  ].filter(Boolean) : []; 

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(nextImage, 5000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  if (!propiedad) return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  let linksPlataformas: string[] = [];
  try {
      if (propiedad.plataforma) {
          linksPlataformas = JSON.parse(propiedad.plataforma as unknown as string);
      }
  } catch (e) {
      console.error("Error parseando plataformas", e);
  }

  const getMapSrc = (iframeCode?: string) => {
    if (!iframeCode) return '';
    const match = iframeCode.match(/src="([^"]+)"/);
    return match ? match[1] : iframeCode;
  };

  const getYoutubeEmbed = (url?: string) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const wideContainerClass = "w-full max-w-[96%] mx-auto px-4 md:px-6";

  const checkItemStyle = (isChecked: boolean | undefined) => `
    p-3 rounded-lg border flex items-center gap-3 font-medium transition-colors
    ${isChecked 
      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
      : 'bg-base-200 border-base-300 opacity-60 text-base-content/70'}
  `;

  return (
    <div className="min-h-screen bg-base-200 font-sans text-base-content">
      <Navbar />
      
      {/* CABECERA */}
      <div className="bg-neutral text-neutral-content py-8 shadow-md">
        <div className={wideContainerClass}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex gap-2 mb-2">
                        <span className="badge badge-primary badge-lg font-bold uppercase rounded-sm">{propiedad.tipo}</span>
                        <span className="badge badge-outline text-neutral-content badge-lg font-bold uppercase rounded-sm">{propiedad.modalidad}</span>
                        {propiedad.tipoContrato && <span className="badge badge-accent badge-lg font-bold uppercase rounded-sm">{propiedad.tipoContrato}</span>}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold uppercase leading-tight tracking-tight">
                        {propiedad.ubicacion}
                    </h1>
                    <p className="text-neutral-content/80 mt-2 flex items-center gap-2 text-lg font-medium">
                        <FaMapMarkerAlt /> {propiedad.direccion}
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                    <div className="text-4xl font-black text-success">
                         $ {Number(propiedad.precio).toLocaleString()}
                    </div>
                    <span className="text-xs font-bold uppercase opacity-70">Precio de {propiedad.modalidad}</span>
                </div>
            </div>
        </div>
      </div>

      {/* CARRUSEL */}
      <div className="bg-base-300 h-[500px] relative group overflow-hidden border-b border-base-300">
        {images.length > 0 ? (
            <img 
              src={`${BACKEND_URL}${images[currentImageIndex]}`} 
              className="w-full h-full object-cover object-center transition-opacity duration-500"
              alt={`Foto ${currentImageIndex + 1}`} 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-base-200 text-base-content/40 flex-col gap-4">
                <FaImages className="text-8xl opacity-30" />
                <span className="text-2xl font-bold">Sin Fotos Disponibles</span>
            </div>
        )}
      </div>

      {/* PESTAÑAS */}
      <div className="sticky top-0 z-30 bg-base-100 shadow-sm border-b border-base-300">
        <div className={`${wideContainerClass} flex overflow-x-auto gap-8`}>
            {['INFORMACION', 'LEGAL Y DOCUMENTOS', 'DESCRIPCION', 'LOCALIZACION', 'VIDEO'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`py-5 text-sm font-bold uppercase tracking-wider border-b-4 transition-colors whitespace-nowrap ${
                        activeTab === tab.toLowerCase() 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-base-content/60 hover:text-primary'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <main className={`${wideContainerClass} py-12 grid grid-cols-1 lg:grid-cols-3 gap-12`}>
        
        <div className="lg:col-span-2 space-y-10">
            
            {/* 1. INFORMACIÓN */}
            <div className={`${activeTab === 'informacion' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2 mb-6 uppercase tracking-wide border-b pb-2 border-base-300">
                  <FaInfoCircle /> Información General
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-base-100 p-8 rounded-xl shadow-sm border border-base-300 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-lg"><div className="text-primary"><FaBuilding className="text-4xl" /></div><div><p className="text-xs uppercase opacity-70 font-bold">Tipo</p><p className="font-bold text-xl">{propiedad.tipo}</p></div></div>
                    <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-lg"><div className="text-success"><FaDollarSign className="text-4xl" /></div><div><p className="text-xs uppercase opacity-70 font-bold">Precio</p><p className="font-bold text-xl text-success">$ {Number(propiedad.precio).toLocaleString()}</p></div></div>
                    <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-lg"><div className="text-warning"><FaRulerCombined className="text-4xl" /></div><div><p className="text-xs uppercase opacity-70 font-bold">Área Terreno</p><p className="font-bold text-xl">{propiedad.area} m²</p></div></div>
                    <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-lg"><div className="text-info"><FaHome className="text-4xl" /></div><div><p className="text-xs uppercase opacity-70 font-bold">Área Construida</p><p className="font-bold text-xl">{propiedad.areaConstruida || 0} m²</p></div></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-base-100 border border-base-300 p-6 rounded-xl flex flex-col items-center text-center shadow-sm"><FaBed className="text-4xl text-indigo-500 mb-2"/><span className="text-2xl font-bold">{propiedad.habitaciones}</span><span className="text-xs font-bold uppercase text-base-content/60">Dormitorios</span></div>
                    <div className="bg-base-100 border border-base-300 p-6 rounded-xl flex flex-col items-center text-center shadow-sm"><FaBath className="text-4xl text-sky-500 mb-2"/><span className="text-2xl font-bold">{propiedad.banos}</span><span className="text-xs font-bold uppercase text-base-content/60">Baños</span></div>
                    <div className="bg-base-100 border border-base-300 p-6 rounded-xl flex flex-col items-center text-center shadow-sm"><FaCar className="text-4xl text-orange-500 mb-2"/><span className="text-2xl font-bold">{propiedad.cocheras}</span><span className="text-xs font-bold uppercase text-base-content/60">Cocheras</span></div>
                </div>
            </div>

            {/* 2. LEGAL Y DOCUMENTOS */}
            <div className={`${activeTab === 'legal y documentos' ? 'block' : 'hidden'} animate-fade-in`}>
                
                {/* SECCIÓN PROPIETARIOS CON OJITO */}
                <div className="bg-white p-6 rounded-xl border border-base-300 shadow-sm mb-8">
                    <h3 className="font-bold text-lg mb-4 border-b pb-2 border-base-200 flex items-center gap-2">
                        <FaUserTie className="text-primary"/> Propietarios Registrados
                    </h3>
                    {propiedad.Propietarios && propiedad.Propietarios.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {propiedad.Propietarios.map((prop) => (
                                <div key={prop.id} className="flex items-center justify-between gap-3 p-3 bg-base-200/50 rounded-lg border border-base-200">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar placeholder"><div className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center font-bold">{prop.nombre.charAt(0)}</div></div>
                                        <div><p className="font-bold text-sm">{prop.nombre}</p><p className="text-xs opacity-70 font-mono">DNI: {prop.dni}</p></div>
                                    </div>
                                    {/* BOTÓN OJITO */}
                                    <button 
                                        onClick={() => setSelectedOwner(prop)}
                                        className="btn btn-sm btn-circle btn-ghost text-primary hover:bg-primary/10 tooltip" 
                                        data-tip="Ver Ficha Completa"
                                    >
                                        <FaEye className="text-lg"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm italic opacity-60">No hay propietarios asignados.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="bg-base-100 p-6 rounded-xl border border-base-300 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 border-b pb-2 border-base-200">Datos Registrales</h3>
                        <div className="space-y-4">
                            <div><p className="text-xs font-bold opacity-60 uppercase mb-1">Partida Registral</p><p className="font-mono text-lg font-bold text-primary bg-base-200/50 p-2 rounded">{propiedad.partidaRegistral || 'No registrada'}</p></div>
                            {propiedad.numeroPartida && <div><p className="text-xs font-bold opacity-60 uppercase mb-1">N° de Partida (Adicional)</p><p className="font-mono text-lg font-bold text-secondary bg-base-200/50 p-2 rounded">{propiedad.numeroPartida}</p></div>}
                            <div><p className="text-xs font-bold opacity-60 uppercase mb-1">Fecha Captación</p><p className="font-medium flex items-center gap-2 text-base-content/80"><FaCalendarAlt className="text-primary"/> {propiedad.fechaCaptacion || '---'}</p></div>
                        </div>
                     </div>
                     <div className="bg-base-100 p-6 rounded-xl border border-base-300 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 border-b pb-2 border-base-200">Contrato y Comisión</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs font-bold opacity-60 uppercase mb-1">Inicio</p><p className="font-medium text-sm">{propiedad.fechaInicioContrato || '---'}</p></div>
                                <div><p className="text-xs font-bold opacity-60 uppercase mb-1">Vencimiento</p><p className="font-medium text-sm text-error">{propiedad.fechaVencimientoContrato || '---'}</p></div>
                            </div>
                            <div className="pt-3 border-t border-base-200 mt-2">
                                <p className="text-xs font-bold opacity-70 uppercase text-green-600 dark:text-green-400 mb-1">Comisión Pactada</p>
                                <p className="font-black text-2xl text-green-600 dark:text-green-400 flex items-center gap-1"><FaPercent className="text-lg opacity-80"/> {propiedad.comision ? (propiedad.comision.includes('%') ? propiedad.comision.replace('%','') : propiedad.comision) : '---'}</p>
                            </div>
                        </div>
                     </div>
                </div>

                <h3 className="font-bold text-lg mb-4 px-1">Checklist de Documentos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className={checkItemStyle(propiedad.testimonio)}>{propiedad.testimonio ? <FaCheckCircle/> : <FaTimesCircle/>} Testimonio</div>
                    <div className={checkItemStyle(propiedad.hr)}>{propiedad.hr ? <FaCheckCircle/> : <FaTimesCircle/>} Hoja Resumen (HR)</div>
                    <div className={checkItemStyle(propiedad.pu)}>{propiedad.pu ? <FaCheckCircle/> : <FaTimesCircle/>} Predio Urbano (PU)</div>
                    <div className={checkItemStyle(propiedad.impuestoPredial)}>{propiedad.impuestoPredial ? <FaCheckCircle/> : <FaTimesCircle/>} Imp. Predial</div>
                    <div className={checkItemStyle(propiedad.arbitrios)}>{propiedad.arbitrios ? <FaCheckCircle/> : <FaTimesCircle/>} Arbitrios</div>
                    <div className={checkItemStyle(propiedad.copiaLiteral)}>{propiedad.copiaLiteral ? <FaCheckCircle/> : <FaTimesCircle/>} Copia Literal</div>
                </div>
            </div>

            {/* 3. DESCRIPCIÓN */}
            <div className={`${activeTab === 'descripcion' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wide border-b pb-2 border-base-300">Descripción Comercial</h2>
                <div className="prose max-w-none text-lg text-base-content/80 leading-relaxed whitespace-pre-line text-justify bg-base-100 p-8 rounded-xl shadow-sm border border-base-300 mb-8">{propiedad.descripcion || "Sin descripción detallada disponible."}</div>
                {propiedad.distribucion && (<><h2 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wide border-b pb-2 border-base-300">Distribución Técnica</h2><div className="bg-base-100 p-8 rounded-xl shadow-sm border-l-4 border-primary border-t border-r border-b border-base-300"><p className="whitespace-pre-line text-md font-mono text-base-content/80 leading-relaxed">{propiedad.distribucion}</p></div></>)}
            </div>

            {/* 4. LOCALIZACIÓN */}
            <div className={`${activeTab === 'localizacion' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wide border-b pb-2 border-base-300">Ubicación</h2>
                <div className="bg-base-100 p-2 rounded-xl h-[500px] w-full border border-base-300 shadow-sm">{propiedad.mapaUrl ? (<iframe src={getMapSrc(propiedad.mapaUrl)} width="100%" height="100%" style={{ border: 0, borderRadius: '0.75rem' }} allowFullScreen loading="lazy"></iframe>) : (<div className="flex h-full items-center justify-center opacity-50 flex-col gap-2"><FaMapMarkerAlt className="text-5xl text-base-content/30"/><span className="text-base-content/50 font-bold">Mapa no disponible</span></div>)}</div>
            </div>

            {/* 5. VIDEO */}
            <div className={`${activeTab === 'video' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wide border-b pb-2 border-base-300">Recorrido Virtual</h2>
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-base-300">{propiedad.videoUrl ? (<iframe width="100%" height="100%" src={getYoutubeEmbed(propiedad.videoUrl)} title="Video Propiedad" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>) : (<div className="flex h-full items-center justify-center text-gray-500 flex-col gap-2"><FaPlayCircle className="text-6xl opacity-50"/><span className="font-bold">Video no disponible</span></div>)}</div>
            </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-1">
            <div className="bg-base-100 p-8 shadow-xl sticky top-24 rounded-xl border border-base-300">
                <h3 className="text-lg font-bold uppercase border-b border-base-300 pb-4 mb-6 text-center tracking-wider text-base-content">Contactar Asesor</h3>
                <div className="flex items-center gap-4 mb-8 bg-base-200 p-4 rounded-lg"><div className="avatar placeholder"><div className="bg-primary text-primary-content rounded-full w-14 h-14 flex items-center justify-center shadow-md"><span className="text-2xl font-black">A</span></div></div><div><p className="font-bold text-xl text-base-content">{propiedad.asesor || 'Asesor Sillar'}</p><p className="text-xs uppercase font-bold text-primary tracking-wide">Agente Inmobiliario</p></div></div>
                <button className="btn btn-success w-full text-white border-none font-bold text-lg h-14 mb-4 shadow-md flex items-center justify-center gap-3 hover:scale-105 transition-transform"><FaWhatsapp className="text-3xl" /> Enviar WhatsApp</button>
                {propiedad.pdfUrl ? (<a href={`${BACKEND_URL}${propiedad.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-primary w-full font-bold h-12 flex items-center justify-center gap-2"><FaFilePdf className="text-xl" /> Descargar Ficha PDF</a>) : (<button disabled className="btn btn-disabled w-full border-base-300 font-bold h-12 flex items-center justify-center gap-2 opacity-50"><FaFilePdf className="text-xl" /> PDF No Disponible</button>)}
                {linksPlataformas.length > 0 && (<div className="mt-8 pt-6 border-t border-base-300"><p className="text-xs font-bold mb-3 opacity-70 uppercase tracking-wider text-base-content flex items-center gap-2"><FaGlobe/> Publicado en:</p><div className="flex flex-col gap-2">{linksPlataformas.map((link, index) => (<a key={index} href={link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline w-full flex justify-between items-center">Link Externo {index + 1} <FaExternalLinkAlt className="text-xs"/></a>))}</div></div>)}
                <div className="mt-8 text-center border-t border-base-300 pt-6"><p className="text-sm font-bold mb-3 opacity-70 uppercase tracking-wider text-base-content">Compartir:</p><div className="flex justify-center gap-4"><button className="btn btn-circle btn-ghost hover:bg-base-200"><FaShareAlt className="text-lg" /></button></div></div>
            </div>
        </div>

        {/* 👇 MODAL DE DETALLE DEL PROPIETARIO (ESTILO PREMIUM) 👇 */}
        {selectedOwner && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
             <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                
                {/* HEADER CON GRADIENTE */}
                <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 text-white p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex items-start gap-6">
                            <div className="avatar placeholder shadow-2xl">
                                <div className="bg-gradient-to-br from-orange-400 to-pink-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold border-4 border-white/20">
                                    {selectedOwner.nombre.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{selectedOwner.nombre}</h2>
                                <div className="flex flex-wrap gap-3 text-white/90 font-mono text-sm">
                                    <span className="bg-white/20 px-3 py-1 rounded-lg flex items-center gap-2"><FaIdCard/> {selectedOwner.dni}</span>
                                    <span className="bg-white/20 px-3 py-1 rounded-lg flex items-center gap-2"><FaCalendarCheck/> Alta: {selectedOwner.fechaAlta || 'No registrada'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setSelectedOwner(null)} className="btn btn-circle btn-ghost text-white hover:bg-white/20">✕</button>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-blue-800 font-bold uppercase text-sm border-b pb-3 mb-4 flex items-center gap-2"><FaUser /> Datos de Contacto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                    <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Celular Principal</p><p className="font-bold text-gray-800 text-lg flex items-center gap-2"><FaPhone className="text-green-500"/> {selectedOwner.celular1}</p></div>
                                    {selectedOwner.celular2 && <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Celular Secundario</p><p className="font-medium text-gray-700 flex items-center gap-2"><FaPhone className="text-gray-400"/> {selectedOwner.celular2}</p></div>}
                                    <div className="md:col-span-2"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Email</p><p className="font-medium text-gray-800 flex items-center gap-2"><FaEnvelope className="text-blue-500"/> {selectedOwner.email || 'No registrado'}</p></div>
                                    <div className="md:col-span-2"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Dirección</p><p className="font-medium text-gray-800 flex items-start gap-2"><FaMapMarkerAlt className="text-red-500 mt-1"/> {selectedOwner.direccion}</p></div>
                                    <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Fecha de Nacimiento</p><p className="font-medium text-gray-800 flex items-center gap-2"><FaBirthdayCake className="text-pink-500"/> {selectedOwner.fechaNacimiento}</p></div>
                                </div>
                            </div>
                            {selectedOwner.detalles && (<div className="mt-4 pt-4 border-t border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase mb-2"><FaStickyNote className="inline mr-1"/> Notas Internas</p><p className="text-sm italic bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800">{selectedOwner.detalles}</p></div>)}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-purple-800 font-bold uppercase text-sm border-b pb-3 mb-4 flex items-center gap-2"><FaUserTie /> Gestión Interna</h3>
                                <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Asesor Captador</p><p className="font-bold text-purple-900 text-xl">{selectedOwner.asesor || 'No especificado'}</p></div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-green-700 font-bold uppercase text-sm border-b pb-3 mb-4 flex items-center gap-2"><FaCreditCard /> Información Bancaria</h3>
                                {selectedOwner.banco ? (
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-green-600 uppercase">Banco</span><span className="font-bold text-green-900 text-lg">{selectedOwner.banco}</span></div>
                                        <div className="mb-2"><p className="text-xs text-green-600 font-bold uppercase">Cuenta</p><p className="font-mono text-sm bg-white px-2 py-1 rounded border border-green-200 tracking-wide">{selectedOwner.cuenta}</p></div>
                                        <div><p className="text-xs text-green-600 font-bold uppercase">CCI</p><p className="font-mono text-sm bg-white px-2 py-1 rounded border border-green-200 tracking-wide">{selectedOwner.cci}</p></div>
                                    </div>
                                ) : (<div className="bg-gray-100 p-4 rounded-lg text-center text-gray-400 italic text-sm">Sin datos bancarios registrados.</div>)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 flex justify-end border-t border-gray-100"><button onClick={() => setSelectedOwner(null)} className="btn btn-primary px-6">Cerrar Ficha</button></div>
             </div>
           </div> 
        )}

      </main>
    </div>
  );
}