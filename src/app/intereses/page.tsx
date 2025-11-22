'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createInteres } from '../../services/api';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';

interface FormInteres {
  clienteId: string;
  propiedadId: string;
  nota: string;
}

export default function InteresesPage() {
  const { intereses, fetchIntereses, clientes, fetchClientes, propiedades, fetchPropiedades } = useInmobiliariaStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormInteres>();

  useEffect(() => {
    fetchIntereses();
    fetchClientes();
    fetchPropiedades();
  }, []);

  const onSubmit = async (data: FormInteres) => {
    try {
      await createInteres(data);
      await fetchIntereses();
      setModalOpen(false);
      reset();
      alert('✅ Interés registrado');
    } catch (error) {
      alert('❌ Error al registrar');
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Libro de Intereses</h1>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">+ Registrar Nuevo Interés</button>
        </div>

        {intereses.length === 0 ? (
          <div className="text-center">No hay intereses registrados.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {intereses.map((int) => (
              <div key={int.id} className="card bg-base-100 shadow-xl border-l-4 border-secondary">
                <div className="card-body">
                  <div className="flex justify-between">
                    <h3 className="text-xs font-bold text-gray-500">{new Date(int.createdAt || Date.now()).toLocaleDateString()}</h3>
                    <div className="badge badge-primary badge-outline">{int.estado}</div>
                  </div>
                  <p className="mt-2 text-sm text-gray-400 font-bold">CLIENTE</p>
                  <p className="text-lg font-bold text-secondary">👤 {int.Cliente?.nombre}</p>
                  <p className="mt-2 text-sm text-gray-400 font-bold">PROPIEDAD</p>
                  <p className="text-base font-bold">🏠 {int.Propiedad?.direccion}</p>
                  {int.nota && <p className="mt-3 italic text-sm bg-base-200 p-2 rounded">"{int.nota}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Registrar Interés">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-bold">Cliente</span></div>
              <select {...register('clienteId')} className="select select-bordered w-full">
                <option value="">Seleccione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} (DNI: {c.dni})</option>)}
              </select>
            </div>
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-bold">Propiedad</span></div>
              <select {...register('propiedadId')} className="select select-bordered w-full">
                <option value="">Seleccione...</option>
                {propiedades.map(p => <option key={p.id} value={p.id}>{p.tipo}: {p.direccion}</option>)}
              </select>
            </div>
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text">Nota</span></div>
              <textarea {...register('nota')} className="textarea textarea-bordered" placeholder="Detalles..." />
            </div>
            <button className="btn btn-primary mt-4">Guardar</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}