'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion';
import { 
    FaUserTie, FaBirthdayCake, FaPlus, FaSearch, FaTrash, 
    FaPhone, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, 
    FaIdCard, FaWhatsapp, FaExclamationTriangle 
} from 'react-icons/fa';
import { getCartera, createClienteCartera, deleteClienteCartera, buscarInteresadoPorNombre } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CarteraPage() {
    const [clientes, setClientes] = useState<any[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Estados para el Autocompletado
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fecha actual para validaciones
    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        nombreCompleto: '',
        documento: '',
        telefono: '',
        telefono2: '',
        email: '',
        direccion: '', 
        fechaNacimiento: '',
        profesion: '',
        fechaRegistro: today,
        tipo: 'INQUILINO'
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await getCartera();
            setClientes(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar la cartera");
        }
    };

    // --- LOGICA DE DUPLICADOS ---
    const verificarDuplicado = (nombre: string, dni: string) => {
        // Normalizamos textos (minusculas y sin espacios extra)
        const nombreLimpio = nombre.trim().toLowerCase();
        const dniLimpio = dni ? dni.trim() : '';

        return clientes.find(c => {
            const cNombre = c.nombreCompleto.toLowerCase().trim();
            const cDni = c.documento ? c.documento.trim() : '';
            
            // Coincide Nombre O Coincide DNI (si tiene)
            return cNombre === nombreLimpio || (dniLimpio && cDni === dniLimpio);
        });
    };

    // --- AUTOCOMPLETADO INTELIGENTE ---
    const handleNombreChange = async (e: any) => {
        const val = e.target.value;
        setForm({ ...form, nombreCompleto: val });
        
        if (val.length > 2) {
            try {
                const resultados = await buscarInteresadoPorNombre(val);
                
                // FILTRO MÁGICO: Excluir los que YA están en cartera
                const resultadosFiltrados = resultados.filter((r: any) => {
                    const yaExiste = clientes.some(c => 
                        c.nombreCompleto.toLowerCase().trim() === r.nombre.toLowerCase().trim()
                    );
                    return !yaExiste; // Solo mostramos los que NO existen
                });

                setSugerencias(resultadosFiltrados);
                setMostrarSugerencias(true);
            } catch (error) {
                console.error("Error buscando", error);
            }
        } else {
            setSugerencias([]);
            setMostrarSugerencias(false);
        }
    };

    const seleccionarSugerencia = (interesado: any) => {
        setForm({
            ...form,
            nombreCompleto: interesado.nombre,
            telefono: interesado.telefono || '',
            email: interesado.email || '',
        });
        setMostrarSugerencias(false);
    };

    // --- VALIDACIÓN ESTRICTA PARA TELÉFONOS  ---
    const handleInputNumerico = (e: any, campo: string) => {
        const val = e.target.value.replace(/\D/g, ''); 
        if (val.length <= 9) {
            setForm({ ...form, [campo]: val });
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        
        // 1. Validación de Teléfono
        if (form.telefono.length !== 9) {
            toast.error("⚠️ El teléfono principal debe tener 9 dígitos exactos.");
            return;
        }

        // 2. VALIDACIÓN DE DUPLICADOS (El Guardián Final) 🛡️
        const duplicado = verificarDuplicado(form.nombreCompleto, form.documento);
        if (duplicado) {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-amber-500`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <FaExclamationTriangle className="h-10 w-10 text-amber-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-gray-900">Cliente Duplicado</p>
                                <p className="mt-1 text-sm text-gray-500">
                                    El cliente <b>{duplicado.nombreCompleto}</b> ya existe en tu cartera.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-amber-600 hover:text-amber-500 focus:outline-none">Cerrar</button>
                    </div>
                </div>
            ), { duration: 5000 });
            return; // DETENEMOS TODO AQUÍ
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Guardando cliente...");

        try {
            await createClienteCartera(form);
            toast.success("Cliente guardado en cartera", { id: loadingToast });
            setShowModal(false);
            setForm({ 
                nombreCompleto: '', documento: '', telefono: '', telefono2: '', 
                email: '', direccion: '', fechaNacimiento: '', profesion: '', 
                fechaRegistro: today, tipo: 'INQUILINO' 
            });
            cargarDatos();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('¿Estás seguro de eliminar este cliente de la cartera?')) return;
        
        const loadingToast = toast.loading("Eliminando...");
        try {
            await deleteClienteCartera(id);
            toast.success("Cliente eliminado", { id: loadingToast });
            cargarDatos();
        } catch (error) {
            toast.error("Error al eliminar", { id: loadingToast });
        }
    };

    const filtrados = clientes.filter(c => 
        c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.documento && c.documento.includes(busqueda))
    );

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
            <Navbar />
            <Toaster position="top-right" reverseOrder={false} />

            {/* FONDO ANIMADO */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob"></div>
                <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-teal-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-4000"></div>
            </div>

            <div className="flex relative z-10">
                <SidebarAtencion />
                
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    
                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black text-slate-800 mb-1 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                    Cartera de Clientes
                                </span>
                                <span className="text-3xl">💼</span>
                            </h1>
                            <p className="text-slate-500 font-medium ml-1">Gestión de clientes formales y contratos</p>
                        </div>

                        <button 
                            onClick={() => setShowModal(true)} 
                            className="relative z-10 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-200/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group/btn"
                        >
                            <FaPlus className="group-hover/btn:rotate-90 transition-transform duration-300"/> 
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>

                    {/* BARRA DE BÚSQUEDA */}
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg mb-8 border border-white/60">
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors text-lg"/>
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre, DNI o teléfono..." 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-300 text-slate-700 placeholder-slate-400 font-medium"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* TABLA */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
                                    <tr>
                                        <th className="py-5 pl-8 text-slate-500 uppercase text-xs font-bold tracking-wider">Cliente</th>
                                        <th className="text-slate-500 uppercase text-xs font-bold tracking-wider">Contacto</th>
                                        <th className="text-slate-500 uppercase text-xs font-bold tracking-wider hidden md:table-cell">Dirección</th>
                                        <th className="text-slate-500 uppercase text-xs font-bold tracking-wider hidden lg:table-cell">Detalles</th>
                                        <th className="text-center text-slate-500 uppercase text-xs font-bold tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-20">
                                                <div className="flex flex-col items-center gap-4 opacity-50">
                                                    <div className="bg-slate-100 p-4 rounded-full">
                                                        <FaUserTie className="text-4xl text-slate-400"/>
                                                    </div>
                                                    <p className="text-slate-500 font-medium text-lg">No se encontraron clientes</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtrados.map((c) => (
                                            <tr key={c.id} className="hover:bg-white/60 transition-colors group">
                                                <td className="pl-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-200">
                                                            {c.nombreCompleto.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-lg">{c.nombreCompleto}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                                                                    <FaIdCard className="text-[10px]"/> {c.documento || 'S/D'}
                                                                </span>
                                                                {c.profesion && (
                                                                    <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 flex items-center gap-1">
                                                                        <FaBriefcase className="text-[10px]"/> {c.profesion}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex flex-col gap-1.5">
                                                        <a href={`https://wa.me/51${c.telefono}`} target="_blank" className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                <FaWhatsapp className="text-sm"/>
                                                            </div>
                                                            <span className="font-mono text-base">{c.telefono}</span>
                                                        </a>
                                                        {c.telefono2 && (
                                                            <div className="flex items-center gap-2 text-slate-400 text-sm ml-1">
                                                                <FaPhone className="text-xs"/>
                                                                <span className="font-mono">{c.telefono2}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell">
                                                    <div className="flex items-start gap-2 max-w-[200px]">
                                                        <FaMapMarkerAlt className="text-slate-400 mt-1 flex-shrink-0"/>
                                                        <span className="text-slate-600 text-sm leading-snug line-clamp-2">
                                                            {c.direccion || 'Sin dirección registrada'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="hidden lg:table-cell">
                                                    <div className="space-y-1">
                                                        {c.fechaNacimiento && (
                                                            <div className="flex items-center gap-2 text-pink-600 text-sm font-medium">
                                                                <FaBirthdayCake className="text-pink-400"/>
                                                                <span>{c.fechaNacimiento}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                            <FaCalendarAlt/>
                                                            <span>Reg: {c.fechaRegistro}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex justify-center">
                                                        <button 
                                                            onClick={() => handleDelete(c.id)} 
                                                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-red-200 hover:scale-110"
                                                            title="Eliminar Cliente"
                                                        >
                                                            <FaTrash/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden scale-100 animate-scale-in">
                        
                        {/* Header Modal */}
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">Nuevo Cliente</h3>
                                <p className="text-slate-500 text-sm">Ingresa los datos para agregar a la cartera</p>
                            </div>
                            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                                <FaUserTie className="text-2xl"/>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} autoComplete="off" className="p-8 space-y-6">
                            
                            {/* CAMPO DE BÚSQUEDA / NOMBRE */}
                            <div className="form-control relative">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nombre Completo <span className="text-slate-400 font-normal">(Buscar Interesado)</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-bold text-slate-700 placeholder-slate-400"
                                        placeholder="Escribe para buscar..."
                                        value={form.nombreCompleto} 
                                        onChange={handleNombreChange}
                                        onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                                        required 
                                    />
                                    {/* LISTA DE SUGERENCIAS FILTRADA */}
                                    {mostrarSugerencias && sugerencias.length > 0 && (
                                        <ul className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl mt-2 z-50 max-h-48 overflow-y-auto overflow-x-hidden">
                                            {sugerencias.map((s: any) => (
                                                <li 
                                                    key={s.id} 
                                                    onClick={() => seleccionarSugerencia(s)}
                                                    className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-none flex justify-between items-center transition-colors group"
                                                >
                                                    <span className="font-bold text-slate-700 group-hover:text-emerald-700">{s.nombre}</span>
                                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono group-hover:bg-emerald-100 group-hover:text-emerald-600">{s.telefono}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">DNI / RUC</label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-slate-700" 
                                            placeholder="12345678"
                                            value={form.documento} 
                                            onChange={e => setForm({...form, documento: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Profesión / Ocupación</label>
                                    <div className="relative">
                                        <FaBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700"
                                            placeholder="Ej. Ingeniero"
                                            value={form.profesion} 
                                            onChange={e => setForm({...form, profesion: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Dirección del Cliente</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700"
                                        placeholder="Av. Ejército 123, Cercado"
                                        value={form.direccion} 
                                        onChange={e => setForm({...form, direccion: e.target.value})} 
                                    />
                                </div>
                            </div>

                            {/* SECCIÓN TELÉFONOS DESTACADA */}
                            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                                        <FaWhatsapp className="text-emerald-600"/> Teléfono Principal *
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-lg tracking-wide text-slate-800" 
                                        placeholder="999888777"
                                        maxLength={9}
                                        value={form.telefono} 
                                        onChange={(e) => handleInputNumerico(e, 'telefono')} 
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                                        <FaPhone className="text-slate-400"/> Teléfono 2 (Opcional)
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-lg tracking-wide text-slate-800" 
                                        placeholder="987654321"
                                        maxLength={9}
                                        value={form.telefono2} 
                                        onChange={(e) => handleInputNumerico(e, 'telefono2')} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <FaBirthdayCake className="text-pink-400"/> Fecha de Nacimiento
                                    </label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700" 
                                        max={today}
                                        value={form.fechaNacimiento} 
                                        onChange={e => setForm({...form, fechaNacimiento: e.target.value})} 
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <FaCalendarAlt className="text-teal-500"/> Fecha de Registro
                                    </label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" 
                                        value={form.fechaRegistro} 
                                        disabled
                                        onChange={e => setForm({...form, fechaRegistro: e.target.value})} 
                                    />
                                </div>
                            </div>
                            
                            {/* FOOTER MODAL */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}