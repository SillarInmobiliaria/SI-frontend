'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion';
import { FaUserTie, FaBirthdayCake, FaPlus, FaSearch, FaTrash, FaPhone, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { getCartera, createClienteCartera, deleteClienteCartera, buscarInteresadoPorNombre } from '../../services/api';

export default function CarteraPage() {
    const [clientes, setClientes] = useState<any[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Estados para el Autocompletado
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

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
        }
    };

    // --- AUTOCOMPLETADO ---
    const handleNombreChange = async (e: any) => {
        const val = e.target.value;
        setForm({ ...form, nombreCompleto: val });
        
        if (val.length > 2) {
            try {
                const resultados = await buscarInteresadoPorNombre(val);
                setSugerencias(resultados);
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
        
        // Validación extra por seguridad
        if (form.telefono.length !== 9) {
            alert("⚠️ El teléfono principal debe tener 9 dígitos exactos.");
            return;
        }

        if(!confirm('¿Guardar nuevo cliente en cartera?')) return;
        try {
            await createClienteCartera(form);
            setShowModal(false);
            setForm({ 
                nombreCompleto: '', documento: '', telefono: '', telefono2: '', 
                email: '', direccion: '', fechaNacimiento: '', profesion: '', 
                fechaRegistro: today, tipo: 'INQUILINO' 
            });
            cargarDatos();
        } catch (error) {
            alert('Error al guardar');
        }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('¿Eliminar de la cartera?')) return;
        try {
            await deleteClienteCartera(id);
            cargarDatos();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const filtrados = clientes.filter(c => 
        c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.documento && c.documento.includes(busqueda))
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <Navbar />
            <div className="flex flex-1">
                <SidebarAtencion />
                
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                <FaUserTie className="text-emerald-600"/> Cartera de Clientes
                            </h1>
                            <p className="text-slate-500">Gestión de clientes formales.</p>
                        </div>
                        <button onClick={() => setShowModal(true)} className="btn bg-emerald-600 text-white hover:bg-emerald-700 border-none gap-2 shadow-lg">
                            <FaPlus /> Nuevo Cliente
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex gap-4 border border-slate-200">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Buscar en cartera..." 
                                className="input input-bordered w-full pl-10"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-3.5 text-slate-400"/>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="table w-full">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
                                <tr>
                                    <th>Cliente</th>
                                    <th>Contacto</th>
                                    <th>Dirección</th>
                                    <th>Cumpleaños</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-slate-400">No hay clientes registrados.</td></tr>
                                ) : (
                                    filtrados.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50 border-b border-slate-100">
                                            <td>
                                                <div className="font-bold text-slate-700">{c.nombreCompleto}</div>
                                                <div className="text-xs text-slate-400">{c.documento || 'S/D'}</div>
                                                {c.profesion && <div className="badge badge-ghost badge-xs mt-1">{c.profesion}</div>}
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <FaPhone className="text-slate-400 text-xs"/> 
                                                        <span className="font-mono">{c.telefono}</span>
                                                    </div>
                                                    {c.telefono2 && (
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <FaPhone className="text-slate-300 text-xs"/> 
                                                            <span className="font-mono text-xs">{c.telefono2}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 max-w-[200px] truncate">
                                                    <FaMapMarkerAlt className="text-slate-300"/>
                                                    {c.direccion || 'Sin dirección'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-1">Reg: {c.fechaRegistro}</div>
                                            </td>
                                            <td>
                                                {c.fechaNacimiento ? (
                                                    <div className="flex items-center gap-2 text-pink-500 font-bold bg-pink-50 px-3 py-1 rounded-full w-fit text-xs">
                                                        <FaBirthdayCake />
                                                        {c.fechaNacimiento}
                                                    </div>
                                                ) : <span className="text-xs text-slate-300">-</span>}
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(c.id)} className="btn btn-ghost btn-xs text-red-400 hover:bg-red-50">
                                                    <FaTrash/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* MODAL CLIENTE */}
            {showModal && (
                <div className="modal modal-open bg-black/50 backdrop-blur-sm z-50">
                    <div className="modal-box rounded-2xl p-6 max-w-2xl">
                        <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2">
                            <FaUserTie className="text-emerald-500"/> Agregar Cliente a Cartera
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                            
                            {/* BUSCADOR */}
                            <div className="form-control relative">
                                <label className="label-text font-bold mb-1">Nombre Completo (Buscar Interesado)</label>
                                <input 
                                    type="text" 
                                    className="input input-bordered w-full font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500" 
                                    placeholder="Escribe para buscar..."
                                    value={form.nombreCompleto} 
                                    onChange={handleNombreChange}
                                    onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                                    required 
                                />
                                {mostrarSugerencias && sugerencias.length > 0 && (
                                    <ul className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 z-50 max-h-48 overflow-y-auto">
                                        {sugerencias.map((s: any) => (
                                            <li 
                                                key={s.id} 
                                                onClick={() => seleccionarSugerencia(s)}
                                                className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-none flex justify-between items-center"
                                            >
                                                <span className="font-bold text-slate-700">{s.nombre}</span>
                                                <span className="text-xs text-slate-400">{s.telefono}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label-text font-bold text-xs text-slate-500 mb-1">DNI / RUC</label>
                                    <input type="text" className="input input-bordered w-full" 
                                        value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} />
                                </div>
                                <div className="form-control">
                                    <label className="label-text font-bold text-xs text-slate-500 mb-1">Profesión / Ocupación</label>
                                    <div className="relative">
                                        <FaBriefcase className="absolute left-3 top-3.5 text-slate-400"/>
                                        <input type="text" className="input input-bordered w-full pl-10" placeholder="Ej. Ingeniero"
                                            value={form.profesion} onChange={e => setForm({...form, profesion: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label-text font-bold text-xs text-slate-500 mb-1">Dirección del Cliente</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-3.5 text-slate-400"/>
                                    <input type="text" className="input input-bordered w-full pl-10" placeholder="Av. Ejército..."
                                        value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
                                </div>
                            </div>

                            {/* TELÉFONOS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                                <div className="form-control">
                                    <label className="label-text font-bold text-xs text-emerald-600 mb-1">Teléfono Principal (Obligatorio)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="input input-bordered w-full border-emerald-200 focus:border-emerald-500 font-mono tracking-wider" 
                                        placeholder="999888777"
                                        maxLength={9}
                                        value={form.telefono} 
                                        onChange={(e) => handleInputNumerico(e, 'telefono')} 
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label-text font-bold text-xs text-slate-500 mb-1">Teléfono 2 (Opcional)</label>
                                    <input 
                                        type="text" 
                                        className="input input-bordered w-full font-mono tracking-wider" 
                                        placeholder="Otro número..."
                                        maxLength={9}
                                        value={form.telefono2} 
                                        onChange={(e) => handleInputNumerico(e, 'telefono2')} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label-text font-bold text-xs text-slate-500 mb-1">Cumpleaños</label>
                                    {/* FECHA LIMITADA PARA EVITAR AÑO 200000 */}
                                    <input 
                                        type="date" 
                                        className="input input-bordered w-full" 
                                        max={today}
                                        value={form.fechaNacimiento} 
                                        onChange={e => setForm({...form, fechaNacimiento: e.target.value})} 
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label-text font-bold text-xs text-slate-500 mb-1">Fecha Registro</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-3.5 text-slate-400"/>
                                        <input type="date" className="input input-bordered w-full pl-10 bg-slate-100" 
                                            value={form.fechaRegistro} onChange={e => setForm({...form, fechaRegistro: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-action border-t pt-4 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost hover:bg-slate-100">Cancelar</button>
                                <button type="submit" className="btn bg-slate-800 text-white hover:bg-slate-900 px-8">Guardar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}