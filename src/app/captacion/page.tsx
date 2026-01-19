'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { getCaptaciones, createCaptacion, importarCaptacionesMasivo, deleteCaptacion, updateCaptacion } from '../../services/api';
import { 
    FaHome, FaPlus, FaSearch, FaFileUpload, FaTrash, FaMapMarkerAlt, 
    FaDollarSign, FaPhone, FaUser, FaCalculator, FaCalendarAlt, FaTimes, 
    FaCheckCircle, FaChevronDown, FaChevronRight, FaFilter, FaPen, FaFileExcel
} from 'react-icons/fa';
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
  
  // --- FILTROS AVANZADOS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(''); 
  const [filterOperacion, setFilterOperacion] = useState('TODOS');
  const [filterInmueble, setFilterInmueble] = useState('TODOS');
  const [filterDistrito, setFilterDistrito] = useState('TODOS');

  // --- ESTADOS DEL MODAL ---
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sugerenciasDistrito, setSugerenciasDistrito] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(1);

  const getToday = () => new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    fechaCaptacion: getToday(),
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
        const sorted = data.sort((a: any, b: any) => {
            const dateA = new Date(a.fechaCaptacion || 0).getTime();
            const dateB = new Date(b.fechaCaptacion || 0).getTime();
            return dateB - dateA;
        });
        setCaptaciones(sorted);
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

  // --- IMPORTACIÓN INTELIGENTE (Corregida para ENUMs) ---
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event: any) => {
        try {
            const wb = read(event.target.result, { type: 'binary' });
            const sheets = wb.SheetNames;
            
            if (sheets.length) {
                const allRows = utils.sheet_to_json(wb.Sheets[sheets[0]], { header: 1 }) as any[][];
                
                // 1. BUSCAR CABECERA
                let headerRowIndex = -1;
                for (let i = 0; i < Math.min(allRows.length, 25); i++) {
                    const rowStr = JSON.stringify(allRows[i]).toUpperCase();
                    if (rowStr.includes("INMUEBLE") && (rowStr.includes("PRECIO") || rowStr.includes("AT"))) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    alert("⚠️ No se encontró la cabecera de la tabla (INMUEBLE, PRECIO, etc). Verifica el archivo.");
                    return;
                }

                // 2. MAPEAR COLUMNAS
                const headers = allRows[headerRowIndex].map(h => String(h).toUpperCase().trim());
                const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

                const idxFecha = getIdx(["FECHA"]);
                const idxFuente = getIdx(["FUENTE"]);
                const idxInmueble = getIdx(["INMUEBLE"]);
                const idxTipo = getIdx(["TIPO"]);
                const idxRelacion = getIdx(["RELACIÓN", "RELACION"]);
                const idxNombre = getIdx(["NOMBRE"]);
                const idxCel1 = getIdx(["CONTACTO 1", "CELULAR 1"]);
                const idxCel2 = getIdx(["CONTACTO 2", "CELULAR 2"]);
                const idxUbicacion = getIdx(["UBICACIÓN", "UBICACION"]);
                const idxDistrito = getIdx(["DISTRITO"]);
                const idxPrecio = getIdx(["PRECIO", "PRECIO $"]);
                const idxAT = getIdx(["AT", "A.T."]);
                const idxAC = getIdx(["AC", "A.C."]);
                const idxM2 = getIdx(["PRECIO M2", "$/M2"]);
                const idxCarac = getIdx(["CARACTERISTICAS", "CARACTERÍSTICAS"]);
                const idxAntig = getIdx(["ANTIG", "ANTIGUEDAD"]);
                const idxSit = getIdx(["SITUACIÓN", "SITUACION"]);
                const idxObs = getIdx(["OBS", "OBSERVACIONES"]);

                // Auxiliares
                const cleanNumber = (val: any) => {
                    if (!val) return 0;
                    if (typeof val === 'number') return val;
                    const cleaned = String(val).replace(/[^0-9.]/g, ''); 
                    return parseFloat(cleaned) || 0;
                };

                const parseExcelDate = (excelDate: any) => {
                    if (!excelDate) return new Date().toISOString().split('T')[0];
                    if (typeof excelDate === 'number') {
                        const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
                        return date.toISOString().split('T')[0];
                    }
                    const strDate = String(excelDate).trim();
                    if (strDate.match(/^\d{4}-\d{2}-\d{2}$/)) return strDate;
                    return new Date().toISOString().split('T')[0];
                };

                // 3. PROCESAR FILAS
                const dataRows = allRows.slice(headerRowIndex + 1);
                const importados = dataRows.map((row) => {
                    if (!row[idxInmueble] && !row[idxPrecio]) return null;

                    // --- LIMPIEZA DE ENUMS (AQUÍ ESTÁ LA SOLUCIÓN) ---
                    
                    // 1. Relación: Convertir "AGENTE INMOBILIARIO" -> "AGENTE"
                    let relacionLimpia = 'PROPIETARIO'; // Default
                    const rawRel = String(row[idxRelacion] || '').toUpperCase();
                    if (rawRel.includes('AGENTE')) relacionLimpia = 'AGENTE';
                    else if (rawRel.includes('INMOBILIARIA')) relacionLimpia = 'INMOBILIARIA';
                    else if (rawRel.includes('CONSTRUCTORA')) relacionLimpia = 'CONSTRUCTORA';

                    // 2. Operación
                    let operacionLimpia = 'VENTA';
                    const rawOp = String(row[idxTipo] || '').toUpperCase();
                    if (rawOp.includes('ALQUILER')) operacionLimpia = 'ALQUILER';
                    else if (rawOp.includes('ANTICRESIS')) operacionLimpia = 'ANTICRESIS';

                    // 3. Inmueble
                    let tipoInmueble = 'CASA'; 
                    const rawTipo = String(row[idxInmueble] || '').toUpperCase();
                    if (rawTipo.includes('TERRENO')) tipoInmueble = 'TERRENO';
                    else if (rawTipo.includes('LOCAL') || rawTipo.includes('OFICINA')) tipoInmueble = 'LOCAL_COMERCIAL';
                    else if (rawTipo.includes('PENTHOUSE')) tipoInmueble = 'PENTHOUSE';
                    else if (rawTipo.includes('DUPLEX')) tipoInmueble = 'DUPLEX';
                    else if (rawTipo.includes('DEPARTAMENTO') || rawTipo.includes('DPTO')) tipoInmueble = 'DEPARTAMENTO';

                    // Limpieza de moneda
                    const rawPrecio = String(row[idxPrecio] || '');
                    const moneda = rawPrecio.includes('S/') || rawPrecio.includes('PEN') ? 'PEN' : 'USD';

                    // Corrección Chivay (desfase de columnas)
                    let precioM2 = idxM2 !== -1 ? cleanNumber(row[idxM2]) : 0;
                    let caracteristicas = idxCarac !== -1 ? String(row[idxCarac] || '') : '';
                    
                    const posibleTextoEnM2 = String(row[idxM2] || '');
                    if (posibleTextoEnM2.length > 15 && isNaN(parseFloat(posibleTextoEnM2))) {
                        caracteristicas = posibleTextoEnM2 + " " + caracteristicas;
                        precioM2 = 0;
                    }

                    return {
                        fechaCaptacion: parseExcelDate(row[idxFecha]), 
                        fuente: String(row[idxFuente] || 'OTROS').toUpperCase().trim().slice(0, 50), 
                        inmueble: tipoInmueble, 
                        tipoOperacion: operacionLimpia,
                        relacion: relacionLimpia, // Usamos la versión limpia
                        nombre: String(row[idxNombre] || 'Sin Nombre').slice(0, 100),
                        celular1: row[idxCel1] ? String(row[idxCel1]).replace(/\D/g, '').slice(0, 9) : '',
                        celular2: row[idxCel2] ? String(row[idxCel2]).replace(/\D/g, '').slice(0, 9) : '',
                        ubicacion: String(row[idxUbicacion] || '').slice(0, 250),
                        distrito: String(row[idxDistrito] || 'Arequipa').slice(0, 100),
                        moneda: moneda,
                        precio: cleanNumber(row[idxPrecio]),
                        at: cleanNumber(row[idxAT]),
                        ac: cleanNumber(row[idxAC]),
                        precioM2: precioM2,
                        caracteristicas: caracteristicas.slice(0, 250),
                        antiguedad: String(row[idxAntig] || '').slice(0, 50),
                        situacion: String(row[idxSit] || '').slice(0, 100),
                        observaciones: String(row[idxObs] || '').slice(0, 250)
                    };
                }).filter(item => item !== null);

                if (importados.length > 0) {
                    if (confirm(`📦 Se encontraron ${importados.length} propiedades legibles.\n¿Importar a la base de datos?`)) {
                        try {
                            setLoading(true);
                            await importarCaptacionesMasivo(importados);
                            alert('🚀 ¡Importación exitosa!');
                            cargarDatos();
                        } catch (e) { 
                            console.error(e);
                            alert('Hubo un error al guardar. Revisa la consola.'); 
                        } 
                        finally { setLoading(false); }
                    }
                } else {
                    alert('⚠️ No se encontraron datos válidos.');
                }
            }
        } catch (error) {
            console.error("Error crítico:", error);
            alert("Error al leer el archivo Excel.");
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
          if (editingId) {
              await updateCaptacion(editingId, payload);
              alert('✏️ Captación actualizada correctamente');
          } else {
              await createCaptacion(payload);
              alert('✅ Propiedad registrada correctamente');
          }
          setModalOpen(false);
          setEditingId(null);
          cargarDatos();
      } catch (e) { 
          alert('Error al guardar.'); 
      } finally { setIsSubmitting(false); }
  };

  const handleEdit = (item: any) => {
      setForm({
          fechaCaptacion: item.fechaCaptacion || getToday(),
          fuente: item.fuente || 'LETRERO',
          inmueble: item.inmueble || 'CASA',
          tipoOperacion: item.tipoOperacion || 'VENTA',
          relacion: item.relacion || 'PROPIETARIO',
          nombre: item.nombre || '',
          celular1: item.celular1 || '',
          celular2: item.celular2 || '',
          ubicacion: item.ubicacion || '',
          distrito: item.distrito || '',
          moneda: item.moneda || 'USD',
          precio: item.precio || '',
          at: item.at || '',
          ac: item.ac || '',
          precioM2: item.precioM2 || '',
          caracteristicas: item.caracteristicas || '',
          antiguedad: item.antiguedad || '',
          situacion: item.situacion || '',
          observaciones: item.observaciones || ''
      });
      setEditingId(item.id);
      setActiveStep(1);
      setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
      if(!confirm('¿Eliminar registro?')) return;
      await deleteCaptacion(id);
      cargarDatos();
  };

  const handleOpenNew = () => {
      setForm({
        fechaCaptacion: getToday(),
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
      setEditingId(null);
      setActiveStep(1);
      setModalOpen(true);
  };

  const filtrados = useMemo(() => {
      const t = searchTerm.toLowerCase();
      
      return captaciones.filter(c => {
        const matchesText = 
            c.nombre?.toLowerCase().includes(t) || 
            c.ubicacion?.toLowerCase().includes(t) ||
            c.celular1?.includes(t) ||
            c.distrito?.toLowerCase().includes(t);
        
        const matchesDate = filterDate ? c.fechaCaptacion === filterDate : true;
        const matchesOperacion = filterOperacion === 'TODOS' ? true : c.tipoOperacion === filterOperacion;
        const matchesInmueble = filterInmueble === 'TODOS' ? true : c.inmueble === filterInmueble;
        const matchesDistrito = filterDistrito === 'TODOS' ? true : c.distrito === filterDistrito;

        return matchesText && matchesDate && matchesOperacion && matchesInmueble && matchesDistrito;
      });
  }, [captaciones, searchTerm, filterDate, filterOperacion, filterInmueble, filterDistrito]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 relative">
          
          <main className="flex-1 p-6 max-w-[100vw] overflow-x-hidden w-full">
            
            {/* HEADER Y FILTROS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <FaHome className="text-cyan-600"/> Captaciones
                        </h1>
                        <p className="text-slate-500 mt-1">Base de datos de propiedades y precios.</p>
                    </div>
                    <div className="flex gap-2">
                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv"/>
                        <button onClick={() => fileInputRef.current?.click()} className="btn btn-sm bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 gap-2"><FaFileExcel/> Importar Excel</button>
                        <button onClick={handleOpenNew} className="btn btn-sm bg-cyan-600 text-white hover:bg-cyan-700 gap-2"><FaPlus/> Nueva Captación</button>
                    </div>
                </div>

                {/* BARRA DE FILTROS */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <select className="select select-bordered select-sm w-full font-bold text-slate-600" value={filterOperacion} onChange={e => setFilterOperacion(e.target.value)}>
                        <option value="TODOS">Todas las Operaciones</option>
                        <option value="VENTA">Venta</option>
                        <option value="ALQUILER">Alquiler</option>
                        <option value="ANTICRESIS">Anticresis</option>
                    </select>

                    <select className="select select-bordered select-sm w-full font-bold text-slate-600" value={filterInmueble} onChange={e => setFilterInmueble(e.target.value)}>
                        <option value="TODOS">Todos los Inmuebles</option>
                        <option value="CASA">Casa</option>
                        <option value="CASA_TERRENO">Casa / Terreno</option>
                        <option value="DEPARTAMENTO">Departamento</option>
                        <option value="PENTHOUSE">Penthouse</option>
                        <option value="DUPLEX">Duplex</option>
                        <option value="LOCAL_COMERCIAL">Local Comercial</option>
                        <option value="TERRENO">Terreno</option>
                    </select>

                    <select className="select select-bordered select-sm w-full font-bold text-slate-600" value={filterDistrito} onChange={e => setFilterDistrito(e.target.value)}>
                        <option value="TODOS">Todos los Distritos</option>
                        {DISTRITOS_AREQUIPA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <div className="relative">
                        <input type="date" className="input input-bordered input-sm w-full font-bold text-slate-600" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                        {filterDate && <button onClick={() => setFilterDate('')} className="absolute right-2 top-1.5 text-xs text-red-500 font-bold hover:underline">Borrar Fecha</button>}
                    </div>

                    <div className="relative">
                        <FaSearch className="absolute left-3 top-2.5 text-slate-400"/>
                        <input type="text" placeholder="Buscar..." className="input input-bordered input-sm w-full pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
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
                                <th className="sticky right-0 bg-slate-100 shadow-l">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 && (
                                <tr>
                                    <td colSpan={19} className="text-center py-20 text-slate-400">
                                        <FaSearch className="text-4xl mx-auto mb-4 opacity-20"/>
                                        <p className="text-lg">No se encontraron resultados con estos filtros.</p>
                                    </td>
                                </tr>
                            )}
                            {filtrados.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-100 text-center group">
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
                                    <td className="sticky right-0 bg-white group-hover:bg-slate-50 shadow-l">
                                        <div className="flex justify-center gap-1">
                                            {/* BOTÓN EDITAR */}
                                            <button onClick={() => handleEdit(item)} className="btn btn-ghost btn-xs text-blue-500 hover:text-blue-700 hover:bg-blue-100 tooltip tooltip-left" data-tip="Editar">
                                                <FaPen/>
                                            </button>
                                            {/* BOTÓN ELIMINAR */}
                                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-red-400 hover:text-red-600 hover:bg-red-100 tooltip tooltip-left" data-tip="Eliminar">
                                                <FaTrash/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL (Reutilizado para Crear y Editar) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-0 my-10 animate-scaleIn overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
                            <h2 className="text-2xl font-black flex items-center gap-2">
                                <FaHome className="text-cyan-400"/> {editingId ? 'Editar Captación' : 'Nueva Captación'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-white"><FaTimes/></button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* PASO 1 */}
                                <div className={`border rounded-2xl transition-all duration-300 ${activeStep === 1 ? 'border-cyan-500 shadow-lg bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-slate-50 rounded-t-2xl border-b border-slate-100" onClick={() => setActiveStep(1)}>
                                        <h3 className="font-black text-slate-700 flex items-center gap-2"><span className="badge badge-neutral">1</span> Datos Básicos</h3>
                                        {activeStep === 1 ? <FaChevronDown/> : <FaChevronRight/>}
                                    </div>
                                    {activeStep === 1 && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Fecha</label><input type="date" className="input input-bordered input-sm" value={form.fechaCaptacion} onChange={e => setForm({...form, fechaCaptacion: e.target.value})} /></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Fuente</label><select className="select select-bordered select-sm" value={form.fuente} onChange={e => setForm({...form, fuente: e.target.value})}><option value="LETRERO">Letrero</option><option value="GRUPOS">Grupos</option><option value="PERIODICO">Periódico</option><option value="OTROS">Otros</option></select></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Tipo Inmueble</label><select className="select select-bordered select-sm" value={form.inmueble} onChange={e => setForm({...form, inmueble: e.target.value})}><option value="CASA">Casa</option><option value="CASA_TERRENO">Casa / Terreno</option><option value="DEPARTAMENTO">Departamento</option><option value="PENTHOUSE">Penthouse</option><option value="DUPLEX">Duplex</option><option value="LOCAL_COMERCIAL">Local Comercial</option><option value="TERRENO">Terreno</option></select></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Operación</label><select className="select select-bordered select-sm" value={form.tipoOperacion} onChange={e => setForm({...form, tipoOperacion: e.target.value})}><option value="VENTA">Venta</option><option value="ALQUILER">Alquiler</option><option value="ANTICRESIS">Anticresis</option></select></div>
                                            <div className="md:col-span-4 flex justify-end"><button type="button" onClick={() => setActiveStep(2)} className="btn btn-sm bg-slate-800 text-white hover:bg-slate-900">Siguiente <FaChevronRight/></button></div>
                                        </div>
                                    )}
                                </div>

                                {/* PASO 2 */}
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
                                            <div className="md:col-span-4 flex justify-end"><button type="button" onClick={() => setActiveStep(3)} className="btn btn-sm bg-slate-800 text-white hover:bg-slate-900">Siguiente <FaChevronRight/></button></div>
                                        </div>
                                    )}
                                </div>

                                {/* PASO 3 */}
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
                                                <div className="flex items-center"><input type="number" className="input input-bordered input-sm w-full rounded-r-none" placeholder="10" value={form.antiguedad.replace(' años', '')} onChange={e => setForm({...form, antiguedad: e.target.value})} /><span className="bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 rounded-r-lg border border-l-0 border-slate-300 h-[32px] flex items-center">años</span></div>
                                            </div>
                                            <div className="form-control md:col-span-4"><label className="label font-bold text-slate-600 text-xs">Situación</label><textarea className="textarea textarea-bordered h-12 text-sm leading-tight" placeholder="Saneado, en litigio, sucesión..." value={form.situacion} onChange={e => setForm({...form, situacion: e.target.value})}></textarea></div>
                                            <div className="md:col-span-4 flex justify-end"><button type="button" onClick={() => setActiveStep(4)} className="btn btn-sm bg-slate-800 text-white hover:bg-slate-900">Siguiente <FaChevronRight/></button></div>
                                        </div>
                                    )}
                                </div>

                                {/* PASO 4 */}
                                <div className={`border rounded-2xl transition-all duration-300 ${activeStep === 4 ? 'border-cyan-500 shadow-lg bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-slate-50 rounded-t-2xl border-b border-slate-100" onClick={() => setActiveStep(4)}>
                                        <h3 className="font-black text-slate-700 flex items-center gap-2"><span className="badge badge-neutral">4</span> Notas Finales</h3>
                                        {activeStep === 4 ? <FaChevronDown/> : <FaChevronRight/>}
                                    </div>
                                    {activeStep === 4 && (
                                        <div className="p-6 space-y-4 animate-fade-in">
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Características del Inmueble</label><textarea className="textarea textarea-bordered h-20 text-sm" value={form.caracteristicas} onChange={e => setForm({...form, caracteristicas: e.target.value})} placeholder="Descripción física..."></textarea></div>
                                            <div className="form-control"><label className="label font-bold text-slate-600 text-xs">Observaciones / Notas Internas</label><textarea className="textarea textarea-bordered h-20 text-sm bg-yellow-50 focus:bg-yellow-100 transition-colors" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} placeholder="Datos confidenciales, notas privadas..."></textarea></div>
                                            <div className="flex gap-3 pt-4">
                                                <button type="button" onClick={() => setModalOpen(false)} className="btn flex-1 btn-ghost">Cancelar</button>
                                                <button type="submit" disabled={isSubmitting} className="btn flex-1 bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg border-none text-lg"><FaCheckCircle/> {editingId ? 'Actualizar' : 'Guardar Todo'}</button>
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