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
                    return !clientes.some(c => c.nombreCompleto.toLowerCase().trim() === r.nombre.toLowerCase().trim());
                });
                setSugerencias(resultadosFiltrados);
                setMostrarSugerencias(true);
            } catch (error) { console.error("Error buscando", error); }
        } else {
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
            toast.error(`El cliente ${duplicado.nombreCompleto} ya existe.`);
            return; 
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Guardando...");
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
            cargarDatos();
        } catch (error) {
            toast.error("Error al guardar", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('¿Eliminar cliente?')) return;
        try {
            await deleteClienteCartera(id);
            toast.success("Eliminado");
            cargarDatos();
        } catch (error) { toast.error("Error"); }
    };

    const filtrados = clientes.filter(c => {
        const search = busqueda.toLowerCase();
        return c.nombreCompleto.toLowerCase().includes(search) || 
               (c.documento && c.documento.includes(busqueda)) ||
               (c.empresa && c.empresa.toLowerCase().includes(search));
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            <Toaster position="top-right" />
            <div className="flex">
                <SidebarAtencion />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent flex items-center gap-3">
                            Cartera de Clientes 💼
                        </h1>
                        <button onClick={handleNuevoClick} className="btn btn-emerald text-white rounded-xl shadow-lg flex items-center gap-2">
                            <FaPlus /> Nuevo Cliente
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border flex items-center gap-4">
                        <FaSearch className="text-slate-400 ml-2" />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente, DNI o empresa..." 
                            className="w-full bg-transparent focus:outline-none font-medium"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                        <table className="table w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Cliente</th>
                                    <th>Contacto</th>
                                    <th>Detalles</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${c.tipoPersona === 'PJ' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                                    {c.tipoPersona === 'PJ' ? <FaBuilding /> : c.nombreCompleto.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{c.nombreCompleto}</p>
                                                    {c.tipoPersona === 'PJ' && <p className="text-xs text-indigo-600 font-bold">{c.empresa}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="text-sm font-mono">{c.telefono}</p>
                                            <p className="text-xs text-slate-400">{c.email}</p>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <FaCalendarAlt /> Reg: {c.fechaRegistro}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEditarClick(c)} className="btn btn-sm btn-ghost text-blue-500 hover:bg-blue-50">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(c.id)} className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {showModal && (
                <div className="modal modal-open bg-slate-900/60 backdrop-blur-sm">
                    <div className="modal-box max-w-2xl rounded-3xl p-0 overflow-hidden">
                        <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
                            <h3 className="font-black text-xl text-slate-800">{editandoId ? 'Editar' : 'Nuevo'} Cliente</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-sm btn-circle btn-ghost text-slate-400">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="tipoPersona" value="PN" checked={form.tipoPersona === 'PN'} onChange={handleChange} className="radio radio-success radio-sm" />
                                    <span className="text-sm font-bold">Natural (PN)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="tipoPersona" value="PJ" checked={form.tipoPersona === 'PJ'} onChange={handleChange} className="radio radio-success radio-sm" />
                                    <span className="text-sm font-bold">Jurídica (PJ)</span>
                                </label>
                            </div>

                            {form.tipoPersona === 'PJ' && (
                                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                    <input type="text" name="empresa" placeholder="Nombre Empresa" value={form.empresa} onChange={handleChange} className="input input-bordered w-full font-bold" required />
                                    <input type="text" placeholder="RUC (11 dígitos)" value={form.ruc} onChange={e => handleInputNumerico(e, 'ruc')} className="input input-bordered w-full font-mono" required />
                                </div>
                            )}

                            <input type="text" placeholder="Nombre completo" value={form.nombreCompleto} onChange={handleNombreChange} className="input input-bordered w-full font-bold" required />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="DNI / Documento" value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} className="input input-bordered w-full" />
                                <input type="text" placeholder="Profesión" value={form.profesion} onChange={handleChange} name="profesion" className="input input-bordered w-full" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100">
                                <input type="text" placeholder="Teléfono 1 *" value={form.telefono} onChange={e => handleInputNumerico(e, 'telefono')} className="input input-bordered w-full font-bold" required />
                                <input type="text" placeholder="Teléfono 2" value={form.telefono2} onChange={e => handleInputNumerico(e, 'telefono2')} className="input input-bordered w-full" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label text-xs font-bold text-slate-500">Fecha Nacimiento</label>
                                    <input 
                                        type="date" 
                                        value={form.fechaNacimiento} 
                                        onChange={e => setForm({...form, fechaNacimiento: e.target.value})} 
                                        className="input input-bordered w-full"
                                        disabled={form.tipoPersona === 'PJ'} 
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label text-xs font-bold text-slate-500">Fecha Registro</label>
                                    <input type="date" value={form.fechaRegistro} onChange={e => setForm({...form, fechaRegistro: e.target.value})} className="input input-bordered w-full" />
                                </div>
                            </div>

                            <div className="modal-action">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost rounded-xl">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="btn btn-emerald text-white rounded-xl px-8">
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