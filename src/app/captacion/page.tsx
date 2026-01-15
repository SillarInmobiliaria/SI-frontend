'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion';
import { getCaptaciones, createCaptacion, importarCaptacionesMasivo, deleteCaptacion } from '../../services/api';
import { FaHome, FaPlus, FaSearch, FaFileUpload, FaTrash, FaMapMarkerAlt, FaDollarSign, FaPhone, FaUser, FaCalculator, FaCalendarAlt, FaTimes, FaCheckCircle, FaChevronDown, FaChevronRight, FaFilter } from 'react-icons/fa';
import { read, utils } from 'xlsx';

// LISTA MAESTRA DE DISTRITOS
const DISTRITOS_AREQUIPA = [
  "Alto Selva Alegre", "Arequipa", "Camaná", "Cayma", "Cerro Colorado", 
  "Characato", "Chiguata", "Chivay", "Ilo", "Islay", "Jacobo Hunter", 
  "José Luis Bustamante y Rivero", "La Joya", "Majes", "Mariano Melgar", 
  "Mejía", "Miraflores", "Mollebaya", "Mollendo", "Moquegua", "Paucarpata", 
  "Pedregal", "Pocsi", "Polobaya", "Quequeña", "Sabandía", "Sachaca", 
  "San Juan de Siguas", "San Juan de Tarucani", "Santa Isabel de Siguas", 
  "Santa Rita de Siguas", "Socabaya", "Tiabaya", "Uchumayo", "Vitor", 
  "Yanahuara", "Yarabamba", "Yura"
];

