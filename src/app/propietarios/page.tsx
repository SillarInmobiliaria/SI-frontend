'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInmobiliariaStore } from '../../store/useInmobiliariaStore';
import { createPropietario } from '../../services/api';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';

interface FormPropietario {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
}

export default function PropietariosPage() {
  const { propietarios, fetchPropietarios, loading } = useInmobiliariaStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormPropietario>();

  useEffect(() => {
    fetchPropietarios();
  }, []);

  const onSubmit = async (data: FormPropietario) => {
    try {
      await createPropietario(data);
      await fetchPropietarios();
      setModalOpen(false);
      reset();
      alert('✅ Propietario registrado con éxito');
    } catch (error) {
      alert('❌ Error: El DNI ya existe o hay datos inválidos');
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Gestión de Propietarios</h1>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">+ Nuevo Propietario</button>
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
                      <th>Dirección</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propietarios.map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold">{p.nombre}</td>
                        <td><div className="badge badge-ghost">{p.dni}</div></td>
                        <td>{p.direccion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Registrar Nuevo Propietario">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-semibold">Nombre Completo</span></div>
              <input {...register('nombre', { required: true })} type="text" className="input input-bordered w-full" />
            </div>
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-semibold">DNI (8 dígitos)</span></div>
              <input {...register('dni', { required: true, maxLength: 8, minLength: 8 })} type="text" className="input input-bordered w-full" maxLength={8} />
              {errors.dni && <span className="text-error text-xs">Debe tener 8 dígitos</span>}
            </div>
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-semibold">Fecha Nacimiento</span></div>
              <input {...register('fechaNacimiento', { required: true })} type="date" className="input input-bordered w-full" />
            </div>
            <div className="form-control w-full">
              <div className="label pb-1"><span className="label-text font-semibold">Dirección</span></div>
              <input {...register('direccion', { required: true })} type="text" className="input input-bordered w-full" />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6 font-bold">Guardar Propietario</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}