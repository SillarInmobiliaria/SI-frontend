'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import api from '../../../../services/api';
import { FaSave, FaArrowLeft, FaHome, FaEdit } from 'react-icons/fa';

export default function EditarPropiedadPage() {
  const router = useRouter();
  const { id } = useParams();
  const { register, handleSubmit, setValue, watch } = useForm();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. CARGAR DATOS ACTUALES
  useEffect(() => {
    const cargarPropiedad = async () => {
      try {
        const { data } = await api.get(`/propiedades/${id}`);
        // Llenamos el formulario con los datos de la DB
        Object.keys(data).forEach(key => {
          setValue(key, data[key]);
        });
        setLoading(false);
      } catch (e) {
        alert("Error al cargar los datos de la propiedad");
        router.back();
      }
    };
    cargarPropiedad();
  }, [id, setValue, router]);

  // 2. ENVIAR CAMBIOS
  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await api.put(`/propiedades/${id}`, formData);
      alert('✅ Propiedad actualizada correctamente');
      router.push(`/propiedades/${id}`); // Volvemos al detalle
    } catch (e) {
      alert('❌ Error al actualizar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-indigo-600"></span></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm text-gray-500"><FaArrowLeft/></button>
            <h1 className="text-xl font-bold text-indigo-900 uppercase flex items-center gap-2">
              <FaEdit/> EDITAR_INMUEBLE_V3
            </h1>
          </div>
          <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn btn-primary bg-indigo-600 border-none shadow-md px-8 text-white font-bold text-xs uppercase">
            {isSubmitting ? 'Guardando...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </div>

      <main className="container mx-auto px-6 max-w-4xl mt-8">
        <form className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 border-b pb-2"><FaHome className="text-indigo-500"/> DATOS GENERALES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label font-bold text-gray-600 text-[10px] uppercase">Distrito</label>
                  <input {...register('ubicacion')} className="input input-bordered w-full bg-white" />
                </div>
                <div className="form-control">
                  <label className="label font-bold text-gray-600 text-[10px] uppercase">Dirección</label>
                  <input {...register('direccion')} className="input input-bordered w-full bg-white" />
                </div>
                <div className="form-control">
                  <label className="label font-bold text-gray-600 text-[10px] uppercase">Precio</label>
                  <input type="number" step="0.01" {...register('precio')} className="input input-bordered w-full bg-white font-bold" />
                </div>
                <div className="form-control">
                  <label className="label font-bold text-gray-600 text-[10px] uppercase">Categoría</label>
                  <select {...register('modalidad')} className="select select-bordered w-full bg-white">
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>
              </div>
              
              <div className="form-control mt-6">
                <label className="label font-bold text-gray-600 text-[10px] uppercase">Descripción Comercial</label>
                <textarea {...register('descripcion')} className="textarea textarea-bordered h-40 bg-white" />
              </div>
           </div>
           
           <p className="text-center text-gray-400 text-xs italic mt-4">Pronto podrás editar multimedia y links externos en este formulario...</p>
        </form>
      </main>
    </div>
  );
}