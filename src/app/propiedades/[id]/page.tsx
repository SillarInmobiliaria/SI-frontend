'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { useInmobiliariaStore } from '../../../store/useInmobiliariaStore';
import { 
  FaBed, FaBath, FaCar, FaRulerCombined, FaMapMarkerAlt, 
  FaWhatsapp, FaHome, FaDollarSign, FaFilePdf, FaShareAlt, 
  FaPlayCircle, FaImages, FaBuilding, FaChevronLeft, FaChevronRight, FaInfoCircle
} from 'react-icons/fa';

// URL del Backend
const BACKEND_URL = 'http://localhost:4000/';

export default function PropiedadDetallePage() {
  const { id } = useParams();
  const { propiedades, fetchPropiedades } = useInmobiliariaStore();
  const [activeTab, setActiveTab] = useState('informacion');
  
  // Estado para el Carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const propiedad = propiedades.find(p => p.id === id);

  useEffect(() => {
    if (propiedades.length === 0) fetchPropiedades();
  }, []);

  // Preparar lista de imágenes (Principal + Galería)
  const images = propiedad ? [
    propiedad.fotoPrincipal,
    ...(propiedad.galeria || [])
  ].filter(Boolean) : []; 

  // Lógica del Carrusel
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-play del carrusel (opcional, cada 6s)
  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(nextImage, 6000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  if (!propiedad) return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  // Utilidades
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

  // Clase para el ancho máximo expandido
  const wideContainerClass = "w-full max-w-[96%] mx-auto px-4 md:px-6";

  return (
    <div className="min-h-screen bg-base-200 font-sans text-base-content">
      <Navbar />
      
      {/* --- CABECERA DE TÍTULO (Diseño Original) --- */}
      <div className="bg-neutral text-neutral-content py-8 shadow-md">
        <div className={wideContainerClass}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex gap-2 mb-2">
                        <span className="badge badge-primary badge-lg font-bold uppercase rounded-sm">{propiedad.tipo}</span>
                        <span className="badge badge-outline text-neutral-content badge-lg font-bold uppercase rounded-sm">{propiedad.modalidad}</span>
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
                        {propiedad.moneda === 'PEN' ? 'S/.' : '$'} {Number(propiedad.precio).toLocaleString()}
                    </div>
                    <span className="text-xs font-bold uppercase opacity-70">Precio de {propiedad.modalidad}</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- CARRUSEL DE FOTOS (Ajustado al Cuadro) --- */}
      {/* Altura fija responsive: 400px en móvil, 600px en escritorio */}
      <div className="bg-base-300 h-[400px] md:h-[600px] relative group overflow-hidden border-b border-base-300">
        {images.length > 0 ? (
            <>
                {/* La imagen se centra y cubre el espacio sin deformarse */}
                <img 
                  src={`${BACKEND_URL}${images[currentImageIndex]}`} 
                  className="w-full h-full object-cover object-center transition-opacity duration-500"
                  alt={`Foto ${currentImageIndex + 1}`} 
                />
                
                {/* Flechas de Navegación (Solo si hay más de 1 foto) */}
                {images.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle glass text-white hover:bg-black/50 border-none">
                            <FaChevronLeft className="text-2xl" />
                        </button>
                        <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle glass text-white hover:bg-black/50 border-none">
                            <FaChevronRight className="text-2xl" />
                        </button>
                    </>
                )}

                {/* Contador de fotos */}
                <div className="absolute bottom-6 right-6 bg-black/60 text-white px-5 py-2 text-sm rounded-full backdrop-blur-md font-bold flex items-center gap-2 z-20 shadow-lg border border-white/10">
                    <FaImages className="text-lg" /> {currentImageIndex + 1} / {images.length}
                </div>
            </>
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-base-200 text-base-content/40 flex-col gap-4">
                <FaImages className="text-8xl opacity-30" />
                <span className="text-2xl font-bold">Sin Fotos Disponibles</span>
            </div>
        )}
      </div>

      {/* --- MENÚ DE PESTAÑAS --- */}
      <div className="sticky top-0 z-30 bg-base-100 shadow-sm border-b border-base-300">
        <div className={`${wideContainerClass} flex overflow-x-auto gap-8`}>
            {['INFORMACION', 'DESCRIPCION', 'CARACTERISTICAS', 'LOCALIZACION', 'VIDEO'].map((tab) => (
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
        
        {/* COLUMNA IZQUIERDA (CONTENIDO) */}
        <div className="lg:col-span-2 space-y-10">
            
            {/* 1. INFORMACIÓN */}
            <div className={`${activeTab === 'informacion' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2 mb-6 uppercase tracking-wide border-b pb-2 border-base-300">
                  <FaInfoCircle /> Información General
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-base-100 p-8 rounded-xl shadow-sm border border-base-300">
                    <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-lg">
                        <div className="text-primary"><FaBuilding className="text-4xl" /></div>
                        <div><p className="text-xs uppercase opacity-70 font-bold">Tipo</p><p className="font-bold text-xl">{propiedad.tipo}</p></div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-lg">
                        <div className="text-success"><FaDollarSign className="text-4xl" /></div>
                        <div><p className="text-xs uppercase opacity-70 font-bold">Precio</p><p className="font-bold text-xl text-success">{propiedad.moneda} {Number(propiedad.precio).toLocaleString()}</p></div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-lg">
                        <div className="text-warning"><FaRulerCombined className="text-4xl" /></div>
                        <div><p className="text-xs uppercase opacity-70 font-bold">Área Terreno</p><p className="font-bold text-xl">{propiedad.area} m²</p></div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-lg">
                        <div className="text-info"><FaHome className="text-4xl" /></div>
                        <div><p className="text-xs uppercase opacity-70 font-bold">Área Construida</p><p className="font-bold text-xl">{propiedad.areaConstruida || 0} m²</p></div>
                    </div>
                </div>
            </div>

            {/* 2. DESCRIPCIÓN */}
            <div className={`${activeTab === 'descripcion' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wide border-b pb-2 border-base-300">Descripción</h2>
                <div className="prose max-w-none text-lg text-base-content/80 leading-relaxed whitespace-pre-line text-justify bg-base-100 p-8 rounded-xl shadow-sm border border-base-300">
                    {propiedad.descripcion || "Sin descripción detallada disponible."}
                </div>
            </div>

            {/* 3. CARACTERÍSTICAS */}
            <div className={`${activeTab === 'caracteristicas' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wide border-b pb-2 border-base-300">Distribución y Detalles</h2>
                
                {/* Iconos de resumen */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-base-100 border border-base-300 p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
                        <FaBed className="text-4xl text-indigo-500 mb-2"/>
                        <span className="text-2xl font-bold">{propiedad.habitaciones}</span>
                        <span className="text-xs font-bold uppercase text-base-content/60">Dormitorios</span>
                    </div>
                    <div className="bg-base-100 border border-base-300 p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
                        <FaBath className="text-4xl text-sky-500 mb-2"/>
                        <span className="text-2xl font-bold">{propiedad.banos}</span>
                        <span className="text-xs font-bold uppercase text-base-content/60">Baños</span>
                    </div>
                    <div className="bg-base-100 border border-base-300 p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
                        <FaCar className="text-4xl text-orange-500 mb-2"/>
                        <span className="text-2xl font-bold">{propiedad.cocheras}</span>
                        <span className="text-xs font-bold uppercase text-base-content/60">Cocheras</span>
                    </div>
                </div>

                {/* Texto de distribución técnica */}
                {propiedad.distribucion ? (
                    <div className="bg-base-100 p-8 rounded-xl shadow-sm border-l-4 border-primary border-t border-r border-b border-base-300">
                        <p className="whitespace-pre-line text-md font-mono text-base-content/80 leading-relaxed">
                            {propiedad.distribucion}
                        </p>
                    </div>
                ) : (
                    <div className="alert bg-base-200 text-base-content/60">No se ha registrado la distribución técnica.</div>
                )}
            </div>

            {/* 4. LOCALIZACIÓN */}
            <div className={`${activeTab === 'localizacion' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wide border-b pb-2 border-base-300">Ubicación</h2>
                <div className="bg-base-100 p-2 rounded-xl h-[500px] w-full border border-base-300 shadow-sm">
                    {propiedad.mapaUrl ? (
                        <iframe 
                            src={getMapSrc(propiedad.mapaUrl)} 
                            width="100%" height="100%" style={{ border: 0, borderRadius: '0.75rem' }} 
                            allowFullScreen loading="lazy"
                        ></iframe>
                    ) : (
                        <div className="flex h-full items-center justify-center opacity-50 flex-col gap-2">
                            <FaMapMarkerAlt className="text-5xl text-base-content/30"/>
                            <span className="text-base-content/50 font-bold">Mapa no disponible</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. VIDEO */}
            <div className={`${activeTab === 'video' ? 'block' : 'hidden'} animate-fade-in`}>
                <h2 className="text-2xl font-bold text-primary mb-6 uppercase tracking-wide border-b pb-2 border-base-300">Recorrido Virtual</h2>
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-base-300">
                    {propiedad.videoUrl ? (
                        <iframe 
                            width="100%" height="100%" src={getYoutubeEmbed(propiedad.videoUrl)} 
                            title="Video Propiedad" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-500 flex-col gap-2">
                            <FaPlayCircle className="text-6xl opacity-50"/>
                            <span className="font-bold">Video no disponible</span>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* COLUMNA DERECHA (SIDEBAR CONTACTO) */}
        <div className="lg:col-span-1">
            <div className="bg-base-100 p-8 shadow-xl sticky top-24 rounded-xl border border-base-300">
                <h3 className="text-lg font-bold uppercase border-b border-base-300 pb-4 mb-6 text-center tracking-wider text-base-content">
                    Contactar Asesor
                </h3>
                
                <div className="flex items-center gap-4 mb-8 bg-base-200 p-4 rounded-lg">
                    <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-14 h-14 flex items-center justify-center shadow-md">
                            <span className="text-2xl font-black">A</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-xl text-base-content">{propiedad.asesor || propiedad.Propietario?.nombre || 'Asesor Sillar'}</p>
                        <p className="text-xs uppercase font-bold text-primary tracking-wide">Agente Inmobiliario</p>
                    </div>
                </div>

                <button className="btn btn-success w-full text-white border-none font-bold text-lg h-14 mb-4 shadow-md flex items-center justify-center gap-3 hover:scale-105 transition-transform">
                    <FaWhatsapp className="text-3xl" /> Enviar WhatsApp
                </button>
                
                {propiedad.pdfUrl ? (
                    <a 
                        href={`${BACKEND_URL}${propiedad.pdfUrl}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-primary w-full font-bold h-12 flex items-center justify-center gap-2"
                    >
                        <FaFilePdf className="text-xl" /> Descargar Ficha PDF
                    </a>
                ) : (
                    <button disabled className="btn btn-disabled w-full border-base-300 font-bold h-12 flex items-center justify-center gap-2 opacity-50">
                        <FaFilePdf className="text-xl" /> PDF No Disponible
                    </button>
                )}

                <div className="mt-10 text-center border-t border-base-300 pt-6">
                    <p className="text-sm font-bold mb-3 opacity-70 uppercase tracking-wider text-base-content">Compartir:</p>
                    <div className="flex justify-center gap-4">
                        <button className="btn btn-circle btn-ghost hover:bg-base-200"><FaShareAlt className="text-lg" /></button>
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}