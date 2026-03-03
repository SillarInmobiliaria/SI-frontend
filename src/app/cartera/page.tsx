'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion';
import { 
    FaUserTie, FaBirthdayCake, FaPlus, FaSearch, FaTrash, 
    FaPhone, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, 
    FaIdCard, FaWhatsapp, FaExclamationTriangle, FaEdit, FaBuilding 
} from 'react-icons/fa';
import { getCartera, createClienteCartera, updateClienteCartera, deleteClienteCartera, buscarInteresadoPorNombre } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CarteraPage() {
    const [clientes, setClientes] = useState<any[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editandoId, setEditandoId] = useState<number | string | null>(null);

    const today = new Date().toISOString().split('T')[0];

    const INITIAL_FORM = {
        tipoPersona: 'PN',
        empresa: '',
        ruc: '',
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
    };

    const [form, setForm] = useState(INITIAL_FORM);

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

    const verificarDuplicado = (nombre: string, dni: string) => {
        const nombreLimpio = nombre.trim().toLowerCase();
        const dniLimpio = dni ? dni.trim() : '';

        return clientes.find(c => {
            const cNombre = c.nombreCompleto.toLowerCase().trim();
            const cDni = c.documento ? c.documento.trim() : '';
            return cNombre === nombreLimpio || (dniLimpio && cDni === dniLimpio);
        });
    };

    const handleNombreChange = async (e: any) => {
        const val = e.target.value;
        setForm({ ...form, nombreCompleto: val });
        
        if (val.length > 2) {
            try {
                const resultados = await buscarInteresadoPorNombre(val);
                const resultadosFiltrados = resultados.filter((r: any) => {
                    const yaExiste = clientes.some(c => 
                        c.nombreCompleto.toLowerCase().trim() === r.nombre.toLowerCase().trim()
                    );
                    return !yaExiste;
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

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleInputNumerico = (e: any, campo: string) => {
        const val = e.target.value.replace(/\D/g, ''); 
        const maxLength = campo === 'ruc' ? 11 : 9;
        if (val.length <= maxLength) {
            setForm({ ...form, [campo]: val });
        }
    };

    const handleNuevoClick = () => {
        setEditandoId(null);
        setForm(INITIAL_FORM);
        setShowModal(true);
    };

    const handleEditarClick = (cliente: any) => {
        setEditandoId(cliente.id);
        setForm({
            tipoPersona: cliente.tipoPersona || 'PN',
            empresa: cliente.empresa || '',
            ruc: cliente.ruc || '',
            nombreCompleto: cliente.nombreCompleto || '',
            documento: cliente.documento || '',
            telefono: cliente.telefono || '',
            telefono2: cliente.telefono2 || '',
            email: cliente.email || '',
            direccion: cliente.direccion || '',
            fechaNacimiento: cliente.fechaNacimiento || '',
            profesion: cliente.profesion || '',
            fechaRegistro: cliente.fechaRegistro || today,
            tipo: cliente.tipo || 'INQUILINO'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        
        if (form.telefono.length !== 9) {
            toast.error("⚠️ El teléfono principal debe tener 9 dígitos exactos.");
            return;
        }

        if (form.tipoPersona === 'PJ' && form.ruc.length !== 11) {
            toast.error("⚠️ El RUC debe tener 11 dígitos exactos.");
            return;
        }

        const duplicado = verificarDuplicado(form.nombreCompleto, form.documento);
        if (duplicado && duplicado.id !== editandoId) {
            toast.error("Cliente duplicado detectado.");
            return; 
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading(editandoId ? "Actualizando cliente..." : "Guardando cliente...");

        try {
            const payload = { ...form };
            if (payload.tipoPersona === 'PN') {
                payload.empresa = '';
                payload.ruc = '';
            }

            if (editandoId) {
                await updateClienteCartera(editandoId, payload);
                toast.success("Cliente actualizado", { id: loadingToast });
            } else {
                await createClienteCartera(payload);
                toast.success("Cliente guardado", { id: loadingToast });
            }
            
            setShowModal(false);
            setForm(INITIAL_FORM);
            setEditandoId(null);
            cargarDatos();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('¿Estás seguro de eliminar este cliente?')) return;
        const loadingToast = toast.loading("Eliminando...");
        try {
            await deleteClienteCartera(id);
            toast.success("Cliente eliminado", { id: loadingToast });
            cargarDatos();
        } catch (error) {
            toast.error("Error al eliminar", { id: loadingToast });
        }
    };

    const filtrados = clientes.filter(c => {
        const busquedaLower = busqueda.toLowerCase();
        return c.nombreCompleto.toLowerCase().includes(busquedaLower) ||
               (c.documento && c.documento.includes(busqueda)) ||
               (c.empresa && c.empresa.toLowerCase().includes(busquedaLower)) ||
               (c.ruc && c.ruc.includes(busqueda));
    });

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
            <Navbar />
            <Toaster position="top-right" reverseOrder={false} />

            {/* RECUPERADO: FONDO ANIMADO ORIGINAL */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob"></div>
                <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-teal-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-4000"></div>
            </div>

            <div className="flex relative z-10">
                <SidebarAtencion />
                
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    
                    {/* RECUPERADO: HEADER CON ESTILO ORIGINAL */}
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

                        <button onClick={handleNuevoClick} className="relative z-10 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-200/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group/btn">
                            <FaPlus className="group-hover/btn:rotate-90 transition-transform duration-300"/> 
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg mb-8 border border-white/60">
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors text-lg"/>
                            <input type="text" placeholder="Buscar por nombre, DNI, empresa o RUC..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-300 text-slate-700 placeholder-slate-400 font-medium" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        </div>
                    </div>

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
                                    {filtrados.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/60 transition-colors group">
                                            <td className="pl-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md ${c.tipoPersona === 'PJ' ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                                                        {c.tipoPersona === 'PJ' ? <FaBuilding /> : c.nombreCompleto.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                            {c.nombreCompleto}
                                                            {c.tipoPersona === 'PJ' && <span className="badge badge-sm bg-indigo-100 text-indigo-700 font-bold border-none">PJ</span>}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                                                                <FaIdCard className="text-[10px]"/> {c.documento || 'S/D'}
                                                            </span>
                                                            {c.tipoPersona === 'PJ' && c.empresa && (
                                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                                                    <FaBuilding className="text-[10px]" /> {c.empresa}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1.5">
                                                    <a href={`https://wa.me/51${c.telefono}`} target="_blank" className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                                        <FaWhatsapp /> <span className="font-mono">{c.telefono}</span>
                                                    </a>
                                                    {c.telefono2 && <span className="text-xs text-slate-400 ml-5 font-mono">{c.telefono2}</span>}
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell">
                                                <div className="flex items-start gap-2 max-w-[200px]">
                                                    <FaMapMarkerAlt className="text-slate-400 mt-1 flex-shrink-0"/>
                                                    <span className="text-slate-600 text-sm line-clamp-2">{c.direccion || 'Sin dirección'}</span>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell">
                                                <div className="space-y-1">
                                                    {c.fechaNacimiento && c.tipoPersona === 'PN' && (
                                                        <div className="flex items-center gap-2 text-pink-600 text-sm font-medium">
                                                            <FaBirthdayCake className="text-pink-400"/> <span>{c.fechaNacimiento}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                        <FaCalendarAlt/> <span>Reg: {c.fechaRegistro}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleEditarClick(c)} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all shadow-sm">
                                                        <FaEdit/>
                                                    </button>
                                                    <button onClick={() => handleDelete(c.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm">
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
                </main>
            </div>

            {/* MODAL CON ESTILO ORIGINAL RECUPERADO */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden scale-100 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">{editandoId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                                <p className="text-slate-500 text-sm">Gestiona la información detallada del cliente</p>
                            </div>
                            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                                {editandoId ? <FaEdit className="text-2xl"/> : <FaUserTie className="text-2xl"/>}
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} autoComplete="off" className="p-8 space-y-6">
                            <div className="form-control bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Tipo de Persona *</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tipoPersona" value="PN" checked={form.tipoPersona === 'PN'} onChange={handleChange} className="radio radio-emerald radio-sm" />
                                        <span className="font-bold text-slate-600">Natural (PN)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tipoPersona" value="PJ" checked={form.tipoPersona === 'PJ'} onChange={handleChange} className="radio radio-emerald radio-sm" />
                                        <span className="font-bold text-slate-600">Jurídica (PJ)</span>
                                    </label>
                                </div>
                            </div>

                            {form.tipoPersona === 'PJ' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 animate-fade-in">
                                    <div className="form-control">
                                        <label className="block text-sm font-bold text-indigo-900 mb-2">Nombre Empresa *</label>
                                        <input type="text" name="empresa" className="input input-bordered w-full font-bold" value={form.empresa} onChange={handleChange} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="block text-sm font-bold text-indigo-900 mb-2">Número RUC *</label>
                                        <input type="text" className="input input-bordered w-full font-mono" maxLength={11} value={form.ruc} onChange={e => handleInputNumerico(e, 'ruc')} required />
                                    </div>
                                </div>
                            )}

                            <div className="form-control relative">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    {form.tipoPersona === 'PJ' ? 'Representante Legal *' : 'Nombre Completo *'}
                                </label>
                                <input type="text" className="input input-bordered w-full font-bold" value={form.nombreCompleto} onChange={handleNombreChange} required />
                                {mostrarSugerencias && sugerencias.length > 0 && !editandoId && (
                                    <ul className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-2xl mt-2 z-50 max-h-48 overflow-y-auto">
                                        {sugerencias.map((s: any) => (
                                            <li key={s.id} onClick={() => seleccionarSugerencia(s)} className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b last:border-none flex justify-between font-bold text-slate-700">
                                                <span>{s.nombre}</span> <span className="text-xs text-slate-400">{s.telefono}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">DNI / CE</label>
                                    <input type="text" className="input input-bordered w-full font-mono" value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} />
                                </div>
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Profesión</label>
                                    <input type="text" className="input input-bordered w-full" value={form.profesion} onChange={e => setForm({...form, profesion: e.target.value})} />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Dirección</label>
                                <input type="text" className="input input-bordered w-full" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                                <div className="form-control">
                                    <label className="text-sm font-bold text-emerald-800 mb-2">Teléfono Principal *</label>
                                    <input type="text" required className="input input-bordered w-full font-mono font-bold" maxLength={9} value={form.telefono} onChange={(e) => handleInputNumerico(e, 'telefono')} />
                                </div>
                                <div className="form-control">
                                    <label className="text-sm font-bold text-slate-600 mb-2">Teléfono 2</label>
                                    <input type="text" className="input input-bordered w-full font-mono" maxLength={9} value={form.telefono2} onChange={(e) => handleInputNumerico(e, 'telefono2')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 items-center gap-2">
                                        <FaBirthdayCake className="text-pink-400"/> Fecha de Nacimiento
                                    </label>
                                    {/* CORREGIDO: SE PUEDE EDITAR SIEMPRE QUE SEA PN */}
                                    <input 
                                        type="date" 
                                        className="input input-bordered w-full" 
                                        max={today} 
                                        value={form.fechaNacimiento} 
                                        onChange={e => setForm({...form, fechaNacimiento: e.target.value})}
                                        disabled={form.tipoPersona === 'PJ'} 
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 items-center gap-2">
                                        <FaCalendarAlt className="text-teal-500"/> Fecha de Registro
                                    </label>
                                    <input type="date" className="input input-bordered w-full" value={form.fechaRegistro} onChange={e => setForm({...form, fechaRegistro: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="btn bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold px-8 rounded-xl shadow-lg shadow-emerald-200">
                                    {isSubmitting ? 'Guardando...' : (editandoId ? 'Actualizar Cliente' : 'Guardar Cliente')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}