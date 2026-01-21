'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import SidebarAtencion from '../../components/SidebarAtencion'; 
import { FaHandshake, FaFileContract, FaKey, FaMoneyCheckAlt, FaBuilding, FaCalendarAlt, FaSave, FaUniversity } from 'react-icons/fa';
import { createCierre } from '../../services/api'; // <--- IMPORTANTE: Conexión con el Backend

export default function CierrePage() {
  const [tipoOperacion, setTipoOperacion] = useState<'ALQUILER' | 'VENTA'>('ALQUILER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado único para todo el formulario
  const [form, setForm] = useState({
    // General
    clienteNombre: '',
    propiedadDireccion: '',
    notaria: '',
    ubicacionNotaria: '',
    fechaFirma: new Date().toISOString().split('T')[0],
    observaciones: '',
    
    // Alquiler
    tipoFirmaAlquiler: 'LEGALIZACION', // Legalización o Escritura
    moneda: 'USD',
    montoRenta: '',
    fechaInicio: '',
    fechaTermino: '',
    plazo: '',
    diasGracia: '',
    garantia: '',
    mesAdelantado: '',
    banco: '',
    numeroCuenta: '',
    cci: '',
    titularCuenta: '',
    mascotas: false,
    cochera: false,

    // Venta
    etapaVenta: 'ESCRITURA', // Reserva, Arras, Escritura
    numeroEscritura: '',
    montoVenta: '',
    gastosNotariales: '',
    gastosRegistrales: '',
    fechaEntrega: '',
    impuestoAlcabala: '',
    impuestoRenta: '',
    formaPago: 'CONTADO', // Contado o Financiado
    bancoFinanciamiento: '',
    cuotaInicial: '',
    montoArras: ''
  });

  const handleChange = (e: any) => {
      const { name, value, type, checked } = e.target;
      setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: any) => {
      e.preventDefault();
      
      if(!confirm('¿Estás seguro de registrar esta operación de cierre?')) return;

      setIsSubmitting(true);
      try {
          // Preparamos el objeto final agregando el tipo de operación seleccionado
          const payload = { 
              ...form, 
              tipoOperacion: tipoOperacion 
          }; 
          
          await createCierre(payload);
          
          alert('✅ ¡Operación registrada exitosamente!');
          // Opcional: Reiniciar formulario
          setForm({ ...form, clienteNombre: '', propiedadDireccion: '' }); 

      } catch (error) {
          console.error(error);
          alert('❌ Error al registrar el cierre. Verifica los datos.');
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 relative">
          <SidebarAtencion /> 

          <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
            
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg">
                    <FaHandshake size={28}/>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Cierre de Operación</h1>
                    <p className="text-slate-500">Registra los detalles finales del contrato (Venta o Alquiler)</p>
                </div>
            </div>

            {/* SELECTOR DE TIPO */}
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-6 w-full max-w-md mx-auto">
                <button 
                    onClick={() => setTipoOperacion('ALQUILER')}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${tipoOperacion === 'ALQUILER' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <FaFileContract/> ALQUILER
                </button>
                <button 
                    onClick={() => setTipoOperacion('VENTA')}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${tipoOperacion === 'VENTA' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <FaKey/> VENTA
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                
                {/* 1. DATOS GENERALES (Compartidos) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FaBuilding/> Datos Generales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label font-bold text-slate-600">Cliente (Inquilino/Comprador)</label>
                            <input type="text" name="clienteNombre" className="input input-bordered" placeholder="Nombre completo" value={form.clienteNombre} onChange={handleChange} required />
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-slate-600">Propiedad</label>
                            <input type="text" name="propiedadDireccion" className="input input-bordered" placeholder="Dirección breve" value={form.propiedadDireccion} onChange={handleChange} required />
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-slate-600">Notaría</label>
                            <input type="text" name="notaria" className="input input-bordered" placeholder="Ej: Notaría Rodriguez" value={form.notaria} onChange={handleChange} />
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-slate-600">Ubicación Notaría</label>
                            <input type="text" name="ubicacionNotaria" className="input input-bordered" placeholder="Distrito / Dirección" value={form.ubicacionNotaria} onChange={handleChange} />
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-slate-600">Fecha de Firma</label>
                            <input type="date" name="fechaFirma" className="input input-bordered" value={form.fechaFirma} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* 2. CAMPOS ESPECÍFICOS DE ALQUILER */}
                {tipoOperacion === 'ALQUILER' && (
                    <>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                            <h3 className="text-sm font-black text-indigo-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaFileContract/> Condiciones del Contrato
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Tipo de Firma</label>
                                    <select name="tipoFirmaAlquiler" className="select select-bordered" value={form.tipoFirmaAlquiler} onChange={handleChange}>
                                        <option value="LEGALIZACION">Legalización de Firmas</option>
                                        <option value="ESCRITURA_PUBLICA">Escritura Pública</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Plazo (Duración)</label>
                                    <input type="text" name="plazo" className="input input-bordered" placeholder="Ej: 1 año forzoso" value={form.plazo} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Días de Gracia</label>
                                    <input type="number" name="diasGracia" className="input input-bordered" placeholder="0" value={form.diasGracia} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Fecha Inicio</label>
                                    <input type="date" name="fechaInicio" className="input input-bordered" value={form.fechaInicio} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Fecha Término</label>
                                    <input type="date" name="fechaTermino" className="input input-bordered" value={form.fechaTermino} onChange={handleChange} />
                                </div>
                                
                                {/* Checks Extras */}
                                <div className="md:col-span-3 flex gap-6 mt-2 p-3 bg-slate-50 rounded-xl">
                                    <label className="cursor-pointer label gap-2">
                                        <input type="checkbox" name="mascotas" className="checkbox checkbox-indigo" checked={form.mascotas} onChange={handleChange} />
                                        <span className="label-text font-bold">Permite Mascotas</span>
                                    </label>
                                    <label className="cursor-pointer label gap-2">
                                        <input type="checkbox" name="cochera" className="checkbox checkbox-indigo" checked={form.cochera} onChange={handleChange} />
                                        <span className="label-text font-bold">Incluye Cochera</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                            <h3 className="text-sm font-black text-indigo-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaMoneyCheckAlt/> Datos Financieros
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Moneda</label>
                                    <select name="moneda" className="select select-bordered font-bold" value={form.moneda} onChange={handleChange}>
                                        <option value="USD">Dólares (USD)</option>
                                        <option value="PEN">Soles (PEN)</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Monto Renta Mensual</label>
                                    <input type="number" name="montoRenta" className="input input-bordered font-mono font-bold text-lg" placeholder="0.00" value={form.montoRenta} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Garantía (Total)</label>
                                    <input type="number" name="garantia" className="input input-bordered" placeholder="2 meses" value={form.garantia} onChange={handleChange} />
                                </div>
                                <div className="form-control md:col-span-3 mt-4 border-t pt-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Cuenta Bancaria para Depósito (Propietario)</span>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input type="text" name="banco" className="input input-bordered input-sm" placeholder="Banco (BCP, Interbank...)" value={form.banco} onChange={handleChange} />
                                        <input type="text" name="numeroCuenta" className="input input-bordered input-sm" placeholder="N° Cuenta" value={form.numeroCuenta} onChange={handleChange} />
                                        <input type="text" name="titularCuenta" className="input input-bordered input-sm" placeholder="Titular de la cuenta" value={form.titularCuenta} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* 3. CAMPOS ESPECÍFICOS DE VENTA */}
                {tipoOperacion === 'VENTA' && (
                    <>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaKey/> Datos de la Venta
                            </h3>
                            
                            {/* Etapas de la Venta */}
                            <div className="flex gap-4 mb-6 bg-emerald-50 p-2 rounded-xl">
                                {['RESERVA', 'ARRAS', 'ESCRITURA'].map((etapa) => (
                                    <label key={etapa} className={`flex-1 cursor-pointer py-2 text-center rounded-lg font-bold text-sm transition-all ${form.etapaVenta === etapa ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-700 hover:bg-emerald-100'}`}>
                                        <input type="radio" name="etapaVenta" value={etapa} className="hidden" checked={form.etapaVenta === etapa} onChange={handleChange}/>
                                        {etapa}
                                    </label>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Precio Final Venta</label>
                                    <input type="number" name="montoVenta" className="input input-bordered font-mono font-bold text-lg text-emerald-700" placeholder="0.00" value={form.montoVenta} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">N° Escritura Pública</label>
                                    <input type="text" name="numeroEscritura" className="input input-bordered" placeholder="Kardex / Nro" value={form.numeroEscritura} onChange={handleChange} />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-slate-600">Fecha Entrega Inmueble</label>
                                    <input type="date" name="fechaEntrega" className="input input-bordered" value={form.fechaEntrega} onChange={handleChange} />
                                </div>

                                {/* Si es Arras */}
                                {form.etapaVenta === 'ARRAS' && (
                                    <div className="col-span-3 bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-2 animate-fade-in">
                                        <label className="label font-bold text-yellow-800">Monto de Arras (Separación 10%)</label>
                                        <input type="number" name="montoArras" className="input input-bordered w-full" placeholder="Monto entregado" value={form.montoArras} onChange={handleChange} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaMoneyCheckAlt/> Impuestos y Financiamiento
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Columna Izq: Impuestos */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-slate-700 border-b pb-1">Impuestos y Gastos</h4>
                                    <div className="form-control">
                                        <label className="label text-xs font-bold text-slate-500">Impuesto Alcabala</label>
                                        <input type="number" name="impuestoAlcabala" className="input input-bordered input-sm" placeholder="0.00" value={form.impuestoAlcabala} onChange={handleChange} />
                                    </div>
                                    <div className="form-control">
                                        <label className="label text-xs font-bold text-slate-500">Impuesto a la Renta</label>
                                        <input type="number" name="impuestoRenta" className="input input-bordered input-sm" placeholder="0.00" value={form.impuestoRenta} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="form-control"><label className="label text-xs font-bold text-slate-500">Gasto Notarial</label><input type="number" name="gastosNotariales" className="input input-bordered input-sm" placeholder="0.00" value={form.gastosNotariales} onChange={handleChange} /></div>
                                        <div className="form-control"><label className="label text-xs font-bold text-slate-500">Gasto Registral</label><input type="number" name="gastosRegistrales" className="input input-bordered input-sm" placeholder="0.00" value={form.gastosRegistrales} onChange={handleChange} /></div>
                                    </div>
                                </div>

                                {/* Columna Der: Financiamiento */}
                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                                    <h4 className="font-bold text-slate-700 border-b pb-1 flex items-center gap-2"><FaUniversity/> Forma de Pago</h4>
                                    <div className="flex gap-2 mb-2">
                                        <label className="cursor-pointer label gap-2"><input type="radio" name="formaPago" value="CONTADO" className="radio radio-sm radio-emerald" checked={form.formaPago === 'CONTADO'} onChange={handleChange} /><span className="text-sm font-bold">Recursos Propios</span></label>
                                        <label className="cursor-pointer label gap-2"><input type="radio" name="formaPago" value="FINANCIADO" className="radio radio-sm radio-emerald" checked={form.formaPago === 'FINANCIADO'} onChange={handleChange} /><span className="text-sm font-bold">Financiamiento</span></label>
                                    </div>
                                    
                                    {form.formaPago === 'FINANCIADO' && (
                                        <div className="animate-fade-in space-y-2">
                                            <input type="text" name="bancoFinanciamiento" className="input input-bordered input-sm w-full" placeholder="Nombre del Banco" value={form.bancoFinanciamiento} onChange={handleChange} />
                                            <input type="number" name="cuotaInicial" className="input input-bordered input-sm w-full" placeholder="Cuota Inicial" value={form.cuotaInicial} onChange={handleChange} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitting} className="btn bg-slate-800 text-white hover:bg-slate-900 px-8 rounded-xl shadow-xl gap-2 font-bold text-lg">
                        <FaSave/> {isSubmitting ? 'Guardando...' : 'Registrar Operación'}
                    </button>
                </div>

            </form>
          </main>
      </div>
    </div>
  );
}