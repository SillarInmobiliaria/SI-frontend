'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion'; 
import { FaHandshake, FaFileContract, FaKey, FaMoneyCheckAlt, FaBuilding, FaSave, FaSearch, FaHistory, FaCheckCircle, FaBalanceScale, FaExclamationCircle } from 'react-icons/fa';
import { createCierre, getPropiedades, getCierres } from '../../services/api'; 
import Link from 'next/link';

const BANCOS_PERU = [
    "BCP (Banco de Crédito)", "Interbank", "BBVA", "Scotiabank", "Banco de la Nación", 
    "BanBif", "Pichincha", "Banco GNB", "Banco de Comercio", "Santander", 
    "MiBanco", "Caja Arequipa", "Caja Cusco", "Caja Huancayo"
];

const INITIAL_FORM = {
    clienteNombre: '',
    direccionClienteContrato: '', 
    propiedadId: '', 
    propiedadDireccion: '', 
    partidaRegistral: '', 
    notaria: '',
    ubicacionNotaria: '',
    fechaFirma: new Date().toISOString().split('T')[0],
    observaciones: '',
    
    // Alquiler
    tipoFirmaAlquiler: 'LEGALIZACION',
    moneda: 'PEN',
    montoRenta: '',
    fechaInicio: '',
    fechaTermino: '',
    plazo: '',
    diasGracia: '',      
    diasTolerancia: '',  
    moraDiaria: '',      
    penalidadResolucion: '', 
    garantia: '',
    mesAdelantado: '',
    banco: '',
    numeroCuenta: '',
    cci: '',
    titularCuenta: '',
    tieneInventario: false, 
    mascotas: false,
    cochera: false,
    datosRepresentante: '', 

    // Venta
    etapaVenta: 'ESCRITURA',
    numeroEscritura: '',
    montoVenta: '',
    gastosNotariales: '',
    gastosRegistrales: '',
    fechaEntrega: '',
    impuestoAlcabala: '',
    impuestoRenta: '',
    formaPago: 'CONTADO',
    bancoFinanciamiento: '',
    cuotaInicial: '',
    montoArras: ''
};