export default function CaptacionPage() {
  const [captaciones, setCaptaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  
  // INICIAMOS CON LA FECHA DE HOY (YYYY-MM-DD)
  const getToday = () => new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(getToday());

  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sugerenciasDistrito, setSugerenciasDistrito] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(1);

  const [form, setForm] = useState({
    fechaCaptacion: getToday(), // También el formulario inicia con hoy
    fuente: 'LETRERO',
    inmueble: 'CASA',
    tipoOperacion: 'VENTA',
    relacion: 'PROPIETARIO',
    nombre: '',
    celular1: '',
    celular2: '',
    ubicacion: '',
    distrito: '',
    moneda: 'USD',
    precio: '',
    at: '',
    ac: '',
    precioM2: '',
    caracteristicas: '',
    antiguedad: '',
    situacion: '',
    observaciones: ''
  });

  useEffect(() => { cargarDatos(); }, []);

  // --- CÁLCULO AUTOMÁTICO DE M2 ---
  useEffect(() => {
    if (form.tipoOperacion === 'VENTA') {
        const precio = parseFloat(form.precio) || 0;
        const at = parseFloat(form.at) || 0;
        const ac = parseFloat(form.ac) || 0;
        let resultado = 0;

        if (['TERRENO', 'CASA_TERRENO', 'TERRENO_AGRICOLA', 'TERRENO_INDUSTRIAL'].includes(form.inmueble)) {
            if (at > 0) resultado = precio / at;
        }
        else if (['DEPARTAMENTO', 'PENTHOUSE', 'DUPLEX', 'LOCAL_COMERCIAL'].includes(form.inmueble)) {
            if (ac > 0) resultado = precio / ac;
        }
        
        if (resultado > 0) {
            setForm(prev => ({ ...prev, precioM2: resultado.toFixed(2) }));
        }
    }
  }, [form.precio, form.at, form.ac, form.inmueble, form.tipoOperacion]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
        const data = await getCaptaciones();
        setCaptaciones(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleDistritoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value;
      setForm({ ...form, distrito: valor });
      if (valor.length > 0) {
          const coincidencias = DISTRITOS_AREQUIPA.filter(dist => dist.toLowerCase().includes(valor.toLowerCase()));
          setSugerenciasDistrito(coincidencias);
      } else { setSugerenciasDistrito([]); }
  };

  const seleccionarDistrito = (distrito: string) => {
      setForm({ ...form, distrito: distrito });
      setSugerenciasDistrito([]);
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event: any) => {
        const wb = read(event.target.result, { type: 'binary' });
        const sheets = wb.SheetNames;
        if (sheets.length) {
            const rows: any[] = utils.sheet_to_json(wb.Sheets[sheets[0]], { header: 1 });
            const importados = rows.filter((row: any) => {
                const strRow = JSON.stringify(row).toUpperCase();
                return strRow.includes('VENTA') || strRow.includes('ALQUILER') || (row[1] && row[1].includes('-'));
            }).map((row) => {
                let tipoInmueble = 'OTROS';
                const rawTipo = String(row[3] || '').toUpperCase();
                if (rawTipo.includes('CASA')) tipoInmueble = 'CASA';
                if (rawTipo.includes('TERRENO')) tipoInmueble = 'TERRENO';
                if (rawTipo.includes('DEPARTAMENTO') || rawTipo.includes('DPTO')) tipoInmueble = 'DEPARTAMENTO';
                if (rawTipo.includes('PENTHOUSE')) tipoInmueble = 'PENTHOUSE';
                if (rawTipo.includes('DUPLEX')) tipoInmueble = 'DUPLEX';
                if (rawTipo.includes('LOCAL')) tipoInmueble = 'LOCAL_COMERCIAL';

                return {
                    fechaCaptacion: row[1] || new Date(), 
                    fuente: String(row[2] || 'OTROS').toUpperCase().trim(), 
                    inmueble: tipoInmueble, 
                    tipoOperacion: String(row[4] || 'VENTA').toUpperCase().trim(),
                    relacion: String(row[5] || 'PROPIETARIO').toUpperCase().includes('AGENTE') ? 'AGENTE' : 'PROPIETARIO',
                    nombre: row[6] || 'Sin Nombre',
                    celular1: row[7] ? String(row[7]).slice(0, 9) : '',
                    celular2: row[8] ? String(row[8]).slice(0, 9) : '',
                    ubicacion: row[9] || '',
                    distrito: row[10] || '',
                    moneda: 'USD',
                    precio: row[11] || 0,
                    at: row[12] || 0,
                    ac: row[13] || 0,
                    precioM2: row[14] || 0,
                    caracteristicas: row[15] || '',
                    antiguedad: row[16] || '',
                    situacion: row[17] || '',
                    observaciones: row[19] || ''
                };
            });
            const cleanData = importados.filter(i => !String(i.inmueble).includes('INMUEBLE'));
            if (confirm(`📦 Se encontraron ${cleanData.length} propiedades.\n¿Importar ahora?`)) {
                try {
                    setLoading(true);
                    await importarCaptacionesMasivo(cleanData);
                    alert('🚀 ¡Importación exitosa!');
                    cargarDatos();
                } catch (e) { alert('Error al importar'); } 
                finally { setLoading(false); }
            }
        }
    };
    reader.readAsBinaryString(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      const payload = { ...form };
      if (payload.antiguedad && !payload.antiguedad.toLowerCase().includes('año')) {
          payload.antiguedad = `${payload.antiguedad} años`;
      }

      try {
          await createCaptacion(payload);
          alert('✅ Propiedad registrada correctamente');
          setModalOpen(false);
          setActiveStep(1); 
          cargarDatos();
      } catch (e) { 
          alert('Error al guardar.'); 
      } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
      if(!confirm('¿Eliminar registro?')) return;
      await deleteCaptacion(id);
      cargarDatos();
  };

  // --- LÓGICA DE FILTRADO MEJORADA ---
  const filtrados = useMemo(() => {
      const t = searchTerm.toLowerCase();
      
      return captaciones.filter(c => {
        // BUSCADOR: Busca en Nombre, Ubicación, Distrito, Celulares y Tipo Inmueble
        const matchesText = 
            c.nombre?.toLowerCase().includes(t) || 
            c.ubicacion?.toLowerCase().includes(t) ||
            c.distrito?.toLowerCase().includes(t) ||
            c.inmueble?.toLowerCase().includes(t) ||
            c.celular1?.includes(t) ||
            c.celular2?.includes(t);
        
        // FECHA: Si filterDate tiene valor, filtra exacto. Si está vacío, muestra todo.
        const matchesDate = filterDate ? c.fechaCaptacion === filterDate : true;

        return matchesText && matchesDate;
      });
  }, [captaciones, searchTerm, filterDate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
          <SidebarAtencion />
          <main className="flex-1 p-6 max-w-[100vw] overflow-x-hidden w-full">
            
            {/* HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <FaHome className="text-cyan-600"/> Captaciones
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {filterDate ? `Mostrando captaciones del: ${filterDate}` : 'Mostrando historial completo'}
                    </p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 items-center w-full xl:w-auto">
                    
                    {/* FILTRO FECHA (Por defecto HOY) */}
                    <div className="relative group">
                        <input 
                            type="date" 
                            className="input input-bordered pl-10 rounded-xl w-full md:w-auto cursor-pointer font-bold text-slate-600 focus:bg-white bg-slate-50" 
                            value={filterDate} 
                            onChange={e => setFilterDate(e.target.value)}
                        />
                        <FaFilter className="absolute left-3 top-3.5 text-cyan-500 pointer-events-none"/>
                        
                        {/* Botón para limpiar fecha y ver TODO el historial */}
                        {filterDate && (
                            <button 
                                onClick={() => setFilterDate('')} 
                                className="absolute right-10 top-3 text-slate-300 hover:text-red-500 tooltip tooltip-left"
                                data-tip="Ver todo el historial"
                            >
                                <FaTimes/>
                            </button>
                        )}
                    </div>

                    {/* BUSCADOR (La Lupa) */}
                    <div className="relative w-full md:w-72">
                        <FaSearch className="absolute left-3 top-3.5 text-slate-400"/>
                        <input 
                            type="text" 
                            placeholder="Buscar nombre, celular, distrito..." 
                            className="input input-bordered w-full pl-10 rounded-xl bg-white shadow-sm focus:shadow-md transition-all" 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls"/>
                    <button onClick={() => fileInputRef.current?.click()} className="btn bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl gap-2 shadow-md hover:shadow-lg transition-all"><FaFileUpload/> Importar</button>
                    <button onClick={() => { setForm({...form, fechaCaptacion: getToday(), distrito: '', moneda: 'USD'}); setActiveStep(1); setModalOpen(true); }} className="btn bg-cyan-600 text-white hover:bg-cyan-700 rounded-xl gap-2 shadow-md hover:shadow-lg transition-all"><FaPlus/> Nueva</button>
                </div>
            </div>

            {/* TABLA SÁBANA */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="table table-xs w-full min-w-[1800px]">
                        <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 shadow-sm h-12 text-center">
                            <tr>
                                <th className="min-w-[100px]">Fecha</th>
                                <th>Fuente</th>
                                <th>Inmueble</th>
                                <th>Tipo</th>
                                <th>Relación</th>
                                <th className="min-w-[150px] text-left">Nombre</th>
                                <th>Celular 1</th>
                                <th>Celular 2</th>
                                <th className="min-w-[200px] text-left">Ubicación</th>
                                <th>Distrito</th>
                                <th>Precio</th>
                                <th>AT</th>
                                <th>AC</th>
                                <th>$/m²</th>
                                <th className="min-w-[200px] text-left">Características</th>
                                <th>Antig.</th>
                                <th className="min-w-[150px] text-left">Situación</th>
                                <th className="min-w-[150px] text-left">Obs</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 && (
                                <tr>
                                    <td colSpan={19} className="text-center py-20 text-slate-400">
                                        <FaSearch className="text-4xl mx-auto mb-4 opacity-20"/>
                                        <p className="text-lg">No se encontraron resultados.</p>
                                        {filterDate && <p className="text-sm opacity-70">Intenta cambiando la fecha o borrando el filtro.</p>}
                                    </td>
                                </tr>
                            )}
                            {filtrados.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-100 text-center">
                                    <td className="font-mono text-slate-500">{item.fechaCaptacion}</td>
                                    <td><span className="badge badge-ghost badge-sm">{item.fuente}</span></td>
                                    <td className="font-bold text-cyan-700">{item.inmueble}</td>
                                    <td className="font-bold text-[10px] uppercase text-slate-500">{item.tipoOperacion}</td>
                                    <td className="text-[10px] uppercase font-bold text-slate-400">{item.relacion}</td>
                                    <td className="font-bold truncate max-w-[150px] text-left" title={item.nombre}>{item.nombre}</td>
                                    <td className="font-mono text-slate-700 font-bold bg-slate-50 rounded px-1">{item.celular1}</td>
                                    <td className="font-mono text-slate-400 text-[10px]">{item.celular2}</td>
                                    <td className="truncate max-w-[200px] text-left" title={item.ubicacion}>{item.ubicacion}</td>
                                    <td className="font-semibold text-indigo-600 text-[11px]">{item.distrito}</td>
                                    <td className="font-mono font-bold text-emerald-600 text-right pr-4">
                                        {item.moneda === 'PEN' ? 'S/ ' : '$ '} 
                                        {Number(item.precio).toLocaleString()}
                                    </td>
                                    <td className="text-center font-mono text-xs">{item.at > 0 ? item.at : '-'}</td>
                                    <td className="text-center font-mono text-xs">{item.ac > 0 ? item.ac : '-'}</td>
                                    <td className="font-mono font-bold text-slate-500 text-xs">
                                        {item.precioM2 > 0 ? <span>{item.precioM2}</span> : '-'}
                                    </td>
                                    <td className="truncate max-w-[200px] text-xs text-slate-500 italic text-left" title={item.caracteristicas}>{item.caracteristicas}</td>
                                    <td className="text-xs">{item.antiguedad}</td>
                                    <td className="truncate max-w-[150px] text-xs text-left" title={item.situacion}>{item.situacion}</td>
                                    <td className="truncate max-w-[150px] text-xs text-left text-yellow-600 font-medium" title={item.observaciones}>{item.observaciones}</td>
                                    <td>
                                        <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-red-400 hover:text-red-600"><FaTrash/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CON EFECTO ACORDEÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-0 my-10 animate-scaleIn overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* CABECERA MODAL */}
                        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
                            <h2 className="text-2xl font-black flex items-center gap-2">
                                <FaHome className="text-cyan-400"/> Nueva Captación
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white"><FaTimes/></button>
                        </div>

                        {/* CUERPO DEL FORMULARIO CON SCROLL */}
                        <div className="p-8 overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                
                                {/* PASO 1: DATOS BÁSICOS */}
                                <div className={`border rounded-2xl transition-all duration-300 ${activeStep === 1 ? 'border-cyan-500 shadow-lg bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                                    <div 
                                        className="p-4 flex justify-between items-center cursor-pointer bg-slate-50 rounded-t-2xl border-b border-slate-100"
                                        onClick={() => setActiveStep(1)}
                                    >
                                        <h3 className="font-black text-slate-700 flex items-center gap-2"><span className="badge badge-neutral">1</span> Datos Básicos</h3>
                                        {activeStep === 1 ? <FaChevronDown/> : <FaChevronRight/>}
                                    </div>
                                    
                                    {activeStep === 1 && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Fecha</label><input type="date" className="input input-bordered input-sm" value={form.fechaCaptacion} onChange={e => setForm({...form, fechaCaptacion: e.target.value})} /></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Fuente</label><select className="select select-bordered select-sm" value={form.fuente} onChange={e => setForm({...form, fuente: e.target.value})}><option value="LETRERO">Letrero</option><option value="GRUPOS">Grupos</option><option value="PERIODICO">Periódico</option><option value="OTROS">Otros</option></select></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Tipo Inmueble</label><select className="select select-bordered select-sm" value={form.inmueble} onChange={e => setForm({...form, inmueble: e.target.value})}><option value="CASA">Casa</option><option value="CASA_TERRENO">Casa / Terreno</option><option value="DEPARTAMENTO">Departamento</option><option value="PENTHOUSE">Penthouse</option><option value="DUPLEX">Duplex</option><option value="LOCAL_COMERCIAL">Local Comercial</option><option value="TERRENO">Terreno</option></select></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Operación</label><select className="select select-bordered select-sm" value={form.tipoOperacion} onChange={e => setForm({...form, tipoOperacion: e.target.value})}><option value="VENTA">Venta</option><option value="ALQUILER">Alquiler</option><option value="ANTICRESIS">Anticresis</option></select></div>
                                            
                                            <div className="md:col-span-4 flex justify-end">
                                                <button type="button" onClick={() => setActiveStep(2)} className="btn btn-sm bg-slate-800 text-white hover:bg-slate-900">Siguiente <FaChevronRight/></button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PASO 2: CONTACTO */}
                                <div className={`border rounded-2xl transition-all duration-300 ${activeStep === 2 ? 'border-cyan-500 shadow-lg bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-slate-50 rounded-t-2xl border-b border-slate-100" onClick={() => setActiveStep(2)}>
                                        <h3 className="font-black text-slate-700 flex items-center gap-2"><span className="badge badge-neutral">2</span> Contacto</h3>
                                        {activeStep === 2 ? <FaChevronDown/> : <FaChevronRight/>}
                                    </div>
                                    
                                    {activeStep === 2 && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Relación</label><select className="select select-bordered select-sm" value={form.relacion} onChange={e => setForm({...form, relacion: e.target.value})}><option value="PROPIETARIO">Propietario</option><option value="AGENTE">Agente</option><option value="INMOBILIARIA">Inmobiliaria</option><option value="CONSTRUCTORA">Constructora</option></select></div>
                                            <div className="form-control md:col-span-3"><label className="label font-bold text-slate-600 text-xs">Nombre Completo</label><input type="text" className="input input-bordered input-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Celular 1</label><input type="text" className="input input-bordered input-sm" value={form.celular1} maxLength={9} placeholder="999..." onChange={e => setForm({...form, celular1: e.target.value.replace(/\D/g, '').slice(0, 9)})} /></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Celular 2</label><input type="text" className="input input-bordered input-sm" value={form.celular2} maxLength={9} placeholder="Opcional" onChange={e => setForm({...form, celular2: e.target.value.replace(/\D/g, '').slice(0, 9)})} /></div>
                                            
                                            <div className="md:col-span-4 flex justify-end">
                                                <button type="button" onClick={() => setActiveStep(3)} className="btn btn-sm bg-slate-800 text-white hover:bg-slate-900">Siguiente <FaChevronRight/></button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PASO 3: DETALLES INMUEBLE */}
                                <div className={`border rounded-2xl transition-all duration-300 ${activeStep === 3 ? 'border-cyan-500 shadow-lg bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-slate-50 rounded-t-2xl border-b border-slate-100" onClick={() => setActiveStep(3)}>
                                        <h3 className="font-black text-slate-700 flex items-center gap-2"><span className="badge badge-neutral">3</span> Detalles</h3>
                                        {activeStep === 3 ? <FaChevronDown/> : <FaChevronRight/>}
                                    </div>
                                    
                                    {activeStep === 3 && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                                            <div className="form-control md:col-span-2"><label className="label font-bold text-slate-600 text-xs">Ubicación</label><input type="text" className="input input-bordered input-sm" value={form.ubicacion} onChange={e => setForm({...form, ubicacion: e.target.value})} /></div>
                                            <div className="form-control md:col-span-2 relative">
                                                <label className="label font-bold text-slate-600 text-xs">Distrito</label>
                                                <input type="text" className="input input-bordered input-sm w-full" placeholder="Escribe para buscar..." value={form.distrito} onChange={handleDistritoChange} onBlur={() => setTimeout(() => setSugerenciasDistrito([]), 200)} />
                                                {sugerenciasDistrito.length > 0 && <ul className="absolute z-50 top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto mt-1">{sugerenciasDistrito.map((dist) => (<li key={dist} onClick={() => seleccionarDistrito(dist)} className="px-4 py-2 hover:bg-cyan-50 cursor-pointer text-xs font-bold text-slate-600">{dist}</li>))}</ul>}
                                            </div>
                                            
                                            <div className="form-control relative md:col-span-2"><label className="label font-bold text-slate-600 text-xs">Precio</label><div className="flex gap-2"><select className="select select-bordered select-sm w-20 font-bold bg-slate-100" value={form.moneda} onChange={e => setForm({...form, moneda: e.target.value})}><option value="USD">USD $</option><option value="PEN">PEN S/</option></select><input type="number" className="input input-bordered input-sm w-full" placeholder="0.00" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} /></div></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">A. Terreno (m2)</label><input type="number" className="input input-bordered input-sm" value={form.at} onChange={e => setForm({...form, at: e.target.value})} /></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">A. Const. (m2)</label><input type="number" className="input input-bordered input-sm" value={form.ac} onChange={e => setForm({...form, ac: e.target.value})} /></div>
                                            <div className="form-control relative"><label className="label font-bold text-slate-600 text-xs flex items-center gap-1">Precio x m² <FaCalculator className="text-cyan-400"/></label><input type="number" className="input input-bordered input-sm bg-cyan-50 font-bold text-cyan-800" value={form.precioM2} onChange={e => setForm({...form, precioM2: e.target.value})} placeholder="Auto..." /></div>
                                            
                                            <div className="form-control">
                                                <label className="label font-bold text-slate-600 text-xs">Antigüedad</label>
                                                <div className="flex items-center">
                                                    <input type="number" className="input input-bordered input-sm w-full rounded-r-none" placeholder="10" value={form.antiguedad.replace(' años', '')} onChange={e => setForm({...form, antiguedad: e.target.value})} />
                                                    <span className="bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 rounded-r-lg border border-l-0 border-slate-300 h-[32px] flex items-center">años</span>
                                                </div>
                                            </div>

                                            <div className="form-control md:col-span-4"><label className="label font-bold text-slate-600 text-xs">Situación</label><textarea className="textarea textarea-bordered h-12 text-sm leading-tight" placeholder="Saneado, en litigio, sucesión..." value={form.situacion} onChange={e => setForm({...form, situacion: e.target.value})}></textarea></div>
                                            
                                            <div className="md:col-span-4 flex justify-end">
                                                <button type="button" onClick={() => setActiveStep(4)} className="btn btn-sm bg-slate-800 text-white hover:bg-slate-900">Siguiente <FaChevronRight/></button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PASO 4: OBSERVACIONES */}
                                <div className={`border rounded-2xl transition-all duration-300 ${activeStep === 4 ? 'border-cyan-500 shadow-lg bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-slate-50 rounded-t-2xl border-b border-slate-100" onClick={() => setActiveStep(4)}>
                                        <h3 className="font-black text-slate-700 flex items-center gap-2"><span className="badge badge-neutral">4</span> Notas Finales</h3>
                                        {activeStep === 4 ? <FaChevronDown/> : <FaChevronRight/>}
                                    </div>
                                    
                                    {activeStep === 4 && (
                                        <div className="p-6 space-y-4 animate-fade-in">
                                            <div className="form-control">
                                                <label className="label font-bold text-slate-600 text-xs">Características del Inmueble</label>
                                                <textarea className="textarea textarea-bordered h-20 text-sm" value={form.caracteristicas} onChange={e => setForm({...form, caracteristicas: e.target.value})} placeholder="Descripción física..."></textarea>
                                            </div>
                                            <div className="form-control">
                                                <label className="label font-bold text-slate-600 text-xs">Observaciones / Notas Internas</label>
                                                <textarea className="textarea textarea-bordered h-20 text-sm bg-yellow-50 focus:bg-yellow-100 transition-colors" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} placeholder="Datos confidenciales, notas privadas..."></textarea>
                                            </div>
                                            
                                            <div className="flex gap-3 pt-4">
                                                <button type="button" onClick={() => setModalOpen(false)} className="btn flex-1 btn-ghost">Cancelar</button>
                                                <button type="submit" disabled={isSubmitting} className="btn flex-1 bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg border-none text-lg"><FaCheckCircle/> Guardar Todo</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}
          </main>
      </div>
    </div>
  );
}