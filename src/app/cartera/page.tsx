'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion';
import { 
    FaUserTie, FaBirthdayCake, FaPlus, FaSearch, FaTrash, 
    FaPhone, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, 
    FaIdCard, FaWhatsapp, FaExclamationTriangle, FaEdit, FaBuilding, FaEye, FaEnvelope 
} from 'react-icons/fa';
import { getCartera, createClienteCartera, updateClienteCartera, deleteClienteCartera, buscarInteresadoPorNombre } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CarteraPage() {
    const [clientes, setClientes] = useState<any[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
    
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

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            const data = await getCartera();
            setClientes(data);
        } catch (error) { toast.error("Error al cargar la cartera"); }
    };

    const verificarDuplicado = (nombre: string, dni: string) => {
        const nombreLimpio = nombre.trim().toLowerCase();
        const dniLimpio = dni ? dni.trim() : '';
        return clientes.find(c => {
            const cNombre = (c.nombreCompleto || '').toLowerCase().trim();
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
                    return !clientes.some(c => (c.nombreCompleto || '').toLowerCase().trim() === r.nombre.toLowerCase().trim());
                });
                setSugerencias(resultadosFiltrados);
                setMostrarSugerencias(true);
            } catch (error) { console.error("Error buscando", error); }
        } else { setMostrarSugerencias(false); }
    };

    const seleccionarSugerencia = (interesado: any) => {
        setForm({ ...form, nombreCompleto: interesado.nombre, telefono: interesado.telefono || '', email: interesado.email || '' });
        setMostrarSugerencias(false);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleInputNumerico = (e: any, campo: string) => {
        const val = e.target.value.replace(/\D/g, ''); 
        const maxLength = campo === 'ruc' ? 11 : (campo === 'documento' ? 8 : 9);
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
        setForm({ ...cliente });
        setShowModal(true);
    };

    const handleVerDetalles = (cliente: any) => {
        setClienteSeleccionado(cliente);
        setShowViewModal(true);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (form.telefono.length !== 9) { toast.error("⚠️ El teléfono debe tener 9 dígitos."); return; }
        if (form.tipoPersona === 'PJ' && form.ruc.length !== 11) { toast.error("⚠️ El RUC debe tener 11 dígitos."); return; }
        if (form.documento && form.documento.length !== 8) { toast.error("⚠️ El DNI debe tener 8 dígitos."); return; }

        const duplicado = verificarDuplicado(form.nombreCompleto, form.documento);
        if (duplicado && duplicado.id !== editandoId) {
            toast.error("Este cliente ya existe en la cartera.");
            return; 
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading(editandoId ? "Actualizando..." : "Guardando...");
        try {
            const payload = { ...form };
            if (payload.tipoPersona === 'PN') { payload.empresa = ''; payload.ruc = ''; }
            if (editandoId) {
                await updateClienteCartera(editandoId, payload);
                toast.success("Actualizado correctamente", { id: loadingToast });
            } else {
                await createClienteCartera(payload);
                toast.success("Cliente guardado", { id: loadingToast });
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) { toast.error("Error al guardar.", { id: loadingToast }); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('¿Estás seguro de eliminar este cliente?')) return;
        const loadingToast = toast.loading("Eliminando...");
        try {
            await deleteClienteCartera(id);
            toast.success("Eliminado", { id: loadingToast });
            cargarDatos();
        } catch (error) { toast.error("Error al eliminar", { id: loadingToast }); }
    };

    const filtrados = clientes.filter(c => {
        const search = busqueda.toLowerCase();
        return (c.nombreCompleto || '').toLowerCase().includes(search) || 
               (c.documento && c.documento.includes(busqueda)) ||
               (c.empresa && c.empresa.toLowerCase().includes(search));
    });

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
            <Navbar />
            <Toaster position="top-right" reverseOrder={false} />

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob"></div>
                <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-teal-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-4000"></div>
            </div>

            <div className="flex relative z-10">
                <SidebarAtencion />
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black text-slate-800 mb-1 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Cartera de Clientes</span>
                                <span className="text-3xl">💼</span>
                            </h1>
                            <p className="text-slate-500 font-medium ml-1">Gestión de clientes formales y contratos</p>
                        </div>
                        <button onClick={handleNuevoClick} className="relative z-10 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 active:scale-95 transition-all text-white font-bold rounded-xl shadow-lg flex items-center gap-2 group/btn">
                            <FaPlus className="group-hover/btn:rotate-90 transition-transform duration-300"/> <span>Nuevo Cliente</span>
                        </button>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg mb-8 border border-white/60">
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors text-lg"/>
                            <input type="text" placeholder="Buscar por nombre, DNI, empresa o RUC..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-300 text-slate-700 font-medium" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-slate-50/80 border-b border-slate-200">
                                    <tr>
                                        <th className="py-5 pl-8 text-slate-500 uppercase text-xs font-bold tracking-wider">Cliente / Representante</th>
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
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md ${c.tipoPersona === 'PJ' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-indigo-200' : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'}`}>
                                                        {c.tipoPersona === 'PJ' ? <FaBuilding /> : (c.nombreCompleto || 'C').charAt(0).toUpperCase()}
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
                                                                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 w-fit">
                                                                    <FaBuilding className="text-[10px]" /> {c.empresa} (RUC: {c.ruc})
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1.5">
                                                    <a href={`https://wa.me/51${c.telefono}`} target="_blank" className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                                        <FaWhatsapp className="text-sm"/> <span className="font-mono text-base">{c.telefono}</span>
                                                    </a>
                                                    {c.telefono2 && <span className="font-mono text-slate-400 text-sm ml-5">{c.telefono2}</span>}
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell">
                                                <div className="flex items-start gap-2 max-w-[200px]">
                                                    <FaMapMarkerAlt className="text-slate-400 mt-1 flex-shrink-0"/>
                                                    <span className="text-slate-600 text-sm leading-snug line-clamp-2">{c.direccion || 'Sin dirección registrada'}</span>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell">
                                                <div className="space-y-1">
                                                    {c.fechaNacimiento && (
                                                        <div className="flex items-center gap-2 text-pink-600 text-sm font-medium">
                                                            <FaBirthdayCake className="text-pink-400"/> <span>{c.fechaNacimiento}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                                        <FaCalendarAlt/> Reg: {c.fechaRegistro}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleVerDetalles(c)} className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110" title="Ver Detalles"><FaEye/></button>
                                                    <button onClick={() => handleEditarClick(c)} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110" title="Editar"><FaEdit/></button>
                                                    <button onClick={() => handleDelete(c.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-red-200 hover:scale-110" title="Eliminar"><FaTrash/></button>
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

            {/* MODAL DE VISTA DETALLADA (OJITO) */}
            {showViewModal && clienteSeleccionado && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className={`p-8 text-white ${clienteSeleccionado.tipoPersona === 'PJ' ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-emerald-600 to-teal-600'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    {clienteSeleccionado.tipoPersona === 'PJ' ? <FaBuilding size={32}/> : <FaUserTie size={32}/>}
                                </div>
                                <button onClick={() => setShowViewModal(false)} className="text-white/60 hover:text-white text-2xl font-bold">✕</button>
                            </div>
                            <h3 className="text-2xl font-black">{clienteSeleccionado.nombreCompleto}</h3>
                            <p className="text-white/80 font-medium">
                                {clienteSeleccionado.tipoPersona === 'PJ' ? `Representante Legal de ${clienteSeleccionado.empresa}` : clienteSeleccionado.profesion || 'Cliente Particular'}
                            </p>
                        </div>
                        <div className="p-8 space-y-4 bg-slate-50 max-h-[60vh] overflow-y-auto">
                            {clienteSeleccionado.tipoPersona === 'PJ' && (
                                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
                                    <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><FaBuilding/></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Razón Social / RUC</p>
                                        <p className="font-bold text-indigo-900">{clienteSeleccionado.empresa}</p>
                                        <p className="text-xs font-mono text-indigo-600">{clienteSeleccionado.ruc}</p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><FaIdCard/> DNI / Documento</p>
                                    <p className="font-bold text-slate-700">{clienteSeleccionado.documento || 'S/D'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><FaBirthdayCake/> Cumpleaños</p>
                                    <p className="font-bold text-pink-600">{clienteSeleccionado.fechaNacimiento || 'No reg.'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><FaPhone/> Teléfono 1</p>
                                    <p className="font-bold text-slate-700">{clienteSeleccionado.telefono}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><FaPhone/> Teléfono 2</p>
                                    <p className="font-bold text-slate-700">{clienteSeleccionado.telefono2 || '---'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><FaEnvelope/> Correo Electrónico</p>
                                    <p className="font-bold text-slate-700">{clienteSeleccionado.email || 'Sin correo registrado'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><FaBriefcase/> Profesión / Ocupación</p>
                                    <p className="font-bold text-slate-700">{clienteSeleccionado.profesion || 'No especificado'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><FaMapMarkerAlt/> Dirección Registrada</p>
                                    <p className="font-bold text-slate-700 text-sm leading-relaxed">{clienteSeleccionado.direccion || 'Sin dirección'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-white border-t flex gap-4">
                            <a href={`https://wa.me/51${clienteSeleccionado.telefono}`} target="_blank" className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"><FaWhatsapp/> WhatsApp</a>
                            <button onClick={() => setShowViewModal(false)} className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE REGISTRO / EDICION */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">{editandoId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                                <p className="text-slate-500 text-sm">Información detallada para el sistema</p>
                            </div>
                            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                                {editandoId ? <FaEdit className="text-2xl"/> : <FaUserTie className="text-2xl"/>}
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} autoComplete="off" className="p-8 space-y-6 text-slate-700">
                            <div className="form-control bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Tipo de Persona *</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="radio" name="tipoPersona" value="PN" checked={form.tipoPersona === 'PN'} onChange={handleChange} className="radio radio-emerald radio-sm" />
                                        <span className="font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">Persona Natural</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="radio" name="tipoPersona" value="PJ" checked={form.tipoPersona === 'PJ'} onChange={handleChange} className="radio radio-emerald radio-sm" />
                                        <span className="font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">Persona Jurídica</span>
                                    </label>
                                </div>
                            </div>

                            {form.tipoPersona === 'PJ' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 animate-fade-in">
                                    <div className="form-control">
                                        <label className="block text-sm font-bold text-indigo-900 mb-2">Nombre Empresa *</label>
                                        <input type="text" name="empresa" className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-slate-700" placeholder="Nombre Empresa S.A.C." value={form.empresa} onChange={handleChange} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="block text-sm font-bold text-indigo-900 mb-2">RUC *</label>
                                        <input type="text" className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-slate-700" placeholder="20000000000" maxLength={11} value={form.ruc} onChange={e => handleInputNumerico(e, 'ruc')} required />
                                    </div>
                                </div>
                            )}

                            <div className="form-control relative">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    {form.tipoPersona === 'PJ' ? 'Representante Legal (Nombre Completo) *' : 'Nombre Completo *'}
                                </label>
                                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-bold text-slate-700" value={form.nombreCompleto} onChange={handleNombreChange} required />
                                {mostrarSugerencias && sugerencias.length > 0 && !editandoId && (
                                    <ul className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl mt-2 z-50 max-h-48 overflow-y-auto">
                                        {sugerencias.map((s: any) => (
                                            <li key={s.id} onClick={() => seleccionarSugerencia(s)} className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b last:border-none flex justify-between items-center group font-bold text-slate-700 transition-colors">
                                                <span>{s.nombre}</span> <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono group-hover:bg-emerald-100">{s.telefono}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{form.tipoPersona === 'PJ' ? 'DNI del Representante *' : 'DNI / CE *'}</label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                        <input type="text" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-slate-700 font-bold" placeholder="8 dígitos" maxLength={8} value={form.documento} onChange={e => handleInputNumerico(e, 'documento')} />
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                        <input type="email" name="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700" placeholder="ejemplo@correo.com" value={form.email} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Profesión / Ocupación</label>
                                    <div className="relative">
                                        <FaBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                        <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700" placeholder="Ej. Ingeniero" value={form.profesion} onChange={e => setForm({...form, profesion: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{form.tipoPersona === 'PJ' ? 'Dirección Fiscal' : 'Dirección'}</label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                                        <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700" placeholder="Dirección para contrato" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2"><FaWhatsapp className="text-emerald-600"/> Teléfono Principal *</label>
                                    <input type="text" required className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-lg text-slate-800" placeholder="987654321" maxLength={9} value={form.telefono} onChange={(e) => handleInputNumerico(e, 'telefono')} />
                                </div>
                                <div className="form-control">
                                    <label className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2"><FaPhone className="text-slate-400"/> Teléfono 2</label>
                                    <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-lg text-slate-800" placeholder="987654321" maxLength={9} value={form.telefono2} onChange={(e) => handleInputNumerico(e, 'telefono2')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 items-center gap-2"><FaBirthdayCake className="text-pink-400"/> Fecha de Nacimiento (Rep.)</label>
                                    <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 font-bold" max={today} value={form.fechaNacimiento} onChange={e => setForm({...form, fechaNacimiento: e.target.value})} />
                                </div>
                                <div className="form-control">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 items-center gap-2"><FaCalendarAlt className="text-teal-500"/> Fecha de Registro</label>
                                    <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 font-bold" value={form.fechaRegistro} max={today} onChange={e => setForm({...form, fechaRegistro: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all">
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