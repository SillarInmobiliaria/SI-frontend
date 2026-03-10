'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import {
    createCliente, updateCliente, createInteres, eliminarCliente, createSeguimiento, createRequerimiento,
    getRequerimientos
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSeguimientos } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

import {
  FaUser, FaSearch, FaEye, FaPhone, FaUserPlus, FaTrafficLight, FaCalendarCheck,
  FaCalendarAlt, FaUndo, FaTrash, FaUserTie, FaHistory, FaInfoCircle, FaBullhorn,
  FaHome, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaRulerCombined, FaHammer, FaTimes,
  FaBed, FaBath, FaCar, FaImages, FaChevronDown, FaHandshake, FaRoute, FaCheckCircle, FaSave,
  FaClipboardList, FaEnvelope, FaIdCard, FaMoneyBillWave, FaCity, FaPlus, FaUniversity, FaTasks, FaArrowRight, FaKey, FaTools, FaEdit,
  FaWhatsapp
} from 'react-icons/fa';

const BACKEND_URL = 'https://sillar-backend.onrender.com';

const DISTRITOS_SUGERIDOS = [
    "Arequipa", "Alto Selva Alegre", "Cayma", "Cerro Colorado", "Characato",
    "Chiguata", "Jacobo Hunter", "José Luis Bustamante y Rivero", "La Joya",
    "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata", "Pocsi",
    "Polobaya", "Quequeña", "Sabandía", "Sachaca", "San Juan de Siguas",
    "San Juan de Tarucani", "Santa Isabel de Siguas", "Santa Rita de Siguas",
    "Socabaya", "Tiabaya", "Uchumayo", "Vitor", "Yanahuara", "Yarabamba", "Yura"
];

const BANCOS_PERU = [
    "BCP (Banco de Crédito)", "BBVA", "Interbank", "Scotiabank", "Banco de la Nación",
    "BanBif", "Pichincha", "GNB", "Banco de Comercio", "Caja Arequipa", "Caja Cusco", "Otro"
];

interface FormClienteCompleto {
  id?: string;
  nombre: string;
  telefono1: string;
  dni?: string;
  email?: string;
  direccion?: string;
  origen?: string;
  detalles?: string;
  fechaAlta: string;
  modoInteres: 'PROPIEDAD' | 'REQUERIMIENTO';
  propiedadId?: string;
  asesorCliente?: string;
  observaciones?: string;
  reqTipo?: 'COMPRA' | 'ALQUILER';
  reqZonas?: string;
  reqAreaMin?: string;
  reqAreaMax?: string;
  reqPresupuestoMin?: string;
  reqPresupuestoMax?: string;
  reqComentarios?: string;
  reqPrioridad?: 'NORMAL' | 'URGENTE' | 'DESCARTADO';
  reqFormaPago?: 'CONTADO' | 'FINANCIADO' | 'MIXTO';
  reqBanco?: string;
}