export default function CierrePage() {
  const [tipoOperacion, setTipoOperacion] = useState<'ALQUILER' | 'VENTA'>('ALQUILER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Datos
  const [listaPropiedades, setListaPropiedades] = useState<any[]>([]);
  const [historialCierres, setHistorialCierres] = useState<any[]>([]); 
  
  // UI
  const [sugerenciasPropiedad, setSugerenciasPropiedad] = useState<any[]>([]);
  const [sugerenciasBanco, setSugerenciasBanco] = useState<string[]>([]);
  const [mostrarSugPropiedad, setMostrarSugPropiedad] = useState(false);
  const [mostrarSugBanco, setMostrarSugBanco] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
      cargarDatos();
  }, []);

  const cargarDatos = async () => {
      try {
          const props = await getPropiedades();
          console.log("Propiedades cargadas:", props); // Revisa la consola del navegador
          setListaPropiedades(props);
          
          const cierres = await getCierres();
          if (Array.isArray(cierres)) {
              const ordenados = cierres.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setHistorialCierres(ordenados);
          }
      } catch (e) {
          console.error("Error cargando datos", e);
      }
  };

  const handleChange = (e: any) => {
      const { name, value, type, checked } = e.target;

      if (name === 'clienteNombre' || name === 'titularCuenta') {
          const soloLetras = value.replace(/[0-9]/g, ''); 
          setForm({ ...form, [name]: soloLetras });
          return;
      }

      if (type === 'date') {
          const year = value.split('-')[0];
          if (year && year.length > 4) return;
      }

      setForm({ ...form, [name]: type === 'checkbox' ? checked : value });

      // --- FILTRO CORREGIDO SEGÚN TU BASE DE DATOS ---
      if (name === 'propiedadDireccion') {
          if (value.length > 0) {
              const lowerVal = value.toLowerCase();
              const terminos = lowerVal.split(" "); 

              const filtradas = listaPropiedades.filter((p: any) => {
                  // 1. Buscamos en: direccion, ubicacion, tipo (Nombres exactos de tu DB)
                  const textoCompleto = `${p.direccion || ''} ${p.ubicacion || ''} ${p.tipo || ''}`.toLowerCase();
                  
                  const coincideTexto = terminos.every((t: string) => textoCompleto.includes(t));
                  
                  // 2. Filtro por 'modalidad' (Nombre exacto de tu DB)
                  const modalidad = (p.modalidad || '').toUpperCase();
                  
                  let coincideTipo = false;
                  if (tipoOperacion === 'ALQUILER') {
                      coincideTipo = modalidad.includes('ALQUILER') || modalidad.includes('RENTA');
                  } else {
                      coincideTipo = modalidad.includes('VENTA');
                  }

                  return coincideTexto && coincideTipo;
              });
              
              setSugerenciasPropiedad(filtradas);
              setMostrarSugPropiedad(true);
          } else {
              setMostrarSugPropiedad(false);
          }
      }

      if (name === 'banco') {
          if (value.length > 0) {
              const filtrados = BANCOS_PERU.filter(b => b.toLowerCase().includes(value.toLowerCase()));
              setSugerenciasBanco(filtrados);
              setMostrarSugBanco(true);
          } else {
              setMostrarSugBanco(false);
          }
      }
  };

  const seleccionarPropiedad = (prop: any) => {
      // Usamos los campos correctos de tu DB: direccion y ubicacion
      setForm({
          ...form,
          propiedadDireccion: `${prop.direccion} (${prop.ubicacion})`, 
          propiedadId: prop.id
      });
      setMostrarSugPropiedad(false);
  };

  const seleccionarBanco = (nombreBanco: string) => {
      setForm({ ...form, banco: nombreBanco });
      setMostrarSugBanco(false);
  };

  const handleSubmit = async (e: any) => {
      e.preventDefault();
      
      if (!form.propiedadId) {
          alert("⚠️ Selecciona una propiedad válida de la lista desplegable.");
          return;
      }

      if(!confirm('¿Estás seguro de registrar esta operación?')) return;

      setIsSubmitting(true);
      try {
          const cleanDate = (val: string) => (val && val.trim() !== '' && val !== 'Invalid date' ? val : null);
          const cleanNum = (val: any) => (val && val !== '' ? val : 0);

          const payload = { 
              ...form, 
              tipoOperacion,
              fechaInicio: cleanDate(form.fechaInicio),
              fechaTermino: cleanDate(form.fechaTermino),
              fechaEntrega: cleanDate(form.fechaEntrega),
              fechaFirma: cleanDate(form.fechaFirma),
              
              montoRenta: cleanNum(form.montoRenta),
              garantia: cleanNum(form.garantia),
              mesAdelantado: cleanNum(form.mesAdelantado),
              diasGracia: cleanNum(form.diasGracia),
              diasTolerancia: cleanNum(form.diasTolerancia),
              moraDiaria: cleanNum(form.moraDiaria),
              penalidadResolucion: cleanNum(form.penalidadResolucion),
              
              montoVenta: cleanNum(form.montoVenta),
              gastosNotariales: cleanNum(form.gastosNotariales),
              gastosRegistrales: cleanNum(form.gastosRegistrales),
              impuestoAlcabala: cleanNum(form.impuestoAlcabala),
              impuestoRenta: cleanNum(form.impuestoRenta),
              cuotaInicial: cleanNum(form.cuotaInicial),
              montoArras: cleanNum(form.montoArras),
          }; 
          
          await createCierre(payload);
          alert('✅ Operación registrada exitosamente');
          
          setForm(INITIAL_FORM); 
          cargarDatos();

      } catch (error) {
          console.error(error);
          alert('❌ Error al registrar.');
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 relative">
          <SidebarAtencion /> 

          <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
            
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-lg">
                    <FaHandshake size={28}/>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Cierre de Operación</h1>
                    <p className="text-slate-500">Gestión de Contratos y Ventas Finales</p>
                </div>
            </div>

            {/* SELECTOR */}
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-6 w-full max-w-md mx-auto">
                <button 
                    onClick={() => { setTipoOperacion('ALQUILER'); setForm(INITIAL_FORM); }}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${tipoOperacion === 'ALQUILER' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <FaFileContract/> ALQUILER
                </button>
                <button 
                    onClick={() => { setTipoOperacion('VENTA'); setForm(INITIAL_FORM); }}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${tipoOperacion === 'VENTA' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <FaKey/> VENTA
                </button>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" autoComplete="off">
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FaBuilding/> Identificación y Propiedad
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label font-bold text-slate-600">Cliente (Inquilino/Comprador)</label>
                            <input type="text" name="clienteNombre" className="input input-bordered" placeholder="Nombre completo (Solo letras)" value={form.clienteNombre} onChange={handleChange} required />
                        </div>
                        
                        {/* INPUT PROPIEDAD */}
                        <div className="form-control relative">
                            <label className="label font-bold text-slate-600">Propiedad (Dirección)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="propiedadDireccion" 
                                    className="input input-bordered w-full pr-10" 
                                    placeholder={`Buscar en inventario de ${tipoOperacion}...`} 
                                    value={form.propiedadDireccion} 
                                    onChange={handleChange} 
                                    onBlur={() => setTimeout(() => setMostrarSugPropiedad(false), 200)}
                                    required 
                                />
                                <FaSearch className="absolute right-3 top-3.5 text-slate-400"/>
                            </div>
                            
                            {/* SUGERENCIAS */}
                            {mostrarSugPropiedad && sugerenciasPropiedad.length > 0 && (
                                <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
                                    {sugerenciasPropiedad.map((prop: any) => (
                                        <li 
                                            key={prop.id} 
                                            onClick={() => seleccionarPropiedad(prop)}
                                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-none"
                                        >
                                            <div className="flex justify-between items-center">
                                                {/* Usamos 'direccion' y 'modalidad' que son los campos reales */}
                                                <p className="font-bold text-sm text-slate-700 truncate">{prop.direccion}</p>
                                                <span className={`badge badge-sm badge-ghost text-[10px] ${prop.modalidad?.toUpperCase().includes('ALQUILER') ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                                    {prop.modalidad}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">{prop.tipo} - {prop.ubicacion}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            
                            {/* AVISO SI NO HAY RESULTADOS */}
                            {mostrarSugPropiedad && sugerenciasPropiedad.length === 0 && form.propiedadDireccion.length > 0 && (
                                <div className="absolute z-50 w-full bg-white border border-red-200 rounded-xl shadow-xl mt-1 p-3 text-center text-sm text-red-500 flex flex-col gap-1 items-center">
                                    <span><FaExclamationCircle/> No se encontraron propiedades en <b>{tipoOperacion}</b>.</span>
                                    <Link href="/propiedades" className="text-xs underline font-bold hover:text-red-700">Ir a registrar propiedad</Link>
                                </div>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label font-bold text-slate-600">Dirección Actual del Cliente</label>
                            <input type="text" name="direccionClienteContrato" className="input input-bordered" placeholder="Dirección para el contrato" value={form.direccionClienteContrato} onChange={handleChange} />
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-slate-600">Partida Registral N°</label>
                            <input type="text" name="partidaRegistral" className="input input-bordered font-mono" placeholder="Ej: 11223344" value={form.partidaRegistral} onChange={handleChange} />
                        </div>
                        
                        <div className="form-control md:col-span-2">
                            <label className="label font-bold text-slate-600">Datos de Poder / Representante (Opcional)</label>
                            <textarea name="datosRepresentante" className="textarea textarea-bordered h-12" placeholder="Si actúa con poder: Nombre representante, N° Partida del poder..." value={form.datosRepresentante} onChange={handleChange}></textarea>
                        </div>
                    </div>
                </div>

                {tipoOperacion === 'ALQUILER' && (
                    <>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                            <h3 className="text-sm font-black text-indigo-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaFileContract/> Condiciones del Contrato
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600 text-xs">Tipo de Firma</label>
                                    <select name="tipoFirmaAlquiler" className="select select-bordered select-sm" value={form.tipoFirmaAlquiler} onChange={handleChange}>
                                        <option value="LEGALIZACION">Legalización de Firmas</option>
                                        <option value="ESCRITURA_PUBLICA">Escritura Pública</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600 text-xs">Notaría</label>
                                    <input type="text" name="notaria" className="input input-bordered input-sm" placeholder="Ej: Rodriguez" value={form.notaria} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600 text-xs">Fecha de Firma</label>
                                    <input type="date" name="fechaFirma" max="2099-12-31" className="input input-bordered input-sm" value={form.fechaFirma} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600 text-xs">Plazo (Años/Meses)</label>
                                    <input type="text" name="plazo" className="input input-bordered input-sm" placeholder="Ej: 1 año forzoso" value={form.plazo} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600 text-xs">Fecha Inicio</label>
                                    <input type="date" name="fechaInicio" max="2099-12-31" className="input input-bordered input-sm" value={form.fechaInicio} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600 text-xs">Fecha Término</label>
                                    <input type="date" name="fechaTermino" max="2099-12-31" className="input input-bordered input-sm" value={form.fechaTermino} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600 text-xs">Días de Gracia</label>
                                    <input type="number" name="diasGracia" className="input input-bordered input-sm" placeholder="Ej: 7 días" value={form.diasGracia} onChange={handleChange} />
                                </div>
                                
                                <div className="md:col-span-4 flex flex-wrap gap-4 mt-2 p-3 bg-slate-50 rounded-xl">
                                    <label className="cursor-pointer flex items-center gap-2"><input type="checkbox" name="tieneInventario" className="checkbox checkbox-xs checkbox-indigo" checked={form.tieneInventario} onChange={handleChange} /><span className="text-xs font-bold">Con Inventario (Anexo)</span></label>
                                    <label className="cursor-pointer flex items-center gap-2"><input type="checkbox" name="mascotas" className="checkbox checkbox-xs checkbox-indigo" checked={form.mascotas} onChange={handleChange} /><span className="text-xs font-bold">Permite Mascotas</span></label>
                                    <label className="cursor-pointer flex items-center gap-2"><input type="checkbox" name="cochera" className="checkbox checkbox-xs checkbox-indigo" checked={form.cochera} onChange={handleChange} /><span className="text-xs font-bold">Incluye Cochera</span></label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                            <h3 className="text-sm font-black text-indigo-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaMoneyCheckAlt/> Renta, Penalidades y Pagos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 border-b pb-1">RENTA Y GARANTÍA</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="label text-xs">Moneda</label><select name="moneda" className="select select-bordered select-xs w-full" value={form.moneda} onChange={handleChange}><option value="PEN">Soles (S/)</option><option value="USD">Dólares ($)</option></select></div>
                                        <div><label className="label text-xs">Monto Renta</label><input type="number" name="montoRenta" className="input input-bordered input-xs w-full font-bold" value={form.montoRenta} onChange={handleChange} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="label text-xs">Garantía</label><input type="number" name="garantia" className="input input-bordered input-xs w-full" value={form.garantia} onChange={handleChange} /></div>
                                        <div><label className="label text-xs">Mes Adelantado</label><input type="number" name="mesAdelantado" className="input input-bordered input-xs w-full" value={form.mesAdelantado} onChange={handleChange} /></div>
                                    </div>
                                </div>

                                <div className="space-y-2 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <h4 className="text-xs font-bold text-red-400 border-b border-red-200 pb-1 flex gap-1"><FaBalanceScale/> MORA Y PENALIDADES</h4>
                                    <div>
                                        <label className="label text-xs text-red-700">Días de Tolerancia (Pago)</label>
                                        <input type="number" name="diasTolerancia" className="input input-bordered input-xs w-full" placeholder="Ej: 3 días" value={form.diasTolerancia} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="label text-[10px] text-red-700">Mora Diaria</label>
                                            <input type="number" name="moraDiaria" className="input input-bordered input-xs w-full" placeholder="S/ x día" value={form.moraDiaria} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="label text-[10px] text-red-700">Penalidad Venc.</label>
                                            <input type="number" name="penalidadResolucion" className="input input-bordered input-xs w-full" placeholder="S/ x día" value={form.penalidadResolucion} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 relative">
                                    <h4 className="text-xs font-bold text-slate-400 border-b pb-1">CUENTA DE DEPÓSITO</h4>
                                    <div className="relative">
                                        <input type="text" name="banco" className="input input-bordered input-xs w-full font-bold" placeholder="Escribe Banco..." value={form.banco} onChange={handleChange} onBlur={() => setTimeout(() => setMostrarSugBanco(false), 200)}/>
                                        {mostrarSugBanco && sugerenciasBanco.length > 0 && (
                                            <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                                                {sugerenciasBanco.map((bancoName, idx) => (
                                                    <li key={idx} onClick={() => seleccionarBanco(bancoName)} className="px-3 py-2 hover:bg-emerald-50 cursor-pointer text-xs font-bold text-slate-700">{bancoName}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <input type="text" name="numeroCuenta" className="input input-bordered input-xs w-full" placeholder="N° Cuenta" value={form.numeroCuenta} onChange={handleChange} />
                                    <input type="text" name="cci" className="input input-bordered input-xs w-full" placeholder="CCI (Opcional)" value={form.cci} onChange={handleChange} />
                                    <input type="text" name="titularCuenta" className="input input-bordered input-xs w-full" placeholder="Titular (Solo letras)" value={form.titularCuenta} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {tipoOperacion === 'VENTA' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                        <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FaKey/> Datos de la Venta
                        </h3>
                        <div className="flex gap-4 mb-4 bg-emerald-50 p-2 rounded-xl">
                            {['RESERVA', 'ARRAS', 'ESCRITURA'].map((etapa) => (
                                <label key={etapa} className={`flex-1 cursor-pointer py-1 text-center rounded-lg font-bold text-xs transition-all ${form.etapaVenta === etapa ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-700 hover:bg-emerald-100'}`}>
                                    <input type="radio" name="etapaVenta" value={etapa} className="hidden" checked={form.etapaVenta === etapa} onChange={handleChange}/>{etapa}
                                </label>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control"><label className="label text-xs font-bold">Precio Venta</label><input type="number" name="montoVenta" className="input input-bordered input-sm font-bold text-emerald-700" value={form.montoVenta} onChange={handleChange} /></div>
                            <div className="form-control"><label className="label text-xs font-bold">N° Escritura</label><input type="text" name="numeroEscritura" className="input input-bordered input-sm" value={form.numeroEscritura} onChange={handleChange} /></div>
                            <div className="form-control"><label className="label text-xs font-bold">Fecha Entrega</label><input type="date" name="fechaEntrega" max="2099-12-31" className="input input-bordered input-sm" value={form.fechaEntrega} onChange={handleChange} /></div>
                            
                            {/* Impuestos */}
                            <div className="form-control"><label className="label text-xs font-bold">Alcabala</label><input type="number" name="impuestoAlcabala" className="input input-bordered input-sm" value={form.impuestoAlcabala} onChange={handleChange} /></div>
                            <div className="form-control"><label className="label text-xs font-bold">Imp. Renta</label><input type="number" name="impuestoRenta" className="input input-bordered input-sm" value={form.impuestoRenta} onChange={handleChange} /></div>
                            <div className="form-control"><label className="label text-xs font-bold">Gastos Notariales</label><input type="number" name="gastosNotariales" className="input input-bordered input-sm" value={form.gastosNotariales} onChange={handleChange} /></div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitting} className="btn bg-slate-800 text-white hover:bg-slate-900 px-8 rounded-xl shadow-xl gap-2 font-bold text-lg">
                        <FaSave/> {isSubmitting ? 'Guardando...' : 'Registrar Operación'}
                    </button>
                </div>

            </form>

            {/* --- TABLA DE HISTORIAL --- */}
            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in-up">
                <h3 className="text-xl font-black text-slate-700 flex items-center gap-2 mb-4">
                    <FaHistory className="text-slate-400"/> Historial de Operaciones
                </h3>
                
                {historialCierres.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">No hay operaciones registradas aún.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                                <tr>
                                    <th>Fecha Firma</th>
                                    <th>Tipo</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historialCierres.map((cierre: any) => (
                                    <tr key={cierre.id} className="hover:bg-slate-50 border-b border-slate-100">
                                        <td className="font-mono text-slate-500">{cierre.fechaCierre || '-'}</td>
                                        <td>
                                            <span className={`badge badge-sm font-bold ${cierre.tipoOperacion === 'ALQUILER' ? 'badge-primary' : 'badge-accent text-white'}`}>
                                                {cierre.tipoOperacion}
                                            </span>
                                        </td>
                                        <td className="font-bold text-slate-700">{cierre.clienteId}</td>
                                        <td className="font-bold">
                                            {cierre.tipoOperacion === 'ALQUILER' 
                                                ? `${cierre.moneda === 'PEN' ? 'S/' : '$'} ${cierre.montoRenta}`
                                                : `$ ${cierre.montoVenta}`
                                            }
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                                                <FaCheckCircle/> Cerrado
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

          </main>
      </div>
    </div>
  );
}