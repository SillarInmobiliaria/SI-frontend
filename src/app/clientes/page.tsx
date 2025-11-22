'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createCliente } from '../../services/api';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';

interface FormCliente {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
}

export default function ClientesPage() {
  const { clientes, fetchClientes, loading } = useInmobiliariaStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormCliente>();

  useEffect(() => {
    fetchClientes();
  }, []);

  const onSubmit = async (data: FormCliente) => {
    try {
      await createCliente(data);
      await fetchClientes();
      setModalOpen(false);
      reset();
      alert('✅ Cliente registrado con éxito');
    } catch (error) {
      alert('❌ Error al registrar cliente');
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Cartera de Clientes</h1>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">+ Nuevo Cliente</button>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {loading ? <div className="text-center">Cargando...</div> : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>Fecha Nac.</th>
                      <th>Dirección</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((c) => (
                      <tr key={c.id}>
                        <td className="font-bold">{c.nombre}</td>
                        <td><div className="badge badge-secondary badge-outline">{c.dni}</div></td>
                        <td>
                          {new Date(c.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-ES', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </td>
                        <td>{c.direccion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Registrar Nuevo Cliente">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-semibold">Nombre Completo</span></div>
              <input {...register('nombre', { required: true })} type="text" className="input input-bordered w-full" placeholder="Ej: María Gómez" />
            </div>
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-semibold">DNI (8 dígitos)</span></div>
              <input {...register('dni', { required: true, minLength: 8, maxLength: 8 })} type="text" className="input input-bordered w-full" placeholder="87654321" maxLength={8} />
              {errors.dni && <span className="text-error text-xs">DNI inválido</span>}
            </div>
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-semibold">Fecha Nacimiento</span></div>
              <input {...register('fechaNacimiento', { required: true })} type="date" className="input input-bordered w-full" />
            </div>
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-semibold">Dirección</span></div>
              <input {...register('direccion', { required: true })} type="text" className="input input-bordered w-full" placeholder="Dirección..." />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6 font-bold">Guardar Cliente</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}