export default function ClientesPage() {
  const router = useRouter();
  const { clientes, fetchClientes, propiedades, fetchPropiedades, intereses, fetchIntereses, loading } = useInmobiliariaStore();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'admin';

  const [requerimientos, setRequerimientos] = useState<any[]>([]);
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
 
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const [filterDate, setFilterDate] = useState(today);
  const [filterType, setFilterType] = useState<'TODOS' | 'PROSPECTO' | 'CLIENTE'>('TODOS');

  // Modales
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [showFullProperty, setShowFullProperty] = useState(false);
  const [isSeguimientoOpen, setSeguimientoOpen] = useState(false);
  const [clienteSeguimiento, setClienteSeguimiento] = useState<any>(null);
  const [isReqOpen, setReqOpen] = useState(false);
  const [clienteReq, setClienteReq] = useState<any>(null);

  const [propSearch, setPropSearch] = useState('');
  const [showPropSuggestions, setShowPropSuggestions] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-select Zonas
  const [zonasQuery, setZonasQuery] = useState('');
  const [zonasSelected, setZonasSelected] = useState<string[]>([]);
  const [showZonasSuggestions, setShowZonasSuggestions] = useState(false);

  // Estado para Tipologías de Interés en Proyectos
  const [tipologiasInteres, setTipologiasInteres] = useState<string[]>([]);

  // Formularios
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormClienteCompleto>({
      defaultValues: { modoInteres: 'PROPIEDAD', reqTipo: 'COMPRA', reqPrioridad: 'NORMAL', reqFormaPago: 'FINANCIADO' }
  });
  
  const modoInteres = watch('modoInteres');
  const reqTipo = watch('reqTipo');
  const reqFormaPago = watch('reqFormaPago');
  const selectedPropiedadId = watch('propiedadId');
  const editandoId = watch('id');
  const propiedadSeleccionada = propiedades.find(p => p.id === selectedPropiedadId);

  const { register: registerSeg, handleSubmit: handleSubmitSeg, reset: resetSeg, formState: { errors: errorsSeg } } = useForm();
 
  const { register: registerReq, handleSubmit: handleSubmitReq, reset: resetReq, watch: watchReq } = useForm();
 
  const reqTipoModal = watchReq('reqTipo');
  const reqFormaPagoModal = watchReq('reqFormaPago');

  // CARGA DE DATOS
  useEffect(() => {
    const loadData = async () => {
        await Promise.all([fetchClientes(), fetchPropiedades(), fetchIntereses()]);
        try {
            const reqs = await getRequerimientos();
            setRequerimientos(reqs || []);
        } catch (e) { console.error("Error loading reqs", e); }
        try {
            const segs = await getSeguimientos();
            setSeguimientos(segs || []);
        } catch (e) { console.error("Error loading seguimientos", e); }
    };
    loadData();
  }, []);

  const getISOFechaPeru = (fechaStr: string) => {
      if (!fechaStr) return new Date().toISOString();
      const [anio, mes, dia] = fechaStr.split('-').map(Number);
      const fecha = new Date(anio, mes - 1, dia, 12, 0, 0);
      return fecha.toISOString();
  };

  const filteredProps = useMemo(() => {
      if (!propSearch) return [];
      const search = propSearch.toLowerCase();
      return propiedades.filter(p => p.tipo.toLowerCase().includes(search) || p.ubicacion.toLowerCase().includes(search) || (p.direccion && p.direccion.toLowerCase().includes(search)));
  }, [propiedades, propSearch]);

  const filteredDistritos = useMemo(() => {
      if (!zonasQuery) return [];
      const search = zonasQuery.toLowerCase();
      return DISTRITOS_SUGERIDOS.filter(d => d.toLowerCase().includes(search) && !zonasSelected.includes(d));
  }, [zonasQuery, zonasSelected]);

  const handleSelectPropiedad = (prop: any) => { 
      setValue('propiedadId', prop.id); 
      setPropSearch(`${prop.tipo} - ${prop.ubicacion} (${prop.direccion || ''})`); 
      setShowPropSuggestions(false); 
      setTipologiasInteres([]);
  };

  const handleAddZona = (zona: string) => {
      const nuevasZonas = [...zonasSelected, zona];
      setZonasSelected(nuevasZonas);
      setValue('reqZonas', nuevasZonas.join(', '));
      setZonasQuery('');
      setShowZonasSuggestions(false);
  };
 
  const handleRemoveZona = (zona: string) => {
      const nuevasZonas = zonasSelected.filter(z => z !== zona);
      setZonasSelected(nuevasZonas);
      setValue('reqZonas', nuevasZonas.join(', '));
  };
 
  const handleOpenModal = () => {
      setModalOpen(true);
      setPropSearch(''); setValue('propiedadId', ''); setZonasSelected([]); setZonasQuery(''); setTipologiasInteres([]);
      reset({ id: undefined, modoInteres: 'PROPIEDAD', reqTipo: 'COMPRA', reqPrioridad: 'NORMAL', reqFormaPago: 'FINANCIADO', fechaAlta: today });
      setShowFullProperty(false);
  };

  const handleOpenEdit = (cliente: any) => {
      const interes = intereses.find((i: any) => i.clienteId === cliente.id);
      const requerimiento = requerimientos.find((r: any) => r.clienteId === cliente.id);
      
      let modoInteres: 'PROPIEDAD' | 'REQUERIMIENTO' = 'PROPIEDAD';
      let reqData = {};
      let propData = {};

      if (requerimiento) {
          modoInteres = 'REQUERIMIENTO';
          const zonasMatch = requerimiento.pedido?.match(/en\s+(.*?)\./);
          const zonasStr = zonasMatch ? zonasMatch[1] : '';
          if(zonasStr && zonasStr !== 'Zonas varias') {
              setZonasSelected(zonasStr.split(', '));
          } else {
              setZonasSelected([]);
          }

          reqData = {
              reqTipo: requerimiento.pedido?.includes('COMPRA') ? 'COMPRA' : 'ALQUILER',
              reqPrioridad: requerimiento.prioridad === 'DESCARTADO' ? 'NORMAL' : requerimiento.prioridad,
              reqComentarios: requerimiento.pedido,
              reqZonas: zonasStr
          };
      } else if (interes) {
          modoInteres = 'PROPIEDAD';
          propData = {
              propiedadId: interes.propiedadId,
              observaciones: interes.nota || ''
          };
          if (interes.Propiedad) {
              setPropSearch(`${interes.Propiedad.tipo} - ${interes.Propiedad.ubicacion} (${interes.Propiedad.direccion || ''})`);
              
              if(interes.nota?.includes('Interesado en tipologías:')) {
                  const parts = interes.nota.split('Interesado en tipologías: ');
                  if(parts.length > 1) {
                      const tips = parts[1].replace('.', '').split(', ');
                      setTipologiasInteres(tips);
                  }
              }
          }
      }

      reset({
          id: cliente.id,
          nombre: cliente.nombre || '',
          telefono1: cliente.telefono1 || '',
          dni: cliente.dni || '',
          email: cliente.email || '',
          origen: cliente.origen || '',
          detalles: cliente.detalles || '',
          fechaAlta: cliente.fechaAlta ? cliente.fechaAlta.split('T')[0] : today,
          modoInteres: modoInteres,
          ...propData,
          ...reqData
      });

      setModalOpen(true);
      setShowFullProperty(false);
  };

  const handleToggleTipologia = (tipologiaNombre: string) => {
      if (tipologiasInteres.includes(tipologiaNombre)) {
          setTipologiasInteres(prev => prev.filter(t => t !== tipologiaNombre));
      } else {
          setTipologiasInteres(prev => [...prev, tipologiaNombre]);
      }
  };

  const onSubmitCliente = async (data: FormClienteCompleto) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(data.id ? "Actualizando cliente..." : "Guardando cliente...");
    
    if (!data.nombre?.trim() || !data.telefono1?.trim()) {
      toast.dismiss(loadingToast);
      toast.error('Nombre y celular son requeridos');
      setIsSubmitting(false);
      return;
    }

    try {
      let nuevoId: string | undefined = data.id;

      if (data.id) {
          // CORRECCIÓN: El ID se envía como string (UUID), no como número. Y forzamos PROSPECTO.
          await updateCliente(data.id as any, {
              nombre: data.nombre,
              telefono1: data.telefono1,
              dni: data.dni || undefined,
              email: data.email || undefined,
              fechaAlta: getISOFechaPeru(data.fechaAlta),
              origen: data.origen,
              detalles: data.detalles || undefined,
              tipo: 'PROSPECTO' 
          });
      } else {
          // CREAR NUEVO CLIENTE (Forzado como PROSPECTO)
          const resp = await createCliente({
              nombre: data.nombre,
              telefono1: data.telefono1,
              dni: data.dni || undefined,
              email: data.email || undefined,
              fechaAlta: getISOFechaPeru(data.fechaAlta),
              origen: data.origen,
              detalles: data.detalles || undefined,
              tipo: 'PROSPECTO'
          } as any);
          nuevoId = (resp as any).data?.id || (resp as any).id;
      }

      // MANEJO DE INTERÉS O REQUERIMIENTO
      if (data.modoInteres === 'PROPIEDAD' && data.propiedadId && nuevoId) {
        let notaInteres = `Registro/Actualización. ${data.observaciones || ''}`;
        
        if (tipologiasInteres.length > 0) {
            notaInteres += `\nInteresado en tipologías: ${tipologiasInteres.join(', ')}.`;
        }
        await createInteres({ clienteId: nuevoId, propiedadId: data.propiedadId, nota: notaInteres });
      }

      if (data.modoInteres === 'REQUERIMIENTO' && nuevoId) {
          const zonasFinales = zonasSelected.length > 0 ? zonasSelected.join(', ') : data.reqZonas;
          let detallePedido = `Busca: ${data.reqTipo} en ${zonasFinales || 'Zonas varias'}. Área: ${data.reqAreaMin || 0} - ${data.reqAreaMax || 'Max'} m². Presupuesto: ${data.reqPresupuestoMin || 0} - ${data.reqPresupuestoMax || 'Max'}. Notas: ${data.reqComentarios || ''}`;
         
          if (data.reqTipo === 'COMPRA') {
              detallePedido += `\n Pago: ${data.reqFormaPago}.`;
              if (data.reqFormaPago !== 'CONTADO') detallePedido += ` Banco: ${data.reqBanco || 'Por definir'}`;
          }

          const estadoFinal = data.reqPrioridad === 'DESCARTADO' ? 'DESCARTADO' : 'PENDIENTE';
          const prioridadFinal = data.reqPrioridad === 'DESCARTADO' ? 'NORMAL' : data.reqPrioridad;

          await createRequerimiento({
              clienteId: nuevoId,
              fecha: new Date().toISOString(),
              pedido: detallePedido,
              prioridad: prioridadFinal,
              estado: estadoFinal,
              usuarioId: user?.id
          });
      }

      await fetchClientes(); await fetchIntereses();
      try { const reqs = await getRequerimientos(); setRequerimientos(reqs || []); } catch(e){}
      try { const segs = await getSeguimientos(); setSeguimientos(segs || []); } catch(e){}

      setModalOpen(false); reset();
      toast.success(data.id ? 'Actualizado Exitosamente' : 'Registrado Exitosamente', { id: loadingToast });
      if (data.fechaAlta === today) setFilterDate(today); else setFilterDate(data.fechaAlta);

    } catch (error) { 
        console.error(error); 
        toast.error('Error al guardar', { id: loadingToast }); 
    }
    finally { setIsSubmitting(false); }
  };

  const handleEliminar = async (id: string) => {
      if(!confirm('⚠️ ¿Eliminar?')) return;
      const loadingToast = toast.loading("Eliminando cliente...");
      try {
          await eliminarCliente(id);
          fetchClientes();
          toast.success('Cliente eliminado correctamente', { id: loadingToast });
      } catch (e) {
          toast.error('Error al eliminar', { id: loadingToast });
      }
  };

  const handleViewDetail = (c: any) => { setSelectedCliente(c); setDetailOpen(true); };
  const handleOpenAgendarVisita = (c: any) => { const interes = intereses.find(i => i.clienteId === c.id); const propiedadId = interes ? interes.propiedadId : ''; router.push(`/visitas?clienteId=${c.id}&clienteNombre=${encodeURIComponent(c.nombre)}&propiedadId=${propiedadId}`); };
  const handleGoToSeguimiento = () => { router.push('/seguimiento'); };
  const handleGoToRequerimientos = () => { router.push('/requerimientos'); };

  const handleOpenReq = (cliente: any) => {
      setClienteReq(cliente);
      setReqOpen(true);
      setZonasSelected([]);
      setZonasQuery('');
      resetReq({ reqTipo: 'COMPRA', reqPrioridad: 'NORMAL', reqFormaPago: 'FINANCIADO' });
  };

  const onSubmitReq = async (data: any) => {
      if (!clienteReq) return;
      const loadingToast = toast.loading("Guardando requerimiento...");
      try {
          const zonasFinales = zonasSelected.length > 0 ? zonasSelected.join(', ') : '';
          let detallePedido = `Busca: ${data.reqTipo} en ${zonasFinales || 'Zonas varias'}. Área: ${data.reqAreaMin || 0} - ${data.reqAreaMax || 'Max'} m². Presupuesto: ${data.reqPresupuestoMin || 0} - ${data.reqPresupuestoMax || 'Max'}. Notas: ${data.reqComentarios || ''}`;
         
          if (data.reqTipo === 'COMPRA') {
              detallePedido += `\n Pago: ${data.reqFormaPago}.`;
              if (data.reqFormaPago !== 'CONTADO') detallePedido += ` Banco: ${data.reqBanco || 'Por definir'}`;
          }

          const estadoFinal = data.reqPrioridad === 'DESCARTADO' ? 'DESCARTADO' : 'PENDIENTE';
          const prioridadFinal = data.reqPrioridad === 'DESCARTADO' ? 'NORMAL' : data.reqPrioridad;

          await createRequerimiento({
              clienteId: clienteReq.id,
              fecha: new Date().toISOString(),
              pedido: detallePedido,
              prioridad: prioridadFinal,
              estado: estadoFinal,
              usuarioId: user?.id
          });

          toast.success('Requerimiento guardado', { id: loadingToast });
          setReqOpen(false);
          resetReq();
          try{ const reqs = await getRequerimientos(); setRequerimientos(reqs); }catch(e){}
      } catch (error) {
          toast.error('Error al guardar requerimiento', { id: loadingToast });
      }
  };

  const handleOpenSeguimientoModal = (cliente: any) => { setClienteSeguimiento(cliente); setSeguimientoOpen(true); resetSeg(); };
  const onSubmitSeguimiento = async (data: any) => {
      if (!clienteSeguimiento) return;
      const loadingToast = toast.loading("Guardando seguimiento...");
      try {
          await createSeguimiento({
              clienteId: clienteSeguimiento.id,
              usuarioId: user?.id,
              fecha: new Date().toISOString(),
              comentario: data.comentario,
              fechaProxima: getISOFechaPeru(data.fechaProxima),
              estado: data.estado
          });
          toast.success('Seguimiento registrado', { id: loadingToast });
          setSeguimientoOpen(false);
          resetSeg();
          try{ const segs = await getSeguimientos(); setSeguimientos(segs); }catch(e){}
      } catch (error) { toast.error('Error al registrar seguimiento', { id: loadingToast }); }
  };
 
  const handleNumberInput = (e: React.FormEvent<HTMLInputElement>) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); };

  const clientesFiltrados = useMemo(() => {
      let filtrados = clientes.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (c.dni && c.dni.includes(searchTerm)) || c.telefono1.includes(searchTerm));
      if (searchTerm === '') { filtrados = filtrados.filter(c => { const fechaRaw = c.fechaAlta || c.createdAt || ''; return fechaRaw.split('T')[0] === filterDate; }); }
      if (filterType !== 'TODOS') filtrados = filtrados.filter(c => c.tipo === filterType);
      filtrados.sort((a, b) => new Date(b.fechaAlta || b.createdAt || new Date().toISOString()).getTime() - new Date(a.fechaAlta || a.createdAt || new Date().toISOString()).getTime());
      return filtrados;
  }, [clientes, searchTerm, filterDate, filterType]);

  const esTerrenoFicha = propiedadSeleccionada?.tipo?.toLowerCase().includes('terreno');
  const esProyectoFicha = propiedadSeleccionada?.tipo?.toLowerCase().includes('proyecto');
  const tipologiasParseadas = typeof propiedadSeleccionada?.tipologias === 'string' ? JSON.parse(propiedadSeleccionada.tipologias) : propiedadSeleccionada?.tipologias;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-gray-800 flex flex-col">
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
     
      <div className="flex flex-1 relative">
          <SidebarAtencion />

          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 backdrop-blur-sm bg-white/80">
            <div><h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Módulo de Atención</h1><p className="text-gray-600 mt-2 font-medium">Gestiona tus interesados y requerimientos.</p></div>
            <div className="flex gap-3 w-full md:w-auto items-center">
                <div className="relative w-full md:w-72"><FaSearch className={`absolute left-4 top-4 transition-colors ${searchTerm ? 'text-indigo-600' : 'text-gray-400'}`}/><input type="text" placeholder="Buscar por nombre..." className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${searchTerm ? 'border-indigo-400 bg-indigo-50/50 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <button onClick={handleOpenModal} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all"><FaUserPlus className="text-lg"/> Nuevo</button>
            </div>
            </div>
           
            <div className="flex flex-col xl:flex-row items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 gap-6 transition-all">
                <div className="flex items-center gap-5 w-full xl:w-auto">
                    <div className={`p-4 rounded-2xl shadow-sm ${searchTerm ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>{searchTerm ? <FaHistory className="text-2xl"/> : <FaCalendarAlt className="text-2xl"/>}</div>
                    <div className="flex-1">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{searchTerm ? 'MODO BÚSQUEDA' : 'VIENDO REGISTROS DEL:'}</h3>
                        {searchTerm ? <div className="text-sm font-bold text-orange-600 animate-pulse">Buscando "{searchTerm}"...</div> : (
                            <div className="flex items-center gap-3"><input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-4 py-2 border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"/>{filterDate !== today && <button onClick={() => setFilterDate(today)} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-all">Hoy</button>}</div>
                        )}
                    </div>
                </div>
                <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 rounded-xl w-full xl:w-auto shadow-inner">
                    <button onClick={() => setFilterType('TODOS')} className={`flex-1 px-5 py-3 text-sm font-bold rounded-lg transition-all ${filterType === 'TODOS' ? 'bg-white shadow-md text-indigo-600 scale-105' : 'text-gray-500 hover:text-gray-700'}`}>Todos</button>
                    <button onClick={() => setFilterType('PROSPECTO')} className={`flex-1 px-5 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${filterType === 'PROSPECTO' ? 'bg-white shadow-md text-orange-500 scale-105' : 'text-gray-500 hover:text-gray-700'}`}><FaTrafficLight/> Interesados</button>
                    <button onClick={() => setFilterType('CLIENTE')} className={`flex-1 px-5 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${filterType === 'CLIENTE' ? 'bg-white shadow-md text-green-600 scale-105' : 'text-gray-500 hover:text-gray-700'}`}><FaHandshake/> Clientes</button>
                </div>
            </div>

            {loading ? <div className="text-center py-20 font-bold text-gray-400">Cargando...</div> :
            clientesFiltrados.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"><p className="text-gray-400 font-bold">No hay registros</p></div> :
            <div className="overflow-x-auto pb-10">
                <table className="table w-full border-separate border-spacing-y-3">
                    <thead><tr className="text-gray-500 text-xs font-black uppercase tracking-wider pl-4"><th className="bg-transparent border-none py-4">Nivel</th><th className="bg-transparent border-none py-4">Nombre</th><th className="bg-transparent border-none py-4">Contacto</th><th className="bg-transparent border-none py-4">Interés</th><th className="bg-transparent border-none text-center py-4">Acciones</th></tr></thead>
                    <tbody>
                        {clientesFiltrados.map((c: any) => {
                            const interesC = intereses.find(i => i.clienteId === c.id);
                            const reqC = requerimientos.find(r => r.clienteId === c.id);
                            const segC = seguimientos.find(s => s.clienteId === c.id);
                            const propC = interesC?.Propiedad;
                           
                            const hasRealReq = reqC && reqC.id;
                            const hasRealSeg = segC && segC.id;

                            let statusLabel = 'INTERESADO';
                            let statusColor = 'bg-orange-100 text-orange-700';
                            let avatarColor = 'bg-gradient-to-br from-orange-400 to-amber-500';

                            if (c.tipo === 'CLIENTE') {
                                statusLabel = 'CLIENTE';
                                statusColor = 'bg-green-100 text-green-700';
                                avatarColor = 'bg-gradient-to-br from-green-50 to-emerald-600';
                            } else if (hasRealReq) {
                                if (reqC?.estado === 'RECHAZADO' || reqC?.estado === 'DESCARTADO') {
                                    statusLabel = 'DESCARTADO';
                                    statusColor = 'bg-red-100 text-red-700';
                                    avatarColor = 'bg-gradient-to-br from-red-500 to-red-600';
                                } else {
                                    statusLabel = 'REQUERIMIENTO';
                                    statusColor = 'bg-purple-100 text-purple-700';
                                    avatarColor = 'bg-gradient-to-br from-purple-500 to-indigo-600';
                                }
                            } else if (hasRealSeg) {
                                statusLabel = 'SEGUIMIENTO';
                                statusColor = 'bg-blue-100 text-blue-700';
                                avatarColor = 'bg-gradient-to-br from-blue-400 to-blue-600';
                            }

                            return (
                                <tr key={c.id} className="group bg-white hover:bg-indigo-50/30 shadow-sm hover:shadow-md transition-all rounded-2xl">
                                    <td className="rounded-l-2xl border-y border-l border-gray-100 py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shadow-lg ${avatarColor}`}>
                                                {c.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}>
                                                {statusLabel}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="border-y border-gray-100 font-bold text-gray-800">{c.nombre}</td>
                                    <td className="border-y border-gray-100 text-sm font-semibold text-gray-600"><FaPhone className="inline mr-1 text-indigo-400"/> {c.telefono1}</td>
                                   
                                    <td className="border-y border-gray-100">
                                        {propC ? (
                                            <div className="text-xs flex flex-col gap-1">
                                                <span className="font-bold text-indigo-700 uppercase tracking-wide">
                                                    {propC.operacion || 'VENTA'} - {propC.tipo}
                                                </span>
                                                <span className="text-gray-500 font-semibold flex items-center gap-1">
                                                    <FaMapMarkerAlt className="text-gray-400 text-[10px]"/> {propC.ubicacion}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded-lg">Sin propiedad asignada</span>
                                        )}
                                    </td>

                                    <td className="rounded-r-2xl border-y border-r border-gray-100 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            {hasRealReq ? (<button onClick={handleGoToRequerimientos} className="bg-orange-100 text-orange-600 p-2 rounded-lg hover:bg-orange-200 transition-all" title="Ir a Requerimientos"><FaArrowRight/></button>) : hasRealSeg ? (<button onClick={handleGoToSeguimiento} className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-all" title="Ir a Seguimiento"><FaArrowRight/></button>) : (<><button onClick={() => handleOpenReq(c)} className="bg-orange-100 text-orange-600 p-2 rounded-lg hover:bg-orange-200 transition-all" title="Crear Requerimiento"><FaClipboardList/></button><button onClick={() => handleOpenSeguimientoModal(c)} className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-all" title="Iniciar Seguimiento"><FaRoute/></button></>)}
                                            <button onClick={() => handleOpenAgendarVisita(c)} className="bg-indigo-100 text-indigo-600 p-2 rounded-lg hover:bg-indigo-200 transition-all" title="Visita"><FaCalendarCheck/></button>
                                            <button onClick={() => handleViewDetail(c)} className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-all" title="Ver"><FaEye/></button>
                                            <button onClick={() => handleOpenEdit(c)} className="bg-blue-50 text-blue-500 p-2 rounded-lg hover:bg-blue-100 transition-all" title="Editar"><FaEdit/></button>
                                            {isAdmin && <button onClick={() => handleEliminar(c.id)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-all" title="Eliminar"><FaTrash/></button>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            }

            {/* MODAL PRINCIPAL: NUEVO / EDITAR REGISTRO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto relative">
                        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-8 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-2xl flex items-center gap-3">
                                {editandoId ? <><FaEdit className="text-3xl"/> Editar Interesado</> : <><FaUserPlus className="text-3xl"/> Nuevo Interesado</>}
                            </h3>
                            <p className="text-indigo-200 mt-1 font-medium">
                                {editandoId ? 'Modifica los datos del cliente y su interés' : 'Registra un nuevo cliente potencial'}
                            </p>
                        </div>
                        <button onClick={() => setModalOpen(false)} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all"><FaTimes className="text-xl"/></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmitCliente)} className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
                            
                            <input type="hidden" {...register('id')} />

                            <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-lg mb-6">
                                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-4 border-b pb-2">Datos Básicos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="form-control"><label className="label font-bold text-gray-700 mb-1">Nombre Completo *</label><input {...register('nombre', { required: true })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/></div>
                                    <div className="form-control"><label className="label font-bold text-gray-700 mb-1">Celular *</label><input {...register('telefono1', { required: true, minLength: 9 })} onInput={handleNumberInput} maxLength={9} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/></div>
                                   
                                    <div className="form-control"><label className="label font-bold text-gray-700 mb-1">DNI / Documento</label><input {...register('dni')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/></div>
                                    <div className="form-control"><label className="label font-bold text-gray-700 mb-1">Correo Electrónico</label><input type="email" {...register('email')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/></div>
                                   
                                    <div className="form-control"><label className="label font-bold text-gray-700 mb-1 flex items-center gap-2"><FaBullhorn className="text-orange-500"/> Canal de Contacto</label>
                                            <select {...register('origen')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"><option value="">Seleccione...</option><option value="Redes Sociales">Redes Sociales</option><option value="Llamada">Llamada</option><option value="Letrero">Letrero</option><option value="Referido">Referido</option><option value="Urbania">Urbania</option><option value="Web">Página Web</option></select>
                                    </div>
                                    <div className="form-control"><label className="label font-bold text-gray-700 mb-1">Fecha Registro</label><input {...register('fechaAlta')} type="date" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/></div>
                                </div>
                                <div className="form-control mb-6">
                                    <label className="label font-bold text-gray-700 mb-1">Detalles Adicionales</label>
                                    <textarea {...register('detalles')} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="Notas adicionales sobre el cliente..."></textarea>
                                </div>
                                <div className="flex flex-col mb-6">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2">¿Qué busca el cliente?</label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl w-full">
                                            <label className={`flex-1 text-center py-3 rounded-lg cursor-pointer transition-all font-bold text-sm flex items-center justify-center gap-2 ${modoInteres === 'PROPIEDAD' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}><input type="radio" {...register('modoInteres')} value="PROPIEDAD" className="hidden"/> <FaHome/> Interés en Propiedad</label>
                                            <label className={`flex-1 text-center py-3 rounded-lg cursor-pointer transition-all font-bold text-sm flex items-center justify-center gap-2 ${modoInteres === 'REQUERIMIENTO' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}><input type="radio" {...register('modoInteres')} value="REQUERIMIENTO" className="hidden"/> <FaClipboardList/> Buscar (Requerimiento)</label>
                                    </div>
                                </div>
                                {modoInteres === 'PROPIEDAD' && (
                                    <div className="animate-fade-in space-y-4">
                                            <div className="form-control relative"><label className="label font-bold text-slate-700">Propiedad de Interés</label><div className="relative"><FaSearch className="absolute left-3 top-3.5 text-slate-400"/><input type="text" className="w-full pl-10 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="Buscar propiedad..." value={propSearch} onChange={(e) => { setPropSearch(e.target.value); setShowPropSuggestions(true); if(!e.target.value) setValue('propiedadId', ''); }}/><input type="hidden" {...register('propiedadId')} />
                                            {showPropSuggestions && propSearch && filteredProps.length > 0 && (<div className="absolute z-50 w-full bg-white border-2 border-indigo-200 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto">{filteredProps.map(p => (<div key={p.id} onClick={() => handleSelectPropiedad(p)} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 flex flex-col"><span className="font-bold text-slate-800">{p.tipo} - {p.ubicacion}</span><span className="text-xs text-slate-500">{p.direccion}</span></div>))}</div>)}</div></div>
                                           
                                            {propiedadSeleccionada && (
                                                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative shadow-md">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-blue-600 text-white p-2 rounded-lg"><FaInfoCircle className="text-xl"/></div>
                                                            <h5 className="font-black text-blue-900 text-lg">Información de la Propiedad</h5>
                                                        </div>
                                                        <button type="button" onClick={() => setShowFullProperty(true)} className="bg-white text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-sm border border-blue-100 transition-all hover:scale-110" title="Ver ficha completa"><FaEye size={20}/></button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="bg-white p-3 rounded-xl flex items-center gap-3 border border-blue-100"><FaHome className="text-gray-400"/><span className="text-sm text-gray-600 font-semibold">Tipo:</span> <span className="font-bold text-gray-800">{propiedadSeleccionada.tipo}</span></div>
                                                        <div className="bg-white p-3 rounded-xl flex items-center gap-3 border border-blue-100"><FaMapMarkerAlt className="text-gray-400"/><span className="text-sm text-gray-600 font-semibold">Ubicación:</span> <span className="font-bold text-gray-800">{propiedadSeleccionada.ubicacion}</span></div>
                                                        <div className="bg-white p-3 rounded-xl flex items-center gap-3 border border-blue-100"><FaRulerCombined className="text-gray-400"/><span className="text-sm text-gray-600 font-semibold">Área Terreno:</span> <span className="font-bold text-gray-800">{propiedadSeleccionada.area} m²</span></div>
                                                        <div className="bg-white p-3 rounded-xl flex items-center gap-3 border border-blue-100"><FaHammer className="text-gray-400"/><span className="text-sm text-gray-600 font-semibold">Área Construida:</span> <span className="font-bold text-gray-800">{propiedadSeleccionada.areaConstruida || 0} m²</span></div>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-xl border border-blue-100 mb-4 flex items-center gap-2">
                                                        <span className="font-bold text-gray-500 text-sm">$ Precio:</span>
                                                        <span className="text-xl font-black text-green-600">{propiedadSeleccionada.moneda} {Number(propiedadSeleccionada.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                                    </div>

                                                    {propiedadSeleccionada.tipo?.toLowerCase().includes('proyecto') && (() => {
                                                        const tipologias = typeof propiedadSeleccionada.tipologias === 'string' ? JSON.parse(propiedadSeleccionada.tipologias) : propiedadSeleccionada.tipologias;
                                                        if (tipologias && tipologias.length > 0) {
                                                            return (
                                                                <div className="mt-4 pt-4 border-t border-blue-200">
                                                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">¿En qué tipologías está interesado?</p>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {tipologias.map((t: any, idx: number) => (
                                                                            <label key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-50 transition-all">
                                                                                <input 
                                                                                    type="checkbox" 
                                                                                    className="checkbox checkbox-sm checkbox-primary"
                                                                                    checked={tipologiasInteres.includes(t.nombre)}
                                                                                    onChange={() => handleToggleTipologia(t.nombre)}
                                                                                />
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-sm font-bold text-blue-900">{t.nombre}</span>
                                                                                    <span className="text-[10px] font-bold text-gray-500">{t.areaConstruida} m² | {propiedadSeleccionada.moneda} {Number(t.precio).toLocaleString()}</span>
                                                                                </div>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            )}
                                    </div>
                                )}
                                {modoInteres === 'REQUERIMIENTO' && (
                                    <div className="animate-fade-in space-y-4 border border-amber-200 bg-amber-50/30 p-5 rounded-xl">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="form-control"><label className="label font-bold text-slate-700">Tipo Operación</label><select {...register('reqTipo')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"><option value="COMPRA">Compra</option><option value="ALQUILER">Alquiler</option></select></div>
                                               
                                                <div className="form-control">
                                                    <label className="label font-bold text-slate-700">Prioridad</label>
                                                    <select {...register('reqPrioridad')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                                                        <option value="NORMAL">Normal</option>
                                                        <option value="URGENTE">Urgente</option>
                                                        <option value="DESCARTADO">Descartado (No viable)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-control relative">
                                                <label className="label font-bold text-slate-700 flex gap-2 items-center"><FaCity className="text-slate-400"/> Zonas / Distritos</label>
                                                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white flex flex-wrap gap-2 items-center">
                                                    {zonasSelected.map(z => (<span key={z} className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">{z} <FaTimes className="cursor-pointer hover:text-red-500" onClick={() => handleRemoveZona(z)}/></span>))}
                                                    <input className="flex-1 outline-none min-w-[150px] bg-transparent text-sm" placeholder={zonasSelected.length > 0 ? "Añadir otro..." : "Escribe para buscar (ej. Yanahuara)..."} value={zonasQuery} onChange={(e) => { setZonasQuery(e.target.value); setShowZonasSuggestions(true); }}/>
                                                    <input type="hidden" {...register('reqZonas')} />
                                                </div>
                                                {showZonasSuggestions && zonasQuery && filteredDistritos.length > 0 && (<div className="absolute z-50 w-full bg-white border-2 border-amber-200 rounded-xl shadow-xl mt-1 max-h-40 overflow-y-auto">{filteredDistritos.map(d => (<div key={d} onClick={() => handleAddZona(d)} className="p-2 hover:bg-amber-50 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2"><FaPlus className="text-amber-500 text-xs"/> {d}</div>))}</div>)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="form-control"><label className="label font-bold text-slate-700 flex gap-2 items-center"><FaRulerCombined className="text-slate-400"/> Área (m²)</label><div className="flex gap-2 items-center"><input {...register('reqAreaMin')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center" placeholder="Min"/><span className="text-slate-400">-</span><input {...register('reqAreaMax')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center" placeholder="Max"/></div></div>
                                                <div className="form-control"><label className="label font-bold text-slate-700 flex gap-2 items-center"><FaDollarSign className="text-slate-400"/> Presupuesto</label><div className="flex gap-2 items-center"><input {...register('reqPresupuestoMin')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center" placeholder="Min"/><span className="text-slate-400">-</span><input {...register('reqPresupuestoMax')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center" placeholder="Max"/></div></div>
                                            </div>
                                            {reqTipo === 'COMPRA' && (
                                                <div className="bg-white p-4 rounded-xl border-2 border-gray-100 mt-2 shadow-sm transition-all">
                                                    <h5 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><FaMoneyBillWave className="text-green-500"/> Forma de Pago</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="form-control"><select {...register('reqFormaPago')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"><option value="FINANCIADO">Financiamiento Bancario</option><option value="CONTADO">Recursos Propios (Contado)</option><option value="MIXTO">Mixto (Banco + Contado)</option></select></div>
                                                        {(reqFormaPago === 'FINANCIADO' || reqFormaPago === 'MIXTO') && (
                                                            <div className="form-control animate-fade-in-right relative"><FaUniversity className="absolute left-4 top-4 text-green-600 pointer-events-none"/><select {...register('reqBanco')} className="w-full pl-10 pr-4 py-3 border-2 border-green-200 bg-green-50/50 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-green-900"><option value="">Selecciona un Banco...</option>{BANCOS_PERU.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="form-control"><label className="label font-bold text-slate-700">Comentarios Adicionales</label><textarea {...register('reqComentarios')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl h-24 resize-none" placeholder="Ej: Que tenga jardín, cochera doble..."></textarea></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold transition-all">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : (modoInteres === 'REQUERIMIENTO' ? 'Crear Requerimiento' : 'Registrar Interés'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FICHA TÉCNICA DETALLADA */}
            {showFullProperty && propiedadSeleccionada && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-y-auto relative p-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 pb-5">
                            <div>
                                <h3 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                                    <FaBuilding className="text-indigo-500"/> {propiedadSeleccionada.tipo} en {propiedadSeleccionada.ubicacion}
                                </h3>
                                <p className="text-gray-500 mt-1 font-medium">{propiedadSeleccionada.direccion}</p>
                            </div>
                            <button type="button" onClick={() => setShowFullProperty(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-3 transition-all transform hover:scale-110">
                                <FaTimes className="text-xl"/>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden relative shadow-lg border-2 border-gray-200">
                                {propiedadSeleccionada.fotoPrincipal ? (
                                    <img 
                                        src={propiedadSeleccionada.fotoPrincipal.startsWith('http') 
                                            ? propiedadSeleccionada.fotoPrincipal 
                                            : `${BACKEND_URL}${propiedadSeleccionada.fotoPrincipal.startsWith('/') ? '' : '/'}${propiedadSeleccionada.fotoPrincipal}`} 
                                        className="w-full h-full object-cover"
                                        alt="Principal"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300"><FaImages className="text-6xl"/></div>
                                )}
                                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm text-indigo-900 px-6 py-3 rounded-2xl font-black shadow-2xl text-lg">
                                    {propiedadSeleccionada.moneda} {propiedadSeleccionada.precio ? Number(propiedadSeleccionada.precio).toLocaleString('es-PE') : 'Consultar'}
                                </div>
                            </div>

                            {!esTerrenoFicha && !esProyectoFicha && (
                                <div className="grid grid-cols-3 gap-4 animate-fade-in">
                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl text-center border-2 border-indigo-100 shadow-sm">
                                        <FaBed className="mx-auto text-3xl text-indigo-500 mb-3"/>
                                        <span className="block font-black text-gray-800 text-2xl">{propiedadSeleccionada.habitaciones || 0}</span>
                                        <span className="text-xs text-gray-600 font-semibold">Dormitorios</span>
                                    </div>
                                    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 p-5 rounded-2xl text-center border-2 border-sky-100 shadow-sm">
                                        <FaBath className="mx-auto text-3xl text-sky-500 mb-3"/>
                                        <span className="block font-black text-gray-800 text-2xl">{propiedadSeleccionada.banos || 0}</span>
                                        <span className="text-xs text-gray-600 font-semibold">Baños</span>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl text-center border-2 border-orange-100 shadow-sm">
                                        <FaCar className="mx-auto text-3xl text-orange-500 mb-3"/>
                                        <span className="block font-black text-gray-800 text-2xl">{propiedadSeleccionada.cocheras || 0}</span>
                                        <span className="text-xs text-gray-600 font-semibold">Cocheras</span>
                                    </div>
                                </div>
                            )}

                            {esTerrenoFicha && (
                                <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-100 text-center animate-fade-in">
                                    <span className="font-black text-emerald-800 uppercase tracking-widest text-xs">Propiedad tipo Terreno</span>
                                </div>
                            )}

                            {esProyectoFicha && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 shadow-sm">
                                        <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-widest"><FaBuilding className="text-indigo-600"/> Detalles del Proyecto</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                                            <div className="bg-white p-4 rounded-2xl border border-indigo-200 flex items-center gap-4 shadow-sm">
                                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><FaCalendarAlt size={20}/></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">Inicio de Obra</p>
                                                    <p className="font-black text-indigo-900">{propiedadSeleccionada.fechaInicioProyecto || 'Por definir'}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-indigo-200 flex items-center gap-4 shadow-sm">
                                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><FaTools size={20}/></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">Ejecución</p>
                                                    <p className="font-black text-indigo-900">{propiedadSeleccionada.tiempoEjecucion || 'No especificado'}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-indigo-200 flex items-center gap-4 shadow-sm">
                                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><FaKey size={20}/></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">Fecha Entrega</p>
                                                    <p className="font-black text-indigo-900">{propiedadSeleccionada.fechaEntrega || 'No especificado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {tipologiasParseadas && tipologiasParseadas.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Tipologías Disponibles</p>
                                                {tipologiasParseadas.map((t: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                                                        <span className="font-black text-indigo-900 text-sm">{t.nombre}</span>
                                                        <div className="flex gap-6 items-center">
                                                            <span className="text-xs text-gray-400 font-black">{t.areaConstruida} m²</span>
                                                            <span className="font-black text-indigo-600 text-lg">{propiedadSeleccionada.moneda === 'USD' ? '$' : 'S/'} {Number(t.precio).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {propiedadSeleccionada.descripcion && (
                                <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-md">
                                    <h4 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wider flex items-center gap-2"><FaBullhorn className="text-blue-500"/> Descripción Comercial</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{propiedadSeleccionada.descripcion}</p>
                                </div>
                            )}
                            {propiedadSeleccionada.detalles && (
                                <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100 shadow-md">
                                    <h4 className="font-black text-purple-900 mb-3 text-sm uppercase tracking-wider flex items-center gap-2"><FaClipboardList className="text-purple-500"/> Detalles Técnicos y Acabados</h4>
                                    <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">{propiedadSeleccionada.detalles}</p>
                                </div>
                            )}
                        </div>
                        <div className="pt-8 border-t-2 border-gray-100 mt-8 flex justify-end">
                            <button type="button" onClick={() => setShowFullProperty(false)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold w-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Volver al Registro</button>
                        </div>
                    </div>
                </div>
            )}
           
            {/* MODAL DETALLE CLIENTE */}
            {isDetailOpen && selectedCliente && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                        <button onClick={()=>setDetailOpen(false)} className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 absolute right-6 top-6 transition-all text-gray-600 hover:text-red-500">
                            <FaTimes className="text-xl"/>
                        </button>
                        
                        <div className="flex items-center gap-5 mb-8 pb-6 border-b-2 border-gray-100 pr-12">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-lg border-4 border-indigo-50">
                                {selectedCliente.nombre.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-3xl font-black text-gray-800 tracking-tight">{selectedCliente.nombre}</h2>
                                <p className="text-sm font-bold text-gray-500 flex items-center gap-3 mt-2">
                                    <span className={`badge badge-lg border-none px-4 shadow-sm ${selectedCliente.tipo === 'CLIENTE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{selectedCliente.tipo}</span>
                                    {selectedCliente.origen && <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-lg border border-orange-100"><FaBullhorn/> {selectedCliente.origen}</span>}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><FaPhone className="text-indigo-400"/> Teléfono / WhatsApp</p>
                                <div className="flex items-center justify-between">
                                    <p className="font-black text-gray-800 text-lg">{selectedCliente.telefono1}</p>
                                    <a href={`https://wa.me/51${selectedCliente.telefono1}`} target="_blank" rel="noreferrer" className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-500 hover:text-white transition-colors" title="Abrir WhatsApp">
                                        <FaWhatsapp size={20}/>
                                    </a>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><FaEnvelope className="text-indigo-400"/> Correo Electrónico</p>
                                <p className="font-bold text-gray-800 truncate" title={selectedCliente.email}>{selectedCliente.email || 'No registrado'}</p>
                            </div>
                            
                            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 hover:shadow-md transition-shadow">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-2"><FaBullhorn className="text-orange-500"/> Canal de Contacto</p>
                                <p className="font-black text-orange-800 text-lg">{selectedCliente.origen || 'No registrado'}</p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><FaIdCard className="text-indigo-400"/> Documento de Identidad</p>
                                <p className="font-bold text-gray-800">{selectedCliente.dni || 'No registrado'}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow md:col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><FaCalendarAlt className="text-indigo-400"/> Fecha de Registro</p>
                                <p className="font-bold text-gray-800">{selectedCliente.fechaAlta ? new Date(selectedCliente.fechaAlta).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '---'}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-4 border-b-2 border-indigo-100 pb-2 inline-block">Motivo del Contacto</h4>
                        </div>
                        
                        {(() => {
                            const interes = intereses.find((i: any) => i.clienteId === selectedCliente.id);
                            const requerimiento = requerimientos.find((r: any) => r.clienteId === selectedCliente.id);

                            if (interes && interes.Propiedad) {
                                return (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border-2 border-blue-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute -right-6 -top-6 text-blue-100 opacity-50 pointer-events-none">
                                            <FaHome size={120}/>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md"><FaHome size={20}/></div>
                                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Interesado en Propiedad</p>
                                            </div>
                                            
                                            <h5 className="font-black text-gray-800 text-xl mb-1">{interes.Propiedad.tipo} en {interes.Propiedad.ubicacion}</h5>
                                            <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-4">
                                                <FaMapMarkerAlt className="text-red-400"/> {interes.Propiedad.direccion}
                                            </p>
                                            
                                            <div className="flex gap-4 mb-6">
                                                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-50 flex items-center gap-2">
                                                    <FaDollarSign className="text-green-500"/>
                                                    <span className="font-black text-gray-800 text-lg">{interes.Propiedad.moneda} {Number(interes.Propiedad.precio).toLocaleString()}</span>
                                                </div>
                                                {interes.Propiedad.area && (
                                                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-50 flex items-center gap-2">
                                                        <FaRulerCombined className="text-blue-500"/>
                                                        <span className="font-black text-gray-800 text-lg">{interes.Propiedad.area} m²</span>
                                                    </div>
                                                )}
                                            </div>

                                            {interes.nota && (
                                                <div className="bg-white/80 p-4 rounded-xl border border-blue-100">
                                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2"><FaClipboardList/> Notas del Asesor / Tipologías</p>
                                                    <p className="text-sm font-medium text-gray-700 whitespace-pre-line leading-relaxed">{interes.nota}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            if (requerimiento) {
                                return (
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl border-2 border-amber-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute -right-6 -top-6 text-amber-200 opacity-30 pointer-events-none">
                                            <FaSearch size={120}/>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md"><FaSearch size={20}/></div>
                                                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Requerimiento de Búsqueda</p>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider shadow-sm border ${
                                                    requerimiento.prioridad === 'URGENTE' ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 
                                                    requerimiento.prioridad === 'DESCARTADO' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                    'bg-amber-100 text-amber-600 border-amber-200'
                                                }`}>
                                                    {requerimiento.prioridad}
                                                </span>
                                            </div>
                                            
                                            <div className="bg-white/80 p-5 rounded-xl border border-amber-100">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2"><FaClipboardList/> Detalles de la Búsqueda</p>
                                                <p className="text-sm font-medium text-gray-800 whitespace-pre-line leading-relaxed">{requerimiento.pedido}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="bg-gray-50 p-10 rounded-3xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                                    <FaInfoCircle className="text-gray-300 text-5xl mb-3"/>
                                    <p className="text-sm font-bold text-gray-500">Este cliente aún no tiene un interés o requerimiento específico registrado.</p>
                                </div>
                            );
                        })()}

                    </div>
                </div>
            )}
           
            {/* MODAL REQUERIMIENTO */}
            {isReqOpen && clienteReq && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-xl flex items-center gap-2"><FaClipboardList/> Nuevo Requerimiento</h3>
                                <p className="text-amber-100 text-sm">Para el cliente: <strong>{clienteReq.nombre}</strong></p>
                            </div>
                            <button onClick={()=>setReqOpen(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"><FaTimes/></button>
                        </div>
                       
                        <div className="p-8 overflow-y-auto bg-slate-50">
                            <form onSubmit={handleSubmitReq(onSubmitReq)} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label font-bold text-slate-700">Tipo Operación</label>
                                        <select {...registerReq('reqTipo')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white">
                                            <option value="COMPRA">Compra</option>
                                            <option value="ALQUILER">Alquiler</option>
                                        </select>
                                    </div>
                                    <div className="form-control">
                                        <label className="label font-bold text-slate-700">Prioridad</label>
                                        <select {...registerReq('reqPrioridad')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white">
                                            <option value="NORMAL">Normal</option>
                                            <option value="URGENTE">Urgente</option>
                                            <option value="DESCARTADO">Descartado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-control relative">
                                    <label className="label font-bold text-slate-700 flex gap-2 items-center"><FaCity className="text-slate-400"/> Zonas / Distritos</label>
                                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white flex flex-wrap gap-2 items-center min-h-[50px]">
                                        {zonasSelected.map(z => (
                                            <span key={z} className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                                {z} <FaTimes className="cursor-pointer hover:text-red-500" onClick={() => handleRemoveZona(z)}/>
                                            </span>
                                        ))}
                                        <input 
                                            className="flex-1 outline-none min-w-[150px] bg-transparent text-sm" 
                                            placeholder={zonasSelected.length > 0 ? "Añadir otro..." : "Escribe zona (ej. Yanahuara)..."} 
                                            value={zonasQuery} 
                                            onChange={(e) => { setZonasQuery(e.target.value); setShowZonasSuggestions(true); }}
                                        />
                                    </div>
                                    {showZonasSuggestions && zonasQuery && filteredDistritos.length > 0 && (
                                        <div className="absolute z-50 w-full bg-white border-2 border-amber-200 rounded-xl shadow-xl mt-1 max-h-40 overflow-y-auto">
                                            {filteredDistritos.map(d => (
                                                <div key={d} onClick={() => handleAddZona(d)} className="p-2 hover:bg-amber-50 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <FaPlus className="text-amber-500 text-xs"/> {d}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label font-bold text-slate-700 flex gap-2 items-center"><FaRulerCombined className="text-slate-400"/> Área (m²)</label>
                                        <div className="flex gap-2 items-center">
                                            <input {...registerReq('reqAreaMin')} className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl text-center bg-white" placeholder="Min"/>
                                            <span className="text-slate-400">-</span>
                                            <input {...registerReq('reqAreaMax')} className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl text-center bg-white" placeholder="Max"/>
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label font-bold text-slate-700 flex gap-2 items-center"><FaDollarSign className="text-slate-400"/> Presupuesto</label>
                                        <div className="flex gap-2 items-center">
                                            <input {...registerReq('reqPresupuestoMin')} className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl text-center bg-white" placeholder="Min"/>
                                            <span className="text-slate-400">-</span>
                                            <input {...registerReq('reqPresupuestoMax')} className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl text-center bg-white" placeholder="Max"/>
                                        </div>
                                    </div>
                                </div>

                                {reqTipoModal === 'COMPRA' && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                         <h5 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><FaMoneyBillWave className="text-green-500"/> Forma de Pago</h5>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <select {...registerReq('reqFormaPago')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white">
                                                    <option value="FINANCIADO">Financiamiento Bancario</option>
                                                    <option value="CONTADO">Recursos Propios (Contado)</option>
                                                    <option value="MIXTO">Mixto (Banco + Contado)</option>
                                                </select>
                                            </div>
                                            {(reqFormaPagoModal === 'FINANCIADO' || reqFormaPagoModal === 'MIXTO') && (
                                                 <div className="form-control animate-fade-in-right relative"><FaUniversity className="absolute left-4 top-4 text-green-600 pointer-events-none"/><select {...registerReq('reqBanco')} className="w-full pl-10 pr-4 py-3 border-2 border-green-200 bg-green-50/50 rounded-xl font-medium text-green-900"><option value="">Selecciona un Banco...</option>{BANCOS_PERU.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                                            )}
                                         </div>
                                    </div>
                                )}

                                <div className="form-control">
                                    <label className="label font-bold text-slate-700">Comentarios Adicionales</label>
                                    <textarea {...registerReq('reqComentarios')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl h-24 resize-none bg-white" placeholder="Ej: Que tenga jardín, cochera doble..."></textarea>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2">
                                        <FaSave/> Guardar Requerimiento
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SEGUIMIENTO */}
            {isSeguimientoOpen && clienteSeguimiento && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative shadow-2xl">
                        <button onClick={()=>setSeguimientoOpen(false)} className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all text-gray-600">
                            <FaTimes/>
                        </button>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FaRoute className="text-blue-500"/> Nuevo Seguimiento</h3>
                        <p className="text-sm text-gray-500 mb-4">Para: <strong>{clienteSeguimiento.nombre}</strong></p>
                        <form onSubmit={handleSubmitSeg(onSubmitSeguimiento)} className="space-y-4">
                            <textarea {...registerSeg('comentario', {required:true})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none h-28" placeholder="Resultado de la gestión..."></textarea>
                            <div className="grid grid-cols-2 gap-3">
                                <select {...registerSeg('estado')} className="px-4 py-3 border-2 border-gray-200 rounded-xl font-medium">
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="FINALIZADO">Finalizado</option>
                                </select>
                                <input type="date" {...registerSeg('fechaProxima')} className="px-4 py-3 border-2 border-gray-200 rounded-xl font-medium"/>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2">
                                    <FaSave/> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

          </main>
      </div>
    </div>
  );
}